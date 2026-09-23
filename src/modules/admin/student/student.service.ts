import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ResponseHelper } from '../../../common/helpers/response.helper';
import { TermType, Prisma } from '@prisma/client';
import { generateStudentResultPdf } from '../../../common/helpers/pdf.helper';
import { generateClassResultsPdf } from '../../../common/helpers/pdf-class.helper';
import { StudentAnalyticsQueryDto } from './dto';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getStudentDashboard(filters?: {
    session?: string;
    term?: TermType;
    schoolId?: string;
    classId?: string;
    subject?: string;
    gender?: string;
    search?: string;
    lgaId?: string;
    page?: number;
    limit?: number;
  }) {
    this.logger.log(`Fetching student dashboard data with filters bulala:`, filters);

    try {
      // Get current active session and term if not specified
      const hasSearch = Boolean(filters?.search && filters.search.trim().length > 0);

      // Get current active session and term if not specified
      let currentSession = filters?.session;
      let currentTerm = filters?.term;

      if (!currentSession || !currentTerm) {
        const activeSession = await this.prisma.session.findFirst({
          where: { isActive: true },
          include: {
            terms: {
              where: { isActive: true },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        });

        if (!activeSession) {
          this.logger.log("Error loading session");
          throw new Error('No active session found');
        }

        currentSession = currentSession || activeSession.name;
        currentTerm = currentTerm || (activeSession.terms[0]?.name as TermType);
      }

      // Prepare cascading options for frontend filters
      let lgasList: any = null;
      let schoolsList: any = null;
      let classesList: any = null;
      let schoolInfo: any = null;

      // If no LGA ID is provided, query all active LGAs for the dropdown
      if (!filters?.lgaId) {
        this.logger.log("Querying list of all LGAs");
        lgasList = await this.prisma.localGovernmentArea.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            code: true,
            state: true,
          },
          orderBy: { name: 'asc' },
        });
      }

      // If LGA ID is provided, query schools in that LGA for the dropdown
      if (filters?.lgaId) {
        this.logger.log("Querying schools in LGA");
        schoolsList = await this.prisma.school.findMany({
          where: { 
            isActive: true,
            lgaId: filters.lgaId,
          },
          select: {
            id: true,
            name: true,
            code: true,
            level: true,
          },
          orderBy: { name: 'asc' },
        });
      }

      // If school ID is provided, query classes and school stats for that school
      if (filters?.schoolId) {
        const school = await this.prisma.school.findUnique({
          where: { id: filters.schoolId },
          select: {
            id: true,
            name: true,
            code: true,
            level: true,
            address: true,
            totalStudents: true,
            totalTeachers: true,
            capacity: true,
            lga: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        });

        if (school) {
          const studentStats = await this.prisma.student.groupBy({
            by: ['gender'],
            where: {
              schoolId: filters.schoolId,
              isActive: true,
            },
            _count: {
              gender: true,
            },
          });

          const totalStudents = studentStats.reduce((sum, stat) => sum + stat._count.gender, 0);
          const maleCount = studentStats.find(stat => stat.gender === 'MALE')?._count.gender || 0;
          const femaleCount = studentStats.find(stat => stat.gender === 'FEMALE')?._count.gender || 0;
          const otherCount = studentStats.find(stat => stat.gender === 'OTHER')?._count.gender || 0;

          classesList = await this.prisma.class.findMany({
            where: { 
              isActive: true,
              schoolId: filters.schoolId,
            },
            select: {
              id: true,
              name: true,
              grade: true,
              section: true,
              school: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
            orderBy: [
              { grade: 'asc' },
              { section: 'asc' },
            ],
          });

          schoolInfo = {
            id: school.id,
            name: school.name,
            code: school.code,
            level: school.level,
            address: school.address,
            lga: school.lga,
            totalStudents: school.totalStudents,
            totalTeachers: school.totalTeachers,
            capacity: school.capacity,
            studentStats: {
              total: totalStudents,
              male: maleCount,
              female: femaleCount,
              other: otherCount,
            },
          };
        }
      }

      const isTermName = currentTerm && typeof currentTerm === 'string' && (currentTerm.includes('_') || Object.values(TermType).includes(currentTerm as TermType));
      const termQueryCondition: any = {};
      if (currentTerm) {
        if (isTermName) {
          termQueryCondition.name = currentTerm as TermType;
        } else {
          termQueryCondition.id = currentTerm;
        }
      }
      if (currentSession) {
        termQueryCondition.session = currentSession.includes('/')
          ? { name: currentSession }
          : { id: currentSession };
      }

      // Build student where conditions for pagination
      const studentWhereConditions: any = {
        isActive: true,
      };

      // Require assessments for the specified session & term so search and table results are strictly scoped to that academic period
      if (Object.keys(termQueryCondition).length > 0) {
        studentWhereConditions.assessments = {
          some: {
            term: termQueryCondition,
          },
        };
      }

      // Apply existing cascade filters
      if (filters?.classId) {
        studentWhereConditions.classId = filters.classId;
      } else if (filters?.schoolId) {
        studentWhereConditions.schoolId = filters.schoolId;
      } else if (filters?.lgaId) {
        studentWhereConditions.school = {
          lgaId: filters.lgaId,
        };
      }

      if (filters?.gender) {
        studentWhereConditions.gender = filters.gender;
      }

      if (hasSearch && filters?.search) {
        const searchTerm = filters.search.trim();
        const searchWords = searchTerm.split(/\s+/).filter(Boolean);

        const searchConditions: any[] = [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { studentId: { contains: searchTerm, mode: 'insensitive' } },
          { school: { name: { contains: searchTerm, mode: 'insensitive' } } },
          { class: { name: { contains: searchTerm, mode: 'insensitive' } } },
        ];

        if (searchWords.length > 1) {
          const firstWord = searchWords[0];
          const restWords = searchWords.slice(1).join(' ');

          searchConditions.push(
            {
              AND: [
                { firstName: { contains: firstWord, mode: 'insensitive' } },
                { lastName: { contains: restWords, mode: 'insensitive' } },
              ],
            },
            {
              AND: [
                { firstName: { contains: restWords, mode: 'insensitive' } },
                { lastName: { contains: firstWord, mode: 'insensitive' } },
              ],
            },
            {
              AND: searchWords.map((word) => ({
                OR: [
                  { firstName: { contains: word, mode: 'insensitive' } },
                  { lastName: { contains: word, mode: 'insensitive' } },
                  { studentId: { contains: word, mode: 'insensitive' } },
                  { school: { name: { contains: word, mode: 'insensitive' } } },
                  { class: { name: { contains: word, mode: 'insensitive' } } },
                ],
              })),
            }
          );
        }

        studentWhereConditions.OR = searchConditions;
      }

      // Setup pagination and sorting (alphabetical A-Z)
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const skip = (page - 1) * limit;

      const orderByClause: any = [
        { firstName: 'asc' },
        { lastName: 'asc' },
      ];

      // Get total count first
      const totalStudents = await this.prisma.student.count({
        where: studentWhereConditions
      });

      // Then get paginated students
      const students = await this.prisma.student.findMany({
        where: studentWhereConditions,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          studentId: true,
          gender: true,
          school: {
            select: {
              name: true,
              lga: {
                select: {
                  name: true,
                },
              },
            },
          },
          class: { select: { name: true } },
          assessments: {
            where: {
              ...(Object.keys(termQueryCondition).length > 0 && {
                term: termQueryCondition,
              }),
              ...(filters?.subject && {
                subject: { name: { contains: filters.subject, mode: 'insensitive' } },
              }),
            },
            select: { score: true, maxScore: true, subject: { select: { name: true } } },
          },
        },
        orderBy: orderByClause,
        skip,
        take: limit,
      });

      // Calculate performance metrics (maintaining alphabetical database sorting)
      const performanceTable = students.map((student, index) => {
        const totalScore = student.assessments.reduce((sum, a) => sum + a.score, 0);
        const totalMaxScore = student.assessments.reduce((sum, a) => sum + a.maxScore, 0);
        const average = student.assessments.length > 0 ? totalScore / student.assessments.length : 0;
        const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

        return {
          id: student.id,
          position: skip + index + 1,
          studentName: `${student.firstName} ${student.lastName}`,
          examNo: student.studentId,
          lga: student.school?.lga?.name || 'N/A',
          school: student.school?.name || 'N/A',
          class: student.class?.name || 'N/A',
          total: totalScore,
          totalMaxScore,
          average: Math.round(average * 100) / 100,
          percentage: Math.round(percentage * 100) / 100,
          gender: student.gender,
        };
      });

      // Calculate pagination info
      const totalPages = Math.ceil(totalStudents / limit);
      const hasMore = page < totalPages;

      const responseData: any = {
        session: currentSession,
        term: currentTerm,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalStudents,
          itemsPerPage: limit,
          hasMore,
        },
        lastUpdated: new Date().toISOString(),
        performanceTable,
      };

      if (lgasList) {
        responseData.lgas = lgasList;
        responseData.totalLgas = lgasList.length;
      }
      if (schoolsList) {
        responseData.schools = schoolsList;
        responseData.totalSchools = schoolsList.length;
      }
      if (classesList) {
        responseData.classes = classesList;
        responseData.totalClasses = classesList.length;
      }
      if (schoolInfo) {
        responseData.school = schoolInfo;
      }

      return ResponseHelper.success('Students retrieved successfully', responseData);

    } catch (error) {
      this.logger.error('Error in getStudentDashboard:', error);
      throw new Error(`Error fetching student dashboard: ${error.message}`);
    }
  }

  async getStudentResultPdf(studentId: string, options?: { sessionId?: string; termId?: string; session?: string; term?: TermType }) {
    this.logger.log(`Generating PDF for student ID: ${studentId}`, options);

    try {
      // Get current active session and term if not specified
      let currentSession = options?.session;
      let currentTerm = options?.term;

      if (!currentSession || !currentTerm) {
        const activeSession = await this.prisma.session.findFirst({
          where: { isActive: true },
          include: {
            terms: {
              where: { isActive: true },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        });

        if (!activeSession) {
          throw new Error('No active session found');
        }

        currentSession = currentSession || activeSession.name;
        currentTerm = currentTerm || activeSession.terms[0]?.name as TermType;
      }

      // Get comprehensive student details (same as getStudentDetails)
      const student = await this.prisma.student.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          studentId: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
          address: true,
          enrollmentDate: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          school: {
            select: {
              id: true,
              name: true,
              code: true,
              level: true,
              address: true,
              phone: true,
              email: true,
              website: true,
              principalName: true,
              principalPhone: true,
              principalEmail: true,
              establishedYear: true,
              totalStudents: true,
              totalTeachers: true,
              capacity: true,
              lga: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  state: true,
                }
              }
            }
          },
          class: {
            select: {
              id: true,
              name: true,
              grade: true,
              section: true,
              capacity: true,
              currentEnrollment: true,
              academicYear: true,
              teacher: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                }
              }
            }
          },
          parent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              address: true,
              occupation: true,
            }
          }
        }
      });

      if (!student) {
        throw new NotFoundException(`Student with ID ${studentId} not found`);
      }

      const termQueryCondition = {
        ...(currentTerm.includes('_') ? { name: currentTerm as TermType } : { id: currentTerm }),
        session: {
          ...(currentSession.includes('/') ? { name: currentSession } : { id: currentSession }),
        },
      };

      // Get assessments for the specified session and term
      const assessments = await this.prisma.assessment.findMany({
        where: {
          studentId: studentId,
          term: termQueryCondition,
        },
        select: {
          id: true,
          type: true,
          title: true,
          description: true,
          maxScore: true,
          score: true,
          percentage: true,
          remarks: true,
          dateGiven: true,
          dateSubmitted: true,
          isSubmitted: true,
          isGraded: true,
          createdAt: true,
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
              level: true,
            }
          },
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
        orderBy: [
          { subject: { name: 'asc' } },
          { type: 'asc' },
          { dateGiven: 'desc' }
        ]
      });

      // Calculate performance summary (same as getStudentDetails)
      const totalAssessments = assessments.length;
      const totalScore = assessments.reduce((sum, assessment) => sum + assessment.score, 0);
      const totalMaxScore = assessments.reduce((sum, assessment) => sum + assessment.maxScore, 0);
      const averageScore = totalAssessments > 0 ? totalScore / totalAssessments : 0;
      const overallPercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

      // Group assessments by subject for detailed breakdown
      const subjectBreakdown = assessments.reduce((acc, assessment) => {
        const subjectName = assessment.subject.name;
        if (!acc[subjectName]) {
          acc[subjectName] = {
            subject: assessment.subject,
            assessments: [],
            totalScore: 0,
            totalMaxScore: 0,
            averageScore: 0,
            percentage: 0,
            assessmentCount: 0
          };
        }
        
        acc[subjectName].assessments.push(assessment);
        acc[subjectName].totalScore += assessment.score;
        acc[subjectName].totalMaxScore += assessment.maxScore;
        acc[subjectName].assessmentCount += 1;
        
        return acc;
      }, {} as Record<string, any>);

      // Calculate subject-wise averages and percentages
      Object.values(subjectBreakdown).forEach((subject: any) => {
        subject.averageScore = subject.assessmentCount > 0 ? subject.totalScore / subject.assessmentCount : 0;
        subject.percentage = subject.totalMaxScore > 0 ? (subject.totalScore / subject.totalMaxScore) * 100 : 0;
      });

      // Get assessment type breakdown
      const assessmentTypeBreakdown = assessments.reduce((acc, assessment) => {
        const type = assessment.type;
        if (!acc[type]) {
          acc[type] = {
            type,
            count: 0,
            totalScore: 0,
            totalMaxScore: 0,
            averageScore: 0,
            percentage: 0
          };
        }
        
        acc[type].count += 1;
        acc[type].totalScore += assessment.score;
        acc[type].totalMaxScore += assessment.maxScore;
        
        return acc;
      }, {} as Record<string, any>);

      // Calculate assessment type averages and percentages
      Object.values(assessmentTypeBreakdown).forEach((type: any) => {
        type.averageScore = type.count > 0 ? type.totalScore / type.count : 0;
        type.percentage = type.totalMaxScore > 0 ? (type.totalScore / type.totalMaxScore) * 100 : 0;
      });

      // Get grade classification
      const getGradeClassification = (percentage: number): string => {
        if (percentage >= 90) return 'A+ (Excellent)';
        if (percentage >= 80) return 'A (Very Good)';
        if (percentage >= 70) return 'B+ (Good)';
        if (percentage >= 60) return 'B (Fair)';
        if (percentage >= 50) return 'C (Pass)';
        if (percentage >= 40) return 'D (Poor)';
        return 'F (Fail)';
      };

      const performanceSummary = {
        session: currentSession,
        term: currentTerm,
        totalAssessments,
        totalScore: Math.round(totalScore * 100) / 100,
        totalMaxScore: Math.round(totalMaxScore * 100) / 100,
        averageScore: Math.round(averageScore * 100) / 100,
        overallPercentage: Math.round(overallPercentage * 100) / 100,
        grade: getGradeClassification(overallPercentage),
        subjectBreakdown: Object.values(subjectBreakdown).map((subject: any) => ({
          ...subject,
          totalScore: Math.round(subject.totalScore * 100) / 100,
          totalMaxScore: Math.round(subject.totalMaxScore * 100) / 100,
          averageScore: Math.round(subject.averageScore * 100) / 100,
          percentage: Math.round(subject.percentage * 100) / 100,
        })),
        assessmentTypeBreakdown: Object.values(assessmentTypeBreakdown).map((type: any) => ({
          ...type,
          totalScore: Math.round(type.totalScore * 100) / 100,
          totalMaxScore: Math.round(type.totalMaxScore * 100) / 100,
          averageScore: Math.round(type.averageScore * 100) / 100,
          percentage: Math.round(type.percentage * 100) / 100,
        }))
      };

      // Generate PDF with comprehensive data
      const studentDisplayName = `${student.firstName} ${student.lastName}`.trim() || student.studentId;
      const pdf = await generateStudentResultPdf({
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        studentId: student.studentId,
        gender: student.gender,
        schoolName: student.school?.name ?? null,
        className: student.class?.name ?? null,
        sessionName: currentSession,
        termName: currentTerm,
        assessments: (assessments || []).map(a => ({
          subjectName: a.subject.name,
          score: a.score,
          maxScore: a.maxScore,
          percentage: a.percentage,
          type: a.type,
        })),
        // Add comprehensive data for PDF generation
        studentData: {
          student,
          performanceSummary,
          lastUpdated: new Date().toISOString(),
        }
      });

      this.logger.log(`PDF generated successfully for ${student.firstName} ${student.lastName}`);
      return { pdf, filename: `asubeb - ${studentDisplayName} - ${currentTerm}.pdf` };

    } catch (error) {
      this.logger.error('Error in getStudentResultPdf:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error generating student result PDF: ${error.message}`);
    }
  }

  async getClassResultsPdf(params: { 
    schoolId: string; 
    classId: string; 
    sessionId?: string; 
    termId?: string;
    session?: string;
    term?: TermType;
  }) {
    this.logger.log(`Generating class results PDF for school: ${params.schoolId}, class: ${params.classId}`, params);

    try {
      // Get current active session and term if not specified
      let currentSession = params.session;
      let currentTerm = params.term;

      if (!currentSession || !currentTerm) {
        const activeSession = await this.prisma.session.findFirst({
          where: { isActive: true },
          include: {
            terms: {
              where: { isActive: true },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        });

        if (!activeSession) {
          throw new Error('No active session found');
        }

        currentSession = currentSession || activeSession.name;
        currentTerm = currentTerm || activeSession.terms[0]?.name as TermType;
      }

      // Fetch students in class for this school
      const students = await this.prisma.student.findMany({
        where: { isActive: true, classId: params.classId, schoolId: params.schoolId },
        select: {
          id: true,
          studentId: true,
          firstName: true,
          lastName: true,
          school: { select: { name: true } },
          class: { select: { name: true } },
          assessments: {
            where: {
              term: {
                ...(currentTerm.includes('_') ? { name: currentTerm as TermType } : { id: currentTerm }),
                session: {
                  ...(currentSession.includes('/') ? { name: currentSession } : { id: currentSession }),
                },
              },
            },
            select: {
              score: true,
              maxScore: true,
              subject: { select: { name: true } },
            },
          },
        },
        orderBy: { firstName: 'asc' },
      });

      if (students.length === 0) {
        throw new Error('No students found in the specified class');
      }

      const subjectsSet = new Set<string>();
      students.forEach(s => s.assessments.forEach(a => subjectsSet.add(a.subject.name)));
      const subjects = Array.from(subjectsSet).sort((a, b) => a.localeCompare(b));

      const rows = students.map(s => ({
        studentName: `${s.firstName} ${s.lastName}`.trim(),
        studentId: s.studentId,
        subjects: subjects.reduce((acc, subj) => {
          const hit = s.assessments.find(a => a.subject.name === subj);
          acc[subj] = hit ? { score: hit.score, maxScore: hit.maxScore } : undefined;
          return acc;
        }, {} as Record<string, { score: number; maxScore: number } | undefined>),
      }));

      const payload = {
        schoolName: students[0]?.school?.name ?? null,
        className: students[0]?.class?.name ?? null,
        sessionName: currentSession,
        termName: currentTerm,
        subjects,
        rows,
      };

      const pdf = await generateClassResultsPdf(payload);
      const filename = `asubeb - ${payload.schoolName ?? 'school'} - ${payload.className ?? 'class'} - ${payload.termName}.pdf`;
      
      this.logger.log(`Class results PDF generated successfully for ${students.length} students`);
      return { pdf, filename };

    } catch (error) {
      this.logger.error('Error in getClassResultsPdf:', error);
      throw new Error(`Error generating class results PDF: ${error.message}`);
    }
  }
  async getAllStudents(page: number = 1, limit: number = 10, schoolId?: string) {
    const skip = (page - 1) * limit;
    
    const where = {
      isActive: true,
      ...(schoolId && { schoolId }),
    };

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          school: {
            select: {
              name: true,
              code: true,
            },
          },
          class: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return ResponseHelper.success(
      'Students retrieved successfully',
      students,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    );
  }

  async getStudentById(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        school: {
          select: {
            name: true,
            code: true,
          },
        },
        class: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!student) {
      this.logger.error(`Student with ID ${id} not found`);
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    this.logger.log(`Student with ID ${id} retrieved successfully`);

    return ResponseHelper.success('Student retrieved successfully', student);
  }

  async createStudent(createStudentDto: any) {
    const student = await this.prisma.student.create({
      data: createStudentDto,
      include: {
        school: {
          select: {
            name: true,
            code: true,
          },
        },
        class: {
          select: {
            name: true,
          },
        },
      },
    });

    // Update school student count
    await this.updateSchoolStudentCount(student.schoolId);

    return ResponseHelper.created('Student created successfully', student);
  }

  async updateStudent(id: string, updateStudentDto: any) {
    const existingStudent = await this.prisma.student.findUnique({
      where: { id },
      select: { schoolId: true },
    });

    if (!existingStudent) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    const student = await this.prisma.student.update({
      where: { id },
      data: updateStudentDto,
      include: {
        school: {
          select: {
            name: true,
            code: true,
          },
        },
        class: {
          select: {
            name: true,
          },
        },
      },
    });

    // Update school student count if school changed
    if (updateStudentDto.schoolId && updateStudentDto.schoolId !== existingStudent.schoolId) {
      await Promise.all([
        this.updateSchoolStudentCount(existingStudent.schoolId),
        this.updateSchoolStudentCount(updateStudentDto.schoolId),
      ]);
    } else {
      await this.updateSchoolStudentCount(student.schoolId);
    }

    return ResponseHelper.success('Student updated successfully', student);
  }

  async deleteStudent(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      select: { schoolId: true },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    await this.prisma.student.update({
      where: { id },
      data: { isActive: false },
    });

    // Update school student count
    await this.updateSchoolStudentCount(student.schoolId);

    return ResponseHelper.success('Student deleted successfully');
  }

  async getStudentAcademicRecord(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        school: {
          select: {
            name: true,
            code: true,
          },
        },
        class: {
          select: {
            name: true,
          },
        },
        assessments: {
          include: {
            subject: true,
            term: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return ResponseHelper.success('Academic record retrieved successfully', student);
  }

  async getStudentAssessmentBreakdown(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
        gender: true,
        school: {
          select: {
            name: true,
          },
        },
        class: {
          select: {
            name: true,
          },
        },
        assessments: {
          select: {
            id: true,
            score: true,
            maxScore: true,
            percentage: true,
            type: true,
            title: true,
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            term: {
              select: {
                id: true,
                name: true,
                session: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            subject: {
              name: 'asc',
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // Calculate total score
    const totalScore = student.assessments.reduce((sum, assessment) => sum + assessment.score, 0);
    const totalMaxScore = student.assessments.reduce((sum, assessment) => sum + assessment.maxScore, 0);
    const averageScore = student.assessments.length > 0 ? totalScore / student.assessments.length : 0;

    const breakdown = {
      student: {
        id: student.id,
        studentId: student.studentId,
        name: `${student.firstName} ${student.lastName}`,
        gender: student.gender,
        school: student.school?.name,
        class: student.class?.name,
      },
      assessments: student.assessments,
      summary: {
        totalAssessments: student.assessments.length,
        totalScore,
        totalMaxScore,
        averageScore: Math.round(averageScore * 100) / 100,
        percentage: totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100 * 100) / 100 : 0,
      },
    };

    return ResponseHelper.success('Assessment breakdown retrieved successfully', breakdown);
  }

  private async updateSchoolStudentCount(schoolId: string): Promise<void> {
    const studentCount = await this.prisma.student.count({
      where: {
        schoolId,
        isActive: true,
      },
    });

    await this.prisma.school.update({
      where: { id: schoolId },
      data: { totalStudents: studentCount },
    });
  }

  async searchFilterPaginationStudents(query: {
    page?: number;
    limit?: number;
    search?: string;
    lgaId?: string;
    schoolId?: string;
    classId?: string;
    gender?: string;
    subject?: string;
    session?: string;
    term?: TermType;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 10,
      search,
      lgaId,
      schoolId,
      classId,
      gender,
      subject,
      session,
      term,
      sortBy = 'firstName',
      sortOrder = 'asc',
    } = query;

    this.logger.log(`Searching students with filters: ${JSON.stringify(query)}`);

    try {
      const skip = (page - 1) * limit;

      // Get current session and term if not provided
      let currentSession = session;
      let currentTerm = term;

      if (!currentSession || !currentTerm) {
        const activeSession = await this.prisma.session.findFirst({
          where: { isCurrent: true, isActive: true },
        });

        if (!activeSession) {
          throw new Error('No current session found');
        }

        currentSession = currentSession || activeSession.name;

        if (!currentTerm) {
          const currentTermData = await this.prisma.term.findFirst({
            where: {
              sessionId: activeSession.id,
              isCurrent: true,
              isActive: true,
            },
          });

          if (!currentTermData) {
            throw new Error('No current term found');
          }

          currentTerm = currentTermData.name as TermType;
        }
      }

      // Build where conditions for students
      const studentWhereConditions: any = {
        isActive: true,
      };

      // Apply filters
      if (lgaId) {
        studentWhereConditions.school = {
          lgaId: lgaId,
        };
      }

      if (schoolId) {
        studentWhereConditions.schoolId = schoolId;
      }

      if (classId) {
        studentWhereConditions.classId = classId;
      }

      if (gender) {
        studentWhereConditions.gender = gender;
      }

      if (search) {
        studentWhereConditions.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { studentId: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Get total count for pagination
      const total = await this.prisma.student.count({
        where: studentWhereConditions,
      });

      // Get students with pagination and filters
      const students = await this.prisma.student.findMany({
        where: studentWhereConditions,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          studentId: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
          address: true,
          enrollmentDate: true,
          school: {
            select: {
              id: true,
              name: true,
              code: true,
              level: true,
              lga: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  state: true,
                },
              },
            },
          },
          class: {
            select: {
              id: true,
              name: true,
              grade: true,
              section: true,
            },
          },
          parent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          assessments: {
            where: {
              term: {
                name: currentTerm,
                session: {
                  name: currentSession,
                },
              },
              ...(subject && {
                subject: {
                  name: {
                    contains: subject,
                    mode: 'insensitive',
                  },
                },
              }),
            },
            select: {
              id: true,
              score: true,
              maxScore: true,
              percentage: true,
              type: true,
              title: true,
              subject: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
              term: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: this.getStudentOrderBy(sortBy, sortOrder),
      });

      // Process student data
      const studentsData = students.map(student => {
        const totalScore = student.assessments.reduce((sum, assessment) => sum + assessment.score, 0);
        const totalMaxScore = student.assessments.reduce((sum, assessment) => sum + assessment.maxScore, 0);
        const average = student.assessments.length > 0 ? totalScore / student.assessments.length : 0;
        const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

        return {
          id: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          studentId: student.studentId,
          email: student.email,
          phone: student.phone,
          dateOfBirth: student.dateOfBirth,
          gender: student.gender,
          address: student.address,
          enrollmentDate: student.enrollmentDate,
          school: student.school,
          class: student.class,
          parent: student.parent,
          performance: {
            totalScore,
            average: Math.round(average * 100) / 100,
            percentage: Math.round(percentage * 100) / 100,
            assessmentCount: student.assessments.length,
            assessments: student.assessments,
          },
        };
      });

      // Get filter options for frontend
      const filterOptions = await this.getStudentFilterOptions();

      this.logger.log(`Found ${studentsData.length} students (page ${page} of ${Math.ceil(total / limit)})`);

      return ResponseHelper.success('Students retrieved successfully', {
        data: studentsData,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error searching students: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getStudentExplorer(params: {
    sessionId?: string;
    termId?: string;
    lgaId?: string;
    schoolId?: string;
    classId?: string;
    studentId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    this.logger.log(`Student explorer params: ${JSON.stringify(params)}`);

    const { sessionId, termId, lgaId, schoolId, classId, studentId, search } = params;

    // Always provide sessions (with terms) and LGAs for the explorer header filters
    const [sessions, lgas] = await Promise.all([
      this.prisma.session.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          isCurrent: true,
          terms: {
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
            select: { id: true, name: true, isCurrent: true },
          },
        },
      }),
      this.prisma.localGovernmentArea.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, code: true, state: true },
      }),
    ]);

    let schools: any[] | undefined;
    let classes: any[] | undefined;
    let students: any[] | undefined;
    let student: any | undefined;
    let studentsPagination: { page: number; limit: number; total: number; totalPages: number } | undefined;
    let selectedSession: { id: string; name: string } | undefined;
    let selectedTerm: { id: string; name: string } | undefined;
    let selectedLga: { id: string; name: string } | undefined;
    let selectedSchool: { id: string; name: string } | undefined;
    let selectedClass: { id: string; name: string } | undefined;
    let selectedStudent: { id: string; name: string } | undefined;

    // If a specific student is requested, fetch that student's record for the current active session/term
    if (studentId) {
      // Resolve current active session and term
      let activeSession = await this.prisma.session.findFirst({ where: { isCurrent: true, isActive: true } });
      if (!activeSession) {
        activeSession = await this.prisma.session.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
      }

      let activeTerm = await this.prisma.term.findFirst({
        where: { isCurrent: true, isActive: true, ...(activeSession && { sessionId: activeSession.id }) },
        orderBy: { createdAt: 'desc' },
      });
      if (!activeTerm && activeSession) {
        activeTerm = await this.prisma.term.findFirst({ where: { sessionId: activeSession.id, isActive: true }, orderBy: { createdAt: 'desc' } });
      }

      student = await this.prisma.student.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          studentId: true,
          firstName: true,
          lastName: true,
          gender: true,
          email: true,
          school: { select: { id: true, name: true } },
          class: { select: { id: true, name: true } },
          assessments: {
            where: activeTerm && activeSession ? {
              term: {
                id: activeTerm.id,
                sessionId: activeSession.id,
              },
            } : undefined,
            select: {
              id: true,
              score: true,
              maxScore: true,
              percentage: true,
              type: true,
              title: true,
              subject: { select: { id: true, name: true, code: true } },
              term: { select: { id: true, name: true, session: { select: { id: true, name: true } } } },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (student) {
        selectedStudent = { id: student.id, name: `${student.firstName} ${student.lastName}` };
      }
    }

    // Resolve selection display names where ids are provided
    const [sessionEntity, termEntity, lgaEntity, schoolEntity, classEntity] = await Promise.all([
      sessionId ? this.prisma.session.findUnique({ where: { id: sessionId }, select: { id: true, name: true } }) : Promise.resolve(null),
      termId ? this.prisma.term.findUnique({ where: { id: termId }, select: { id: true, name: true } }) : Promise.resolve(null),
      lgaId ? this.prisma.localGovernmentArea.findUnique({ where: { id: lgaId }, select: { id: true, name: true } }) : Promise.resolve(null),
      schoolId ? this.prisma.school.findUnique({ where: { id: schoolId }, select: { id: true, name: true } }) : Promise.resolve(null),
      classId ? this.prisma.class.findUnique({ where: { id: classId }, select: { id: true, name: true } }) : Promise.resolve(null),
    ]);

    if (sessionEntity) selectedSession = sessionEntity;
    if (termEntity) selectedTerm = termEntity;
    if (lgaEntity) selectedLga = lgaEntity;
    if (schoolEntity) selectedSchool = schoolEntity;
    if (classEntity) selectedClass = classEntity;

    if (lgaId) {
      schools = await this.prisma.school.findMany({
        where: { isActive: true, lgaId },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, code: true, level: true },
      });
    }

    if (schoolId) {
      // Classes are global (not attached to a specific school). Return all active classes.
      classes = await this.prisma.class.findMany({
        where: { isActive: true },
        orderBy: [{ grade: 'asc' }, { section: 'asc' }],
        select: { id: true, name: true, grade: true, section: true },
      });
    }

    if (classId) {
      const page = params.page && params.page > 0 ? params.page : 1;
      const limit = params.limit && params.limit > 0 ? params.limit : 10;
      const skip = (page - 1) * limit;

      // Filter students by class, and optionally by selected school
      const where: any = {
        isActive: true,
        classId,
        ...(schoolId ? { schoolId } : {}),
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      // Determine active session and term to include assessments context
      let activeSession = await this.prisma.session.findFirst({ where: { isCurrent: true, isActive: true } });
      if (!activeSession) {
        activeSession = await this.prisma.session.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
      }
      let activeTerm = await this.prisma.term.findFirst({
        where: { isCurrent: true, isActive: true, ...(activeSession && { sessionId: activeSession.id }) },
        orderBy: { createdAt: 'desc' },
      });
      if (!activeTerm && activeSession) {
        activeTerm = await this.prisma.term.findFirst({ where: { sessionId: activeSession.id, isActive: true }, orderBy: { createdAt: 'desc' } });
      }

      const [list, total] = await Promise.all([
        this.prisma.student.findMany({
          where,
          orderBy: { firstName: 'asc' },
          skip,
          take: limit,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentId: true,
            gender: true,
            email: true,
            school: { select: { id: true, name: true } },
            class: { select: { id: true, name: true } },
            assessments: {
              where: activeTerm && activeSession ? {
                term: { id: activeTerm.id, sessionId: activeSession.id },
              } : undefined,
              select: {
                id: true,
                score: true,
                maxScore: true,
                percentage: true,
                type: true,
                title: true,
                subject: { select: { id: true, name: true, code: true } },
                term: { select: { id: true, name: true } },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        }),
        this.prisma.student.count({ where }),
      ]);

      students = list;
      studentsPagination = { page, limit, total, totalPages: Math.ceil(total / limit) };
    } else if (schoolId) {
      // Optional: allow pre-class student search by school
      if (search) {
        const page = params.page && params.page > 0 ? params.page : 1;
        const limit = params.limit && params.limit > 0 ? params.limit : 10;
        const skip = (page - 1) * limit;

        const where: any = {
          isActive: true,
          schoolId,
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        };

        const [list, total] = await Promise.all([
          this.prisma.student.findMany({
            where,
            orderBy: { firstName: 'asc' },
            skip,
            take: limit,
            select: {
              id: true,
              firstName: true,
              lastName: true,
              studentId: true,
              gender: true,
              email: true,
              school: { select: { id: true, name: true } },
              class: { select: { id: true, name: true } },
            },
          }),
          this.prisma.student.count({ where }),
        ]);

        students = list;
        studentsPagination = { page, limit, total, totalPages: Math.ceil(total / limit) };
      }
    } else if (lgaId) {
      // Optional: allow pre-school student search by LGA (through school relation)
      if (search) {
        const page = params.page && params.page > 0 ? params.page : 1;
        const limit = params.limit && params.limit > 0 ? params.limit : 10;
        const skip = (page - 1) * limit;

        const where: any = {
          isActive: true,
          school: { lgaId },
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        };

        const [list, total] = await Promise.all([
          this.prisma.student.findMany({
            where,
            orderBy: { firstName: 'asc' },
            skip,
            take: limit,
            select: {
              id: true,
              firstName: true,
              lastName: true,
              studentId: true,
              gender: true,
              email: true,
              school: { select: { id: true, name: true } },
              class: { select: { id: true, name: true } },
            },
          }),
          this.prisma.student.count({ where }),
        ]);

        students = list;
        studentsPagination = { page, limit, total, totalPages: Math.ceil(total / limit) };
      }
    } else if (search) {
      // Global student search by name, school name, or LGA name
      const page = params.page && params.page > 0 ? params.page : 1;
      const limit = params.limit && params.limit > 0 ? params.limit : 10;
      const skip = (page - 1) * limit;

      const where: any = {
        isActive: true,
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { school: { name: { contains: search, mode: 'insensitive' } } },
          { school: { lga: { name: { contains: search, mode: 'insensitive' } } } },
        ],
      };

      const [list, total] = await Promise.all([
        this.prisma.student.findMany({
          where,
          orderBy: { firstName: 'asc' },
          skip,
          take: limit,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentId: true,
            gender: true,
            email: true,
            school: { select: { id: true, name: true } },
            class: { select: { id: true, name: true } },
          },
        }),
        this.prisma.student.count({ where }),
      ]);

      students = list;
      studentsPagination = { page, limit, total, totalPages: Math.ceil(total / limit) };
    }

    // Compute totals based on current selections
    const [totalSchools, totalClasses, totalStudents] = await Promise.all([
      this.prisma.school.count({ where: { isActive: true, ...(lgaId ? { lgaId } : {}) } }),
      // Classes are global; when a school is selected, show total count of all active classes
      schoolId ? this.prisma.class.count({ where: { isActive: true } }) : Promise.resolve(undefined),
      classId ? this.prisma.student.count({ where: { isActive: true, classId, ...(schoolId ? { schoolId } : {}) } }) : Promise.resolve(undefined),
    ]);

    return ResponseHelper.success('Explorer data retrieved successfully', {
      totals: {
        schools: totalSchools,
        ...(totalClasses !== undefined ? { classes: totalClasses } : {}),
        ...(totalStudents !== undefined ? { students: totalStudents } : {}),
      },
      selections: {
        session: selectedSession,
        term: selectedTerm,
        lga: selectedLga,
        school: selectedSchool,
        class: selectedClass,
        student: selectedStudent,
      },
      
      sessions,
      lgas,
      ...(schools && { schools }),
      ...(classes && { classes }),
      ...(students && { students }),
      ...(student && { student }),
      ...(studentsPagination && { pagination: studentsPagination }),
      lastUpdated: new Date().toISOString(),
    });
  }

  private getStudentOrderBy(sortBy: string, sortOrder: 'asc' | 'desc') {
    const fieldMapping: { [key: string]: any } = {
      firstName: 'firstName',
      lastName: 'lastName',
      studentId: 'studentId',
      email: 'email',
      gender: 'gender',
      enrollmentDate: 'enrollmentDate',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    };

    const actualField = fieldMapping[sortBy] || 'firstName';
    return { [actualField]: sortOrder };
  }

  private async getStudentFilterOptions() {
    const [lgas, schools, classes, subjects, genders] = await Promise.all([
      this.prisma.localGovernmentArea.findMany({
        where: { isActive: true },
        select: { id: true, name: true, code: true, state: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.school.findMany({
        where: { isActive: true },
        select: { id: true, name: true, code: true, level: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.class.findMany({
        where: { isActive: true },
        select: { id: true, name: true, grade: true, section: true },
        orderBy: [{ grade: 'asc' }, { section: 'asc' }],
      }),
      this.prisma.subject.findMany({
        where: { isActive: true },
        select: { id: true, name: true, code: true, level: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.student.groupBy({
        by: ['gender'],
        where: { isActive: true },
        _count: { gender: true },
      }),
    ]);

    return {
      lgas,
      schools,
      classes,
      subjects,
      genders: genders.map(g => ({ gender: g.gender, count: g._count.gender })),
    };
  }

  async getStudentDetails(studentId: string, filters?: {
    session?: string;
    term?: TermType | string;
  }) {
    this.logger.log(`Fetching student details for ID: ${studentId}`, filters);

    try {
      // Resolve session and term safely (accepting either IDs or names/enums)
      const currentSession = filters?.session;
      const currentTerm = filters?.term;

      let sessionData: any = currentSession
        ? await this.prisma.session.findFirst({
            where: {
              OR: [{ id: currentSession }, { name: currentSession }],
            },
          })
        : null;

      if (!sessionData) {
        sessionData = await this.prisma.session.findFirst({
          where: { isCurrent: true, isActive: true },
        });
        if (!sessionData) {
          sessionData = await this.prisma.session.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
          });
        }
      }

      const isCombined = Boolean(currentTerm && currentTerm.toUpperCase() === 'COMBINED');
      let termData: any = null;
      if (!isCombined) {
        if (currentTerm) {
          const isTermType = Object.values(TermType).includes(currentTerm as TermType);
          if (sessionData) {
            termData = await this.prisma.term.findFirst({
              where: {
                sessionId: sessionData.id,
                OR: [
                  { id: currentTerm },
                  ...(isTermType ? [{ name: currentTerm as TermType }] : []),
                ],
              },
            });
          }
          if (!termData) {
            termData = await this.prisma.term.findFirst({
              where: {
                OR: [
                  { id: currentTerm },
                  ...(isTermType ? [{ name: currentTerm as TermType }] : []),
                ],
              },
            });
          }
        }

        if (!termData && sessionData) {
          termData = await this.prisma.term.findFirst({
            where: {
              sessionId: sessionData.id,
              isCurrent: true,
              isActive: true,
            },
          });
          if (!termData) {
            termData = await this.prisma.term.findFirst({
              where: {
                sessionId: sessionData.id,
                isActive: true,
              },
              orderBy: { createdAt: 'desc' },
            });
          }
        }
      }

      // Get student details with school and class information
      const student = await this.prisma.student.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          studentId: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
          address: true,
          enrollmentDate: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          school: {
            select: {
              id: true,
              name: true,
              code: true,
              level: true,
              address: true,
              phone: true,
              email: true,
              website: true,
              principalName: true,
              principalPhone: true,
              principalEmail: true,
              establishedYear: true,
              totalStudents: true,
              totalTeachers: true,
              capacity: true,
              lga: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  state: true,
                }
              }
            }
          },
          class: {
            select: {
              id: true,
              name: true,
              grade: true,
              section: true,
              capacity: true,
              currentEnrollment: true,
              academicYear: true,
              teacher: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                }
              }
            }
          },
          parent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              address: true,
              occupation: true,
            }
          }
        }
      });

      if (!student) {
        throw new NotFoundException(`Student with ID ${studentId} not found`);
      }

      // Get assessments for the specified session and term
      const assessments = isCombined
        ? (sessionData
            ? await this.prisma.assessment.findMany({
                where: {
                  studentId: studentId,
                  term: {
                    sessionId: sessionData.id,
                  },
                },
                select: {
                  id: true,
                  type: true,
                  title: true,
                  description: true,
                  maxScore: true,
                  score: true,
                  percentage: true,
                  remarks: true,
                  dateGiven: true,
                  dateSubmitted: true,
                  isSubmitted: true,
                  isGraded: true,
                  createdAt: true,
                  subject: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                      level: true,
                    },
                  },
                  teacher: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
                orderBy: [
                  { subject: { name: 'asc' } },
                  { type: 'asc' },
                  { dateGiven: 'desc' },
                ],
              })
            : [])
        : (termData
            ? await this.prisma.assessment.findMany({
                where: {
                  studentId: studentId,
                  termId: termData.id,
                },
                select: {
                  id: true,
                  type: true,
                  title: true,
                  description: true,
                  maxScore: true,
                  score: true,
                  percentage: true,
                  remarks: true,
                  dateGiven: true,
                  dateSubmitted: true,
                  isSubmitted: true,
                  isGraded: true,
                  createdAt: true,
                  subject: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                      level: true,
                    },
                  },
                  teacher: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
                orderBy: [
                  { subject: { name: 'asc' } },
                  { type: 'asc' },
                  { dateGiven: 'desc' },
                ],
              })
            : []);

      // Calculate performance summary
      const totalAssessments = assessments.length;
      const totalScore = assessments.reduce((sum, assessment) => sum + assessment.score, 0);
      const totalMaxScore = assessments.reduce((sum, assessment) => sum + assessment.maxScore, 0);
      const averageScore = totalAssessments > 0 ? totalScore / totalAssessments : 0;
      const overallPercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

      // Group assessments by subject for detailed breakdown
      const subjectBreakdown = assessments.reduce((acc, assessment) => {
        const subjectName = assessment.subject.name;
        if (!acc[subjectName]) {
          acc[subjectName] = {
            subject: assessment.subject,
            assessments: [],
            totalScore: 0,
            totalMaxScore: 0,
            averageScore: 0,
            percentage: 0,
            assessmentCount: 0
          };
        }
        
        acc[subjectName].assessments.push(assessment);
        acc[subjectName].totalScore += assessment.score;
        acc[subjectName].totalMaxScore += assessment.maxScore;
        acc[subjectName].assessmentCount += 1;
        
        return acc;
      }, {} as Record<string, any>);

      // Calculate subject-wise averages and percentages
      Object.values(subjectBreakdown).forEach((subject: any) => {
        subject.averageScore = subject.assessmentCount > 0 ? subject.totalScore / subject.assessmentCount : 0;
        subject.percentage = subject.totalMaxScore > 0 ? (subject.totalScore / subject.totalMaxScore) * 100 : 0;
      });

      // Get assessment type breakdown
      const assessmentTypeBreakdown = assessments.reduce((acc, assessment) => {
        const type = assessment.type;
        if (!acc[type]) {
          acc[type] = {
            type,
            count: 0,
            totalScore: 0,
            totalMaxScore: 0,
            averageScore: 0,
            percentage: 0
          };
        }
        
        acc[type].count += 1;
        acc[type].totalScore += assessment.score;
        acc[type].totalMaxScore += assessment.maxScore;
        
        return acc;
      }, {} as Record<string, any>);

      // Calculate assessment type averages and percentages
      Object.values(assessmentTypeBreakdown).forEach((type: any) => {
        type.averageScore = type.count > 0 ? type.totalScore / type.count : 0;
        type.percentage = type.totalMaxScore > 0 ? (type.totalScore / type.totalMaxScore) * 100 : 0;
      });

      // Get grade classification
      const getGradeClassification = (percentage: number): string => {
        if (percentage >= 90) return 'A+ (Excellent)';
        if (percentage >= 80) return 'A (Very Good)';
        if (percentage >= 70) return 'B+ (Good)';
        if (percentage >= 60) return 'B (Fair)';
        if (percentage >= 50) return 'C (Pass)';
        if (percentage >= 40) return 'D (Poor)';
        return 'F (Fail)';
      };

      const performanceSummary = {
        session: sessionData?.name || currentSession || 'N/A',
        term: isCombined ? 'Combined (All Terms)' : (termData?.name || currentTerm || 'N/A'),
        totalAssessments,
        totalScore: Math.round(totalScore * 100) / 100,
        totalMaxScore: Math.round(totalMaxScore * 100) / 100,
        averageScore: Math.round(averageScore * 100) / 100,
        overallPercentage: Math.round(overallPercentage * 100) / 100,
        grade: totalAssessments > 0 ? getGradeClassification(overallPercentage) : 'N/A',
        subjectBreakdown: Object.values(subjectBreakdown).map((subject: any) => ({
          ...subject,
          totalScore: Math.round(subject.totalScore * 100) / 100,
          totalMaxScore: Math.round(subject.totalMaxScore * 100) / 100,
          averageScore: Math.round(subject.averageScore * 100) / 100,
          percentage: Math.round(subject.percentage * 100) / 100,
        })),
        assessmentTypeBreakdown: Object.values(assessmentTypeBreakdown).map((type: any) => ({
          ...type,
          totalScore: Math.round(type.totalScore * 100) / 100,
          totalMaxScore: Math.round(type.totalMaxScore * 100) / 100,
          averageScore: Math.round(type.averageScore * 100) / 100,
          percentage: Math.round(type.percentage * 100) / 100,
        }))
      };

      this.logger.log(`Student details retrieved successfully for ${student.firstName} ${student.lastName}`);

      return ResponseHelper.success('Student details retrieved successfully', {
        student,
        performanceSummary,
        lastUpdated: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error('Error in getStudentDetails:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error fetching student details: ${error.message}`);
    }
  }

  async getStudentAnalytics(query?: StudentAnalyticsQueryDto) {
    this.logger.log(`Fetching student analytics with query:`, query);

    try {
      const sessionName = query?.session;
      const termName = query?.term;

      let sessionData = sessionName
        ? await this.prisma.session.findFirst({
            where: { OR: [{ id: sessionName }, { name: sessionName }], isActive: true },
          })
        : await this.prisma.session.findFirst({
            where: { isCurrent: true, isActive: true },
          });

      if (!sessionData) {
        sessionData = await this.prisma.session.findFirst({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        });
      }

      if (!sessionData) {
        return ResponseHelper.success('No active session found', {
          session: 'N/A',
          term: 'N/A',
          summary: {
            overallAverage: 0,
            totalStudentsAssessed: 0,
            totalEnrollment: 0,
            topPerformingLga: 'N/A',
            topPerformingClass: 'N/A',
            genderParityIndex: 1.0,
          },
          byClass: [],
          bySchool: [],
          byLga: [],
          byGender: [],
          byAgeRange: [],
        });
      }

      const isAllTerms = !termName || termName === 'ALL_TERMS' || termName === 'all' || termName === 'ALL';

      let termData: any = null;
      let termCondition = Prisma.empty;
      let prevCondition = Prisma.empty;

      if (!isAllTerms) {
        termData = await this.prisma.term.findFirst({
          where: {
            sessionId: sessionData.id,
            OR: [{ id: termName }, { name: termName as TermType }],
            isActive: true,
          },
        });

        if (!termData) {
          termData = await this.prisma.term.findFirst({
            where: {
              sessionId: sessionData.id,
              isCurrent: true,
              isActive: true,
            },
          });
        }

        if (termData) {
          termCondition = Prisma.sql`AND a."termId" = ${termData.id}`;

          // Find immediate previous term for comparison
          const sessionTerms = await this.prisma.term.findMany({
            where: { sessionId: sessionData.id },
            orderBy: { startDate: 'asc' },
          });

          const currentTermIndex = sessionTerms.findIndex((t) => t.id === termData.id);
          if (currentTermIndex > 0) {
            const prevTermId = sessionTerms[currentTermIndex - 1].id;
            prevCondition = Prisma.sql`AND a."termId" = ${prevTermId}`;
          } else {
            // Check previous session's last term
            const prevSession = await this.prisma.session.findFirst({
              where: { startDate: { lt: sessionData.startDate } },
              orderBy: { startDate: 'desc' },
              include: { terms: { orderBy: { startDate: 'desc' }, take: 1 } },
            });
            if (prevSession?.terms?.[0]) {
              prevCondition = Prisma.sql`AND a."termId" = ${prevSession.terms[0].id}`;
            }
          }
        }
      } else {
        // Combined terms for overall overview of session
        const sessionTerms = await this.prisma.term.findMany({
          where: { sessionId: sessionData.id },
        });
        const sessionTermIds = sessionTerms.map((t) => t.id);
        if (sessionTermIds.length > 0) {
          termCondition = Prisma.sql`AND a."termId" IN (${Prisma.join(sessionTermIds)})`;
        }

        // Previous session for comparison
        const prevSession = await this.prisma.session.findFirst({
          where: { startDate: { lt: sessionData.startDate } },
          orderBy: { startDate: 'desc' },
          include: { terms: true },
        });
        const prevSessionTermIds = prevSession?.terms?.map((t) => t.id) || [];
        if (prevSessionTermIds.length > 0) {
          prevCondition = Prisma.sql`AND a."termId" IN (${Prisma.join(prevSessionTermIds)})`;
        }
      }

      const lgaId = query?.lgaId;
      const schoolId = query?.schoolId;

      const lgaCondition = lgaId
        ? Prisma.sql`AND sch."lgaId" = ${lgaId}`
        : Prisma.empty;
      const schoolCondition = schoolId
        ? Prisma.sql`AND s."schoolId" = ${schoolId}`
        : Prisma.empty;

      const [
        classResults,
        schoolResults,
        lgaResults,
        prevLgaResults,
        genderResults,
        ageResults,
        totalEnrollment,
      ] = await Promise.all([
        // 1. By Class
        this.prisma.$queryRaw<any[]>`
          SELECT 
            c.name AS "className",
            COUNT(DISTINCT s.id)::int AS "studentCount",
            ROUND(AVG((a.score::float / NULLIF(a."maxScore", 0)) * 100)::numeric, 1)::float AS "averagePercentage",
            ROUND(AVG(a.score)::numeric, 1)::float AS "averageScore",
            ROUND(AVG(CASE WHEN s.gender = 'MALE' THEN (a.score::float / NULLIF(a."maxScore", 0)) * 100 END)::numeric, 1)::float AS "maleAverage",
            ROUND(AVG(CASE WHEN s.gender = 'FEMALE' THEN (a.score::float / NULLIF(a."maxScore", 0)) * 100 END)::numeric, 1)::float AS "femaleAverage"
          FROM assessments a
          JOIN students s ON a."studentId" = s.id
          JOIN classes c ON s."classId" = c.id
          JOIN schools sch ON s."schoolId" = sch.id
          WHERE s."isActive" = true
          ${termCondition}
          ${lgaCondition}
          ${schoolCondition}
          GROUP BY c.name
          ORDER BY "averagePercentage" DESC;
        `,

        // 2. By School (Top 8)
        this.prisma.$queryRaw<any[]>`
          SELECT 
            sch.id AS "schoolId",
            sch.name AS "schoolName",
            COALESCE(lga.name, 'N/A') AS "lgaName",
            COUNT(DISTINCT s.id)::int AS "studentCount",
            ROUND(AVG((a.score::float / NULLIF(a."maxScore", 0)) * 100)::numeric, 1)::float AS "averagePercentage",
            ROUND(AVG(a.score)::numeric, 0)::int AS "totalScore"
          FROM assessments a
          JOIN students s ON a."studentId" = s.id
          JOIN schools sch ON s."schoolId" = sch.id
          LEFT JOIN local_government_areas lga ON sch."lgaId" = lga.id
          WHERE s."isActive" = true
          ${termCondition}
          ${lgaCondition}
          ${schoolCondition}
          GROUP BY sch.id, sch.name, lga.name
          HAVING COUNT(DISTINCT s.id) > 0
          ORDER BY "averagePercentage" DESC
          LIMIT 8;
        `,

        // 3. By LGA (All 17 LGAs)
        this.prisma.$queryRaw<any[]>`
          SELECT 
            lga.id AS "lgaId",
            lga.name AS "lgaName",
            COALESCE(lga.code, '') AS "rawCode",
            COUNT(DISTINCT sch.id)::int AS "schoolCount",
            COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN s.id END)::int AS "studentCount",
            ROUND(COALESCE(AVG((a.score::float / NULLIF(a."maxScore", 0)) * 100), 0)::numeric, 1)::float AS "averagePercentage",
            ROUND(COALESCE(COUNT(DISTINCT CASE WHEN (a.score::float / NULLIF(a."maxScore", 0)) >= 0.5 THEN s.id END)::float / NULLIF(COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN s.id END), 0) * 100, 0)::numeric, 1)::float AS "passRate"
          FROM local_government_areas lga
          LEFT JOIN schools sch ON sch."lgaId" = lga.id
          LEFT JOIN students s ON s."schoolId" = sch.id AND s."isActive" = true
          LEFT JOIN assessments a ON a."studentId" = s.id ${termCondition}
          GROUP BY lga.id, lga.name, lga.code
          ORDER BY lga.name ASC;
        `,

        // 3b. Previous period LGA averages (for rise/fall trend)
        prevCondition !== Prisma.empty
          ? this.prisma.$queryRaw<any[]>`
              SELECT 
                lga.id AS "lgaId",
                ROUND(COALESCE(AVG((a.score::float / NULLIF(a."maxScore", 0)) * 100), 0)::numeric, 1)::float AS "prevAverage"
              FROM local_government_areas lga
              JOIN schools sch ON sch."lgaId" = lga.id
              JOIN students s ON s."schoolId" = sch.id AND s."isActive" = true
              JOIN assessments a ON a."studentId" = s.id ${prevCondition}
              GROUP BY lga.id;
            `
          : Promise.resolve([]),

        // 4. By Gender
        this.prisma.$queryRaw<any[]>`
          SELECT 
            s.gender::text AS "gender",
            COUNT(DISTINCT s.id)::int AS "studentCount",
            ROUND(AVG((a.score::float / NULLIF(a."maxScore", 0)) * 100)::numeric, 1)::float AS "averagePercentage",
            ROUND((COUNT(DISTINCT CASE WHEN (a.score::float / NULLIF(a."maxScore", 0)) >= 0.5 THEN s.id END)::float / NULLIF(COUNT(DISTINCT s.id), 0) * 100)::numeric, 1)::float AS "passRate"
          FROM assessments a
          JOIN students s ON a."studentId" = s.id
          JOIN schools sch ON s."schoolId" = sch.id
          WHERE s."isActive" = true
          ${termCondition}
          ${lgaCondition}
          ${schoolCondition}
          GROUP BY s.gender;
        `,

        // 5. By Age Range
        this.prisma.$queryRaw<any[]>`
          SELECT 
            t."range",
            COUNT(DISTINCT t."studentId")::int AS "studentCount",
            ROUND(AVG(t.pct)::numeric, 1)::float AS "averagePercentage",
            ROUND((COUNT(DISTINCT CASE WHEN t.pct >= 50 THEN t."studentId" END)::float / NULLIF(COUNT(DISTINCT t."studentId"), 0) * 100)::numeric, 1)::float AS "passRate"
          FROM (
            SELECT 
              s.id AS "studentId",
              (a.score::float / NULLIF(a."maxScore", 0)) * 100 AS pct,
              CASE 
                WHEN s."dateOfBirth" IS NULL THEN 'Unknown'
                WHEN EXTRACT(YEAR FROM AGE(NOW(), s."dateOfBirth")) < 6 THEN 'Under 6'
                WHEN EXTRACT(YEAR FROM AGE(NOW(), s."dateOfBirth")) BETWEEN 6 AND 7 THEN '6 - 7 yrs'
                WHEN EXTRACT(YEAR FROM AGE(NOW(), s."dateOfBirth")) BETWEEN 8 AND 9 THEN '8 - 9 yrs'
                WHEN EXTRACT(YEAR FROM AGE(NOW(), s."dateOfBirth")) BETWEEN 10 AND 11 THEN '10 - 11 yrs'
                ELSE '12+ yrs'
              END AS "range"
            FROM assessments a
            JOIN students s ON a."studentId" = s.id
            JOIN schools sch ON s."schoolId" = sch.id
            WHERE s."isActive" = true
            ${termCondition}
            ${lgaCondition}
            ${schoolCondition}
          ) t
          GROUP BY t."range"
          ORDER BY 
            CASE t."range"
              WHEN 'Under 6' THEN 1
              WHEN '6 - 7 yrs' THEN 2
              WHEN '8 - 9 yrs' THEN 3
              WHEN '10 - 11 yrs' THEN 4
              WHEN '12+ yrs' THEN 5
              ELSE 6
            END;
        `,

        // Total enrollment
        this.prisma.student.count({
          where: {
            isActive: true,
            ...(schoolId ? { schoolId } : {}),
            ...(lgaId ? { school: { lgaId } } : {}),
          },
        }),
      ]);

      const totalAssessed = genderResults.reduce((sum, g) => sum + (g.studentCount || 0), 0);
      const byGenderWithShare = genderResults.map((g) => ({
        gender: g.gender,
        studentCount: g.studentCount,
        averagePercentage: g.averagePercentage || 0,
        passRate: g.passRate || 0,
        sharePercentage: totalAssessed > 0 ? Math.round((g.studentCount / totalAssessed) * 100) : 0,
      }));

      const maleAvg = byGenderWithShare.find((g) => g.gender === 'MALE')?.averagePercentage || 0;
      const femaleAvg = byGenderWithShare.find((g) => g.gender === 'FEMALE')?.averagePercentage || 0;
      const genderParityIndex = maleAvg > 0 ? Math.round((femaleAvg / maleAvg) * 100) / 100 : 1.0;

      let overallSum = 0;
      let overallCount = 0;
      byGenderWithShare.forEach((g) => {
        overallSum += (g.averagePercentage || 0) * g.studentCount;
        overallCount += g.studentCount;
      });
      const overallAverage = overallCount > 0 ? Math.round((overallSum / overallCount) * 10) / 10 : 0;

      const LGA_CODES: Record<string, string> = {
        'Aba North': 'ABA-N',
        'Aba South': 'ABA-S',
        'Arochukwu': 'ARO',
        'Bende': 'BEN',
        'Ikwuano': 'IKW',
        'Isiala Ngwa North': 'ISI-N',
        'Isiala Ngwa South': 'ISI-S',
        'Isuikwuato': 'ISU',
        'Obi Ngwa': 'OBI-N',
        'Ohafia': 'OHA',
        'Osisioma Ngwa': 'OSI',
        'Ugwunagbo': 'UGW',
        'Ukwa East': 'UKW-E',
        'Ukwa West': 'UKW-W',
        'Umuahia North': 'UMU-N',
        'Umuahia South': 'UMU-S',
        'Umunneochi': 'UMN',
      };

      const prevMap = new Map<string, number>();
      if (Array.isArray(prevLgaResults)) {
        prevLgaResults.forEach((p) => {
          if (p.lgaId && p.prevAverage !== undefined && p.prevAverage !== null) {
            prevMap.set(p.lgaId, Number(p.prevAverage));
          }
        });
      }

      const formattedLgaResults = lgaResults.map((item) => {
        const lgaCode = LGA_CODES[item.lgaName] || item.rawCode || item.lgaName.substring(0, 4).toUpperCase();
        const prevAvg = prevMap.get(item.lgaId);
        const hasPrev = prevAvg !== undefined && prevAvg !== null && prevAvg > 0;
        const currentAvg = Number(item.averagePercentage || 0);
        const change = hasPrev ? Number((currentAvg - prevAvg).toFixed(1)) : null;

        return {
          lgaId: item.lgaId,
          lgaName: item.lgaName,
          lgaCode,
          schoolCount: Number(item.schoolCount || 0),
          studentCount: Number(item.studentCount || 0),
          averagePercentage: currentAvg,
          passRate: Number(item.passRate || 0),
          previousAverage: hasPrev ? prevAvg : null,
          change,
        };
      });

      const activeLgas = formattedLgaResults.filter((l) => l.studentCount > 0);
      const topPerformingLga = activeLgas.length > 0
        ? [...activeLgas].sort((a, b) => b.averagePercentage - a.averagePercentage)[0]?.lgaName || 'N/A'
        : 'N/A';

      const topPerformingClass = classResults.length > 0 ? classResults[0]?.className || 'N/A' : 'N/A';

      return ResponseHelper.success('Student analytics retrieved successfully', {
        session: sessionData.name,
        term: isAllTerms ? 'ALL_TERMS' : (termData?.name || 'N/A'),
        summary: {
          overallAverage,
          totalStudentsAssessed: totalAssessed,
          totalEnrollment,
          topPerformingLga,
          topPerformingClass,
          genderParityIndex,
        },
        byClass: classResults.map((c) => ({
          className: c.className,
          studentCount: c.studentCount,
          averageScore: c.averageScore || 0,
          averagePercentage: c.averagePercentage || 0,
          maleAverage: c.maleAverage ?? c.averagePercentage ?? 0,
          femaleAverage: c.femaleAverage ?? c.averagePercentage ?? 0,
        })),
        bySchool: schoolResults,
        byLga: formattedLgaResults,
        byGender: byGenderWithShare,
        byAgeRange: ageResults,
      });
    } catch (error) {
      this.logger.error('Error in getStudentAnalytics:', error);
      throw new Error(`Error fetching student analytics: ${error.message}`);
    }
  }
}
 
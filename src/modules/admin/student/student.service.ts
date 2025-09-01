import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ResponseHelper } from '../../../common/helpers/response.helper';
import { TermType } from '@prisma/client';

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
  }) {
    this.logger.log(`Fetching student dashboard data with filters:`, filters);

    try {
      // Get current active session and term if not specified
      let currentSession = filters?.session;
      let currentTerm = filters?.term;

      if (!currentSession || !currentTerm) {
        this.logger.log('No session or term provided, fetching active session and term...');
        
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

        this.logger.log(`Found active session: ${activeSession.name}`);
        this.logger.log(`Available terms: ${activeSession.terms.map(t => t.name).join(', ')}`);

        currentSession = currentSession || activeSession.name;
        currentTerm = currentTerm || activeSession.terms[0]?.name as TermType;

        if (!currentTerm) {
          // Try to get any term from the session
          const anyTerm = await this.prisma.term.findFirst({
            where: {
              sessionId: activeSession.id,
            },
            orderBy: { createdAt: 'desc' },
          });

          if (anyTerm) {
            currentTerm = anyTerm.name as TermType;
            this.logger.log(`Using fallback term: ${currentTerm}`);
          } else {
            throw new Error('No terms found for active session');
          }
        }
      }

      this.logger.log(`Using session: ${currentSession}, term: ${currentTerm}`);

      // Get all LGAs
      const lgas = await this.prisma.localGovernmentArea.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          code: true,
          state: true,
        },
      });

      // Get all schools
      const schools = await this.prisma.school.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          code: true,
          level: true,
        },
      });

      // Get all classes
      const classes = await this.prisma.class.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          grade: true,
          section: true,
          school: {
            select: {
              name: true,
            },
          },
        },
      });

      // Get all subjects
      const subjects = await this.prisma.subject.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          code: true,
          level: true,
        },
      });

      // Get gender distribution
      const genders = await this.prisma.student.groupBy({
        by: ['gender'],
        where: { isActive: true },
        _count: {
          gender: true,
        },
      });

      // Build student where conditions
      const studentWhereConditions: any = {
        isActive: true,
        assessments: {
          some: {
            term: {
              name: currentTerm,
              session: {
                name: currentSession,
              },
            },
          },
        },
      };

      // Apply filters
      if (filters?.schoolId) {
        studentWhereConditions.schoolId = filters.schoolId;
        this.logger.log(`Applied school filter: ${filters.schoolId}`);
      }

      if (filters?.classId) {
        studentWhereConditions.classId = filters.classId;
        this.logger.log(`Applied class filter: ${filters.classId}`);
      }

      if (filters?.gender) {
        studentWhereConditions.gender = filters.gender;
        this.logger.log(`Applied gender filter: ${filters.gender}`);
      }

      if (filters?.search) {
        studentWhereConditions.OR = [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { studentId: { contains: filters.search, mode: 'insensitive' } },
        ];
        this.logger.log(`Applied search filter: ${filters.search}`);
      }

      // Get student performance table with filters
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
            },
          },
          class: {
            select: {
              name: true,
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
              // Apply subject filter if specified
              ...(filters?.subject && {
                subject: {
                  name: {
                    contains: filters.subject,
                    mode: 'insensitive',
                  },
                },
              }),
            },
            select: {
              score: true,
              maxScore: true,
              subject: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          firstName: 'asc',
        },
      });

      this.logger.log(`Found ${students.length} students with filters`);
      if (students.length > 0) {
        this.logger.log(`Sample student: ${students[0].firstName} ${students[0].lastName} - Class: ${students[0].class?.name} - School: ${students[0].school?.name}`);
      }

      // Calculate performance metrics for each student
      const performanceData = students.map(student => {
        const totalScore = student.assessments.reduce((sum, assessment) => sum + assessment.score, 0);
        const totalMaxScore = student.assessments.reduce((sum, assessment) => sum + assessment.maxScore, 0);
        const average = student.assessments.length > 0 ? totalScore / student.assessments.length : 0;
        const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

        return {
          studentName: `${student.firstName} ${student.lastName}`,
          examNo: student.studentId,
          school: student.school?.name || 'N/A',
          class: student.class?.name || 'N/A',
          total: totalScore,
          average: Math.round(average * 100) / 100,
          percentage: Math.round(percentage * 100) / 100,
          gender: student.gender,
        };
      });

      // Sort by total score in descending order and add positions
      performanceData.sort((a, b) => b.total - a.total);
      const performanceTable = performanceData.map((student, index) => ({
        position: index + 1,
        ...student,
      }));

      return ResponseHelper.success('Student dashboard data retrieved successfully', {
        session: currentSession,
        term: currentTerm,
        lgas,
        schools,
        classes,
        subjects,
        genders,
        performanceTable,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      throw new Error(`Error fetching student dashboard: ${error.message}`);
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
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

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
  
  
} 
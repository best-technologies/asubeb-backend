import { Injectable, NotFoundException, Logger, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ResponseHelper } from '../../common/helpers/response.helper';
import * as colors from 'colors';
import { AcademicContextService } from '../academic/academic-context.service';

@Injectable()
export class GradingService {
  private readonly logger = new Logger(GradingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly academicContext: AcademicContextService,
  ) {}

  private grades = [
    {
      id: '1',
      studentId: '1',
      subject: 'Mathematics',
      semester: 'First Semester',
      academicYear: '2023-2024',
      assignmentScore: 85,
      examScore: 90,
      totalScore: 87.5,
      grade: 'A',
      remarks: 'Excellent performance',
      teacherId: 'TCH001',
      teacherName: 'Mr. Johnson',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      studentId: '1',
      subject: 'English',
      semester: 'First Semester',
      academicYear: '2023-2024',
      assignmentScore: 78,
      examScore: 82,
      totalScore: 80,
      grade: 'B+',
      remarks: 'Good performance',
      teacherId: 'TCH002',
      teacherName: 'Mrs. Smith',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  private subjects = [
    { id: '1', name: 'Mathematics', code: 'MATH101' },
    { id: '2', name: 'English', code: 'ENG101' },
    { id: '3', name: 'Science', code: 'SCI101' },
    { id: '4', name: 'History', code: 'HIST101' },
    { id: '5', name: 'Geography', code: 'GEO101' },
    { id: '6', name: 'Computer Science', code: 'CS101' },
  ];

  private gradeScales = [
    { grade: 'A', minScore: 90, maxScore: 100, points: 4.0 },
    { grade: 'A-', minScore: 85, maxScore: 89, points: 3.7 },
    { grade: 'B+', minScore: 80, maxScore: 84, points: 3.3 },
    { grade: 'B', minScore: 75, maxScore: 79, points: 3.0 },
    { grade: 'B-', minScore: 70, maxScore: 74, points: 2.7 },
    { grade: 'C+', minScore: 65, maxScore: 69, points: 2.3 },
    { grade: 'C', minScore: 60, maxScore: 64, points: 2.0 },
    { grade: 'D', minScore: 50, maxScore: 59, points: 1.0 },
    { grade: 'F', minScore: 0, maxScore: 49, points: 0.0 },
  ];

  /**
   * Fetch academic metadata needed for grade entry for a given state.
   * Returns the current session, current term and all LGAs in the state.
   */
  async getAcademicMetadataForGradeEntry(stateId: string) {
    this.logger.log(colors.magenta(`Fetching academic metadata for grade entry for state ${stateId}`));

    try {
      const [{ currentSession, currentTerm }, lgas] = await Promise.all([
        this.academicContext.getCurrentSessionAndTerm(stateId),
        this.academicContext.getLgasWithSchoolCounts(stateId),
      ]);

      this.logger.log(colors.green('Academic metadata for grade entry retrieved successfully'));

      return ResponseHelper.success('Academic metadata retrieved successfully', {
        stateId,
        currentSession,
        currentTerm,
        totalLocalGovernments: lgas.length,
        localGovernments: lgas,
      });
    } catch (error) {
      this.logger.error(colors.red(`Failed to fetch academic metadata for grade entry: ${error?.message ?? error}`));
      return ResponseHelper.error(
        'Failed to fetch academic metadata for grade entry',
        (error as any)?.message ?? error,
        500,
      );
    }
  }

  /**
   * Fetch all schools under a selected Local Government Area for a given state.
   * Used during grade entry when an officer selects an LGA and needs its schools.
   */
  async getSchoolsByLocalGovernment(stateId: string, lgaId: string) {
    this.logger.log(colors.magenta(`Fetching schools for state ${stateId} and LGA ${lgaId}`));

    try {
      const schools = await this.academicContext.getSchoolsWithClassCounts(stateId, lgaId);

      this.logger.log(colors.green(`Retrieved ${schools.length} schools for LGA ${lgaId}`));

      return ResponseHelper.success('Schools in LGA retrieved successfully', {
        stateId,
        lgaId,
        total: schools.length,
        schools,
      });
    } catch (error) {
      this.logger.error(colors.red(`Failed to fetch schools for LGA ${lgaId}: ${error?.message ?? error}`));
      return ResponseHelper.error(
        'Failed to fetch schools for LGA',
        (error as any)?.message ?? error,
        500,
      );
    }
  }

  /**
   * Fetch all classes under a selected school for a given state.
   * Used during grade entry when an officer selects a school and needs its classes.
   */
  async getClassesBySchool(stateId: string, schoolId: string) {
    this.logger.log(colors.magenta(`Fetching classes for state ${stateId} and school ${schoolId}`));

    try {
      const classes = await this.academicContext.getClassesWithStudentCounts(stateId, schoolId);

      this.logger.log(colors.green(`Retrieved ${classes.length} classes for school ${schoolId}`));

      return ResponseHelper.success('Classes in school retrieved successfully', {
        stateId,
        schoolId,
        total: classes.length,
        classes,
      });
    } catch (error) {
      this.logger.error(colors.red(`Failed to fetch classes for school ${schoolId}: ${error?.message ?? error}`));
      return ResponseHelper.error(
        'Failed to fetch classes for school',
        (error as any)?.message ?? error,
        500,
      );
    }
  }

  /**
   * Fetch all students under a selected class.
   * Used during grade entry when an officer selects a class and needs its students.
   * The state is derived from the students' records, so only classId is required.
   */
  async fetchAllStudentsByClassId(classId: string) {
    this.logger.log(colors.magenta(`Fetching students for class ${classId}`));

    try {
      // Fetch all active students in the class
      const students = await this.prisma.student.findMany({
        where: {
          classId,
          isActive: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          studentId: true,
          gender: true,
          email: true,
          schoolId: true,
          stateId: true,
        },
        orderBy: { lastName: 'asc' },
      });

      if (students.length === 0) {
        this.logger.log(colors.yellow(`No students found for class ${classId}`));
        return ResponseHelper.success('No students found for class', {
          currentSession: null,
          currentTerm: null,
          stateId: null,
          schoolId: null,
          classId,
          total: 0,
          students: [],
        });
      }

      // Derive stateId from the first student record
      const stateId = students[0].stateId;

      // Fetch current session and term for this state
      const { currentSession, currentTerm } = await this.academicContext.getCurrentSessionAndTerm(stateId);

      // If we have a current term, find which students already have assessments (results) for that term & class
      let studentIdsWithResults = new Set<string>();
      if (currentTerm) {
        const assessments = await this.prisma.assessment.findMany({
          where: {
            classId,
            termId: currentTerm.id,
          },
          select: {
            studentId: true,
          },
        });

        studentIdsWithResults = new Set(assessments.map(a => a.studentId));
      }

      this.logger.log(colors.green(`Retrieved ${students.length} students for class ${classId}`));

      const schoolId = students[0]?.schoolId ?? null;

      return ResponseHelper.success('Students in class retrieved successfully', {
        currentSession: currentSession
          ? {
              id: currentSession.id,
              name: currentSession.name,
              isCurrent: currentSession.isCurrent,
            }
          : null,
        currentTerm: currentTerm
          ? {
              isCurrent: currentTerm.isCurrent,
              name: currentTerm.name,
              id: currentTerm.id,
            }
          : null,
        stateId,
        schoolId,
        classId,
        total: students.length,
        students: students.map(({ schoolId, firstName, lastName, ...rest }) => {
          const rawFullName = `${firstName ?? ''} ${lastName ?? ''}`.trim() || firstName || lastName || '';
          const formattedFullName = this.formatFullName(rawFullName);

          return {
            ...rest,
            firstName,
            lastName,
            fullName: formattedFullName,
            hasResultForActiveTerm: currentTerm ? studentIdsWithResults.has(rest.id) : false,
          };
        }),
      });
    } catch (error) {
      this.logger.error(colors.red(`Failed to fetch students for class ${classId}: ${error?.message ?? error}`));
      return ResponseHelper.error(
        'Failed to fetch students for class',
        (error as any)?.message ?? error,
        500,
      );
    }
  }

  /**
   * Helper to format a raw name string into "Title Case" for display.
   */
  private formatFullName(name: string): string {
    if (!name) return '';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Wrapper: validate user and fetch students for a given class.
   * Keeps controller thin by moving auth/state checks here.
  //  */
  // async fetchStudentsByClassForUser(user: any, classId: string) {
  //   if (!user) {
  //     throw new ForbiddenException('User not authenticated');
  //   }

  //   if (user.role !== 'SUBEB_OFFICER') {
  //     throw new ForbiddenException('Only SUBEB_OFFICER can access this resource');
  //   }

  //   if (!user.stateId) {
  //     throw new BadRequestException('User state not found');
  //   }

  //   return this.getStudentsByClass(user.stateId, classId);
  // }

  // async getStudentGrades(studentId: string, subject?: string, semester?: string) {
  //   let filteredGrades = this.grades.filter(g => g.studentId === studentId);
    
  //   if (subject) {
  //     filteredGrades = filteredGrades.filter(g => g.subject === subject);
  //   }
    
  //   if (semester) {
  //     filteredGrades = filteredGrades.filter(g => g.semester === semester);
  //   }

  //   return {
  //     studentId,
  //     grades: filteredGrades,
  //     summary: {
  //       totalSubjects: filteredGrades.length,
  //       averageScore: filteredGrades.reduce((sum, g) => sum + g.totalScore, 0) / filteredGrades.length,
  //       highestGrade: Math.max(...filteredGrades.map(g => g.totalScore)),
  //       lowestGrade: Math.min(...filteredGrades.map(g => g.totalScore)),
  //     },
  //   };
  // }

  // async addStudentGrade(studentId: string, gradeData: any) {
  //   const newGrade = {
  //     id: (this.grades.length + 1).toString(),
  //     studentId,
  //     ...gradeData,
  //     totalScore: (gradeData.assignmentScore + gradeData.examScore) / 2,
  //     grade: this.calculateGrade((gradeData.assignmentScore + gradeData.examScore) / 2),
  //     createdAt: new Date().toISOString(),
  //     updatedAt: new Date().toISOString(),
  //   };
    
  //   this.grades.push(newGrade);
  //   return newGrade;
  // }

  // async updateStudentGrade(studentId: string, gradeId: string, gradeData: any) {
  //   const gradeIndex = this.grades.findIndex(g => g.id === gradeId && g.studentId === studentId);
  //   if (gradeIndex === -1) {
  //     throw new NotFoundException(`Grade not found`);
  //   }

  //   this.grades[gradeIndex] = {
  //     ...this.grades[gradeIndex],
  //     ...gradeData,
  //     totalScore: (gradeData.assignmentScore + gradeData.examScore) / 2,
  //     grade: this.calculateGrade((gradeData.assignmentScore + gradeData.examScore) / 2),
  //     updatedAt: new Date().toISOString(),
  //   };

  //   return this.grades[gradeIndex];
  // }

  // async getClassGrades(classId: string, subject?: string) {
  //   // Mock class grades - in real app, this would filter by class
  //   let filteredGrades = this.grades;
    
  //   if (subject) {
  //     filteredGrades = filteredGrades.filter(g => g.subject === subject);
  //   }

  //   return {
  //     classId,
  //     grades: filteredGrades,
  //     summary: {
  //       totalStudents: filteredGrades.length,
  //       averageScore: filteredGrades.reduce((sum, g) => sum + g.totalScore, 0) / filteredGrades.length,
  //       gradeDistribution: this.getGradeDistribution(filteredGrades),
  //     },
  //   };
  // }

  // async addBulkGrades(classId: string, gradesData: any) {
  //   const newGrades = gradesData.grades.map((gradeData: any, index: number) => ({
  //     id: (this.grades.length + index + 1).toString(),
  //     classId,
  //     ...gradeData,
  //     totalScore: (gradeData.assignmentScore + gradeData.examScore) / 2,
  //     grade: this.calculateGrade((gradeData.assignmentScore + gradeData.examScore) / 2),
  //     createdAt: new Date().toISOString(),
  //     updatedAt: new Date().toISOString(),
  //   }));

  //   this.grades.push(...newGrades);
  //   return {
  //     message: `${newGrades.length} grades added successfully`,
  //     addedGrades: newGrades,
  //   };
  // }

  // async getSubjects() {
  //   return this.subjects;
  // }

  // async getGradeScales() {
  //   return this.gradeScales;
  // }

  // async getClassGradeReport(classId: string) {
  //   const classGrades = this.grades; // In real app, filter by classId
    
  //   return {
  //     classId,
  //     reportGeneratedAt: new Date().toISOString(),
  //     summary: {
  //       totalStudents: classGrades.length,
  //       averageScore: classGrades.reduce((sum, g) => sum + g.totalScore, 0) / classGrades.length,
  //       gradeDistribution: this.getGradeDistribution(classGrades),
  //       subjectPerformance: this.getSubjectPerformance(classGrades),
  //     },
  //     topPerformers: classGrades
  //       .sort((a, b) => b.totalScore - a.totalScore)
  //       .slice(0, 5),
  //   };
  // }

  // async getStudentGradeReport(studentId: string) {
  //   const studentGrades = this.grades.filter(g => g.studentId === studentId);
    
  //   if (studentGrades.length === 0) {
  //     throw new NotFoundException(`No grades found for student ${studentId}`);
  //   }

  //   return {
  //     studentId,
  //     reportGeneratedAt: new Date().toISOString(),
  //     summary: {
  //       totalSubjects: studentGrades.length,
  //       averageScore: studentGrades.reduce((sum, g) => sum + g.totalScore, 0) / studentGrades.length,
  //       gpa: this.calculateGPA(studentGrades),
  //       gradeDistribution: this.getGradeDistribution(studentGrades),
  //     },
  //     subjectBreakdown: studentGrades.map(grade => ({
  //       subject: grade.subject,
  //       score: grade.totalScore,
  //       grade: grade.grade,
  //       remarks: grade.remarks,
  //     })),
  //   };
  // }

  // private calculateGrade(score: number): string {
  //   const gradeScale = this.gradeScales.find(gs => score >= gs.minScore && score <= gs.maxScore);
  //   return gradeScale ? gradeScale.grade : 'F';
  // }

  // private getGradeDistribution(grades: any[]) {
  //   const distribution: { [key: string]: number } = {};
  //   this.gradeScales.forEach(gs => {
  //     distribution[gs.grade] = grades.filter(g => g.grade === gs.grade).length;
  //   });
  //   return distribution;
  // }

  // private getSubjectPerformance(grades: any[]) {
  //   const subjectPerformance: { [key: string]: number } = {};
  //   const subjects = [...new Set(grades.map(g => g.subject))];
    
  //   subjects.forEach(subject => {
  //     const subjectGrades = grades.filter(g => g.subject === subject);
  //     subjectPerformance[subject] = subjectGrades.reduce((sum, g) => sum + g.totalScore, 0) / subjectGrades.length;
  //   });
    
  //   return subjectPerformance;
  // }

  // private calculateGPA(grades: any[]): number {
  //   const totalPoints = grades.reduce((sum, grade) => {
  //     const gradeScale = this.gradeScales.find(gs => gs.grade === grade.grade);
  //     return sum + (gradeScale ? gradeScale.points : 0);
  //   }, 0);
    
  //   return totalPoints / grades.length;
  // }
} 
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class GradingService {
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

  async getStudentGrades(studentId: string, subject?: string, semester?: string) {
    let filteredGrades = this.grades.filter(g => g.studentId === studentId);
    
    if (subject) {
      filteredGrades = filteredGrades.filter(g => g.subject === subject);
    }
    
    if (semester) {
      filteredGrades = filteredGrades.filter(g => g.semester === semester);
    }

    return {
      studentId,
      grades: filteredGrades,
      summary: {
        totalSubjects: filteredGrades.length,
        averageScore: filteredGrades.reduce((sum, g) => sum + g.totalScore, 0) / filteredGrades.length,
        highestGrade: Math.max(...filteredGrades.map(g => g.totalScore)),
        lowestGrade: Math.min(...filteredGrades.map(g => g.totalScore)),
      },
    };
  }

  async addStudentGrade(studentId: string, gradeData: any) {
    const newGrade = {
      id: (this.grades.length + 1).toString(),
      studentId,
      ...gradeData,
      totalScore: (gradeData.assignmentScore + gradeData.examScore) / 2,
      grade: this.calculateGrade((gradeData.assignmentScore + gradeData.examScore) / 2),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.grades.push(newGrade);
    return newGrade;
  }

  async updateStudentGrade(studentId: string, gradeId: string, gradeData: any) {
    const gradeIndex = this.grades.findIndex(g => g.id === gradeId && g.studentId === studentId);
    if (gradeIndex === -1) {
      throw new NotFoundException(`Grade not found`);
    }

    this.grades[gradeIndex] = {
      ...this.grades[gradeIndex],
      ...gradeData,
      totalScore: (gradeData.assignmentScore + gradeData.examScore) / 2,
      grade: this.calculateGrade((gradeData.assignmentScore + gradeData.examScore) / 2),
      updatedAt: new Date().toISOString(),
    };

    return this.grades[gradeIndex];
  }

  async getClassGrades(classId: string, subject?: string) {
    // Mock class grades - in real app, this would filter by class
    let filteredGrades = this.grades;
    
    if (subject) {
      filteredGrades = filteredGrades.filter(g => g.subject === subject);
    }

    return {
      classId,
      grades: filteredGrades,
      summary: {
        totalStudents: filteredGrades.length,
        averageScore: filteredGrades.reduce((sum, g) => sum + g.totalScore, 0) / filteredGrades.length,
        gradeDistribution: this.getGradeDistribution(filteredGrades),
      },
    };
  }

  async addBulkGrades(classId: string, gradesData: any) {
    const newGrades = gradesData.grades.map((gradeData: any, index: number) => ({
      id: (this.grades.length + index + 1).toString(),
      classId,
      ...gradeData,
      totalScore: (gradeData.assignmentScore + gradeData.examScore) / 2,
      grade: this.calculateGrade((gradeData.assignmentScore + gradeData.examScore) / 2),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    this.grades.push(...newGrades);
    return {
      message: `${newGrades.length} grades added successfully`,
      addedGrades: newGrades,
    };
  }

  async getSubjects() {
    return this.subjects;
  }

  async getGradeScales() {
    return this.gradeScales;
  }

  async getClassGradeReport(classId: string) {
    const classGrades = this.grades; // In real app, filter by classId
    
    return {
      classId,
      reportGeneratedAt: new Date().toISOString(),
      summary: {
        totalStudents: classGrades.length,
        averageScore: classGrades.reduce((sum, g) => sum + g.totalScore, 0) / classGrades.length,
        gradeDistribution: this.getGradeDistribution(classGrades),
        subjectPerformance: this.getSubjectPerformance(classGrades),
      },
      topPerformers: classGrades
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 5),
    };
  }

  async getStudentGradeReport(studentId: string) {
    const studentGrades = this.grades.filter(g => g.studentId === studentId);
    
    if (studentGrades.length === 0) {
      throw new NotFoundException(`No grades found for student ${studentId}`);
    }

    return {
      studentId,
      reportGeneratedAt: new Date().toISOString(),
      summary: {
        totalSubjects: studentGrades.length,
        averageScore: studentGrades.reduce((sum, g) => sum + g.totalScore, 0) / studentGrades.length,
        gpa: this.calculateGPA(studentGrades),
        gradeDistribution: this.getGradeDistribution(studentGrades),
      },
      subjectBreakdown: studentGrades.map(grade => ({
        subject: grade.subject,
        score: grade.totalScore,
        grade: grade.grade,
        remarks: grade.remarks,
      })),
    };
  }

  private calculateGrade(score: number): string {
    const gradeScale = this.gradeScales.find(gs => score >= gs.minScore && score <= gs.maxScore);
    return gradeScale ? gradeScale.grade : 'F';
  }

  private getGradeDistribution(grades: any[]) {
    const distribution: { [key: string]: number } = {};
    this.gradeScales.forEach(gs => {
      distribution[gs.grade] = grades.filter(g => g.grade === gs.grade).length;
    });
    return distribution;
  }

  private getSubjectPerformance(grades: any[]) {
    const subjectPerformance: { [key: string]: number } = {};
    const subjects = [...new Set(grades.map(g => g.subject))];
    
    subjects.forEach(subject => {
      const subjectGrades = grades.filter(g => g.subject === subject);
      subjectPerformance[subject] = subjectGrades.reduce((sum, g) => sum + g.totalScore, 0) / subjectGrades.length;
    });
    
    return subjectPerformance;
  }

  private calculateGPA(grades: any[]): number {
    const totalPoints = grades.reduce((sum, grade) => {
      const gradeScale = this.gradeScales.find(gs => gs.grade === grade.grade);
      return sum + (gradeScale ? gradeScale.points : 0);
    }, 0);
    
    return totalPoints / grades.length;
  }
} 
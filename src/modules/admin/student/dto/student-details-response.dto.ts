import { ApiProperty } from '@nestjs/swagger';
import { TermType } from '@prisma/client';

export class StudentDetailsResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Student details and performance data' })
  data: {
    student: {
      id: string;
      studentId: string;
      firstName: string;
      lastName: string;
      email: string | null;
      phone: string | null;
      dateOfBirth: Date;
      gender: string;
      address: string | null;
      enrollmentDate: Date;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      school: {
        id: string;
        name: string;
        code: string;
        level: string;
        address: string;
        phone: string | null;
        email: string | null;
        website: string | null;
        principalName: string | null;
        principalPhone: string | null;
        principalEmail: string | null;
        establishedYear: number | null;
        totalStudents: number;
        totalTeachers: number;
        capacity: number | null;
        lga: {
          id: string;
          name: string;
          code: string;
          state: string;
        };
      };
      class: {
        id: string;
        name: string;
        grade: string;
        section: string;
        capacity: number;
        currentEnrollment: number;
        academicYear: string;
        teacher: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          phone: string | null;
        } | null;
      } | null;
      parent: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string | null;
        occupation: string | null;
      } | null;
    };
    performanceSummary: {
      session: string;
      term: TermType;
      totalAssessments: number;
      totalScore: number;
      totalMaxScore: number;
      averageScore: number;
      overallPercentage: number;
      grade: string;
      subjectBreakdown: Array<{
        subject: {
          id: string;
          name: string;
          code: string;
          level: string;
        };
        assessments: Array<{
          id: string;
          type: string;
          title: string;
          description: string | null;
          maxScore: number;
          score: number;
          percentage: number;
          remarks: string | null;
          dateGiven: Date;
          dateSubmitted: Date | null;
          isSubmitted: boolean;
          isGraded: boolean;
          createdAt: Date;
          teacher: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
          } | null;
        }>;
        totalScore: number;
        totalMaxScore: number;
        averageScore: number;
        percentage: number;
        assessmentCount: number;
      }>;
      assessmentTypeBreakdown: Array<{
        type: string;
        count: number;
        totalScore: number;
        totalMaxScore: number;
        averageScore: number;
        percentage: number;
      }>;
    };
    lastUpdated: string;
  };
}

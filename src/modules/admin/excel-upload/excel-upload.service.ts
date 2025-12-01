import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ResponseHelper } from '../../../common/helpers';
import * as XLSX from 'xlsx';
import * as colors from 'colors';

interface ExcelRow {
  'School Name': string;
  'LGA': string;
  'Student Name': string;
  'Class': string;
  'Gender': string;
  'English Language': number;
  'Mathematics': number;
  'Number work': number;
  'General norms': number;
  'Letter work': number;
  'Rhyme': number;
  'National values': number;
  'Prevocational': number;
  'CRS': number;
  'History': number;
  'Igbo Language': number;
  'CCA': number;
  'Basic science and technology': number;
  'Total Score': number;
}

@Injectable()
export class ExcelUploadService {
  private readonly logger = new Logger(ExcelUploadService.name);

  constructor(private readonly prisma: PrismaService) {}

  async uploadExcelFile(file: any) {
    this.logger.log(colors.magenta('Processing Excel file upload...'));

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      throw new BadRequestException('Only Excel files are allowed');
    }

    try {
      // Read Excel file
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        throw new BadRequestException('Excel file is empty');
      }

      this.logger.log(colors.cyan(`Found ${jsonData.length} rows in Excel file`));

      // Process each row
      const results = {
        totalRows: jsonData.length,
        processedRows: 0,
        createdSchools: 0,
        createdLgas: 0,
        createdStudents: 0,
        createdAssessments: 0,
        errors: [] as string[],
      };

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as ExcelRow;
        
        try {
          const assessmentCount = await this.processRow(row, i + 1);
          results.processedRows++;
          results.createdAssessments += assessmentCount;
        } catch (error) {
          const errorMsg = `Row ${i + 1}: ${error.message}`;
          results.errors.push(errorMsg);
          this.logger.error(colors.red(errorMsg));
        }
      }

      this.logger.log(colors.america('Excel file processing completed'));
      
      return ResponseHelper.success(
        'Excel file processed successfully',
        results
      );

    } catch (error) {
      this.logger.error(colors.red(`Excel processing error: ${error.message}`));
      throw new BadRequestException(`Error processing Excel file: ${error.message}`);
    }
  }

  private async processRow(row: ExcelRow, rowNumber: number): Promise<number> {
    // Convert all string fields to lowercase
    const schoolName = row['School Name']?.toLowerCase()?.trim();
    const lgaName = row['LGA']?.toLowerCase()?.trim();
    const studentName = row['Student Name']?.toLowerCase()?.trim();
    const className = row['Class']?.toLowerCase()?.trim();
    const gender = row['Gender']?.toLowerCase()?.trim();

    if (!schoolName || !lgaName || !studentName || !className || !gender) {
      throw new Error('Missing required fields (School Name, LGA, Student Name, Class, Gender)');
    }

    // Get Abia State ID (once at the start)
    const abiaState = await this.prisma.state.findFirst({
      where: { stateId: 'ABIA' },
    });
    if (!abiaState) {
      throw new Error('Abia State not found. Please run the migration first.');
    }
    const stateId = abiaState.id;

    // 1. Create or find LGA
    let lga = await this.prisma.localGovernmentArea.findFirst({
      where: { name: lgaName }
    });

    if (!lga) {
      const lgaCode = await this.generateUniqueLgaCode(lgaName);
      lga = await this.prisma.localGovernmentArea.create({
        data: {
          name: lgaName,
          code: lgaCode,
          state: 'abia',
          stateId: stateId,
          isActive: true,
        }
      });
      this.logger.log(colors.green(`Created new LGA: ${lgaName}`));
    }

    // 2. Create or find School
    let school = await this.prisma.school.findFirst({
      where: { name: schoolName }
    });

    if (!school) {
      const schoolCode = await this.generateUniqueSchoolCode(schoolName);
      school = await this.prisma.school.create({
        data: {
          name: schoolName,
          code: schoolCode,
          level: 'PRIMARY', // Default to PRIMARY, can be updated later
          address: `${lgaName}, Abia State`, // Default address
          lgaId: lga.id,
          stateId: stateId,
          isActive: true,
        }
      });
      this.logger.log(colors.green(`Created new School: ${schoolName}`));
    }

    // 3. Create or find Class (now with correct school ID)
    let classRecord = await this.prisma.class.findFirst({
      where: { 
        name: className.toLowerCase(),
        schoolId: school.id
      }
    });

    if (!classRecord) {
      classRecord = await this.prisma.class.create({
        data: {
          name: className.toLowerCase(),
          grade: className,
          section: 'A',
          schoolId: school.id, // Use actual school ID
          academicYear: '2024-2025',
          isActive: true,
        }
      });
      this.logger.log(colors.green(`Created new Class: ${className}`));
    }

    // 4. Create or find Student
    let student = await this.prisma.student.findFirst({
      where: { 
        firstName: studentName,
        schoolId: school.id
      }
    });

    if (!student) {
      const uniqueStudentId = await this.generateUniqueStudentId();
      student = await this.prisma.student.create({
        data: {
          firstName: studentName,
          lastName: '',
          studentId: uniqueStudentId,
          gender: this.mapGender(gender) as any,
          schoolId: school.id,
          classId: classRecord.id, // Add the class assignment
          dateOfBirth: new Date(),
          stateId: stateId,
          isActive: true,
        }
      });
      this.logger.log(colors.green(`Created new Student: ${studentName}`));
    }

    // 5. Create Assessments for each subject
    const subjects = [
      { name: 'English Language', score: row['English Language'] },
      { name: 'Mathematics', score: row['Mathematics'] },
      { name: 'Number work', score: row['Number work'] },
      { name: 'General norms', score: row['General norms'] },
      { name: 'Letter work', score: row['Letter work'] },
      { name: 'Rhyme', score: row['Rhyme'] },
      { name: 'National values', score: row['National values'] },
      { name: 'Prevocational', score: row['Prevocational'] },
      { name: 'CRS', score: row['CRS'] },
      { name: 'History', score: row['History'] },
      { name: 'Igbo Language', score: row['Igbo Language'] },
      { name: 'CCA', score: row['CCA'] },
      { name: 'Basic science and technology', score: row['Basic science and technology'] },
    ];

    const termId = await this.getCurrentTermId(school.id, stateId);
    
    for (const subject of subjects) {
      if (subject.score !== undefined && subject.score !== null && subject.score > 0) {
        const subjectId = await this.getSubjectId(subject.name);
        
        await this.prisma.assessment.create({
          data: {
            studentId: student.id,
            subjectId: subjectId,
            classId: classRecord.id,
            termId: termId,
            type: 'EXAM',
            title: 'Excel Upload Assessment',
            maxScore: 100,
            score: subject.score,
            percentage: 100,
            dateGiven: new Date(),
            isSubmitted: true,
            isGraded: true,
          }
        });
      }
    }

    this.logger.log(colors.green(`Created Assessments for ${studentName}`));
    
    // Return the number of assessments created
    return subjects.filter(subject => subject.score !== undefined && subject.score !== null && subject.score > 0).length;
  }

  private async generateUniqueLgaCode(name: string): Promise<string> {
    const firstThreeLetters = name.substring(0, 3).toUpperCase();
    let code: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      const randomDigits = Math.floor(Math.random() * 900) + 100;
      code = `${firstThreeLetters}${randomDigits}`;
      
      const existingCode = await this.prisma.localGovernmentArea.findFirst({
        where: { code },
      });
      
      if (!existingCode) {
        isUnique = true;
      } else {
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error('Unable to generate unique LGA code');
    }

    return code!;
  }

  private async generateUniqueSchoolCode(name: string): Promise<string> {
    const firstThreeLetters = name.substring(0, 3).toUpperCase();
    let code: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      const randomDigits = Math.floor(Math.random() * 900) + 100;
      code = `${firstThreeLetters}${randomDigits}`;
      
      const existingCode = await this.prisma.school.findFirst({
        where: { code },
      });
      
      if (!existingCode) {
        isUnique = true;
      } else {
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error('Unable to generate unique school code');
    }

    return code!;
  }

  private mapGender(gender: string): string {
    const genderMap: { [key: string]: string } = {
      'male': 'MALE',
      'female': 'FEMALE',
      'm': 'MALE',
      'f': 'FEMALE',
      'boy': 'MALE',
      'girl': 'FEMALE',
    };

    return genderMap[gender] || 'OTHER';
  }

  private async getCurrentSessionId(schoolId: string, stateId: string): Promise<string> {
    let session = await this.prisma.session.findFirst({
      where: { 
        name: '2024/2025',
        stateId: stateId
      }
    });
    
    if (!session) {
      session = await this.prisma.session.create({
        data: {
          name: '2024/2025',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2025-07-31'),
          isActive: true,
          isCurrent: true,
          stateId: stateId,
        }
      });
      this.logger.log(colors.green('Created default session: 2024/2025'));
    }
    
    return session.id;
  }

  private async getCurrentTermId(schoolId: string, stateId: string): Promise<string> {
    const sessionId = await this.getCurrentSessionId(schoolId, stateId);
    
    let term = await this.prisma.term.findFirst({
      where: { 
        sessionId: sessionId,
        name: 'SECOND_TERM',
        stateId: stateId
      }
    });
    
    if (!term) {
      term = await this.prisma.term.create({
        data: {
          sessionId: sessionId,
          name: 'SECOND_TERM',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-04-30'),
          isActive: true,
          isCurrent: true,
          stateId: stateId,
        }
      });
      this.logger.log(colors.green('Created default term: SECOND_TERM'));
    }
    
    return term.id;
  }

  private async generateUniqueStudentId(): Promise<string> {
    let studentId: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 20;

    while (!isUnique && attempts < maxAttempts) {
      const randomDigits = Math.floor(Math.random() * 90000) + 10000; // 5 digits
      studentId = `STU${randomDigits}`;
      
      const existingStudent = await this.prisma.student.findFirst({
        where: { studentId },
      });
      
      if (!existingStudent) {
        isUnique = true;
      } else {
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error('Unable to generate unique student ID');
    }

    return studentId!;
  }

  private async getSubjectId(subjectName: string): Promise<string> {
    // Find or create subject
    let subject = await this.prisma.subject.findFirst({
      where: { name: subjectName.toLowerCase() },
    });

    if (!subject) {
      subject = await this.prisma.subject.create({
        data: {
          name: subjectName.toLowerCase(),
          code: `SUB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          level: 'PRIMARY',
          isActive: true,
        },
      });
    }

    return subject.id;
  }
} 
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ResponseHelper } from '../../../common/helpers';
import { BigQueryService } from './bigquery.service';
import * as colors from 'colors';

// BigQuery data interface - handles both formats (with spaces and underscores)
interface BigQueryRow {
  // Handle both "School Name" and "school_name" formats
  'School Name'?: string;
  school_name?: string;
  LGA?: string;
  lga?: string;
  'Student Name'?: string;
  student_name?: string;
  Class?: string;
  class?: string;
  Gender?: string;
  gender?: string;
  'English Language'?: number;
  english_language?: number;
  Mathematics?: number;
  mathematics?: number;
  'Number work'?: number;
  number_work?: number;
  'General norms'?: number;
  general_norms?: number;
  'Letter work'?: number;
  letter_work?: number;
  Rhyme?: number;
  rhyme?: number;
  'National values'?: number;
  national_values?: number;
  Prevocational?: number;
  prevocational?: number;
  CRS?: number;
  crs?: number;
  History?: number;
  history?: number;
  'Igbo Language'?: number;
  igbo_language?: number;
  CCA?: number;
  cca?: number;
  'Basic science and technology'?: number;
  basic_science_technology?: number;
  'Total Score'?: number;
  total_score?: number;
}

@Injectable()
export class BigQueryImportService {
  private readonly logger = new Logger(BigQueryImportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bigQueryService: BigQueryService
  ) {}

  // New method to fetch data directly from BigQuery -- main
  async importFromBigQueryTable(datasetId: string, tableId: string, limit?: number) {
    this.logger.log(colors.magenta('Starting BigQuery table import...'));
    
    try {
      // Step 1: Fetch data from BigQuery
      this.logger.log(colors.cyan(`Fetching data from: ${datasetId}.${tableId}`));
      const rawData = await this.bigQueryService.getStudentDataFromTable(datasetId, tableId, limit);
      
      if (!rawData || rawData.length === 0) {
        return ResponseHelper.success('No data found in BigQuery table', { processedRows: 0 });
      }
      
      // Step 2: Normalize column names
      this.logger.log(colors.cyan(`Normalizing ${rawData.length} rows...`));
      const normalizedData = rawData.map(row => this.normalizeColumnNames(row));
      
      // Step 3: Process the data directly here
      this.logger.log(colors.magenta(`Processing ${normalizedData.length} rows...`));
      
      const results = {
        totalRows: normalizedData.length,
        processedRows: 0,
        createdSchools: 0,
        createdLgas: 0,
        createdStudents: 0,
        createdAssessments: 0,
        errors: [] as string[],
      };

      for (let i = 0; i < normalizedData.length; i++) {
        const row = normalizedData[i];
        
        // Log progress every 100 rows and force garbage collection
        if (i % 100 === 0) {
          this.logger.log(colors.yellow(`Processing row ${i + 1}/${normalizedData.length}`));
          
          // Force garbage collection every 1000 rows to prevent memory buildup
          if (i % 1000 === 0 && global.gc) {
            global.gc();
            this.logger.log(colors.cyan('Garbage collection triggered'));
          }
        }
        
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

      this.logger.log(colors.green(`BigQuery table import completed: ${results.processedRows} rows processed`));
      
      return ResponseHelper.success(
        'BigQuery table import completed successfully',
        results
      );
      
    } catch (error) {
      this.logger.error(colors.red(`BigQuery table import error: ${error.message}`));
      throw new BadRequestException(`Error importing from BigQuery table: ${error.message}`);
    }
  }

  // Normalize column names to handle both formats
  private normalizeColumnNames(row: any): BigQueryRow {
    return {
      school_name: row['School Name'] || row.school_name,
      lga: row.LGA || row.lga,
      student_name: row['Student Name'] || row.student_name,
      class: row.Class || row.class,
      gender: row.Gender || row.gender,
      english_language: row['English Language'] || row.english_language,
      mathematics: row.Mathematics || row.mathematics,
      number_work: row['Number work'] || row.number_work,
      general_norms: row['General norms'] || row.general_norms,
      letter_work: row['Letter work'] || row.letter_work,
      rhyme: row.Rhyme || row.rhyme,
      national_values: row['National values'] || row.national_values,
      prevocational: row.Prevocational || row.prevocational,
      crs: row.CRS || row.crs,
      history: row.History || row.history,
      igbo_language: row['Igbo Language'] || row.igbo_language,
      cca: row.CCA || row.cca,
      basic_science_technology: row['Basic science and technology'] || row.basic_science_technology,
      total_score: row['Total Score'] || row.total_score,
    };
  }

  async importFromBigQuery(bigQueryData: BigQueryRow[]) {
    this.logger.log(colors.magenta('Starting import...'));

    if (!bigQueryData || bigQueryData.length === 0) {
      throw new BadRequestException('No data provided from BigQuery');
    }

    this.logger.log(colors.cyan(`Found ${bigQueryData.length} rows`));

    // Process each row
    const results = {
      totalRows: bigQueryData.length,
      processedRows: 0,
      createdSchools: 0,
      createdLgas: 0,
      createdStudents: 0,
      createdAssessments: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < bigQueryData.length; i++) {
      const row = bigQueryData[i];
      
      // Log progress every 10 rows
      if (i % 10 === 0) {
        this.logger.log(colors.yellow(`Processing row ${i + 1}/${bigQueryData.length}`));
      }
      
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

    this.logger.log(colors.green('Import completed!'));
    
    return ResponseHelper.success(
      'BigQuery data imported successfully',
      results
    );
  }

  private async processRow(row: BigQueryRow, rowNumber: number): Promise<number> {
    // Normalize data with default values for missing fields
    const schoolName = row.school_name?.toLowerCase()?.trim() || 'unknown_school';
    const lgaName = row.lga?.toLowerCase()?.trim() || 'unknown_lga';
    const studentName = row.student_name?.toLowerCase()?.trim() || 'unknown_student';
    const className = row.class?.toLowerCase()?.trim() || 'unknown_class';
    const gender = row.gender?.toLowerCase()?.trim() || 'unknown_gender';
  
    // Only require student name - everything else can have defaults
    if (!studentName || studentName === 'unknown_student') {
      throw new Error('Student name is required and cannot be empty');
    }
  
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
          isActive: true,
        }
      });
      this.logger.log(colors.green(`New LGA: ${lgaName} created`));
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
          isActive: true,
        }
      });
      this.logger.log(colors.green(`New School: ${schoolName} created`));
    }
  
    // 3. Create or find Class - FIXED VERSION
    const normalizedClassName = className.toLowerCase().trim();
    const academicYear = '2024-2025';
    
    // First, try to find existing class
    let classRecord = await this.prisma.class.findFirst({
      where: {
        // schoolId: school.id,
        name: normalizedClassName,
        // academicYear: academicYear
      }
    });
    
    // Only create if it doesn't exist
    if (!classRecord) {
      try {
        classRecord = await this.prisma.class.create({
          data: {
            name: normalizedClassName,
            grade: className,
            section: 'A',
            schoolId: school.id,
            academicYear: academicYear,
            isActive: true,
          }
        });
        this.logger.log(colors.green(`New Class: ${normalizedClassName} created for school: ${schoolName}`));
      } catch (error) {
        // If creation fails (likely due to race condition), try to find it again
        classRecord = await this.prisma.class.findFirst({
          where: {
            schoolId: school.id,
            name: normalizedClassName,
            academicYear: academicYear
          }
        });
        
        if (!classRecord) {
          throw new Error(`Failed to create or find class: ${normalizedClassName} for school: ${schoolName}`);
        }
      }
    }
  
    // 4. Create or find Student (check by name, school, and class to avoid duplicates)
    let student = await this.prisma.student.findFirst({
      where: { 
        firstName: studentName,
        schoolId: school.id,
        classId: classRecord.id
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
          classId: classRecord.id,
          dateOfBirth: new Date(),
          isActive: true,
        }
      });
      // this.logger.log(colors.green(`New Student: ${studentName} created`));
    }
  
    // 5. Create Assessments for each subject
    const subjects = [
      { name: 'English Language', score: row.english_language },
      { name: 'Mathematics', score: row.mathematics },
      { name: 'Number work', score: row.number_work },
      { name: 'General norms', score: row.general_norms },
      { name: 'Letter work', score: row.letter_work },
      { name: 'Rhyme', score: row.rhyme },
      { name: 'National values', score: row.national_values },
      { name: 'Prevocational', score: row.prevocational },
      { name: 'CRS', score: row.crs },
      { name: 'History', score: row.history },
      { name: 'Igbo Language', score: row.igbo_language },
      { name: 'CCA', score: row.cca },
      { name: 'Basic science and technology', score: row.basic_science_technology },
    ];
  
    const termId = await this.getCurrentTermId(school.id);
    
    for (const subject of subjects) {
      if (subject.score !== undefined && subject.score !== null && subject.score > 0) {
        const subjectId = await this.getSubjectId(subject.name);
        
        // Use upsert to handle duplicates gracefully
        await this.prisma.assessment.upsert({
          where: {
            studentId_subjectId_classId_termId_type_title: {
              studentId: student.id,
              subjectId: subjectId,
              classId: classRecord.id,
              termId: termId,
              type: 'EXAM',
              title: 'BigQuery Import Assessment',
            }
          },
          update: {
            score: subject.score,
            percentage: 100,
            dateGiven: new Date(),
            isSubmitted: true,
            isGraded: true,
          },
          create: {
            studentId: student.id,
            subjectId: subjectId,
            classId: classRecord.id,
            termId: termId,
            type: 'EXAM',
            title: 'BigQuery Import Assessment',
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
  
    // this.logger.log(colors.blue(`Assessments: ${studentName}`));
    
    // Return the number of assessments created
    return subjects.filter(subject => subject.score !== undefined && subject.score !== null && subject.score > 0).length;
  }

  // Helper methods (same as Excel upload service)
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
      'unknown_gender': 'OTHER', // Default unknown gender to OTHER
    };

    return genderMap[gender] || 'OTHER'; // Default to OTHER if not found
  }

  private async getCurrentSessionId(schoolId: string): Promise<string> {
    let session = await this.prisma.session.findFirst({
      where: { 
        name: '2024/2025'
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
        }
      });
      this.logger.log(colors.green('Created default session: 2024/2025'));
    }
    
    return session.id;
  }

  private async getCurrentTermId(schoolId: string): Promise<string> {
    const sessionId = await this.getCurrentSessionId(schoolId);
    
    let term = await this.prisma.term.findFirst({
      where: { 
        sessionId: sessionId,
        name: 'SECOND_TERM'
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

  // Test BigQuery connection
  async testConnection(): Promise<boolean> {
    return this.bigQueryService.testConnection();
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ClassService {
  private classes = [
    {
      id: '1',
      name: 'Class 10A',
      grade: '10',
      section: 'A',
      schoolId: '1',
      teacherId: 'TCH001',
      teacherName: 'Mr. Johnson',
      capacity: 30,
      currentEnrollment: 28,
      academicYear: '2023-2024',
      status: 'active',
      roomNumber: '101',
      schedule: 'Monday-Friday, 8:00 AM - 3:00 PM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Class 9B',
      grade: '9',
      section: 'B',
      schoolId: '1',
      teacherId: 'TCH002',
      teacherName: 'Mrs. Smith',
      capacity: 30,
      currentEnrollment: 25,
      academicYear: '2023-2024',
      status: 'active',
      roomNumber: '102',
      schedule: 'Monday-Friday, 8:00 AM - 3:00 PM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  async getAllClasses(page: number, limit: number, schoolId?: string) {
    let filteredClasses = this.classes;
    
    if (schoolId) {
      filteredClasses = this.classes.filter(c => c.schoolId === schoolId);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedClasses = filteredClasses.slice(startIndex, endIndex);

    return {
      data: paginatedClasses,
      pagination: {
        page,
        limit,
        total: filteredClasses.length,
        totalPages: Math.ceil(filteredClasses.length / limit),
      },
    };
  }

  async getClassById(id: string) {
    const classItem = this.classes.find(c => c.id === id);
    if (!classItem) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classItem;
  }

  async createClass(createClassDto: any) {
    const newClass = {
      id: (this.classes.length + 1).toString(),
      ...createClassDto,
      status: 'active',
      currentEnrollment: 0,
      academicYear: '2023-2024',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.classes.push(newClass);
    return newClass;
  }

  async updateClass(id: string, updateClassDto: any) {
    const classIndex = this.classes.findIndex(c => c.id === id);
    if (classIndex === -1) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    this.classes[classIndex] = {
      ...this.classes[classIndex],
      ...updateClassDto,
      updatedAt: new Date().toISOString(),
    };

    return this.classes[classIndex];
  }

  async deleteClass(id: string) {
    const classIndex = this.classes.findIndex(c => c.id === id);
    if (classIndex === -1) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    const deletedClass = this.classes.splice(classIndex, 1)[0];
    return { message: 'Class deleted successfully', deletedClass };
  }

  async getClassStudents(id: string) {
    const classItem = this.classes.find(c => c.id === id);
    if (!classItem) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    // Mock students data for this class
    return {
      classId: id,
      className: classItem.name,
      students: [
        {
          id: '1',
          studentId: 'STU001',
          name: 'Aisha Bello',
          email: 'aisha.bello@student.edu.ng',
          enrollmentDate: '2023-09-01',
          status: 'active',
        },
        {
          id: '2',
          studentId: 'STU002',
          name: 'Kemi Adebayo',
          email: 'kemi.adebayo@student.edu.ng',
          enrollmentDate: '2023-09-01',
          status: 'active',
        },
      ],
      totalStudents: 2,
    };
  }

  async getClassSchedule(id: string) {
    const classItem = this.classes.find(c => c.id === id);
    if (!classItem) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    // Mock schedule data
    return {
      classId: id,
      className: classItem.name,
      teacher: classItem.teacherName,
      roomNumber: classItem.roomNumber,
      schedule: [
        {
          day: 'Monday',
          subjects: [
            { time: '8:00 AM - 9:00 AM', subject: 'Mathematics', teacher: 'Mr. Johnson' },
            { time: '9:00 AM - 10:00 AM', subject: 'English', teacher: 'Mrs. Smith' },
            { time: '10:00 AM - 11:00 AM', subject: 'Science', teacher: 'Dr. Wilson' },
            { time: '11:00 AM - 12:00 PM', subject: 'History', teacher: 'Mr. Brown' },
            { time: '12:00 PM - 1:00 PM', subject: 'Lunch Break', teacher: '-' },
            { time: '1:00 PM - 2:00 PM', subject: 'Physical Education', teacher: 'Mr. Davis' },
            { time: '2:00 PM - 3:00 PM', subject: 'Art', teacher: 'Ms. Garcia' },
          ],
        },
        {
          day: 'Tuesday',
          subjects: [
            { time: '8:00 AM - 9:00 AM', subject: 'English', teacher: 'Mrs. Smith' },
            { time: '9:00 AM - 10:00 AM', subject: 'Mathematics', teacher: 'Mr. Johnson' },
            { time: '10:00 AM - 11:00 AM', subject: 'Geography', teacher: 'Mr. Lee' },
            { time: '11:00 AM - 12:00 PM', subject: 'Science', teacher: 'Dr. Wilson' },
            { time: '12:00 PM - 1:00 PM', subject: 'Lunch Break', teacher: '-' },
            { time: '1:00 PM - 2:00 PM', subject: 'Music', teacher: 'Ms. Taylor' },
            { time: '2:00 PM - 3:00 PM', subject: 'Computer Science', teacher: 'Mr. Anderson' },
          ],
        },
      ],
    };
  }
} 
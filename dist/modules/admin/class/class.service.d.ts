export declare class ClassService {
    private classes;
    getAllClasses(page: number, limit: number, schoolId?: string): Promise<{
        data: {
            id: string;
            name: string;
            grade: string;
            section: string;
            schoolId: string;
            teacherId: string;
            teacherName: string;
            capacity: number;
            currentEnrollment: number;
            academicYear: string;
            status: string;
            roomNumber: string;
            schedule: string;
            createdAt: string;
            updatedAt: string;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getClassById(id: string): Promise<{
        id: string;
        name: string;
        grade: string;
        section: string;
        schoolId: string;
        teacherId: string;
        teacherName: string;
        capacity: number;
        currentEnrollment: number;
        academicYear: string;
        status: string;
        roomNumber: string;
        schedule: string;
        createdAt: string;
        updatedAt: string;
    }>;
    createClass(createClassDto: any): Promise<any>;
    updateClass(id: string, updateClassDto: any): Promise<{
        id: string;
        name: string;
        grade: string;
        section: string;
        schoolId: string;
        teacherId: string;
        teacherName: string;
        capacity: number;
        currentEnrollment: number;
        academicYear: string;
        status: string;
        roomNumber: string;
        schedule: string;
        createdAt: string;
        updatedAt: string;
    }>;
    deleteClass(id: string): Promise<{
        message: string;
        deletedClass: {
            id: string;
            name: string;
            grade: string;
            section: string;
            schoolId: string;
            teacherId: string;
            teacherName: string;
            capacity: number;
            currentEnrollment: number;
            academicYear: string;
            status: string;
            roomNumber: string;
            schedule: string;
            createdAt: string;
            updatedAt: string;
        };
    }>;
    getClassStudents(id: string): Promise<{
        classId: string;
        className: string;
        students: {
            id: string;
            studentId: string;
            name: string;
            email: string;
            enrollmentDate: string;
            status: string;
        }[];
        totalStudents: number;
    }>;
    getClassSchedule(id: string): Promise<{
        classId: string;
        className: string;
        teacher: string;
        roomNumber: string;
        schedule: {
            day: string;
            subjects: {
                time: string;
                subject: string;
                teacher: string;
            }[];
        }[];
    }>;
}

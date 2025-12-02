"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AcademicContextService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicContextService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AcademicContextService = AcademicContextService_1 = class AcademicContextService {
    prisma;
    logger = new common_1.Logger(AcademicContextService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCurrentSessionAndTerm(stateId) {
        const [currentSession, currentTerm] = await this.prisma.$transaction([
            this.prisma.session.findFirst({
                where: { stateId, isCurrent: true },
            }),
            this.prisma.term.findFirst({
                where: { stateId, isCurrent: true },
            }),
        ]);
        return { currentSession, currentTerm };
    }
    async getLgasWithSchoolCounts(stateId) {
        const lgas = await this.prisma.localGovernmentArea.findMany({
            where: { stateId, isActive: true },
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: {
                        schools: true,
                    },
                },
            },
        });
        return lgas.map(lga => ({
            id: lga.id,
            name: lga.name,
            code: lga.code,
            state: lga.state,
            totalSchools: lga._count?.schools ?? 0,
        }));
    }
    async getSchoolsWithClassCounts(stateId, lgaId) {
        const schools = await this.prisma.school.findMany({
            where: {
                stateId,
                lgaId,
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                code: true,
                level: true,
                isActive: true,
                _count: {
                    select: {
                        classes: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
        return schools.map(school => ({
            id: school.id,
            name: school.name,
            code: school.code,
            level: school.level,
            isActive: school.isActive,
            totalClasses: school._count?.classes ?? 0,
        }));
    }
    async getClassesWithStudentCounts(stateId, schoolId) {
        const classes = await this.prisma.class.findMany({
            where: {
                schoolId,
                isActive: true,
                school: {
                    stateId,
                },
            },
            select: {
                id: true,
                name: true,
                grade: true,
                section: true,
                isActive: true,
                _count: {
                    select: {
                        students: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
        return classes.map(cls => ({
            id: cls.id,
            name: cls.name,
            grade: cls.grade,
            section: cls.section,
            isActive: cls.isActive,
            totalStudents: cls._count?.students ?? 0,
        }));
    }
};
exports.AcademicContextService = AcademicContextService;
exports.AcademicContextService = AcademicContextService = AcademicContextService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AcademicContextService);
//# sourceMappingURL=academic-context.service.js.map
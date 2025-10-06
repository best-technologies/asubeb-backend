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
var LgaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LgaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const helpers_1 = require("../../../common/helpers");
const common_2 = require("@nestjs/common");
const colors = require("colors");
let LgaService = LgaService_1 = class LgaService {
    prisma;
    logger = new common_2.Logger(LgaService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createLga(createLgaDto) {
        this.logger.log(colors.magenta('Creating new LGA...'));
        const name = createLgaDto.name.toLowerCase().trim();
        const description = createLgaDto.description?.toLowerCase().trim();
        const code = await this.generateUniqueCode(name);
        const existingLga = await this.prisma.localGovernmentArea.findFirst({
            where: {
                name: name,
            },
        });
        if (existingLga) {
            throw new common_1.ConflictException('Local Government Area with this name already exists');
        }
        const lga = await this.prisma.localGovernmentArea.create({
            data: {
                name: name,
                code: code,
                state: 'Abia State',
                description: description,
                isActive: true,
            },
        });
        this.logger.log(colors.america('LGA created successfully'));
        return helpers_1.ResponseHelper.created('Local Government Area created successfully', lga);
    }
    async generateUniqueCode(name) {
        const firstThreeLetters = name.substring(0, 3).toUpperCase();
        let code;
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
            }
            else {
                attempts++;
            }
        }
        if (!isUnique) {
            throw new Error('Unable to generate unique code after maximum attempts');
        }
        return code;
    }
    async getAllLga() {
        this.logger.log(colors.cyan('Fetching all LGAs...'));
        try {
            const lgas = await this.prisma.localGovernmentArea.findMany({
                where: { isActive: true },
                orderBy: { name: 'asc' },
                select: {
                    id: true,
                    name: true,
                },
            });
            const formatted = lgas.map((l) => ({ id: l.id, name: l.name }));
            this.logger.log(colors.green(`Fetched ${formatted.length} LGAs`));
            return helpers_1.ResponseHelper.success('LGAs retrieved successfully', formatted);
        }
        catch (error) {
            this.logger.error(colors.red('Failed to fetch LGAs'), error);
            return helpers_1.ResponseHelper.error('Failed to fetch LGAs', error?.message || error, 500);
        }
    }
};
exports.LgaService = LgaService;
exports.LgaService = LgaService = LgaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LgaService);
//# sourceMappingURL=lga.service.js.map
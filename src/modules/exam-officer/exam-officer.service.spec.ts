import { Test, TestingModule } from '@nestjs/testing';
import { ExamOfficerService } from './exam-officer.service';

describe('ExamOfficerService', () => {
  let service: ExamOfficerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamOfficerService],
    }).compile();

    service = module.get<ExamOfficerService>(ExamOfficerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

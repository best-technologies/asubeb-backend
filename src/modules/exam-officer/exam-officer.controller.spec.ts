import { Test, TestingModule } from '@nestjs/testing';
import { ExamOfficerController } from './exam-officer.controller';

describe('ExamOfficerController', () => {
  let controller: ExamOfficerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamOfficerController],
    }).compile();

    controller = module.get<ExamOfficerController>(ExamOfficerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

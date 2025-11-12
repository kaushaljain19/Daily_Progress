import { Test, TestingModule } from '@nestjs/testing';
import { EmpService } from './emp.service';

describe('EmpService', () => {
  let service: EmpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmpService],
    }).compile();

    service = module.get<EmpService>(EmpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

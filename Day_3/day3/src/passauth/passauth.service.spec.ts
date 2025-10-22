import { Test, TestingModule } from '@nestjs/testing';
import { PassauthService } from './passauth.service';

describe('PassauthService', () => {
  let service: PassauthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PassauthService],
    }).compile();

    service = module.get<PassauthService>(PassauthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

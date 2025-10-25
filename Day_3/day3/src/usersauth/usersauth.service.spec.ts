import { Test, TestingModule } from '@nestjs/testing';
import { UsersauthService } from './usersauth.service';

describe('UsersauthService', () => {
  let service: UsersauthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersauthService],
    }).compile();

    service = module.get<UsersauthService>(UsersauthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

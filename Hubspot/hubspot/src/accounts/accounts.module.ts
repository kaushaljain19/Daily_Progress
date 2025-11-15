import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

@Module({
  imports: [HttpModule],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}

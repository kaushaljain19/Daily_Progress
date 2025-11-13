import { Controller, Get, Param, Query } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountQueryDto } from './dto/account-query.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async findAll(@Query() query: AccountQueryDto) {
    return await this.accountsService.findAll(query);
  }


}

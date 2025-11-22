import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SanitizePipe } from '../common/pipes/sanitize.pipe';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @UsePipes(new SanitizePipe())
  async findAll(@Query() query: PaginationDto) {
    return await this.accountsService.findAll(query);
  }

  @Get(':id')
  @UsePipes(new SanitizePipe())
  async findOne(@Param('id') id: string) {
    return await this.accountsService.findOne(id);
  }
}

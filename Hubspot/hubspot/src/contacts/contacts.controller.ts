import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SanitizePipe } from '../common/pipes/sanitize.pipe';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @UsePipes(new SanitizePipe())
  async findAll(@Query() query: PaginationDto) {
    return await this.contactsService.findAll(query);
  }

  @Get(':id')
  @UsePipes(new SanitizePipe())
  async findOne(@Param('id') id: string) {
    return await this.contactsService.findOne(id);
  }
}

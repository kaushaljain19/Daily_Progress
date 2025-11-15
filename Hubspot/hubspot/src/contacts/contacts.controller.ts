import { Controller, Get, Param, Query } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactQueryDto } from './dto/contact-query.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  async findAll(@Query() query: ContactQueryDto) {
    return await this.contactsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.contactsService.findOne(id);
  }
}

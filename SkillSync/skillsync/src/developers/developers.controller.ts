import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DevelopersService } from './developers.service';
import { CreateDeveloperDto } from './dto/create-developer.dto';
import { UpdateDeveloperDto } from './dto/update-developer.dto';

@ApiTags('developers')
@Controller('developers')
export class DevelopersController {
  constructor(private readonly developersService: DevelopersService) {}

  @Post()
  @ApiOperation({ summary: 'Create developer profile' })
  create(@Body() createDeveloperDto: CreateDeveloperDto) {
    return this.developersService.create(createDeveloperDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all developers' })
  findAll(
    @Query('skill') skill?: string,
    @Query('experience') experience?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.developersService.findAll(skill, experience, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get developer by ID' })
  findOne(@Param('id') id: string) {
    return this.developersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update developer' })
  update(@Param('id') id: string, @Body() updateDeveloperDto: UpdateDeveloperDto) {
    return this.developersService.update(id, updateDeveloperDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete developer' })
  remove(@Param('id') id: string) {
    return this.developersService.remove(id);
  }
}

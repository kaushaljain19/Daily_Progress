import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DevelopersService } from './developers.service';
import { CreateDeveloperDto } from './dto/create-developer.dto';
import { UpdateDeveloperDto } from './dto/update-developer.dto';
import { DeveloperResponseDto } from './dto/developer-response.dto';
import { RecommendedProjectResponseDto } from './dto/recommended-project-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('developers')
@Controller('developers')
export class DevelopersController {
  constructor(private readonly developersService: DevelopersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEVELOPER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create developer profile' })
  @ApiResponse({ status: 201, type: DeveloperResponseDto })
  async create(@Body() createDeveloperDto: CreateDeveloperDto): Promise<DeveloperResponseDto> {
    return this.developersService.create(createDeveloperDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all developers with optional filters' })
  @ApiResponse({ status: 200, type: [DeveloperResponseDto] })
  @ApiQuery({ name: 'skill', required: false, type: String, description: 'Filter by skill' })
  @ApiQuery({ name: 'experience', required: false, type: String, description: 'Filter by experience level' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async findAll(
    @Query('skill') skill?: string,
    @Query('experience') experience?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<DeveloperResponseDto[]> {
    return this.developersService.findAll(skill, experience, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single developer by ID' })
  @ApiResponse({ status: 200, type: DeveloperResponseDto })
  async findOne(@Param('id') id: string): Promise<DeveloperResponseDto> {
    return this.developersService.findOne(id);
  }

  @Get(':id/recommended-projects')
  @ApiOperation({ summary: 'Get recommended projects for developer' })
  @ApiResponse({ status: 200, type: [RecommendedProjectResponseDto] })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum results' })
  async getRecommendedProjects(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ): Promise<RecommendedProjectResponseDto[]> {
    return this.developersService.getRecommendedProjects(id, limit);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEVELOPER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update developer profile' })
  @ApiResponse({ status: 200, type: DeveloperResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateDeveloperDto: UpdateDeveloperDto,
  ): Promise<DeveloperResponseDto> {
    return this.developersService.update(id, updateDeveloperDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEVELOPER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete developer profile' })
  @ApiResponse({ status: 200, description: 'Developer deleted successfully' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.developersService.remove(id);
    return { message: 'Developer deleted successfully' };
  }
}

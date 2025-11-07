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
  Request,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { RecommendedDeveloperResponseDto } from './dto/recommended-developer-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto'; // ADD THIS IMPORT
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new project (Client only)' })
  @ApiResponse({
    status: 201,
    type: ProjectResponseDto,
    description: 'Project created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only clients can create projects',
  })
  async create(
    @Request() req,
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.create(req.user.userId, createProjectDto);
  }

  // ========== UPDATED WITH PAGINATION ==========
  @Get()
  @ApiOperation({ summary: 'Get all projects with pagination and filters' })
  @ApiQuery({
    name: 'skill',
    required: false,
    type: String,
    description:
      'Filter by required skills (comma-separated or multiple params, AND logic)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description:
      'Filter by project status (open, in_progress, completed, cancelled)',
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto, // CHANGED: Use DTO
    @Query('skill') skill?: string | string[], // CHANGED: Support multiple skills
    @Query('status') status?: string,
  ) {
    return this.projectsService.findAll(paginationQuery, skill, status);
  }


  

  @Get(':id')
  @ApiOperation({ summary: 'Get single project by ID' })
  @ApiResponse({
    status: 200,
    type: ProjectResponseDto,
    description: 'Project details',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findOne(@Param('id') id: string): Promise<ProjectResponseDto> {
    return this.projectsService.findOne(id);
  }

  @Get(':id/recommended-developers')
  @ApiOperation({
    summary: 'Get recommended developers for project with pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of matching developers with match percentage',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getRecommendedDevelopers(
    @Param('id') id: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.projectsService.getRecommendedDevelopers(id, paginationQuery);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update project (Client only - own projects)' })
  @ApiResponse({
    status: 200,
    type: ProjectResponseDto,
    description: 'Project updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only project owner can update',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req,
  ): Promise<ProjectResponseDto> {
    
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete project (Client only - own projects)' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only project owner can delete',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async remove(
    @Param('id') id: string,
    @Request() req,
  ): Promise<{ message: string }> {
   
    await this.projectsService.remove(id);
    return { message: 'Project deleted successfully' };
  }
}

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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { RecommendedDeveloperResponseDto } from './dto/recommended-developer-response.dto';
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
  @ApiResponse({ status: 201, type: ProjectResponseDto, description: 'Project created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only clients can create projects' })
  async create(
    @Request() req,
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.create(req.user.userId, createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects with optional filters' })
  @ApiResponse({ status: 200, type: [ProjectResponseDto], description: 'List of projects' })
  @ApiQuery({ 
    name: 'skill', 
    required: false, 
    type: String, 
    description: 'Filter projects by required skill (e.g., "React")' 
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    type: String, 
    description: 'Filter by project status (open, in_progress, completed, cancelled)' 
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Page number for pagination (default: 1)' 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Number of items per page (default: 20)' 
  })
  async findAll(
    @Query('skill') skill?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ProjectResponseDto[]> {
    return this.projectsService.findAll(skill, status, page, limit);
  }

  @Get('my-projects')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get projects created by logged-in client' })
  @ApiResponse({ status: 200, type: [ProjectResponseDto], description: 'Client\'s projects' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only clients can access this' })
  async getMyProjects(@Request() req): Promise<ProjectResponseDto[]> {
    return this.projectsService.findByClientId(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single project by ID' })
  @ApiResponse({ status: 200, type: ProjectResponseDto, description: 'Project details' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findOne(@Param('id') id: string): Promise<ProjectResponseDto> {
    return this.projectsService.findOne(id);
  }

  @Get(':id/recommended-developers')
  @ApiOperation({ summary: 'Get recommended developers for project based on skill matching' })
  @ApiResponse({ 
    status: 200, 
    type: [RecommendedDeveloperResponseDto], 
    description: 'List of matching developers with match percentage' 
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Maximum number of results to return (default: 10)' 
  })
  async getRecommendedDevelopers(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ): Promise<RecommendedDeveloperResponseDto[]> {
    return this.projectsService.getRecommendedDevelopers(id, limit);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update project (Client only - own projects)' })
  @ApiResponse({ status: 200, type: ProjectResponseDto, description: 'Project updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only project owner can update' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
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
  @ApiResponse({ status: 403, description: 'Forbidden - Only project owner can delete' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.projectsService.remove(id);
    return { message: 'Project deleted successfully' };
  }
}

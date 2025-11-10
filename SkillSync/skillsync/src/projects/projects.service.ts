import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { Developer } from '../developers/entities/developer.entity'; 
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { RecommendedDeveloperResponseDto } from './dto/recommended-developer-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto'; 
import { PaginatedResponseDto } from '../common/dto/meta-pagination.dto'; 
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';
import { ProjectStatus } from '../common/enums/project-status.enum';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Developer) 
    private developersRepository: Repository<Developer>,
    private usersService: UsersService,
  ) {}

  async create(clientId: string, createProjectDto: CreateProjectDto): Promise<ProjectResponseDto> {
    const client = await this.usersService.findById(clientId);
    
    if (!client || client.role !== Role.CLIENT) {
      throw new BadRequestException('Invalid client');
    }

    const project = this.projectsRepository.create({
      ...createProjectDto,
      client,
      status: ProjectStatus.OPEN,
    });

    const saved = await this.projectsRepository.save(project);
    return this.toDto(saved);
  }

  
  async findAll(
    paginationQuery: PaginationQueryDto,
    skill?: string | string[],
    status?: string,
  ): Promise<PaginatedResponseDto<ProjectResponseDto>> {
    
    const queryBuilder = this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.client', 'client');

    // Handle multiple skills (AND logic - same as developers)
    if (skill) {
      let skillsArray: string[] = [];
      
      if (typeof skill === 'string') {
        skillsArray = skill.split(',').map(s => s.trim()).filter(s => s.length > 0);
      } else if (Array.isArray(skill)) {
        skillsArray = skill.map(s => s.trim()).filter(s => s.length > 0);
      }

      if (skillsArray.length > 0) {
        skillsArray.forEach((s, index) => {
          queryBuilder.andWhere(`project.requiredSkills LIKE :skill${index}`, {
            [`skill${index}`]: `%${s}%`,
          });
        });
      }
    }

    if (status) {
      queryBuilder.andWhere('project.status = :status', { status });
    }

    queryBuilder
      .orderBy('project.createdAt', 'DESC')
      .skip(paginationQuery.skip)
      .take(paginationQuery.limit);

    const [projects, totalItems] = await queryBuilder.getManyAndCount();
    const projectDtos = projects.map(p => this.toDto(p));
    
    return new PaginatedResponseDto(projectDtos, totalItems, paginationQuery);
  }
  

  async findOne(id: string): Promise<ProjectResponseDto> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['client'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return this.toDto(project);
  }

  async findByClientId(clientId: string): Promise<ProjectResponseDto[]> {
    const projects = await this.projectsRepository.find({
      where: { client: { id: clientId } },
      relations: ['client'],
    });

    return projects.map(p => this.toDto(p));
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<ProjectResponseDto> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['client'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    Object.assign(project, updateProjectDto);
    const updated = await this.projectsRepository.save(project);
    return this.toDto(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }

 
  async getRecommendedDevelopers(
    projectId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<RecommendedDeveloperResponseDto>> {
    
    const project = await this.projectsRepository.findOne({ 
      where: { id: projectId } 
    });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Fetch all developers using QueryBuilder (NO RAW SQL!)
    const allDevelopers = await this.developersRepository
      .createQueryBuilder('developer')
      .orderBy('developer.createdAt', 'DESC')
      .getMany();

    // Score and filter developers
    const scoredDevelopers = allDevelopers.map(developer => {
      const devSkills = developer.skills || [];
      const requiredSkills = project.requiredSkills || [];

      // Find matched skills
      const matchedSkills = requiredSkills.filter(skill =>
        devSkills.some(devSkill => 
          devSkill.toLowerCase().trim() === skill.toLowerCase().trim()
        )
      );

      // Calculate percentage
      const matchPercentage = requiredSkills.length > 0
        ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
        : 0;

      return {
        developer: {
          id: developer.id,
          name: developer.name,
          skills: devSkills,
          experienceLevel: developer.experienceLevel,
          bio: developer.bio,
        },
        matchedSkills: matchedSkills,
        matchPercentage: matchPercentage,
      };
    });

    // Filter and sort
    const filteredDevelopers = scoredDevelopers
      .filter(d => d.matchPercentage > 0)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Apply pagination
    const totalItems = filteredDevelopers.length;
    const { skip, limit } = paginationQuery;
    const paginatedDevelopers = filteredDevelopers.slice(skip, skip + limit);

    return new PaginatedResponseDto(paginatedDevelopers, totalItems, paginationQuery);
  }
 

  private toDto(project: Project): ProjectResponseDto {
    return {
      id: project.id,
      title: project.title,
      description: project.description,
      requiredSkills: project.requiredSkills,
      budget: project.budget,
      duration: project.duration,
      status: project.status,
      client: {
        id: project.client.id,
        email: project.client.email,
        role: project.client.role,
      },
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}

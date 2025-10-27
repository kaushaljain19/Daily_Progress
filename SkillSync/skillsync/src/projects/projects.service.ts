import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { RecommendedDeveloperResponseDto } from './dto/recommended-developer-response.dto';
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';
import { ProjectStatus } from '../common/enums/project-status.enum';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    private usersService: UsersService,
    private dataSource: DataSource,
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
    skill?: string,
    status?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<ProjectResponseDto[]> {
    const query = this.projectsRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.client', 'client');

    if (skill) {
      query.andWhere('project.requiredSkills LIKE :skill', { skill: `%${skill}%` });
    }

    if (status) {
      query.andWhere('project.status = :status', { status });
    }

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const projects = await query.getMany();
    return projects.map(p => this.toDto(p));
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

  // ========== ONLY THIS METHOD CHANGED ==========
  async getRecommendedDevelopers(
    projectId: string,
    limit: number = 10,
  ): Promise<RecommendedDeveloperResponseDto[]> {
    const project = await this.projectsRepository.findOne({ 
      where: { id: projectId } 
    });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Simple query - no JSON operations
    const query = `
      SELECT * FROM developers
      ORDER BY createdAt DESC
      LIMIT ?
    `;

    const developers = await this.dataSource.query(query, [limit * 2]);

    // Process developers - handle comma-separated skills
    const scoredDevelopers = developers.map(developer => {
      // Parse skills from comma-separated string
      let devSkills: string[] = [];
      if (developer.skills) {
        if (typeof developer.skills === 'string') {
          devSkills = developer.skills.split(',').map(s => s.trim());
        } else if (Array.isArray(developer.skills)) {
          devSkills = developer.skills;
        }
      }

      // Find matched skills
      const matchedSkills = project.requiredSkills.filter(skill =>
        devSkills.some(devSkill => 
          devSkill.toLowerCase().trim() === skill.toLowerCase().trim()
        )
      );

      // Calculate percentage
      const matchPercentage = project.requiredSkills.length > 0
        ? Math.round((matchedSkills.length / project.requiredSkills.length) * 100)
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

    return scoredDevelopers
      .filter(d => d.matchPercentage > 0)
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, limit);
  }
  // ========== END OF CHANGE ==========

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

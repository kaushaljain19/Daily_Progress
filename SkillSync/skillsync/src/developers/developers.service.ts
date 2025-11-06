import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Developer } from './entities/developer.entity';
import { CreateDeveloperDto } from './dto/create-developer.dto';
import { UpdateDeveloperDto } from './dto/update-developer.dto';
import { DeveloperResponseDto } from './dto/developer-response.dto';
import { RecommendedProjectResponseDto } from './dto/recommended-project-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../common/dto/meta-pagination.dto';
import { Project } from '../projects/entities/project.entity';
@Injectable()
export class DevelopersService {
   constructor(
    @InjectRepository(Developer)
    private developersRepository: Repository<Developer>,
    @InjectRepository(Project) 
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createDeveloperDto: CreateDeveloperDto): Promise<DeveloperResponseDto> {
    const developer = this.developersRepository.create(createDeveloperDto);
    const saved = await this.developersRepository.save(developer);
    return this.toDto(saved);
  }

 async findAll(
  paginationQuery: PaginationQueryDto,
  skill?: string | string[],
  experience?: string,
): Promise<PaginatedResponseDto<DeveloperResponseDto>> {
  
  const queryBuilder = this.developersRepository.createQueryBuilder('developer');


  if (skill) {
    // Convert to array format
    let skillsArray: string[] = [];
    
    if (typeof skill === 'string') {
      // If comma-separated string: "React,Node.js,TypeScript"
      skillsArray = skill.split(',').map(s => s.trim()).filter(s => s.length > 0);
    } else if (Array.isArray(skill)) {
      // If already an array: ["React", "Node.js", "TypeScript"]
      skillsArray = skill.map(s => s.trim()).filter(s => s.length > 0);
    }

    // Build WHERE clause for multiple skills (AND condition)
    // Developer must have ALL specified skills
    if (skillsArray.length > 0) {
      skillsArray.forEach((s, index) => {
        queryBuilder.andWhere(`developer.skills LIKE :skill${index}`, {
          [`skill${index}`]: `%${s}%`,
        });
      });
    }
  }
 

  if (experience) {
    queryBuilder.andWhere('developer.experienceLevel = :experience', { experience });
  }

  queryBuilder
    .orderBy('developer.createdAt', 'DESC')
    .skip(paginationQuery.skip)
    .take(paginationQuery.limit);

  const [developers, totalItems] = await queryBuilder.getManyAndCount();
  const developerDtos = developers.map(dev => this.toDto(dev));
  
  return new PaginatedResponseDto(developerDtos, totalItems, paginationQuery);
}




  async findOne(id: string): Promise<DeveloperResponseDto> {
    const developer = await this.developersRepository.findOne({ where: { id } });
    if (!developer) {
      throw new NotFoundException(`Developer with ID ${id} not found`);
    }
    return this.toDto(developer);
  }

  async update(id: string, updateDeveloperDto: UpdateDeveloperDto): Promise<DeveloperResponseDto> {
    const developer = await this.developersRepository.findOne({ where: { id } });
    if (!developer) {
      throw new NotFoundException(`Developer with ID ${id} not found`);
    }

    Object.assign(developer, updateDeveloperDto);
    const updated = await this.developersRepository.save(developer);
    return this.toDto(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.developersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Developer with ID ${id} not found`);
    }
  }

  
  async getRecommendedProjects(
  developerId: string,
  paginationQuery: PaginationQueryDto,
): Promise<PaginatedResponseDto<RecommendedProjectResponseDto>> {
  
  // Find the developer
  const developer = await this.developersRepository.findOne({ 
    where: { id: developerId } 
  });
  
  if (!developer) {
    throw new NotFoundException(`Developer with ID ${developerId} not found`);
  }

  // Fetch all open projects using QueryBuilder
  const allProjects = await this.projectsRepository
    .createQueryBuilder('project')
    .where('project.status = :status', { status: 'open' })
    .orderBy('project.createdAt', 'DESC')
    .getMany();

  // Score and filter projects based on skill matching
  const scoredProjects = allProjects.map(project => {
    
    const requiredSkills = project.requiredSkills || [];

    // Find matching skills between developer and project
    const matchedSkills = requiredSkills.filter(skill =>
      developer.skills.some(devSkill => 
        devSkill.toLowerCase().trim() === skill.toLowerCase().trim()
      )
    );

    // Calculate match percentage
    const matchPercentage = requiredSkills.length > 0
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
      : 0;

    return {
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        requiredSkills: requiredSkills,
        budget: project.budget,
        duration: project.duration,
      },
      matchedSkills: matchedSkills,
      matchPercentage: matchPercentage,
    };
  });

  // Filter projects with at least some match and sort by percentage
  const filteredProjects = scoredProjects
    .filter(p => p.matchPercentage > 0)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);

  // Apply in-memory pagination
  const totalItems = filteredProjects.length;
  const { skip, limit } = paginationQuery;
  const paginatedProjects = filteredProjects.slice(skip, skip + limit);

  return new PaginatedResponseDto(paginatedProjects, totalItems, paginationQuery);
}


// show only needed information to the client
  private toDto(developer: Developer): DeveloperResponseDto {
    return {
      id: developer.id,
      name: developer.name,
      skills: developer.skills,
      experienceLevel: developer.experienceLevel,
      bio: developer.bio,
      createdAt: developer.createdAt,
      updatedAt: developer.updatedAt,
    };
  }
}




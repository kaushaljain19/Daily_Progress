import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Developer } from './entities/developer.entity';
import { CreateDeveloperDto } from './dto/create-developer.dto';
import { UpdateDeveloperDto } from './dto/update-developer.dto';
import { DeveloperResponseDto } from './dto/developer-response.dto';
import { RecommendedProjectResponseDto } from './dto/recommended-project-response.dto';

@Injectable()
export class DevelopersService {
  constructor(
    @InjectRepository(Developer)
    private developersRepository: Repository<Developer>,
    private dataSource: DataSource,
  ) {}

  async create(createDeveloperDto: CreateDeveloperDto): Promise<DeveloperResponseDto> {
    const developer = this.developersRepository.create(createDeveloperDto);
    const saved = await this.developersRepository.save(developer);
    return this.toDto(saved);
  }

  async findAll(
    skill?: string,
    experience?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<DeveloperResponseDto[]> {
    const query = this.developersRepository.createQueryBuilder('developer');

    if (skill) {
      query.andWhere('developer.skills LIKE :skill', { skill: `%${skill}%` });
    }

    if (experience) {
      query.andWhere('developer.experienceLevel = :experience', { experience });
    }

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const developers = await query.getMany();
    return developers.map(dev => this.toDto(dev));
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

  // ========== ONLY THIS METHOD CHANGED ==========
  async getRecommendedProjects(
    developerId: string,
    limit: number = 10,
  ): Promise<RecommendedProjectResponseDto[]> {
    const developer = await this.developersRepository.findOne({ 
      where: { id: developerId } 
    });
    
    if (!developer) {
      throw new NotFoundException(`Developer with ID ${developerId} not found`);
    }

    // Simple query - no JSON operations
    const query = `
      SELECT * FROM projects
      WHERE status = 'open'
      ORDER BY createdAt DESC
      LIMIT ?
    `;

    const projects = await this.dataSource.query(query, [limit * 2]);

    // Process projects - handle comma-separated skills
    const scoredProjects = projects.map(project => {
      // Parse skills from comma-separated string
      let requiredSkills: string[] = [];
      if (project.requiredSkills) {
        if (typeof project.requiredSkills === 'string') {
          requiredSkills = project.requiredSkills.split(',').map(s => s.trim());
        } else if (Array.isArray(project.requiredSkills)) {
          requiredSkills = project.requiredSkills;
        }
      }

      // Find matched skills
      const matchedSkills = requiredSkills.filter(skill =>
        developer.skills.some(devSkill => 
          devSkill.toLowerCase().trim() === skill.toLowerCase().trim()
        )
      );

      // Calculate percentage
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

    return scoredProjects
      .filter(p => p.matchPercentage > 0)
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, limit);
  }
  // ========== END OF CHANGE ==========

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

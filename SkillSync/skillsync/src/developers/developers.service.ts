import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Developer } from './entities/developer.entity';
import { CreateDeveloperDto } from './dto/create-developer.dto';
import { UpdateDeveloperDto } from './dto/update-developer.dto';

@Injectable()
export class DevelopersService {
  constructor(
    @InjectRepository(Developer)
    private developersRepository: Repository<Developer>,
  ) {
    console.log(' DevelopersService initialized');
  }

  async create(createDeveloperDto: CreateDeveloperDto): Promise<Developer> {
    const developer = this.developersRepository.create(createDeveloperDto);
    const saved = await this.developersRepository.save(developer);
    console.log(' Developer created:', saved.name);
    return saved;
  }

  async findAll(skill?: string, experience?: string, page = 1, limit = 20) {
    const query = this.developersRepository.createQueryBuilder('developer');

    if (skill) {
      query.andWhere('developer.skills LIKE :skill', { skill: `%${skill}%` });
    }

    if (experience) {
      query.andWhere('developer.experienceLevel = :experience', { experience });
    }

    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Developer> {
    const developer = await this.developersRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!developer) {
      throw new NotFoundException(`Developer with ID ${id} not found`);
    }

    return developer;
  }

  async update(id: string, updateDeveloperDto: UpdateDeveloperDto): Promise<Developer> {
    const developer = await this.findOne(id);
    Object.assign(developer, updateDeveloperDto);
    return this.developersRepository.save(developer);
  }

  async remove(id: string): Promise<void> {
    const developer = await this.findOne(id);
    await this.developersRepository.remove(developer);
    console.log(' Developer deleted:', id);
  }
}



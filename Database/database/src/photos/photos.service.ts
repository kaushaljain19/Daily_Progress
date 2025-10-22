import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo)
    private photosRepository: Repository<Photo>,
  ) {}

  async findAll(): Promise<Photo[]> {
    return this.photosRepository.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Photo | null> {
    return this.photosRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async create(url: string, description: string, userId: number): Promise<Photo> {
    const photo = this.photosRepository.create({
      url,
      description,
      user: { id: userId } as any,
    });
    return this.photosRepository.save(photo);
  }

  async remove(id: number): Promise<void> {
    await this.photosRepository.delete(id);
  }
}

import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { PhotosService } from './photos.service';
import { Photo } from './photo.entity';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Get()
  findAll(): Promise<Photo[]> {
    return this.photosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Photo | null> {
    return this.photosService.findOne(+id);
  }

  @Post()
  create(
    @Body() body: { url: string; description: string; userId: number },
  ): Promise<Photo> {
    return this.photosService.create(body.url, body.description, body.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.photosService.remove(+id);
  }
}

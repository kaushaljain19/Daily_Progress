import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevelopersService } from './developers.service';
import { DevelopersController } from './developers.controller';
import { Developer } from './entities/developer.entity';
import { Project } from '../projects/entities/project.entity';

@Module({
 imports: [
    TypeOrmModule.forFeature([
      Developer,
      Project, 
    ]),
  ],
  controllers: [DevelopersController],
  providers: [DevelopersService],
  exports: [DevelopersService],
})
export class DevelopersModule {}

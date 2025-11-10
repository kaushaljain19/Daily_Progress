import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Experience } from '../../common/enums/experience.enum';
import { User } from '../../users/entities/user.entity';

@Entity('developers')
export class Developer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { nullable: true })
  @JoinColumn()
  user: User;

  @Column()
  name: string;

  @Column('simple-array')
  skills: string[];

  @Column({
    type: 'enum',
    enum: Experience,
  })
  experienceLevel: Experience;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

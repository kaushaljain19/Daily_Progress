
// import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// @Entity()
// export class User {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column()
//   firstName: string;

//   @Column()
//   lastName: string;

//   @Column({ default: true })
//   isActive: boolean;
// }



import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Photo } from '../photos/photo.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(type => Photo, photo => photo.user)
  photos: Photo[];
}


// Separating entity definition#
// You can define an entity and its columns right in the model, 
// using decorators. But some people prefer to define entities and 
// their columns inside separate files using the "entity schemas".



// import { EntitySchema } from 'typeorm';
// import { User } from './user.entity';

// export const UserSchema = new EntitySchema<User>({
//   name: 'User',
//   target: User,
//   columns: {
//     id: {
//       type: Number,
//       primary: true,
//       generated: true,
//     },
//     firstName: {
//       type: String,
//     },
//     lastName: {
//       type: String,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   relations: {
//     photos: {
//       type: 'one-to-many',
//       target: 'Photo', // the name of the PhotoSchema
//     },
//   },
// });

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Photo } from './photos/photo.entity';
import { UsersModule } from './users/users.module';
import { PhotosModule } from './photos/photos.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'HACK1234',
      database: 'test',
      entities: [User, Photo],  // Photo entity add karo
      synchronize: true,
    }),
    UsersModule,
    PhotosModule,
  ],
})
export class AppModule {}


// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { UsersModule } from './users/users.module';
// import { User } from './users/user.entity';

// @Module({
//   imports: [
//     TypeOrmModule.forRoot({
//       type: 'mysql',
//       host: 'localhost',
//       port: 3306,
//       username: 'root',
//       password: 'HACK1234',
//       database: 'test',
//       entities: [User],
//       synchronize: true,
//     }),
//     UsersModule,
//     PhotosModule,
//   ],
// })
// export class AppModule {}


// Writing Every entity Manually in the AppModule can be tedious.
// Instead, you can use autoLoadEntities option to automatically 
// load all entities registered through TypeOrmModule.forFeature() in feature modules.

// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { PhotosModule } from './photos/photos.module';

// @Module({
//   imports: [
//     TypeOrmModule.forRoot({
//       ...
//       autoLoadEntities: true,
//     }),
//   ],
// })
// export class AppModule {}

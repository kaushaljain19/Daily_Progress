import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  console.log('  Resetting database...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    await dataSource.dropDatabase();
    console.log('Database dropped');

    await dataSource.synchronize();
    console.log(' Database schema recreated');

    console.log(' Reset complete!');
    console.log(' Run "npm run seed" to add data\n');

  } catch (error) {
    console.error(' Error:', error.message);
    process.exit(1);
  }

  await app.close();
  process.exit(0);
}

bootstrap();

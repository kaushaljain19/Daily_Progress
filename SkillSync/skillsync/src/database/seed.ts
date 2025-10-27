import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { DevelopersService } from '../developers/developers.service';
import { ProjectsService } from '../projects/projects.service';
import { Role } from '../common/enums/role.enum';
import { Experience } from '../common/enums/experience.enum';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  console.log('Starting database seeding...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);
  const developersService = app.get(DevelopersService);
  const projectsService = app.get(ProjectsService);

  try {
    // Developer data
    const developersData = [
      {
        email: 'dev1@skillsync.com',
        name: 'Alice Johnson',
        skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Express'],
        experienceLevel: Experience.MIDLEVEL,
        bio: 'Full-stack developer with 3+ years in MERN stack'
      },
      {
        email: 'dev2@skillsync.com',
        name: 'Bob Smith',
        skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'AWS'],
        experienceLevel: Experience.SENIOR,
        bio: 'Senior backend engineer specializing in Python'
      },
      {
        email: 'dev3@skillsync.com',
        name: 'Carol White',
        skills: ['React Native', 'Flutter', 'Firebase', 'Redux'],
        experienceLevel: Experience.JUNIOR,
        bio: 'Mobile developer passionate about cross-platform apps'
      },
      {
        email: 'dev4@skillsync.com',
        name: 'David Brown',
        skills: ['Vue.js', 'Node.js', 'MySQL', 'Docker', 'Kubernetes'],
        experienceLevel: Experience.MIDLEVEL,
        bio: 'Full-stack developer with expertise in Vue'
      },
      {
        email: 'dev5@skillsync.com',
        name: 'Emma Davis',
        skills: ['Angular', 'Java', 'Spring Boot', 'Oracle'],
        experienceLevel: Experience.SENIOR,
        bio: 'Enterprise application developer with 6+ years'
      },
      {
        email: 'dev6@skillsync.com',
        name: 'Frank Wilson',
        skills: ['React', 'GraphQL', 'Apollo', 'MongoDB', 'TypeScript'],
        experienceLevel: Experience.MIDLEVEL,
        bio: 'Frontend specialist with GraphQL expertise'
      },
      {
        email: 'dev7@skillsync.com',
        name: 'Grace Lee',
        skills: ['PHP', 'Laravel', 'MySQL', 'Redis', 'REST API'],
        experienceLevel: Experience.MIDLEVEL,
        bio: 'Backend developer with 4 years in PHP'
      },
      {
        email: 'dev8@skillsync.com',
        name: 'Henry Taylor',
        skills: ['Go', 'Microservices', 'Docker', 'Kubernetes', 'gRPC'],
        experienceLevel: Experience.SENIOR,
        bio: 'Systems architect specializing in microservices'
      },
      {
        email: 'dev9@skillsync.com',
        name: 'Iris Martinez',
        skills: ['Swift', 'iOS', 'UIKit', 'SwiftUI', 'Core Data'],
        experienceLevel: Experience.MIDLEVEL,
        bio: 'iOS developer with 3 years native development'
      },
      {
        email: 'dev10@skillsync.com',
        name: 'Jack Anderson',
        skills: ['Kotlin', 'Android', 'Jetpack Compose', 'Room'],
        experienceLevel: Experience.MIDLEVEL,
        bio: 'Android developer focused on modern architecture'
      },
      {
        email: 'dev11@skillsync.com',
        name: 'Kate Thompson',
        skills: ['Ruby', 'Rails', 'PostgreSQL', 'Sidekiq', 'Heroku'],
        experienceLevel: Experience.SENIOR,
        bio: 'Full-stack Rails developer with 7 years'
      },
      {
        email: 'dev12@skillsync.com',
        name: 'Liam Garcia',
        skills: ['C#', '.NET Core', 'Azure', 'SQL Server'],
        experienceLevel: Experience.SENIOR,
        bio: 'Enterprise .NET developer with cloud expertise'
      },
      {
        email: 'dev13@skillsync.com',
        name: 'Maya Rodriguez',
        skills: ['React', 'Next.js', 'Tailwind', 'Vercel', 'TypeScript'],
        experienceLevel: Experience.JUNIOR,
        bio: 'Frontend developer passionate about modern web'
      },
      {
        email: 'dev14@skillsync.com',
        name: 'Noah Miller',
        skills: ['Rust', 'WebAssembly', 'System Programming'],
        experienceLevel: Experience.SENIOR,
        bio: 'Systems programmer with high-performance expertise'
      },
      {
        email: 'dev15@skillsync.com',
        name: 'Olivia Moore',
        skills: ['React', 'Redux', 'Jest', 'Cypress', 'Testing'],
        experienceLevel: Experience.MIDLEVEL,
        bio: 'Frontend developer focused on testing'
      },
      {
        email: 'dev16@skillsync.com',
        name: 'Paul Jackson',
        skills: ['Elixir', 'Phoenix', 'PostgreSQL', 'Real-time'],
        experienceLevel: Experience.MIDLEVEL,
        bio: 'Backend developer specializing in real-time apps'
      },
      {
        email: 'dev17@skillsync.com',
        name: 'Quinn Martin',
        skills: ['Scala', 'Akka', 'Apache Kafka', 'Big Data', 'Spark'],
        experienceLevel: Experience.SENIOR,
        bio: 'Big data engineer with functional programming'
      },
      {
        email: 'dev18@skillsync.com',
        name: 'Rachel Lee',
        skills: ['Unity', 'C#', 'Game Development', '3D Graphics'],
        experienceLevel: Experience.MIDLEVEL,
        bio: 'Game developer with AR/VR experience'
      },
      {
        email: 'dev19@skillsync.com',
        name: 'Sam Wilson',
        skills: ['DevOps', 'CI/CD', 'Jenkins', 'Terraform', 'AWS'],
        experienceLevel: Experience.SENIOR,
        bio: 'DevOps engineer focused on automation'
      },
      {
        email: 'dev20@skillsync.com',
        name: 'Tina Clark',
        skills: ['Data Science', 'Python', 'TensorFlow', 'ML', 'Pandas'],
        experienceLevel: Experience.MIDLEVEL,
        bio: 'Data scientist with ML expertise'
      }
    ];

    // Create developers with linked user accounts
    console.log('Creating developers with user accounts...');
    const developerUsers: User[] = [];
    
    for (const devData of developersData) {
      // Create user account
      const user = await usersService.create({
        email: devData.email,
        password: await bcrypt.hash('password123', 10),
        role: Role.DEVELOPER,
      });
      developerUsers.push(user);

      // Create developer profile linked to user
      await developersService.create({
        name: devData.name,
        skills: devData.skills,
        experienceLevel: devData.experienceLevel,
        bio: devData.bio,
      });
      
      console.log(`Created: ${devData.name} (${devData.email})`);
    }

    console.log(`\nCreated ${developerUsers.length} developers with user accounts`);

    // Create client users
    console.log('\nCreating client users...');
    const clientUsers: User[] = [];
    for (let i = 0; i < 10; i++) {
      const user = await usersService.create({
        email: `client${i + 1}@skillsync.com`,
        password: await bcrypt.hash('password123', 10),
        role: Role.CLIENT,
      });
      clientUsers.push(user);
    }
    console.log(`Created ${clientUsers.length} client users`);

    // Create projects
    console.log('\nCreating projects...');
    const projects = [
      {
        title: 'E-commerce Website Development',
        description: 'Build modern e-commerce platform with payment gateway',
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        budget: 5000,
        duration: '3 months',
        clientIndex: 0
      },
      {
        title: 'Mobile Food Delivery App',
        description: 'iOS/Android food delivery with real-time tracking',
        requiredSkills: ['React Native', 'Firebase', 'Redux'],
        budget: 8000,
        duration: '4 months',
        clientIndex: 0
      },
      {
        title: 'RESTful API for Financial Application',
        description: 'Secure REST API for financial data management',
        requiredSkills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
        budget: 6000,
        duration: '2 months',
        clientIndex: 1
      },
      {
        title: 'Analytics Dashboard Development',
        description: 'Interactive dashboard with real-time visualization',
        requiredSkills: ['React', 'TypeScript', 'D3.js', 'Node.js'],
        budget: 4000,
        duration: '2 months',
        clientIndex: 1
      },
      {
        title: 'Social Media Management Platform',
        description: 'Platform for managing multiple social accounts',
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'Redis'],
        budget: 7000,
        duration: '5 months',
        clientIndex: 2
      },
      {
        title: 'Enterprise CRM System',
        description: 'Custom CRM for large enterprise',
        requiredSkills: ['Angular', 'Java', 'Spring Boot', 'Oracle'],
        budget: 15000,
        duration: '6 months',
        clientIndex: 2
      },
      {
        title: 'Video Streaming Platform',
        description: 'Netflix-like streaming service with CDN',
        requiredSkills: ['React', 'Node.js', 'AWS', 'CDN'],
        budget: 12000,
        duration: '5 months',
        clientIndex: 3
      },
      {
        title: 'Healthcare Management System',
        description: 'HIPAA-compliant patient management',
        requiredSkills: ['Vue.js', 'Node.js', 'MySQL', 'Security'],
        budget: 10000,
        duration: '4 months',
        clientIndex: 3
      },
      {
        title: 'Real Estate Listing Platform',
        description: 'Property listing with advanced search',
        requiredSkills: ['React', 'GraphQL', 'MongoDB'],
        budget: 6500,
        duration: '3 months',
        clientIndex: 4
      },
      {
        title: 'Educational LMS Platform',
        description: 'Learning management with video courses',
        requiredSkills: ['PHP', 'Laravel', 'MySQL', 'Video'],
        budget: 8500,
        duration: '4 months',
        clientIndex: 4
      },
      {
        title: 'IoT Device Management',
        description: 'Platform for IoT monitoring',
        requiredSkills: ['Go', 'Microservices', 'Docker', 'MQTT'],
        budget: 11000,
        duration: '5 months',
        clientIndex: 5
      },
      {
        title: 'Native iOS Fitness App',
        description: 'Health tracking with workout plans',
        requiredSkills: ['Swift', 'iOS', 'HealthKit', 'Core Data'],
        budget: 7500,
        duration: '3 months',
        clientIndex: 5
      },
      {
        title: 'Android Productivity Suite',
        description: 'Task management app with offline support',
        requiredSkills: ['Kotlin', 'Android', 'Room', 'MVVM'],
        budget: 7000,
        duration: '3 months',
        clientIndex: 6
      },
      {
        title: 'E-learning Platform Backend',
        description: 'Scalable backend for online learning',
        requiredSkills: ['Ruby', 'Rails', 'PostgreSQL', 'AWS'],
        budget: 9000,
        duration: '4 months',
        clientIndex: 6
      },
      {
        title: 'Enterprise ERP System',
        description: 'Complete ERP for manufacturing',
        requiredSkills: ['C#', '.NET Core', 'Azure', 'SQL Server'],
        budget: 20000,
        duration: '8 months',
        clientIndex: 7
      },
      {
        title: 'Modern Portfolio Website',
        description: 'Personal portfolio with blog',
        requiredSkills: ['React', 'Next.js', 'Tailwind'],
        budget: 2000,
        duration: '1 month',
        clientIndex: 7
      },
      {
        title: 'Blockchain Supply Chain',
        description: 'Supply chain tracking with blockchain',
        requiredSkills: ['Rust', 'Blockchain', 'Smart Contracts'],
        budget: 25000,
        duration: '6 months',
        clientIndex: 8
      },
      {
        title: 'E-commerce Testing Automation',
        description: 'Automated testing suite with CI/CD',
        requiredSkills: ['React', 'Jest', 'Cypress', 'Testing'],
        budget: 5500,
        duration: '2 months',
        clientIndex: 8
      },
      {
        title: 'Real-time Chat Application',
        description: 'Scalable chat with file sharing',
        requiredSkills: ['Elixir', 'Phoenix', 'WebSocket'],
        budget: 6000,
        duration: '3 months',
        clientIndex: 9
      },
      {
        title: 'ML Model Deployment Platform',
        description: 'Deploy ML models with REST API',
        requiredSkills: ['Python', 'TensorFlow', 'Docker', 'Kubernetes'],
        budget: 8000,
        duration: '3 months',
        clientIndex: 9
      }
    ];

    for (const project of projects) {
      await projectsService.create(clientUsers[project.clientIndex].id, {
        title: project.title,
        description: project.description,
        requiredSkills: project.requiredSkills,
        budget: project.budget,
        duration: project.duration,
      });
    }
    console.log(`Created ${projects.length} projects`);

    console.log('\nDatabase seeding completed successfully');
    console.log('Summary:');
    console.log(`- ${developerUsers.length + clientUsers.length} users created`);
    console.log(`- ${developersData.length} developer profiles created`);
    console.log(`- ${projects.length} projects created`);
    console.log('\nTest credentials: dev1@skillsync.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }

  await app.close();
  process.exit(0);
}

bootstrap();

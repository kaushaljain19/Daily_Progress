Authenticatin - 

example 1 - Implemented without jwt 

example 2 - with jwt implemented entire example with guard 

Authorization - 

Authorization is the process that determines 
what actions a user is allowed to perform 
within an application

1. Role-Based Access Control (RBAC) - 
2.NestJS uses a decorator pattern to attach metadata to route handlers, 
specifying which roles are required to access particular endpoints. 
This is accomplished through a custom @Roles() decorator that internally uses 
NestJS's SetMetadata function to tag routes with role requirements

*********************** Recipies ******************************

Recipes = Ready-to-use implementation guides for common patterns which needed 
in all applications.


********** Crud Generator **************

When building APIs, creating CRUD operations for 
each new entity (User, Product, etc.) requires repeating
the same steps manually: generating module, controller, 
service, entity class, DTOs, and test files. 
This is tedious and time-consuming.

Solution: nest g resource




*************************** Passport.js ******************************





*************************** TypeORM ******************************

TypeORM is a tool that lets you interact with databases 
(MySQL, PostgreSQL, SQLite) using TypeScript classes instead 
of writing raw SQL queries. It acts as a 
bridge between your object-oriented code and 
relational database tables.


********** Swagger **************

Swagger is a tool that helps you design, build, document,
and consume RESTful web services. It provides a user-friendly
interface to visualize and interact with your API's resources 
without needing to write any additional code.

implentation - change main .ts file

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);



*********** Cli **************

nest new <name> — Creates a new project with folder structure 
(/src, /test), config files, and default components. Prompts for npm/yarn/pnpm.

nest generate <type> <name> (alias: nest g) — Auto-generates components 
like controllers, services, modules, guards, pipes, etc. Saves manual boilerplate writing.

nest g resource <name> — Generates complete CRUD API 
(controller + service + module + DTOs + entity + tests) 
in one command. Fastest way to scaffold features.

nest build — Compiles TypeScript to JavaScript, outputs to 
/dist folder. Use --watch flag for live-reload during development.



************* Debugging ***************

NestJS provides built-in support for debugging applications
using the Node.js debugger or other
debugging tools. You can set breakpoints, inspect variables,
and step through your code to identify and fix issues.

npm run start:debug

1. click run and bebug 
2. claick create a launch.json file
3. click node js debugger 
4. click on the select box to greeen button at the top 
5. select 'Run script : start:dev'
6. wait for the application to start in watch mode 
7. set a breakpoint 
8. trigger a request to test the breakpoint














































































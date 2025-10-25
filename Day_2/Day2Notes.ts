Fundamentals - 

***************** Injection Scopes *****************

A provider can have any of the following scopes:

DEFAULT	Singleton - Application lifecycle	Normal services (recommended for 99% cases)
REQUEST	Per HTTP request	User-specific data, request tracking, multi-tenancy
TRANSIENT	Per injection	Completely isolated instances - useful for stateful services

2. Default Scope (Singleton) - Recommended
By default, all providers are singleton​

A single instance is created when the application bootstraps

Most efficient for both memory and performance

Safe in Node.js's single-threaded environment

3. REQUEST Scope - Use With Caution
A new instance is created for each HTTP request​

Performance impact because the DI container tree is recreated for each request

Use cases: request-specific logging, user context, per-request caching in GraphQL​

typescript
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  // New instance per request
}

4. Scope Hierarchy (Critical Concept)
Important Rule: Agar koi provider REQUEST/TRANSIENT scope ka hai, toh usko inject karne wala provider bhi automatically REQUEST scope ban jata hai.​

typescript
@Injectable({ scope: Scope.REQUEST })
class RequestService {}

@Injectable() // Automatically becomes REQUEST scoped!
class UserService {
  constructor(private reqService: RequestService) {}
}

5.Controllers can also be assigned a scope :​

typescript
@Controller({
  path: 'cats',
  scope: Scope.REQUEST
})
export class CatsController {
  // New instance per request
}

6. To mitigate REQUEST scope performance issues, NestJS offers durable providers :

7. 9. TRANSIENT Scope
A new instance at every injection point​

Most isolated, most expensive

Used for rare use cases

typescript
@Injectable({ scope: Scope.TRANSIENT })
export class TransientService {
  // New instance every time it's injected
}


**************** Circuler Dependencies *****************

1.A circular dependency occurs when two classes depend on each other :​

Class A needs Class B

Class B needs Class A


2. NestJS provides two techniques to resolve circular dependencies:

Solution 1: Forward Reference (forwardRef)
Solution 2: ModuleRef Class



******** Lifecycle Events ********

A NestJS application and every application element (modules, providers, controllers) has a lifecycle managed by Nest. Lifecycle hooks give you visibility into key lifecycle events and allow you to run code when they occur .

2. Three Lifecycle Phases
The lifecycle is divided into three phases :

Initializing - Application startup and dependency resolution

Running - Application is active and handling requests

Terminating - Application shutdown and cleanup




Lifecycle Hook Method	Trigger Event
onModuleInit()	Host module dependencies resolve hone ke baad
onApplicationBootstrap()	Saare modules initialize hone ke baad, but listening se pehle
onModuleDestroy()*	Termination signal (SIGTERM) receive hone ke baad
beforeApplicationShutdown()*	Saare onModuleDestroy() handlers complete hone ke baad
onApplicationShutdown()*	Connections close hone ke baad (app.close() resolve)


onModuleInit aur onApplicationBootstrap sirf tab trigger hote hain jab 
explicitly app.init() ya app.listen() call karo

onModuleDestroy, beforeApplicationShutdown aur onApplicationShutdown 
sirf tab trigger jab explicitly app.close() call ya system signal 
(SIGTERM) receive ho aur enableShutdownHooks correctly call kiya ho

Both onModuleInit() and onApplicationBootstrap() 
can be async. Nest will wait for them to complete .




************************************************************


Techniques - 

***************Configuration*****************

1. @nestjs/config package internally uses dotenv.

2. ConfigModule.forRoot() - Loads and parses .env file from default location (project root)
   basically reads .env file 

3. ConfigService - in this thing env variables are stored and can be 
   accessed throughout the app 

4. we have to inject ConfigService wherever we want to use env variables with the help of DI

5. configService.get('KEY_NAME') - to access specific env variable


3. global - ConfigModule.forRoot({
  isGlobal: true,
});


******************** Database Connection ********************




*************** Validation ****************

To automatically validate incoming requests, Nest provides several 
pipes available right out-of-the-box. These are ready-to-use tools that 
check data for you. The built-in pipes include:

ValidationPipe: The main pipe for checking data against rules you define in your classes.

ParseIntPipe: Converts strings to integers and validates they are numbers.

ParseBoolPipe: Converts strings to boolean values (true/false).

ParseArrayPipe: Handles arrays of data, like multiple items in a query.

ParseUUIDPipe: Checks if a value is a valid UUID format (like unique identifiers).


The ValidationPipe provides a convenient approach to enforce 
validation rules for all incoming client payloads. Here, "payloads" 
means the data sent in requests (like POST body, query params, or route params).


**********************Logging************************

1. NestJS has a built-in Logger class that provides a simple 
   and consistent way to log messages within your application.
   we  can add some customization to the default logger behavior by
   extending the Logger class and overriding its methods.

2. Disabling the Logger Completely - logger:false

3. const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  }); - only log error and warn messages will be shown 

4. we can implement custom logger by extending Logger class




  



























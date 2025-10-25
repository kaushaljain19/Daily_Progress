entities: [] is empty - meaning tables are not defined yet

Data save/retrieve requires creating entities and repositories ahead

What It Is

DataSource is a central object that represents your database 
connection. From it, you can access all database details and tools.

What You Can Access from DataSource:

EntityManager - for entity operations

QueryRunner - for transactions

Raw queries - to execute custom SQL

Multiple databases - to access specific databases if more than one are connected

Repository is a TypeORM class that helps you perform CRUD 
operations with a specific entity (table).

Repository is a ready-made toolbox for each entity 
(database table). Meaning if there's a User entity, 
you'll get a UserRepository that will work only with the User table.

What You Get

Repository has built-in methods for database operations:

find() - get all records

findOne() / findOneBy() - find one specific record

save() - create new record or update existing

remove() / delete() - delete record

count() - count records

And many more methods

How to Use

Define entity (database table):

typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  firstName: string;
}
Inject in service:

typescript
constructor(
  @InjectRepository(User)
  private usersRepository: Repository<User>,
) {}
Use it:

typescript
// Create
const user = await this.usersRepository.save({ firstName: 'John' });

// Read
const users = await this.usersRepository.find();

// Delete
await this.usersRepository.delete(1);
** Entity**

Entity is a TypeScript class that represents a database table.

What It Is

Entity means a database table, but in code in the form of a 
class. Just like there's a users table in the database, 
similarly there will be a User entity class in code.

How to Create

You make the class an entity using decorators:

typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  isActive: boolean;
}
This will automatically create a table in the database:

text
+-------------+--------------+----------------------------+
| user                                                   |
+-------------+--------------+----------------------------+
| id          | int          | PRIMARY KEY AUTO_INCREMENT |
| firstName   | varchar(255) |                            |
| lastName    | varchar(255) |                            |
| isActive    | boolean      |                            |
+-------------+--------------+----------------------------+
Meaning of Decorators

@Entity() - This class is a database table

@PrimaryGeneratedColumn() - Auto-increment primary key (id)
 that will be automatically generated

@Column() - Database column (field)

Why Needed

With entity you can work with the database in a type-safe manner:

Don't have to write SQL queries manually

Get TypeScript typing - intellisense and autocomplete

Database schema and code stay in sync

Registering Entity

After creating entity, you have to register it in configuration:

typescript
TypeOrmModule.forRoot({
  type: 'mysql',
  entities: [User], // Register entity here
})
Basically, entity = TypeScript representation of database table.

TypeORM supports the repository design pattern, 
so each entity has its own repository.

Where to Write

This code should be written in the users.module.ts 
file which is the users feature module.

Basically you create feature-wise modules in your project - 
like UsersModule for users, ProductsModule for products, etc.

Why Write

This code is registering the User entity specifically inside 
UsersModule using TypeOrmModule.forFeature([User]).

Explanation

TypeOrmModule.forFeature([User]): This specifically registers the
 User entity in this module. This makes the User entity's 
 repository automatically injectable in this module's services and controllers.

Will be injected only then can use in this users related feature

What is Transaction

Transaction is a unit of work that executes multiple operations 
together in the database. Transaction's basic principle is:

"Either all work happens, or nothing happens" (All or Nothing).

ACID Properties

Transaction follows ACID principles:

A - Atomicity (Together): All operations execute as one unit - 
either all success or all fail

C - Consistency (Consistent): Database always stays in valid state

I - Isolation (Separate): One transaction is independent from other transactions

D - Durability (Permanent): Once committed, it's permanently saved

Concept Example (Bank Transfer)

Scenario: You have to transfer ₹1000 from Ram to Shyam.

Without Transaction (Dangerous!):

typescript
// Step 1: Deduct from Ram's account
await ramRepository.update({ balance: ram.balance - 1000 });

// 🔥 What if power cut happens here? Network fails?

// Step 2: Add to Shyam's account
await shyamRepository.update({ balance: shyam.balance + 1000 });
Problem: If error comes after Step 1, Ram's money got deducted but 
Shyam didn't receive. Money disappeared! 💸

With Transaction (Safe!):

typescript
await dataSource.transaction(async (manager) => {
  // Step 1: Deduct from Ram
  await manager.update(User, ramId, { balance: ram.balance - 1000 });
  
  // Step 2: Add to Shyam
  await manager.update(User, shyamId, { balance: shyam.balance + 1000 });
  
  // Both successful? Will commit. Error? Rollback - nothing will change
});
Benefit: Both operations are atomic - either both will happen or none

Transaction needed when:

Multiple related operations that are dependent

Data consistency needs to be maintained

Financial operations (money transfer, payments)

Multiple linked tables are being updated

What is Subscriber

Subscriber is an Observer Pattern where you listen to specific entity lifecycle events.

Simple Example: YouTube channel subscription:

You subscribe to a YouTube channel

When they upload a new video, you get notification

You get automatically informed without manually checking

In database: When an action happens on any 
entity (User, Product, Order) (insert, update, delete), 
subscriber automatically triggers and performs defined actions.

Lifecycle Events

TypeORM has 7 main events:

beforeInsert - BEFORE entity saves

afterInsert - AFTER entity saves

beforeUpdate - BEFORE entity updates

afterUpdate - AFTER entity updates

beforeRemove - BEFORE entity deletes

afterRemove - AFTER entity deletes

afterLoad - AFTER entity loads from database

What is Multiple Databases

Multiple Databases means using more than one database connection in one application.

Simple Example: Restaurant analogy:

Kitchen Database: Menu items, recipes, ingredients (chefs use)

Customer Database: Customer details, orders, payments (waiters use)

Both are separate but the same restaurant application is using them

Technical: Accessing multiple MySQL/PostgreSQL databases simultaneously from one NestJS app.

Migration means a way to version control database schema changes.

Simple Analogy: Git for Database Schema

In Git you track code changes (commit history)

In Migrations you track database changes (migration files)

2. Testing (Mock Repositories)

What It Is: In unit tests use mock repositories - not real database connection.

Why Needed:

Fast tests - no database overhead

Isolated tests - database state doesn't affect

Predictable - can control mock data

Documentation Example:

typescript
@Module({
  providers: [
    UsersService,
    {
      provide: getRepositoryToken(User),  // Repository token
      useValue: mockRepository,           // Inject mock
    },
  ],
})
export class UsersModule {}
Topic 4: Custom DataSource Factory

What is the Concept

Custom DataSource Factory means overriding TypeORM's default DataSource creation and adding your own custom logic.

Why Needed:

Need custom initialization logic during DataSource creation

Need to customize connection pooling

Need to add custom logging/monitoring

Need to configure SSL certificates
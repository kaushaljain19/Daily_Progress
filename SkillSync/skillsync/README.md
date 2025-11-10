# SkillSync 

## Setup

1. **Install Dependencies**
npm install


2. **Configure Database**

Create `.env` file:
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=skillsync
JWT_SECRET=your_super_secret_jwt_key


3. **Create Database**
CREATE DATABASE skillsync;


4. **Start Server**
npm run start:dev


5. **Seed Sample Data**
npm run db:fresh


## Access

- **API Server**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api

## Test Credentials

**Developers**: dev1@skillsync.com to dev20@skillsync.com  
**Clients**: client1@skillsync.com to client10@skillsync.com  
**Password**: password123

## Using Swagger

1. Open http://localhost:3000/api
2. Click POST /auth/login → Try it out
3. Login with above credentials
4. Copy the `access_token`
5. Click "Authorize" button (top right)
6. Paste token → Authorize → Close
7. Test any protected route

**Note**: Register with `role: "developer"` to access developer routes, or `role: "client"` for client routes.

## Commands

npm run start:dev # Start development server
npm run seed # Add sample data
npm run db:reset # Reset database
npm run db:fresh # Reset + seed data


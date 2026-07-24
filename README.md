# EMS Backend

Employee Management System - Production-Ready Backend

## Project Description

EMS Backend is a robust, enterprise-grade backend application built for managing employees in a software company. The system follows Clean Architecture principles and SOLID design patterns to ensure scalability, maintainability, and testability.

This backend is designed to handle hundreds of employees with features including authentication, attendance tracking, work management, reporting, notifications, meetings, and comprehensive role-based access control.

## Folder Structure

```
ems-backend/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   ├── env.js
│   │   ├── cloudinary.js
│   │   └── logger.js
│   ├── core/
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── responses/
│   │   └── utils/
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── permission.middleware.js
│   │   ├── validate.middleware.js
│   │   ├── upload.middleware.js
│   │   └── error.middleware.js
│   ├── modules/
│   │   ├── auth/
│   │   ├── employee/
│   │   ├── attendance/
│   │   ├── work/
│   │   ├── report/
│   │   ├── dashboard/
│   │   ├── notification/
│   │   ├── meeting/
│   │   ├── settings/
│   │   ├── role/
│   │   ├── department/
│   │   ├── designation/
│   │   └── shared/
│   │       ├── services/
│   │       ├── validators/
│   │       ├── helpers/
│   │       ├── emails/
│   │       ├── storage/
│   │       └── routes/
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file from `.env.example` and configure environment variables
5. Start the development server:

```bash
npm run dev
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **File Upload**: Multer with Cloudinary
- **Security**: Helmet, CORS, Rate Limiting, XSS Protection, HPP
- **Logging**: Morgan
- **Password Hashing**: bcrypt
- **Module System**: ES Modules

## Development Rules

- Use ES Modules exclusively (no CommonJS)
- Follow Clean Architecture principles
- Adhere to SOLID principles
- Use feature-based folder structure
- Keep naming consistent across the codebase
- Use lowercase for feature folders
- Implement proper error handling
- Write modular, reusable code
- Maintain separation of concerns
- Do not commit sensitive data (use .env)
- Follow enterprise-level coding standards

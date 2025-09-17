# ASUBEB Backend API

A comprehensive NestJS backend application for managing educational data, student performance, and administrative functions for the Abia State Universal Basic Education Board (ASUBEB).

## 🚀 Features

### Core Functionality
- **Student Management**: Complete CRUD operations for student records
- **School Management**: Manage schools with LGA associations
- **Class Management**: Organize students into classes within schools
- **Assessment System**: Track student performance across subjects
- **Excel Data Import**: Bulk upload student data and assessment scores
- **Admin Dashboard**: Comprehensive analytics and performance metrics
- **Performance Tracking**: Real-time student performance analysis

### Key Modules
- **Academic Module**: Session and term management
- **Admin Module**: Dashboard, student, school, and LGA management
- **Excel Upload**: Bulk data import functionality
- **Grading System**: Assessment and performance tracking

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd asubeb-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Configure your `.env` file with:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/asubeb"
   
   # Application
   PORT=3000
   NODE_ENV=development
   
   # Add other required environment variables
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # (Optional) Seed database with initial data
   npx prisma db seed
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run start:prod
   ```

## 🗄️ Database Schema

### Core Entities
- **Student**: Personal information, academic records, and performance data
- **School**: Educational institutions with LGA associations
- **Class**: Academic classes within schools
- **Assessment**: Student performance records across subjects
- **Session**: Academic sessions (e.g., 2024/2025)
- **Term**: Academic terms (FIRST_TERM, SECOND_TERM, THIRD_TERM)
- **Subject**: Academic subjects for assessments
- **Local Government Area (LGA)**: Administrative divisions

### Key Relationships
- Students belong to Schools and Classes
- Classes belong to Schools
- Schools belong to LGAs
- Assessments link Students, Subjects, Classes, and Terms

## 📊 API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Admin Dashboard
```
GET /admin/dashboard?session=2024/2025&term=SECOND_TERM
```
Returns comprehensive dashboard data including:
- Total students, schools, classes
- Gender distribution statistics
- Top 10 performing students with school and class information
- Performance analytics

### Student Management
```
GET    /admin/students              # Get all students
GET    /admin/students/:id          # Get student by ID
POST   /admin/students              # Create new student
PUT    /admin/students/:id          # Update student
DELETE /admin/students/:id          # Delete student
GET    /admin/students/:id/assessment-breakdown  # Get student assessments
```

### School Management
```
GET    /admin/schools               # Get all schools
GET    /admin/schools/:id           # Get school by ID
POST   /admin/schools               # Create new school
PUT    /admin/schools/:id           # Update school
DELETE /admin/schools/:id           # Delete school
POST   /admin/schools/update-student-counts  # Update student counts
```

### Excel Upload
```
POST /admin/excel-upload
```
Upload Excel files with student data including:
- Student information (name, gender, class)
- School and LGA details
- Subject scores for assessments

**Required Excel Columns:**
- School Name
- LGA
- Student Name
- Class
- Gender
- Subject scores (English Language, Mathematics, etc.)

### Academic Management
```
GET    /admin/sessions              # Get all sessions
POST   /admin/sessions              # Create session
GET    /admin/terms                 # Get all terms
POST   /admin/terms                 # Create term
```

## 🔧 Development

### Available Scripts
```bash
# Development
npm run start:dev          # Start in development mode with hot reload

# Production
npm run start              # Start in production mode
npm run start:prod         # Start in production mode

# Testing
npm run test               # Run unit tests
npm run test:e2e          # Run end-to-end tests
npm run test:cov          # Run tests with coverage

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run database migrations
npm run prisma:studio      # Open Prisma Studio
```

### Database Management
```bash
# Reset database (⚠️ Destructive operation)
npx prisma migrate reset --force

# Generate new migration
npx prisma migrate dev --name migration_name

# Deploy migrations to production
npx prisma migrate deploy
```

## 📈 Dashboard Features

### Admin Dashboard Response
```json
{
  "success": true,
  "message": "Admin Dashboard Data retrieved successfully",
  "data": {
    "session": "2024/2025",
    "term": "SECOND_TERM",
    "totalStudents": 67,
    "totalMale": 35,
    "totalFemale": 32,
    "schools": [...],
    "lgas": [...],
    "classes": [...],
    "genders": {...},
    "subjects": [...],
    "topStudents": [
      {
        "id": "student_id",
        "position": 1,
        "studentName": "Student Name",
        "examNumber": "STU12345",
        "school": "School Name",
        "class": "Class Name",
        "gender": "MALE",
        "totalScore": 697
      }
    ],
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🔒 Security & Configuration

### CORS Configuration
The application includes comprehensive CORS settings for frontend integration:
- Multiple localhost origins supported
- Standard HTTP methods allowed
- Credentials enabled for authentication

### Error Handling
- Global exception filter for consistent error responses
- Detailed logging for debugging
- Structured error responses

## 📝 Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/asubeb"

# Application
PORT=3000
NODE_ENV=development

# Add other environment-specific variables
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run test coverage
npm run test:cov
```

## 📚 API Documentation

Once the application is running, visit:
```
http://localhost:3000/api
```

This will open the Swagger UI with complete API documentation.

## 🚀 Deployment

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Environment Setup
Ensure all environment variables are properly configured for production:
- Database connection string
- Port configuration
- Security settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/api`
- Review the logs for error details
- Contact the development team

---

**Built with ❤️ using NestJS and PostgreSQL**

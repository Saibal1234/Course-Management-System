# Course Management System (CMS) with MongoDB

A full-stack Course Management System built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring role-based access control, file uploads, assignment submissions, and automated grade calculations.

## 🌟 Features

### Authentication & Authorization
- Secure user registration and login with JWT tokens
- HTTP-only cookies for enhanced security
- Role-based access control (Instructor & Student)
- Password hashing with bcrypt

### For Instructors
- **Course Management**: Create, edit, and delete courses with unique course codes
- **Material Upload**: Upload PDFs, documents, images, and videos with descriptions and tags
- **Assignment Creation**: Create assignments with due dates and point values
- **Grade Management**: Grade student submissions with feedback
- **Grade Book**: View comprehensive grade reports for all students in a course

### For Students
- **Course Enrollment**: Enroll in courses using course codes
- **Material Access**: View and download all course materials
- **Assignment Submission**: Submit assignments with automatic late detection
- **Grade Tracking**: View grades, feedback, and overall performance
- **Dashboard**: See enrollment status, assignment completion, and average grades

### Additional Features
- Responsive design with Tailwind CSS
- File upload support (up to 50MB)
- Automatic grade calculation with letter grades (A-F)
- Late submission tracking
- Real-time data updates

## 🏗️ Project Structure

```
cms2/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── courseController.js   # Course CRUD operations
│   │   ├── materialController.js # Material management
│   │   ├── assignmentController.js
│   │   ├── submissionController.js
│   │   └── gradeController.js    # Grade calculations
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & RBAC
│   │   └── upload.js             # Multer file upload config
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Course.js             # Course schema
│   │   ├── Material.js           # Material schema
│   │   ├── Assignment.js         # Assignment schema
│   │   └── Submission.js         # Submission schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── materialRoutes.js
│   │   ├── assignmentRoutes.js
│   │   ├── submissionRoutes.js
│   │   └── gradeRoutes.js
│   ├── uploads/                  # File storage directory
│   ├── server.js                 # Express server
│   ├── mongo-seed.js             # Database seeder
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js         # Navigation component
│   │   │   └── PrivateRoute.js   # Protected route wrapper
│   │   ├── context/
│   │   │   └── AuthContext.js    # Authentication state
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── InstructorDashboard.js
│   │   │   ├── StudentDashboard.js
│   │   │   ├── CourseDetail.js   # Course view (materials & assignments)
│   │   │   └── Grades.js         # Student grades page
│   │   ├── services/
│   │   │   └── api.js            # Axios API service layer
│   │   ├── App.js                # Main app with routing
│   │   ├── index.js              # React entry point
│   │   └── index.css             # Tailwind CSS
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── package.json                  # Root package for concurrent dev
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd cms2
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```
   This installs dependencies for root, backend, and frontend.

3. **Setup environment variables**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `backend/.env` with your configuration:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/cms
   JWT_SECRET=your_super_secret_key_change_this
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in .env
   ```

5. **Seed the database with sample data**
   ```bash
   cd backend
   npm run seed
   ```
   
   This creates:
   - 2 Instructors
   - 4 Students
   - 3 Courses with enrollments
   - Materials, Assignments, and Submissions with grades

6. **Run the application**
   ```bash
   # From the root directory
   npm run dev
   ```
   
   This starts:
   - Backend API: http://localhost:5000
   - Frontend: http://localhost:3000

## 👥 Demo Accounts

### Instructors
- **Email**: john.smith@university.edu  
  **Password**: password123  
  **Courses**: CS101, DB301

- **Email**: sarah.johnson@university.edu  
  **Password**: password123  
  **Courses**: WEB201

### Students
- **Email**: alice.brown@student.edu  
  **Password**: password123  
  **Enrolled**: CS101, DB301

- **Email**: bob.wilson@student.edu  
  **Password**: password123  
  **Enrolled**: CS101, WEB201

- **Email**: charlie.davis@student.edu  
  **Password**: password123  
  **Enrolled**: CS101, WEB201

- **Email**: diana.martinez@student.edu  
  **Password**: password123  
  **Enrolled**: WEB201, DB301

### Course Codes
- **CS101** - Introduction to Computer Science
- **WEB201** - Web Development Fundamentals
- **DB301** - Database Systems

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
POST   /api/auth/logout      - Logout user
GET    /api/auth/me          - Get current user
```

### Courses
```
GET    /api/courses                - List courses (role-based)
POST   /api/courses                - Create course (Instructor)
GET    /api/courses/enrolled       - Get enrolled courses (Student)
POST   /api/courses/enroll         - Enroll in course (Student)
GET    /api/courses/:id            - Get single course
PUT    /api/courses/:id            - Update course (Instructor)
DELETE /api/courses/:id            - Delete course (Instructor)
POST   /api/courses/:id/unenroll   - Unenroll from course (Student)
```

### Materials
```
GET    /api/materials/course/:courseId  - Get materials for course
POST   /api/materials                   - Upload material (Instructor)
PUT    /api/materials/:id               - Update material (Instructor)
DELETE /api/materials/:id               - Delete material (Instructor)
```

### Assignments
```
GET    /api/assignments/course/:courseId - Get assignments for course
POST   /api/assignments                  - Create assignment (Instructor)
GET    /api/assignments/:id              - Get single assignment
PUT    /api/assignments/:id              - Update assignment (Instructor)
DELETE /api/assignments/:id              - Delete assignment (Instructor)
```

### Submissions
```
POST   /api/submissions                      - Submit assignment (Student)
GET    /api/submissions/my                   - Get my submissions (Student)
GET    /api/submissions/assignment/:id       - Get assignment submissions (Instructor)
GET    /api/submissions/:id                  - Get single submission
PUT    /api/submissions/:id/grade            - Grade submission (Instructor)
DELETE /api/submissions/:id                  - Delete submission (Student)
```

### Grades
```
GET    /api/grades/my                - Get all grades overview (Student)
GET    /api/grades/my/:courseId      - Get detailed grades for course (Student)
GET    /api/grades/course/:courseId  - Get grade book for course (Instructor)
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS
- **Context API** - State management

## 🔒 Security Features

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with 30-day expiration
- HTTP-only cookies for token storage
- Role-based access control (RBAC)
- Protected API routes with authentication middleware
- File type validation for uploads
- File size limits (50MB max)
- Input validation and sanitization

## 📊 Grade Calculation

The system automatically calculates:
- **Total Points**: Sum of all assignment max points
- **Earned Points**: Sum of all graded assignment scores
- **Percentage**: (Earned Points / Total Points) × 100
- **Letter Grade**:
  - A: 90-100%
  - B: 80-89%
  - C: 70-79%
  - D: 60-69%
  - F: Below 60%
  - N/A: No graded assignments

## 🎨 UI Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Loading States**: Spinners for async operations
- **Error Handling**: User-friendly error messages
- **Form Validation**: Client-side validation
- **Real-time Updates**: Data refreshes after actions
- **Color-coded Status**: Visual indicators for assignment status, grades, and deadlines

## 📝 Development Scripts

### Root Directory
```bash
npm run dev          # Run both backend and frontend concurrently
npm run server       # Run only backend
npm run client       # Run only frontend
npm run install-all  # Install all dependencies
```

### Backend
```bash
npm start            # Start production server
npm run dev          # Start development server with nodemon
npm run seed         # Seed database with sample data
```

### Frontend
```bash
npm start            # Start React development server
npm run build        # Build for production
npm test             # Run tests
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check `MONGO_URI` in `.env`
- For MongoDB Atlas, whitelist your IP

### Port Already in Use
- Backend: Change `PORT` in `.env`
- Frontend: React will prompt to use different port

### File Upload Errors
- Check `uploads/` directory exists in backend
- Verify file size < 50MB
- Ensure file type is allowed

### CORS Issues
- Backend CORS is set to `http://localhost:3000`
- Adjust in `server.js` if using different port

## 🚀 Deployment

### Backend (Heroku/Railway/Render)
1. Set environment variables
2. Change `MONGO_URI` to MongoDB Atlas
3. Update CORS origin to production URL
4. Deploy

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `build` folder
3. Set proxy to backend URL
4. Configure redirects for React Router

## 📄 License

MIT License - Feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Contact

For questions or support, please open an issue in the repository.

---

**Happy Learning! 🎓**

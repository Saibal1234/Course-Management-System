# Course Management System - Quick Start Guide

## 🚀 Quick Setup (3 Steps)

### Step 1: Install Dependencies
```bash
npm run install-all
```

### Step 2: Seed Database (with sample data)
```bash
cd backend
npm run seed
```

### Step 3: Run Application
```bash
cd ..
npm run dev
```

Then open http://localhost:3000 in your browser!

## 📝 Demo Login Credentials

### Instructors:
- **john.smith@university.edu** / password123
- **sarah.johnson@university.edu** / password123

### Students:
- **alice.brown@student.edu** / password123
- **bob.wilson@student.edu** / password123
- **charlie.davis@student.edu** / password123
- **diana.martinez@student.edu** / password123

## 📚 Course Enrollment Codes
- **CS101** - Introduction to Computer Science
- **WEB201** - Web Development Fundamentals
- **DB301** - Database Systems

## ⚙️ What's Running?

- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:3000
- **MongoDB**: mongodb://localhost:27017/cms

## 🎯 Test the Features

### As Instructor (john.smith@university.edu):
1. ✅ Create a new course
2. ✅ Upload materials (PDFs, docs, images)
3. ✅ Create assignments with due dates
4. ✅ View submissions and grade them
5. ✅ Check the grade book

### As Student (alice.brown@student.edu):
1. ✅ Enroll in a new course using code
2. ✅ View and download materials
3. ✅ Submit assignments
4. ✅ Check grades and feedback
5. ✅ View overall performance

## 🔧 Troubleshooting

**MongoDB not running?**
```bash
mongod
```

**Port 3000 or 5000 already in use?**
- Kill the process or change port in .env

**Need to reset data?**
```bash
cd backend
npm run seed
```

Enjoy your CMS! 🎓

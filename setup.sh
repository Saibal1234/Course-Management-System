#!/bin/bash

# CMS Setup Script
echo "🎓 Course Management System - Setup Script"
echo "==========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js $(node --version) found"

# Check if MongoDB is running
if ! command -v mongod &> /dev/null
then
    echo "⚠️  MongoDB command not found. Make sure MongoDB is installed."
else
    echo "✅ MongoDB found"
fi

echo ""
echo "📦 Installing dependencies..."
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure MongoDB is running (run 'mongod' in another terminal)"
echo "2. Run 'cd backend && npm run seed' to create sample data"
echo "3. Run 'npm run dev' from the root directory to start the app"
echo ""
echo "🌐 The app will run on:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5000"
echo ""
echo "👤 Demo login:"
echo "   Instructor: john.smith@university.edu / password123"
echo "   Student: alice.brown@student.edu / password123"
echo ""
echo "✨ Setup complete! Happy coding!"

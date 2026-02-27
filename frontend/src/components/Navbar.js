import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="text-2xl font-bold">
            CMS
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="hover:text-blue-200 transition">
              Dashboard
            </Link>
            {user.role === "student" && (
              <>
                <Link
                  to="/my-courses"
                  className="hover:text-blue-200 transition"
                >
                  My Courses
                </Link>
                <Link to="/grades" className="hover:text-blue-200 transition">
                  Grades
                </Link>
              </>
            )}
            {user.role === "instructor" && (
              <Link to="/my-courses" className="hover:text-blue-200 transition">
                My Courses
              </Link>
            )}

            <div className="flex items-center space-x-4 border-l border-blue-400 pl-6">
              <div className="text-sm">
                <div className="font-semibold">{user.name}</div>
                <div className="text-blue-200 text-xs capitalize">
                  {user.role}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

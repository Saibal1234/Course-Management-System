

// start from here

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4
      bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">

      <div className="bg-white/90 backdrop-blur-xl rounded-2xl 
        shadow-2xl w-full max-w-md p-10">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-wide mb-1">
            CMS
          </h1>
          <p className="text-gray-500">
            Course Management System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@example.com"
              className="w-full px-4 py-2.5 rounded-lg border
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 rounded-lg border
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                transition"
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300
              text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold
              bg-gradient-to-r from-indigo-600 to-purple-600
              hover:scale-[1.02] hover:shadow-lg
              transition-all duration-200
              disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-5 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-2">
            Demo Accounts
          </p>
          <div className="text-xs text-gray-600 space-y-1 text-center">
            <p><strong>Instructor:</strong> john.smith@university.edu</p>
            <p><strong>Student:</strong> alice.brown@student.edu</p>
            <p><strong>Password:</strong> password123</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;

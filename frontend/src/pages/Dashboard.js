import React from "react";
import { useAuth } from "../context/AuthContext";
import InstructorDashboard from "./InstructorDashboard";
import StudentDashboard from "./StudentDashboard";

const Dashboard = () => {
  const { user } = useAuth();

  if (user.role === "instructor") {
    return <InstructorDashboard />;
  }

  return <StudentDashboard />;
};

export default Dashboard;

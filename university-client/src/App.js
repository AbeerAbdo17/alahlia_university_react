import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import CategoriesPage from "./screens/CategoriesPage";
import BookListPage from "./screens/BookListPage";
import FacultyDepartmentAdmin from "./screens/FacultyDepartmentAdmin";
import RegistrationTabs from "./screens/RegistrationTabs";
import GradeEntry from "./screens/GradeEntry";
import TermResult from "./screens/TermResult";
import StudentsTermList from "./screens/StudentsTermList";
import StaffMembers from "./screens/StaffMembers";
import Dashboard from "./screens/Dashboard";
import ScheduleAdmin from "./screens/ScheduleAdmin";
import UsersManagement from "./screens/UsersManagement";
import Login from "./screens/Login";
import Register from "./screens/Register";
import Certificates from "./screens/Certificates";
import AcademicRecord from "./screens/AcademicRecord";
import Reports from "./screens/Reports";
import ProtectedRoute from "./screens/ProtectedRoute";

function App() {
  return (
    <Router>
<Routes>
  {/* صفحات عامة - بدون حماية */}
  <Route path="/" element={<Login />} />
  <Route path="/login" element={<Login />} />
  {/* <Route path="/register" element={<Register />} /> */}

  {/* صفحات محمية */}
  <Route path="/books" element={<ProtectedRoute><BookListPage /></ProtectedRoute>} />
  <Route path="/faculty" element={<ProtectedRoute><FacultyDepartmentAdmin /></ProtectedRoute>} />
  <Route path="/RegistrationTabs" element={<ProtectedRoute><RegistrationTabs /></ProtectedRoute>} />
  <Route path="/GradeEntry" element={<ProtectedRoute><GradeEntry /></ProtectedRoute>} />
  <Route path="/TermResult" element={<ProtectedRoute><TermResult /></ProtectedRoute>} />
  <Route path="/StudentsTermList" element={<ProtectedRoute><StudentsTermList /></ProtectedRoute>} />
  <Route path="/StaffMembers" element={<ProtectedRoute><StaffMembers /></ProtectedRoute>} />
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/schedule" element={<ProtectedRoute><ScheduleAdmin /></ProtectedRoute>} />
  <Route path="/UsersManagement" element={<ProtectedRoute><UsersManagement /></ProtectedRoute>} />
  <Route path="/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />
  <Route path="/academic-record" element={<ProtectedRoute><AcademicRecord /></ProtectedRoute>} />
  <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
</Routes>
    </Router>
  );
}

export default App;
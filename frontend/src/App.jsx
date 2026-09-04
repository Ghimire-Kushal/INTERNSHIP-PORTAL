// import React from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PlaceholderPage from "./pages/PlaceholderPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import PostJobPage from "./pages/PostJobPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import SavedJobsPage from "./pages/SavedJobsPage";
import EmployerApplicationsPage from "./pages/EmployerApplicationsPage";
import NotificationsPage from "./pages/NotificationsPage";
import InterviewsPage from "./pages/InterviewsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import CompaniesPage from "./pages/CompaniesPage";
import CompanyDetailPage from "./pages/CompanyDetailPage";
import EmployerJobsPage from "./pages/EmployerJobsPage";
import PasswordResetPage, { ForgotPasswordPage } from "./pages/PasswordResetPage";
import AccountSecurityPage from "./pages/AccountSecurityPage";
import JobAlertsPage from "./pages/JobAlertsPage";
//path: frontend/src/App.jsx.  tey

export default function App() {
  return <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password/:uid/:token" element={<PasswordResetPage />} />
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/account/security" element={<ProtectedRoute><AccountSecurityPage /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><RoleRoute allowedRoles={["student"]}><ProfilePage /></RoleRoute></ProtectedRoute>} />
    <Route path="/employer/company" element={<ProtectedRoute><RoleRoute allowedRoles={["employer"]}><CompanyProfilePage /></RoleRoute></ProtectedRoute>} />
    <Route path="/employer/jobs" element={<ProtectedRoute><RoleRoute allowedRoles={["employer"]}><EmployerJobsPage /></RoleRoute></ProtectedRoute>} />
    <Route path="/employer/jobs/create" element={<ProtectedRoute><RoleRoute allowedRoles={["employer"]}><PostJobPage /></RoleRoute></ProtectedRoute>} />
    <Route path="/employer/jobs/:id/edit" element={<ProtectedRoute><RoleRoute allowedRoles={["employer"]}><PostJobPage /></RoleRoute></ProtectedRoute>} />
    <Route path="/my-applications" element={<ProtectedRoute><RoleRoute allowedRoles={["student"]}><ApplicationsPage /></RoleRoute></ProtectedRoute>} />
    <Route path="/saved-jobs" element={<ProtectedRoute><RoleRoute allowedRoles={["student"]}><SavedJobsPage /></RoleRoute></ProtectedRoute>} />
    <Route path="/job-alerts" element={<ProtectedRoute><RoleRoute allowedRoles={["student"]}><JobAlertsPage /></RoleRoute></ProtectedRoute>} />
    <Route path="/employer/applications" element={<ProtectedRoute><RoleRoute allowedRoles={["employer"]}><EmployerApplicationsPage /></RoleRoute></ProtectedRoute>} />
    <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
    <Route path="/interviews" element={<ProtectedRoute><InterviewsPage /></ProtectedRoute>} />
    <Route path="/jobs" element={<JobsPage />} />
    <Route path="/jobs/:id" element={<JobDetailPage />} />
    <Route path="/internships" element={<JobsPage jobType="internship" title="Internship opportunities" intro="Launch your career with practical work experience from growing teams." />} />
    <Route path="/companies" element={<CompaniesPage />} />
    <Route path="/companies/:id" element={<CompanyDetailPage />} />
    <Route path="*" element={<PlaceholderPage title="Page not found" />} />
  </Routes>;
}

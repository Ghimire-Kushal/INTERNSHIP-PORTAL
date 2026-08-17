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
// Define your routes heree

export default function App() {
  return <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    <Route path="/employer/company" element={<ProtectedRoute><CompanyProfilePage /></ProtectedRoute>} />
    <Route path="/employer/jobs/create" element={<ProtectedRoute><PostJobPage /></ProtectedRoute>} />
    <Route path="/my-applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
    <Route path="/saved-jobs" element={<ProtectedRoute><SavedJobsPage /></ProtectedRoute>} />
    <Route path="/employer/applications" element={<ProtectedRoute><EmployerApplicationsPage /></ProtectedRoute>} />
    <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
    <Route path="/interviews" element={<ProtectedRoute><InterviewsPage /></ProtectedRoute>} />
    <Route path="/jobs" element={<JobsPage />} />
    <Route path="/jobs/:id" element={<JobDetailPage />} />
    <Route path="/internships" element={<PlaceholderPage title="Internships" />} />
    <Route path="/companies" element={<PlaceholderPage title="Companies" />} />
    <Route path="*" element={<PlaceholderPage title="Page not found" />} />
  </Routes>;
}

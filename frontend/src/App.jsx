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
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    <Route path="/employer/company" element={<ProtectedRoute><CompanyProfilePage /></ProtectedRoute>} />
    <Route path="/employer/jobs/create" element={<ProtectedRoute><PostJobPage /></ProtectedRoute>} />
    <Route path="/jobs" element={<JobsPage />} />
    <Route path="/jobs/:id" element={<JobDetailPage />} />
    <Route path="/internships" element={<PlaceholderPage title="Internships" />} />
    <Route path="/companies" element={<PlaceholderPage title="Companies" />} />
    <Route path="*" element={<PlaceholderPage title="Page not found" />} />
  </Routes>;
}

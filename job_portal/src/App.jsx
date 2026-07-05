import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import RecruiterLogin from "./pages/recruiter/Login";
import RecruiterRegister from "./pages/recruiter/Register";
import RecruiterDashboard from "./pages/recruiter/Dashboard";
import PostJob from "./pages/recruiter/PostJob";
import Dashboard from "./pages/user/Dashboard";
import Profile from "./pages/user/Profile";
import RecommendedJobs from "./pages/user/RecommendedJobs";
import BrowseJobs from "./pages/public/BrowseJobs";
import MyApplications from "./pages/user/MyApplications";
import Industries from "./pages/public/Industries";
import IndustryJobs from "./pages/public/IndustryJobs";
import JobDetails from "./pages/public/JobDetails";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recruiter/login" element={<RecruiterLogin />} />
        <Route path="/recruiter/register" element={<RecruiterRegister />} />
        <Route path="/recruiter" element={<Navigate to="/recruiter/dashboard" replace />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recommended-jobs"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <RecommendedJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/browse-jobs"
          element={
            
              <BrowseJobs />
           
          }
        />

        <Route
          path="/my-applications"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <MyApplications />
            </ProtectedRoute>
          }
        />

        {/* <Route
          path="/industries"
          element={
            <ProtectedRoute>
              <Industries />
            </ProtectedRoute>
          }
        /> */}

        <Route
          path="/industries"
          element={
              <Industries />
            
          }
        />

        {/* <Route
          path="/industries/:industrySlug"
          element={
            <ProtectedRoute>
              <IndustryJobs />
            </ProtectedRoute>
          }
        /> */}

           <Route
          path="/industries/:industrySlug"
          element={
           
              <IndustryJobs />
           
          }
        />

        <Route
          path="/recruiter/dashboard"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/post-job"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <PostJob />
            </ProtectedRoute>
          }
        />

        <Route path="/jobs/:jobId" element={<JobDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

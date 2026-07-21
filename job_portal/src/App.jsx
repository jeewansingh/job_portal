import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import RecruiterLogin from "./pages/recruiter/Login";
import RecruiterRegister from "./pages/recruiter/Register";
import RecruiterDashboard from "./pages/recruiter/Dashboard";
import ManageJobs from "./pages/recruiter/ManageJobs";
import RecruiterApplications from "./pages/recruiter/RecruiterApplications";
import RecruiterJobDetail from "./pages/recruiter/RecruiterJobDetail";
import RecruiterApplicantProfile from "./pages/recruiter/RecruiterApplicantProfile";
import RecruiterProfile from "./pages/recruiter/RecruiterProfile";
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
import ProtectedRecruiterRoute from "./components/ProtectedRecruiterRoute";

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
            <ProtectedRecruiterRoute>
              <RecruiterDashboard />
            </ProtectedRecruiterRoute>
          }
        />

        <Route
          path="/recruiter/post-job"
          element={
            <ProtectedRecruiterRoute>
              <PostJob />
            </ProtectedRecruiterRoute>
          }
        />

        <Route
          path="/recruiter/manage-jobs"
          element={
            <ProtectedRecruiterRoute>
              <ManageJobs />
            </ProtectedRecruiterRoute>
          }
        />

        <Route
          path="/recruiter/applications"
          element={
            <ProtectedRecruiterRoute>
              <RecruiterApplications />
            </ProtectedRecruiterRoute>
          }
        />

        <Route
          path="/recruiter/profile"
          element={
            <ProtectedRecruiterRoute>
              <RecruiterProfile />
            </ProtectedRecruiterRoute>
          }
        />

        <Route
          path="/recruiter/jobs/:jobId"
          element={
            <ProtectedRecruiterRoute>
              <RecruiterJobDetail />
            </ProtectedRecruiterRoute>
          }
        />

        <Route
          path="/recruiter/applicants/:applicantId"
          element={
            <ProtectedRecruiterRoute>
              <RecruiterApplicantProfile />
            </ProtectedRecruiterRoute>
          }
        />

        <Route path="/jobs/:jobId" element={<JobDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

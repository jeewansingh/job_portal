import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
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
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recommended-jobs"
          element={
            <ProtectedRoute>
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
            <ProtectedRoute>
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

        <Route path="/jobs/:jobId" element={<JobDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import RecommendedJobs from "./pages/RecommendedJobs";
import JobDetails from "./pages/JobDetails";
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

        <Route path="/jobs/:jobId" element={<JobDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

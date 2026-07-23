import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import Navbar from "../../components/Navbar";
import Hero from "../../components/Hero";
import TopJobs from "../../components/TopJobs";
import Footer from "../../components/Footer";
import TopIndustries from "../../components/TopIndustries";
import Stats from "../../components/Stats";

export default function Home() {
  const { isLoggedIn, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      if (user?.role === "recruiter") {
        navigate("/recruiter/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [isLoggedIn, user, navigate]);

  return (
    <>
      <Navbar />
      <Hero />
      <TopJobs />
      <TopIndustries />
      <Stats />
      <Footer />

    </>
  );
}
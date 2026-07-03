import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import TopJobs from "../components/TopJobs";
import Footer from "../components/Footer";
import TopIndustries from "../components/TopIndustries";
import Stats from "../components/Stats";

export default function Home() {
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
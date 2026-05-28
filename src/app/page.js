import Header from "@/components/Header";
import VideoIntro from "@/components/VideoIntro";
import Projects from "@/components/Projects";
import FiverrGigs from "@/components/FiverrGigs";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#0a0a0f", overflowX: "hidden" }}>
      {/* Sticky Global Navigation */}
      <Header />

      {/* Hero Section */}
      <VideoIntro />

      {/* Showcase Section */}
      <Projects />

      {/* Fiverr Freelance Gig Section */}
      <FiverrGigs />

      {/* Terminal Contact Panel */}
      <Contact />

      {/* Telemetry Dashboard Footer */}
      <Footer />
    </main>
  );
}

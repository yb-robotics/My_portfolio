import { Orbitron, Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import CustomCursor from "@/components/CustomCursor";
import StarfieldBackground from "@/components/StarfieldBackground";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import "./globals.css";

const titleFont = Orbitron({
  variable: "--font-title",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const sansFont = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "Yash Bansal | Robotics & AI Engineer",
  description: "Building intelligent machines that interact with the real world. Specializing in ROS2, SLAM, SolidWorks, and closed-loop control systems.",
  keywords: ["Robotics Engineer", "AI", "ROS2", "SLAM", "SolidWorks", "Embedded Systems", "Yash Bansal"],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${titleFont.variable} ${sansFont.variable} ${monoFont.variable} h-full antialiased`}
      style={{ scrollBehavior: "smooth" }}
    >
      <body
        className="min-h-full flex flex-col"
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#0a0a0f",
          fontFamily: "var(--font-sans), sans-serif",
          color: "#ffffff",
          overflowX: "hidden"
        }}
      >
        <SmoothScrollProvider>
          <ScrollProgressBar />
          <StarfieldBackground />
          <CustomCursor />
          {children}
        </SmoothScrollProvider>
        
        {/* Dynamic loading of the Spline runtime viewer */}
        <Script 
          type="module" 
          src="https://unpkg.com/@splinetool/viewer@1.9.0/build/spline-viewer.js" 
          strategy="lazyOnload" 
        />
      </body>
    </html>
  );
}

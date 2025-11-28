import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import LogoSearchSection from "@/components/LogoSearchSection";
import DesktopAppSection from "@/components/DesktopAppSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <Navigation />
      <LogoSearchSection />
      <main>
        <DesktopAppSection />
      </main>
      <Footer />
    </div>
  );
}

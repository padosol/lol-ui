import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import LogoSearchSection from "@/components/LogoSearchSection";
import DesktopAppSection from "@/components/DesktopAppSection";
import HomePatchNotes from "@/components/HomePatchNotes";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Navigation />
      <LogoSearchSection />
      <section className="bg-gradient-to-br from-surface to-surface-4 py-16 min-h-[300px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DesktopAppSection />
            <HomePatchNotes />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

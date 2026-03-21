import { Header, Navigation, Footer } from "@/widgets/layout";
import { LogoSearchSection } from "@/features/summoner-search";
import { DesktopAppSection, HomePatchNotes } from "@/widgets/home-sections";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <Navigation />
      <div className="flex-1">
      <LogoSearchSection />
      <section className="bg-gradient-to-br from-surface to-surface-4 py-16 min-h-[300px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DesktopAppSection />
            <HomePatchNotes />
          </div>
        </div>
      </section>
      </div>
      <Footer />
    </div>
  );
}

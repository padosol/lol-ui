import Image from "next/image";
import SearchBar from "./SearchBar";

export default function LogoSearchSection() {
  return (
    <section className="bg-surface-1 border-b border-divider py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-10">
          <div className="flex items-center justify-center">
            <div className="w-64 h-32 flex items-center justify-center">
              <h1 className="sr-only">METAPICK</h1>
              <Image
                src="/data/METAPICK_LOGO.png"
                alt="METAPICK"
                width={384}
                height={128}
                priority
              />
            </div>
          </div>

          <div className="w-full max-w-2xl -mt-4">
            <SearchBar variant="full" />
          </div>
        </div>
      </div>
    </section>
  );
}

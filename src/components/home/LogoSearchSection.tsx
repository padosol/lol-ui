import SearchBar from "@/components/search/SearchBar";

export default function LogoSearchSection() {
  return (
    <section className="bg-surface-1 border-b border-divider py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-10">
          {/* 로고 영역 */}
          <div className="flex items-center justify-center">
            <div className="w-64 h-32 flex items-center justify-center">
              <h1 className="text-3xl font-bold text-primary">METAPICK</h1>
            </div>
          </div>

          {/* 검색 영역 */}
          <div className="w-full max-w-2xl -mt-4">
            <SearchBar variant="full" />
          </div>
        </div>
      </div>
    </section>
  );
}

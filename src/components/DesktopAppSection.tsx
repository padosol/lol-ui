export default function DesktopAppSection() {
  const features = [
    {
      icon: "⚙️",
      title: "Real-time auto rune setting",
    },
    {
      icon: "🏆",
      title: "OP champions, team comps, and more",
    },
    {
      icon: "📊",
      title: "In-game overlay features to help dominate",
    },
    {
      icon: "💡",
      title: "Latest meta and recommendations",
    },
  ];

  return (
    <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 h-[300px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        {/* <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay overpowered with OP.GG for Desktop - your partner in-game!
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-700"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <p className="text-gray-200 font-medium">{feature.title}</p>
            </div>
          ))}
        </div> */}
      </div>
    </section>
  );
}

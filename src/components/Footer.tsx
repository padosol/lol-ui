export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* OP.GG 섹션 */}
          <div>
            <h3 className="text-white font-bold mb-4">OP.GG</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white">
                  About OP.GG
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Company
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Logo history
                </a>
              </li>
            </ul>
          </div>

          {/* Products 섹션 */}
          <div>
            <h3 className="text-white font-bold mb-4">Products</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white">
                  League of Legends
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Teamfight Tactics
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Valorant
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Desktop
                </a>
              </li>
            </ul>
          </div>

          {/* Resources 섹션 */}
          <div>
            <h3 className="text-white font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Terms of Use
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Help
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Email inquiry
                </a>
              </li>
            </ul>
          </div>

          {/* More 섹션 */}
          <div>
            <h3 className="text-white font-bold mb-4">More</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white">
                  Business
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Advertise
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Recruit
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-sm text-gray-400 text-center">
            © 2012-2025 OP.GG. OP.GG is not endorsed by Riot Games and does
            not reflect the views or opinions of Riot Games or anyone officially
            involved in producing or managing League of Legends. League of
            Legends and Riot Games are trademarks or registered trademarks of
            Riot Games, Inc. League of Legends © Riot Games, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}


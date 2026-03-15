const CONTACT_FORM_URL = "https://forms.gle/a5eF1Wapwirawq936";

export default function Footer() {
  return (
    <footer className="bg-surface-1 text-on-surface-medium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 하단 저작권 */}
        <div className="border-t border-divider pt-8">
          <div className="mb-4 text-center">
            <a
              href={CONTACT_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline underline-offset-4 transition-opacity hover:opacity-80"
            >
              문의하기
            </a>
          </div>
          <p className="text-sm text-on-surface-medium text-center">
            © 2025 METAPICK. metapick.me is not endorsed by Riot Games and does not
            reflect the views or opinions of Riot Games or anyone officially
            involved in producing or managing League of Legends. League of
            Legends and Riot Games are trademarks or registered trademarks of
            Riot Games, Inc. League of Legends © Riot Games, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}

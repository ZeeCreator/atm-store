import Link from 'next/link';
import { Icons } from './Icon';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  
  // Replace placeholders in copyright text
  const copyrightText = t.footer.copyright
    .replace('{year}', currentYear.toString())
    .replace('{credits}', t.footer.creditsATM);
  
  return (
    <footer className="bg-surface-container-lowest w-full py-16 px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="space-y-6">
          <div className="text-lg font-bold text-white font-headline uppercase tracking-tighter">
            Aksesoris Touring Madiun
          </div>
          <p className="text-white/40 text-sm font-body leading-relaxed">
            {t.footer.brandDescription}
          </p>
        </div>

        {/* Navigation */}
        <div className="space-y-6">
          <h4 className="text-primary-container font-headline uppercase tracking-widest text-xs font-bold">
            {t.footer.navigation}
          </h4>
          <ul className="space-y-4 font-body text-sm tracking-wide">
            <li>
              <Link href="/products" className="text-white/40 hover:text-primary transition-colors">
                {t.footer.allProducts}
              </Link>
            </li>
            <li>
              <Link href="/products?category=all" className="text-white/40 hover:text-primary transition-colors">
                {t.footer.categories}
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-white/40 hover:text-primary transition-colors">
                {t.footer.aboutUs}
              </Link>
            </li>
          </ul>
        </div>

        {/* Community */}
        <div className="space-y-6">
          <h4 className="text-primary-container font-headline uppercase tracking-widest text-xs font-bold">
            {t.footer.community}
          </h4>
          <ul className="space-y-4 font-body text-sm tracking-wide">
            <li>
              <Link href="https://instagram.com" target="_blank" className="text-white/40 hover:text-primary transition-colors flex items-center gap-2">
                <Icons.Instagram className="text-sm" />
                {t.footer.instagram}
              </Link>
            </li>
            <li>
              <Link href="https://wa.me/6281234567890" target="_blank" className="text-white/40 hover:text-primary transition-colors flex items-center gap-2">
                <Icons.Whatsapp className="text-sm" />
                {t.footer.whatsappSupport}
              </Link>
            </li>
            <li>
              <Link href="/about#location" className="text-white/40 hover:text-primary transition-colors">
                {t.footer.madiunHQ}
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-6">
          <h4 className="text-primary-container font-headline uppercase tracking-widest text-xs font-bold">
            {t.footer.joinTheRoad}
          </h4>
          <div className="relative">
            <input
              type="email"
              placeholder={t.footer.newsletterPlaceholder}
              className="bg-surface-container-low border-none text-xs px-4 py-3 w-full focus:ring-1 focus:ring-primary text-white"
            />
            <button className="absolute right-2 top-1.5 text-primary">
              <Icons.ArrowRight className="text-sm" />
            </button>
          </div>
          <p className="text-[10px] text-white/30 font-body uppercase tracking-widest">
            {copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-luxury-dark border-t border-luxury-border mt-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="mb-4">
            <span className="font-display text-2xl text-gold-400 tracking-[0.2em] uppercase block">Importe</span>
            <span className="font-sans text-[10px] text-luxury-subtext tracking-[0.5em] uppercase">Luxe</span>
          </div>
          <p className="text-luxury-subtext text-sm leading-relaxed">
            Curating the world's finest luxury goods for the discerning collector.
          </p>
        </div>

        {/* Collections */}
        <div>
          <h4 className="text-xs text-luxury-text tracking-widest uppercase mb-4">Collections</h4>
          <ul className="space-y-2">
            {['Watches', 'Perfumes', 'Apparel', 'Jewelry', 'Accessories'].map((item) => (
              <li key={item}>
                <Link to={`/products?category=${item.toLowerCase()}`} className="text-sm text-luxury-subtext hover:text-gold-400 transition-colors">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className="text-xs text-luxury-text tracking-widest uppercase mb-4">Account</h4>
          <ul className="space-y-2">
            {[['My Profile', '/profile'], ['My Orders', '/orders'], ['Wishlist', '/wishlist'], ['Sign In', '/login']].map(([label, path]) => (
              <li key={label}>
                <Link to={path} className="text-sm text-luxury-subtext hover:text-gold-400 transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xs text-luxury-text tracking-widest uppercase mb-4">Contact</h4>
          <ul className="space-y-2 text-sm text-luxury-subtext">
            <li>concierge@importeluxe.com</li>
            <li>+1 (800) LUXE-000</li>
            <li className="pt-2">Mon–Fri, 9am–6pm EST</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-luxury-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-luxury-subtext">© {new Date().getFullYear()} Importe Luxe. All rights reserved.</p>
        <div className="flex gap-6">
          {['Privacy Policy', 'Terms of Service', 'Returns'].map((item) => (
            <Link key={item} to="#" className="text-xs text-luxury-subtext hover:text-gold-400 transition-colors">
              {item}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

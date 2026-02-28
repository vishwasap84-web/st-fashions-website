import { Link } from "wouter";
import { Phone, Mail, Instagram, MapPin } from "lucide-react";
import { CATEGORIES } from "@shared/schema";
import stLogo from "@/Assets/ST_LOGO.png";

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-brandFrom to-brandTo text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* BRAND */}
          <div>
            <img src={stLogo} alt="ST Fashions" className="h-22 w-auto mb-4" />

            <p className="text-sm text-white/80 leading-relaxed">
              Your one-stop destination for premium Sarees, Blouse Materials,
              Ready Made Blouses, Novelties & Stationery. Quality fashion at the
              best prices.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="font-serif font-semibold text-lg mb-4 text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <span className="text-sm text-white/80 hover:text-brandGold cursor-pointer">
                    Home
                  </span>
                </Link>
              </li>
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <Link
                    href={`/products?category=${encodeURIComponent(category)}`}
                  >
                    <span className="text-sm text-white/80 hover:text-brandGold cursor-pointer">
                      {category}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="font-serif font-semibold text-lg mb-4 text-white">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-white/80">
                <Phone className="w-4 h-4 text-brandGold" />
                9742654155
              </li>
              <li className="flex items-center gap-2 text-sm text-white/80">
                <Mail className="w-4 h-4 text-brandGold" />
                stfashions2024@gmail.com
              </li>
              <li className="flex items-center gap-2 text-sm text-white/80">
                <Instagram className="w-4 h-4 text-brandGold" />
                @pragatihulgeri
              </li>
            </ul>
          </div>

          {/* ADDRESS */}
          <div>
            <h3 className="font-serif font-semibold text-lg mb-4 text-white">
              Visit Our Store
            </h3>
            <div className="flex items-start gap-2 text-sm text-white/80">
              <MapPin className="w-4 h-4 text-brandGold mt-0.5" />
              <address className="not-italic leading-relaxed">
                KMF Nandhini Dairy,
                <br />
                Behind DCC Bank,
                <br />
                Sector No 8, CTS 6481,
                <br />
                Anjaneya Nagar,
                <br />
                Belgaum 590016
              </address>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-sm text-white/70">
            © {new Date().getFullYear()} ST Fashions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

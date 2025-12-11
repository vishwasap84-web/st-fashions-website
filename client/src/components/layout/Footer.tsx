import { Link } from "wouter";
import { Phone, Mail, Instagram, MapPin } from "lucide-react";
import { CATEGORIES } from "@shared/schema";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-serif text-3xl font-bold text-primary">ST</span>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium text-foreground">Sannidhi & Tanisha</span>
                <span className="text-xs text-muted-foreground">Fashions</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your one-stop destination for premium Sarees, Aari Work Blouses, Ready Made Blouses, 
              Ladies Fancy Items & Stationery. Quality fashion at the best prices.
            </p>
          </div>

          <div>
            <h3 className="font-serif font-semibold text-lg mb-4 text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer" data-testid="link-footer-home">
                    Home
                  </span>
                </Link>
              </li>
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <Link href={`/products?category=${encodeURIComponent(category)}`}>
                    <span 
                      className="text-sm text-muted-foreground hover:text-primary cursor-pointer"
                      data-testid={`link-footer-${category.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {category}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-semibold text-lg mb-4 text-foreground">Contact Us</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="tel:9742654155" 
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                  data-testid="link-footer-phone"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  9742654155
                </a>
              </li>
              <li>
                <a 
                  href="mailto:Pragatihulgeri@gmail.com" 
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                  data-testid="link-footer-email"
                >
                  <Mail className="w-4 h-4 text-primary" />
                  Pragatihulgeri@gmail.com
                </a>
              </li>
              <li>
                <a 
                  href="https://instagram.com/pragatihulgeri" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                  data-testid="link-footer-instagram"
                >
                  <Instagram className="w-4 h-4 text-primary" />
                  @pragatihulgeri
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-semibold text-lg mb-4 text-foreground">Visit Our Store</h3>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <address className="not-italic leading-relaxed">
                KMF Nandhini Dairy,<br />
                Behind DCC Bank,<br />
                Sector No 8, CTS 6481,<br />
                Anjaneya Nagar,<br />
                Belgaum 590016
              </address>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ST Fashions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

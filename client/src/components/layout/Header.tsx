import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, User, Menu, X, Phone, Instagram, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getCart, getCartCount } from "@/lib/cart";
import { getCustomerSession } from "@/lib/auth";
import { CATEGORIES } from "@shared/schema";

export function Header() {
  const [location] = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const customer = getCustomerSession();

  useEffect(() => {
    const updateCart = () => {
      const cart = getCart();
      setCartCount(getCartCount(cart));
    };
    updateCart();
    window.addEventListener("storage", updateCart);
    window.addEventListener("cartUpdated", updateCart);
    return () => {
      window.removeEventListener("storage", updateCart);
      window.removeEventListener("cartUpdated", updateCart);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <div className="bg-primary text-primary-foreground text-xs py-1.5 hidden md:block">
        <div className="container mx-auto px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a href="tel:9742654155" className="flex items-center gap-1 opacity-90 hover:opacity-100">
              <Phone className="w-3 h-3" />
              <span>9742654155</span>
            </a>
            <a href="mailto:Pragatihulgeri@gmail.com" className="flex items-center gap-1 opacity-90 hover:opacity-100">
              <Mail className="w-3 h-3" />
              <span>Pragatihulgeri@gmail.com</span>
            </a>
          </div>
          <a 
            href="https://instagram.com/pragatihulgeri" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 opacity-90 hover:opacity-100"
          >
            <Instagram className="w-3 h-3" />
            <span>@pragatihulgeri</span>
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <div className="flex flex-col gap-6 mt-8">
                    <Link href="/">
                      <div className="flex items-center gap-2 cursor-pointer">
                        <span className="font-serif text-3xl font-bold text-primary">ST</span>
                        <span className="text-sm text-muted-foreground">Fashions</span>
                      </div>
                    </Link>
                    <nav className="flex flex-col gap-2">
                      {CATEGORIES.map((category) => (
                        <Link key={category} href={`/products?category=${encodeURIComponent(category)}`}>
                          <span 
                            className="block py-2 px-3 rounded-md hover-elevate text-foreground"
                            data-testid={`link-category-mobile-${category.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {category}
                          </span>
                        </Link>
                      ))}
                    </nav>
                    <div className="border-t pt-4">
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <a href="tel:9742654155" className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          9742654155
                        </a>
                        <a href="mailto:Pragatihulgeri@gmail.com" className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Pragatihulgeri@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Link href="/">
                <div className="flex items-center gap-2 cursor-pointer" data-testid="link-logo">
                  <span className="font-serif text-3xl font-bold text-primary">ST</span>
                  <div className="hidden sm:flex flex-col leading-tight">
                    <span className="text-xs font-medium text-foreground">Sannidhi & Tanisha</span>
                    <span className="text-xs text-muted-foreground">Fashions</span>
                  </div>
                </div>
              </Link>
            </div>

            <nav className="hidden lg:flex items-center gap-1">
              {CATEGORIES.map((category) => (
                <Link key={category} href={`/products?category=${encodeURIComponent(category)}`}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={location.includes(encodeURIComponent(category)) ? "bg-accent" : ""}
                    data-testid={`link-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {category}
                  </Button>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <Input
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-40 sm:w-64"
                    autoFocus
                    data-testid="input-search"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsSearchOpen(false)}
                    data-testid="button-close-search"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </form>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  data-testid="button-open-search"
                >
                  <Search className="w-5 h-5" />
                </Button>
              )}

              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative" data-testid="button-cart">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                      data-testid="badge-cart-count"
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Link href={customer ? "/account" : "/login"}>
                <Button variant="ghost" size="icon" data-testid="button-user">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

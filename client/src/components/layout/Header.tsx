import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Phone,
  Instagram as InstagramIcon,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { getCart, getCartCount } from "@/lib/cart";

import { CATEGORIES } from "@shared/schema";
import stLogo from "@/Assets/ST_LOGO.png";
import { LogOut } from "lucide-react";

export function Header() {
  const [location] = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    fetch("/api/customers/me")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setCustomer(data))
      .catch(() => setCustomer(null));
  }, []);
  
  const handleLogout = async () => {
    await fetch("/api/customers/logout", {
      method: "POST",
      credentials: "include",
    });

    setCustomer(null);
    setLocation("/");
  };

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
      <div className="bg-gradient-to-r from-brandFrom to-brandTo text-white text-xs py-1.5 hidden md:block">
        <div className="container mx-auto px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a
              href="tel:9742654155"
              className="flex items-center gap-1 opacity-90 hover:opacity-100"
            >
              <Phone className="w-3 h-3 text-brandGold" />
              <span>9742654155</span>
            </a>
            <a
              href="mailto:stfashions2024@gmail.com"
              className="flex items-center gap-1 opacity-90 hover:opacity-100"
            >
              <Mail className="w-3 h-3 text-brandGold" />
              <span>stfashions2024@gmail.com</span>
            </a>
          </div>
          <a
            href="https://instagram.com/pragatihulgeri"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 opacity-90 hover:opacity-100"
          >
            <InstagramIcon className="w-3 h-3 text-brandGold" />
            <span>@pragatihulgeri</span>
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-gradient-to-r from-brandFrom to-brandTo border-b border-black/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid="button-mobile-menu"
                  >
                    <Menu className="w-5 h-5 text-white" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-72 bg-gradient-to-b from-brandFrom to-brandTo text-white"
                >
                  <div className="flex flex-col gap-6 mt-8">
                    <Link href="/">
                      <img
                        src={stLogo}
                        alt="ST Fashions"
                        className="h-16 w-auto mb-4 cursor-pointer"
                      />
                    </Link>

                    <nav className="flex flex-col gap-2">
                      {CATEGORIES.map((category) => (
                        <Link
                          key={category}
                          href={`/products?category=${encodeURIComponent(category)}`}
                        >
                          <span
                            className="block py-2 px-3 rounded-md text-white hover:text-brandGold hover:bg-white/10"
                            data-testid={`link-category-mobile-${category.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            {category}
                          </span>
                        </Link>
                      ))}
                    </nav>
                    <div className="border-t pt-4">
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <a
                          href="tel:9742654155"
                          className="flex items-center gap-2"
                        >
                          <Phone className="w-4 h-4" />
                          9742654155
                        </a>
                        <a
                          href="mailto:stfashions2024@gmail.com"
                          className="flex items-center gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          stfashions2024@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Link href="/">
                <img
                  src={stLogo}
                  alt="ST Fashions"
                  className="h-16 w-auto cursor-pointer"
                  data-testid="link-logo"
                />
              </Link>
            </div>

            <nav className="hidden lg:flex items-center gap-1">
              {CATEGORIES.map((category) => (
                <Link
                  key={category}
                  href={`/products?category=${encodeURIComponent(category)}`}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-white hover:text-brandGold ${
                      location.includes(encodeURIComponent(category))
                        ? "bg-white/10"
                        : ""
                    }`}
                    data-testid={`link-category-${category.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {category}
                  </Button>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {isSearchOpen ? (
                <form
                  onSubmit={handleSearch}
                  className="flex items-center gap-2"
                >
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
                    <X className="w-4 h-4 text-white" />
                  </Button>
                </form>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  data-testid="button-open-search"
                >
                  <Search className="w-5 h-5 text-white" />
                </Button>
              )}

              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  data-testid="button-cart"
                >
                  <ShoppingCart className="w-5 h-5 text-white" />
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

      {customer ? (
        <div className="flex items-center gap-2 text-white">
          <span className="hidden sm:block text-sm font-medium">
            Hi, {customer.name}
          </span>

          <Link href="/account">
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5 text-white" />
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-white" />
          </Button>
        </div>
      ) : (
                <Link href="/login">
                  <Button variant="ghost" size="icon" data-testid="button-user">
                    <User className="w-5 h-5 text-white" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

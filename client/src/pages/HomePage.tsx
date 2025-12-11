import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles, Truck, CreditCard, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@shared/schema";
import { CATEGORIES } from "@shared/schema";

const categoryImages: Record<string, string> = {
  "Sarees": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
  "Aari Work Blouses": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80",
  "Ready Made Blouses": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
  "Ladies Fancy Items": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
  "Stationery": "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&q=80",
};

export default function HomePage() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const featuredProducts = products?.slice(0, 8) || [];

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-purple/10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        
        <div className="container mx-auto px-4 relative z-10 text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">New Collection Available</span>
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-4">
            <span className="text-primary">ST</span> Fashions
          </h1>
          <p className="font-serif text-xl md:text-2xl text-muted-foreground mb-2">
            Sannidhi & Tanisha Fashions
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover the finest collection of traditional and contemporary Indian fashion. 
            From elegant Sarees to beautifully crafted Aari Work Blouses.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products">
              <Button size="lg" className="text-lg px-8" data-testid="button-shop-collection">
                Shop Collection
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/products?category=Sarees">
              <Button size="lg" variant="outline" className="text-lg px-8" data-testid="button-view-sarees">
                View Sarees
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our wide range of categories, from traditional Sarees to modern accessories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {CATEGORIES.map((category) => (
              <Link key={category} href={`/products?category=${encodeURIComponent(category)}`}>
                <Card 
                  className="group cursor-pointer overflow-visible hover-elevate"
                  data-testid={`card-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="relative aspect-square overflow-hidden rounded-t-xl">
                    <img
                      src={categoryImages[category]}
                      alt={category}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-serif text-lg font-semibold text-white text-center">
                        {category}
                      </h3>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-2">
                Featured Products
              </h2>
              <p className="text-muted-foreground">
                Handpicked selections just for you
              </p>
            </div>
            <Link href="/products">
              <Button variant="outline" data-testid="button-view-all-products">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[3/4]" />
                  <CardContent className="p-4">
                    <Skeleton className="h-3 w-16 mb-2" />
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-6 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                No products available yet
              </p>
              <p className="text-sm text-muted-foreground">
                Check back soon for our latest collection!
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Free Shipping</h3>
                <p className="text-sm text-muted-foreground">On orders above ₹999</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Secure Payment</h3>
                <p className="text-sm text-muted-foreground">100% secure checkout</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Quality Products</h3>
                <p className="text-sm text-muted-foreground">Premium quality guaranteed</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">Call us anytime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
            Visit Our Store
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Experience our collection in person at our store in Belgaum. 
            Our friendly staff is ready to help you find the perfect outfit.
          </p>
          <div className="bg-primary-foreground/10 rounded-xl p-6 max-w-md mx-auto backdrop-blur-sm">
            <address className="not-italic text-lg leading-relaxed">
              KMF Nandhini Dairy,<br />
              Behind DCC Bank, Sector No 8,<br />
              CTS 6481, Anjaneya Nagar,<br />
              Belgaum 590016
            </address>
            <div className="mt-4 pt-4 border-t border-primary-foreground/20">
              <a href="tel:9742654155" className="text-lg font-semibold hover:underline">
                Call: 9742654155
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

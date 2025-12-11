import { Link } from "wouter";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";
import { addToCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock <= 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently unavailable",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      size: product.sizes[0] || "Free Size",
      color: product.colors[0] || "Default",
      image: product.images[0] || "",
    });

    window.dispatchEvent(new Event("cartUpdated"));

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link href={`/product/${product.id}`}>
      <Card 
        className="group cursor-pointer overflow-visible hover-elevate"
        data-testid={`card-product-${product.id}`}
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl bg-muted">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm">Out of Stock</Badge>
            </div>
          )}

          {product.stock > 0 && product.stock <= 5 && (
            <Badge className="absolute top-2 left-2 bg-gold text-gold-foreground">
              Only {product.stock} left
            </Badge>
          )}

          <Button
            size="icon"
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            data-testid={`button-quick-add-${product.id}`}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>

        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
          <h3 
            className="font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors"
            data-testid={`text-product-name-${product.id}`}
          >
            {product.name}
          </h3>
          <p 
            className="text-lg font-semibold text-gold"
            data-testid={`text-product-price-${product.id}`}
          >
            {formatPrice(product.price)}
          </p>
          
          {product.colors.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {product.colors.slice(0, 4).map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs text-muted-foreground">+{product.colors.length - 4}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

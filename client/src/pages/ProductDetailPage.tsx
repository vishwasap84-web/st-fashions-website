import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  X,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { addToCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const {
    data: product,
    isLoading,
    error,
  } = useQuery<Product>({
    queryKey: ["/api/products", id],
  });

  const handleAddToCart = () => {
    if (!product) return;

    if ((product.colors ?? []).length > 0 && !selectedColor) {
      toast({
        title: "Please select a color",
        variant: "destructive",
      });
      return;
    }
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      size: "Free Size",
      color: selectedColor || "Default",
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

  const navigateImage = (direction: "prev" | "next") => {
    if (!product) return;
    const total = product.images.length;
    if (direction === "prev") {
      setSelectedImage((prev) => (prev === 0 ? total - 1 : prev - 1));
    } else {
      setSelectedImage((prev) => (prev === total - 1 ? 0 : prev + 1));
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <Skeleton className="aspect-[3/4] rounded-xl" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-md" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Product Not Found
        </h2>
        <p className="text-muted-foreground mb-6">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }
  const totalStock =
    Object.values(product.stockByColor ?? {}).reduce(
      (sum, qty) => sum + qty,
      0
    );
  const selectedColorStock =
    selectedColor && product.stockByColor
      ? product.stockByColor[selectedColor] ?? 0
      : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/products">
        <Button variant="ghost" className="mb-6" data-testid="button-back">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
      </Link>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          <div
            className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted cursor-zoom-in"
            onClick={() => setLightboxOpen(true)}
          >
            {product.images[selectedImage] ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="img-product-main"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image Available
              </div>
            )}

            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-4 right-4"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(true);
              }}
              data-testid="button-zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            {totalStock <= 0 && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Out of Stock
                </Badge>
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                  data-testid={`button-thumbnail-${index}`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">
              {product.category}
            </Badge>
            <h1
              className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4"
              data-testid="text-product-name"
            >
              {product.name}
            </h1>
            <p
              className="text-3xl font-bold text-gold"
              data-testid="text-product-price"
            >
              {formatPrice(product.price)}
            </p>
          </div>

          {product.category === "Sarees" && product.sareeType && (
            <div className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Saree Type:</span>{" "}
              {product.sareeType}
            </div>
          )}

          {product.category === "Aari Work Blouses" && (
            <div className="mt-2 text-sm text-muted-foreground space-y-1">
              {product.blouseMaterialType && (
                <div>
                  <span className="font-medium text-foreground">Material:</span>{" "}
                  {product.blouseMaterialType}
                </div>
              )}

              {product.lengthInches && product.widthInches && (
                <div>
                  <span className="font-medium text-foreground">Size:</span>{" "}
                  {product.lengthInches}" × {product.widthInches}"
                </div>
              )}
            </div>
          )}

          {product.category === "Ready Made Blouses" &&
            (product.readyBlouseTypes?.length ?? 0) > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Type:</span>{" "}
                {product.readyBlouseTypes?.[0]}
              </div>
            )}

        {product.colors.length > 0 && (
          <div>
            <h3 className="font-medium text-foreground mb-3">
              Select Color{" "}
              {selectedColor && (
                <span className="font-normal text-muted-foreground">
                  – {selectedColor}
                </span>
              )}
            </h3>

            <div className="flex flex-wrap gap-4">
              {product.colors.map((colorName) => (
                <button
                  key={colorName}
                  type="button"
                  onClick={() => setSelectedColor(colorName)}
                  className={`w-10 h-10 rounded-full border-2 transition-all
                    ${
                      selectedColor === colorName
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-border"
                    }
                  `}
                  style={{
                    backgroundColor: CSS.supports(
                      "color",
                      colorName.toLowerCase()
                    )
                      ? colorName.toLowerCase()
                      : "#ccc",
                  }}
                  title={colorName}
                />
              ))}
            </div>

            {/* ✅ NOW LEGAL */}
            {selectedColor && selectedColorStock === 0 && (
              <p className="mt-2 text-sm text-red-500">
                This color is currently out of stock
              </p>
            )}
          </div>
        )}
        
          <div>
            <h3 className="font-medium text-foreground mb-3">Quantity</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  data-testid="button-quantity-decrease"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span
                  className="w-12 text-center font-medium"
                  data-testid="text-quantity"
                >
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setQuantity(Math.min(selectedColorStock, quantity + 1))
                  }
                  disabled={quantity >= selectedColorStock || !selectedColor}
                  data-testid="button-quantity-increase"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {selectedColor &&
                selectedColorStock > 0 &&
                selectedColorStock <= 10 && (
                  <span className="text-sm text-gold">
                    Only {selectedColorStock} left in stock
                  </span>
              )}
            </div>
          </div>

          <Button
            size="lg"
            className="w-full text-lg"
            onClick={handleAddToCart}
            disabled={!selectedColor || selectedColorStock <= 0}
            data-testid="button-add-to-cart"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {selectedColor && selectedColorStock === 0
              ? "Out of Stock"
              : "Add to Cart"}
          </Button>

          <Accordion type="single" collapsible defaultValue="description">
            <AccordionItem value="description">
              <AccordionTrigger>Product Description</AccordionTrigger>
              <AccordionContent>
                <p
                  className="text-muted-foreground leading-relaxed"
                  data-testid="text-product-description"
                >
                  {product.description || "No description available."}
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="delivery">
              <AccordionTrigger>Delivery Information</AccordionTrigger>
              <AccordionContent>
                <ul className="text-muted-foreground space-y-2">
                  <li>Free shipping on orders above ₹4999</li>
                  <li>Standard delivery: 5-7 business days</li>
                  <li>Express delivery available for select locations</li>
                  <li>Cash on Delivery available</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="returns">
              <AccordionTrigger>Returns & Exchange</AccordionTrigger>
              <AccordionContent>
                <ul className="text-muted-foreground space-y-2">
                  <li>Easy 7-day returns</li>
                  <li>Free exchange for size mismatch</li>
                  <li>Quality guaranteed</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none">
          <div className="relative aspect-square md:aspect-[4/3]">
            {product.images[selectedImage] && (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            )}

            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            {product.images.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={() => navigateImage("prev")}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={() => navigateImage("next")}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    selectedImage === index ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

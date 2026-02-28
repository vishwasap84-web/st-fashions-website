import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  getCartTotal,
} from "@/lib/cart";
import type { CartItem } from "@shared/schema";

const FREE_SHIPPING_THRESHOLD = 4999;

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  const handleUpdateQuantity = (item: CartItem, newQuantity: number) => {
    const updated = updateCartQuantity(
      item.productId,
      item.size,
      item.color,
      newQuantity,
    );
    setCartItems(updated);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleRemove = (item: CartItem) => {
    const updated = removeFromCart(item.productId, item.size, item.color);
    setCartItems(updated);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const subtotal = getCartTotal(cartItems);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-foreground mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added anything to your cart yet. Start
            shopping to fill it up!
          </p>
          <Link href="/products">
            <Button size="lg" data-testid="button-start-shopping">
              Start Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-8">
        Shopping Cart
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, index) => (
            <Card
              key={`${item.productId}-${item.size}-${item.color}`}
              data-testid={`card-cart-item-${index}`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-32 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.productId}`}>
                      <h3
                        className="font-medium text-foreground hover:text-primary truncate cursor-pointer"
                        data-testid={`text-cart-item-name-${index}`}
                      >
                        {item.name}
                      </h3>
                    </Link>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.size && item.color && <span>|</span>}
                      {item.color && (
                        <span className="flex items-center gap-1">
                          Color:
                          <span
                            className="w-4 h-4 rounded-full border border-border inline-block"
                            style={{
                              backgroundColor: item.color.toLowerCase(),
                            }}
                          />
                          {item.color}
                        </span>
                      )}
                    </div>

                    <p
                      className="text-lg font-semibold text-gold mt-2"
                      data-testid={`text-cart-item-price-${index}`}
                    >
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(item)}
                      className="text-muted-foreground hover:text-destructive"
                      data-testid={`button-remove-item-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center border border-border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleUpdateQuantity(item, item.quantity - 1)
                        }
                        data-testid={`button-decrease-quantity-${index}`}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span
                        className="w-8 text-center text-sm font-medium"
                        data-testid={`text-quantity-${index}`}
                      >
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleUpdateQuantity(item, item.quantity + 1)
                        }
                        data-testid={`button-increase-quantity-${index}`}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Subtotal (
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  items)
                </span>
                <span className="font-medium" data-testid="text-subtotal">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium" data-testid="text-shipping">
                  {shipping === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for
                  FREE shipping!
                </p>
              )}

              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-gold" data-testid="text-total">
                  {formatPrice(total)}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Link href="/checkout" className="w-full">
                <Button
                  className="w-full"
                  size="lg"
                  data-testid="button-proceed-checkout"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/products" className="w-full">
                <Button
                  variant="outline"
                  className="w-full"
                  data-testid="button-continue-shopping"
                >
                  Continue Shopping
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

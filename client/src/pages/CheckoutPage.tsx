import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getCart, getCartTotal, clearCart } from "@/lib/cart";
import { getCustomerSession } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { checkoutFormSchema, type CheckoutFormData, type CartItem } from "@shared/schema";

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const customer = getCustomerSession();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: customer?.name || "",
      phone: customer?.phone || "",
      dob: "",
      address: "",
      pinCode: "",
      alternativePhone: "",
    },
  });

  useEffect(() => {
    const cart = getCart();
    if (cart.length === 0) {
      setLocation("/cart");
      return;
    }
    setCartItems(cart);
  }, [setLocation]);

  const orderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const orderData = {
        customerId: customer?.id,
        customerName: data.fullName,
        customerPhone: data.phone,
        customerDob: data.dob || undefined,
        customerAddress: data.address,
        customerPinCode: data.pinCode,
        alternativePhone: data.alternativePhone || undefined,
        items: cartItems,
        totalAmount: total,
      };
      return apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: async (response) => {
      const order = await response.json();
      clearCart();
      window.dispatchEvent(new Event("cartUpdated"));
      setLocation(`/order-confirmation/${order.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    orderMutation.mutate(data);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDob = (value: string) => {
    const digits = value.replace(/\D/g, "");
    let formatted = "";
    if (digits.length > 0) {
      formatted = digits.substring(0, 2);
    }
    if (digits.length > 2) {
      formatted += "/" + digits.substring(2, 4);
    }
    if (digits.length > 4) {
      formatted += "/" + digits.substring(4, 8);
    }
    return formatted;
  };

  const subtotal = getCartTotal(cartItems);
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-8">
        Checkout
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            {...field} 
                            data-testid="input-full-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">+91</span>
                              <Input 
                                placeholder="10-digit mobile number" 
                                className="pl-12"
                                maxLength={10}
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, "");
                                  field.onChange(value);
                                }}
                                data-testid="input-phone"
                              />
                              {field.value?.length === 10 && (
                                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="alternativePhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alternative Phone (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">+91</span>
                              <Input 
                                placeholder="10-digit mobile number" 
                                className="pl-12"
                                maxLength={10}
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, "");
                                  field.onChange(value);
                                }}
                                data-testid="input-alt-phone"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="DD/MM/YYYY" 
                            maxLength={10}
                            {...field}
                            onChange={(e) => {
                              const formatted = formatDob(e.target.value);
                              field.onChange(formatted);
                            }}
                            data-testid="input-dob"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Address *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter your complete address including house/flat no., street, landmark, city, state"
                            className="min-h-[100px] resize-none"
                            {...field}
                            data-testid="input-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pinCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PIN Code *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="6-digit PIN code" 
                              maxLength={6}
                              className="w-40"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                field.onChange(value);
                              }}
                              data-testid="input-pincode"
                            />
                            {field.value?.length === 6 && (
                              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={orderMutation.isPending}
                    data-testid="button-place-order"
                  >
                    {orderMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      `Place Order - ${formatPrice(total)}`
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
                    <div className="w-16 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
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
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.size} | {item.color} | Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-gold mt-1">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-gold" data-testid="text-checkout-total">{formatPrice(total)}</span>
              </div>

              <div className="bg-muted rounded-md p-3">
                <p className="text-xs text-muted-foreground text-center">
                  Cash on Delivery available. Pay when your order arrives.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

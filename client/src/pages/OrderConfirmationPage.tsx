import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Package, Truck, Phone, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order } from "@shared/schema";

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ["/api/orders", id],
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-500";
      case "Confirmed": return "bg-blue-500";
      case "Packed": return "bg-purple-500";
      case "Shipped": return "bg-orange-500";
      case "Delivered": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist.</p>
        <Link href="/">
          <Button>Go to Homepage</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground">
            Thank you for shopping with ST Fashions. Your order has been received.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono text-lg font-semibold text-foreground" data-testid="text-order-id">
                  {order.id}
                </p>
              </div>
              <Badge className={`${getStatusColor(order.status)} text-white`} data-testid="badge-order-status">
                {order.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Order placed on:</span>
              <span className="font-medium" data-testid="text-order-date">{formatDate(order.createdAt)}</span>
            </div>
            
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="text-muted-foreground">Delivery Address:</span>
                <p className="font-medium mt-1" data-testid="text-delivery-address">
                  {order.customerName}<br />
                  {order.customerAddress}<br />
                  PIN: {order.customerPinCode}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Contact:</span>
              <span className="font-medium" data-testid="text-contact-phone">+91 {order.customerPhone}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4" data-testid={`order-item-${index}`}>
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
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.size} | {item.color} | Qty: {item.quantity}
                  </p>
                  <p className="text-sm font-semibold text-gold mt-1">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(order.totalAmount - (order.totalAmount >= 999 ? 0 : 99))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-green-600">FREE</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="text-gold" data-testid="text-order-total">{formatPrice(order.totalAmount)}</span>
            </div>

            <div className="bg-muted rounded-md p-3">
              <p className="text-sm text-muted-foreground text-center">
                Payment: Cash on Delivery
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button size="lg" data-testid="button-continue-shopping">
              Continue Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" data-testid="button-go-home">
              Go to Homepage
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Call us at{" "}
            <a href="tel:9742654155" className="text-primary hover:underline">
              9742654155
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

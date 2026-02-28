import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";

export default function AccountPage() {
  const [, setLocation] = useLocation();
  const [customer, setCustomer] = useState<any>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders", customer?.id],
    enabled: !!customer,
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/customers/${customer!.id}/orders`,
      );
      return res.json();
    },
  });

  useEffect(() => {
    fetch("/api/customers/me")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setCustomer(data);
        setLoadingCustomer(false);
      })
      .catch(() => {
        setCustomer(null);
        setLoadingCustomer(false);
        setLocation("/login");
      });
  }, []);
  
   // Prevent flash before redirect
  if (!customer) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
        My Account
      </h1>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            <strong>Name:</strong> {customer.name}
          </p>
          <p>
            <strong>Phone:</strong> {customer.phone}
          </p>

          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            className="mt-4"
          >
            Go to Home
          </Button>
        </CardContent>
      </Card>
      {/* ORDER HISTORY */}
      <Card className="max-w-xl mt-6">
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading orders...</p>
          )}

          {!isLoading && orders.length === 0 && (
            <p className="text-sm text-muted-foreground">
              You haven’t placed any orders yet.
            </p>
          )}

          {!isLoading &&
            orders.map((order: any) => (
              <div key={order.id} className="border rounded-md p-3 space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <span>Order #{order.id.slice(0, 6)}</span>
                  <span>₹{order.totalAmount}</span>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Status: {order.status}</span>
                  <span>
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

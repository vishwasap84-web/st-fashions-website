import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingCart, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminLayout } from "@/components/admin/AdminLayout";
import type { Product, Order } from "@shared/schema";
import { ORDER_STATUSES } from "@shared/schema";

function getStatusColor(status: string) {
  switch (status) {
    case "Pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Confirmed": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "Packed": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "Shipped": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "Delivered": return "bg-green-500/20 text-green-400 border-green-500/30";
    default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0;
  const pendingOrders = orders?.filter(o => o.status === "Pending").length || 0;

  const recentOrders = orders
    ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5) || [];

  const ordersByStatus = ORDER_STATUSES.map(status => ({
    status,
    count: orders?.filter(o => o.status === status).length || 0,
  }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Welcome to ST Fashions Admin Panel</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Total Products
              </CardTitle>
              <Package className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <Skeleton className="h-8 w-24 bg-slate-700" />
              ) : (
                <div className="text-2xl font-bold text-white" data-testid="text-total-products">
                  {totalProducts}
                </div>
              )}
              <p className="text-xs text-slate-400 mt-1">Products in catalog</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Total Orders
              </CardTitle>
              <ShoppingCart className="w-4 h-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <Skeleton className="h-8 w-24 bg-slate-700" />
              ) : (
                <div className="text-2xl font-bold text-white" data-testid="text-total-orders">
                  {totalOrders}
                </div>
              )}
              <p className="text-xs text-slate-400 mt-1">All time orders</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Total Revenue
              </CardTitle>
              <DollarSign className="w-4 h-4 text-gold" />
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <Skeleton className="h-8 w-32 bg-slate-700" />
              ) : (
                <div className="text-2xl font-bold text-white" data-testid="text-total-revenue">
                  {formatCurrency(totalRevenue)}
                </div>
              )}
              <p className="text-xs text-slate-400 mt-1">Total sales amount</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Pending Orders
              </CardTitle>
              <Clock className="w-4 h-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <Skeleton className="h-8 w-16 bg-slate-700" />
              ) : (
                <div className="text-2xl font-bold text-white" data-testid="text-pending-orders">
                  {pendingOrders}
                </div>
              )}
              <p className="text-xs text-slate-400 mt-1">Awaiting confirmation</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Orders</CardTitle>
              <CardDescription className="text-slate-400">
                Latest orders from customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full bg-slate-700" />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No orders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div 
                      key={order.id}
                      className="flex items-center justify-between gap-4 p-4 rounded-lg bg-slate-700/50"
                      data-testid={`order-row-${order.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {order.items.length} item{order.items.length > 1 ? "s" : ""} - {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gold">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Order Status</CardTitle>
              <CardDescription className="text-slate-400">
                Orders by current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ordersByStatus.map(({ status, count }) => (
                  <div 
                    key={status}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      {status === "Delivered" ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="text-sm text-slate-300">{status}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(status)} border`}
                      data-testid={`status-count-${status.toLowerCase()}`}
                    >
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Search, 
  ShoppingCart, 
  Package,
  User,
  MapPin,
  Phone,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order, OrderStatus } from "@shared/schema";
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
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface OrderRowProps {
  order: Order;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  isUpdating: boolean;
}

function OrderRow({ order, onStatusChange, isUpdating }: OrderRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <TableRow className="border-slate-700" data-testid={`order-row-${order.id}`}>
        <TableCell>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-400" data-testid={`button-expand-${order.id}`}>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
        </TableCell>
        <TableCell className="font-mono text-sm text-slate-300">
          #{order.id.slice(0, 8)}
        </TableCell>
        <TableCell className="text-white">{order.customerName}</TableCell>
        <TableCell className="text-slate-300">{order.items.length} item(s)</TableCell>
        <TableCell className="text-gold font-medium">{formatCurrency(order.totalAmount)}</TableCell>
        <TableCell>
          <Select 
            value={order.status} 
            onValueChange={(value) => onStatusChange(order.id, value as OrderStatus)}
            disabled={isUpdating}
          >
            <SelectTrigger 
              className={`w-32 ${getStatusColor(order.status)} border`}
              data-testid={`select-status-${order.id}`}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <SelectValue />
              )}
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {ORDER_STATUSES.map(status => (
                <SelectItem key={status} value={status} className="text-white">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell className="text-slate-400 text-sm">
          {formatDate(order.createdAt)}
        </TableCell>
      </TableRow>
      <CollapsibleContent asChild>
        <TableRow className="border-slate-700 bg-slate-800/50">
          <TableCell colSpan={7} className="p-0">
            <div className="p-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer Details
                  </h4>
                  <div className="text-sm space-y-1 text-slate-400">
                    <p className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      {order.customerPhone}
                      {order.alternativePhone && ` / ${order.alternativePhone}`}
                    </p>
                    <p className="flex items-start gap-2">
                      <MapPin className="w-3 h-3 mt-1 flex-shrink-0" />
                      <span>{order.customerAddress}, {order.customerPinCode}</span>
                    </p>
                    {order.customerDob && (
                      <p className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        DOB: {order.customerDob}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Order Items
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-3 p-2 rounded-md bg-slate-700/50"
                      >
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-slate-600 rounded flex items-center justify-center">
                            <Package className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{item.name}</p>
                          <p className="text-xs text-slate-400">
                            {item.size} / {item.color} x {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm text-gold">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function AdminOrders() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      setUpdatingOrderId(orderId);
      const response = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order status updated",
        description: `Order status changed to ${variables.status}`,
      });
      setUpdatingOrderId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
      setUpdatingOrderId(null);
    },
  });

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-slate-400">Manage and track customer orders</p>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by customer, phone, or order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                  data-testid="input-search-orders"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-white" data-testid="select-status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Statuses</SelectItem>
                  {ORDER_STATUSES.map(status => (
                    <SelectItem key={status} value={status} className="text-white">{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full bg-slate-700" />
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No orders found</p>
                <p className="text-sm">Orders will appear here when customers place them</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="w-12 text-slate-400"></TableHead>
                      <TableHead className="text-slate-400">Order ID</TableHead>
                      <TableHead className="text-slate-400">Customer</TableHead>
                      <TableHead className="text-slate-400">Items</TableHead>
                      <TableHead className="text-slate-400">Total</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <OrderRow
                        key={order.id}
                        order={order}
                        onStatusChange={handleStatusChange}
                        isUpdating={updatingOrderId === order.id}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {filteredOrders.length > 0 && (
          <div className="text-center text-sm text-slate-400">
            Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

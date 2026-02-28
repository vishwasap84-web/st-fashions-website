import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderConfirmationPage from "@/pages/OrderConfirmationPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import AccountPage from "@/pages/AccountPage";
import NotFound from "@/pages/not-found";

// Admin
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import ChangePasswordPage from "@/pages/admin/ChangePasswordPage";

function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <CustomerLayout>
          <HomePage />
        </CustomerLayout>
      </Route>

      <Route path="/products">
        <CustomerLayout>
          <ProductsPage />
        </CustomerLayout>
      </Route>

      <Route path="/product/:id">
        <CustomerLayout>
          <ProductDetailPage />
        </CustomerLayout>
      </Route>

      <Route path="/cart">
        <CustomerLayout>
          <CartPage />
        </CustomerLayout>
      </Route>

      <Route path="/checkout">
        <CustomerLayout>
          <CheckoutPage />
        </CustomerLayout>
      </Route>

      <Route path="/order-confirmation/:id">
        <CustomerLayout>
          <OrderConfirmationPage />
        </CustomerLayout>
      </Route>

      <Route path="/login">
        <CustomerLayout>
          <LoginPage />
        </CustomerLayout>
      </Route>

      <Route path="/signup">
        <CustomerLayout>
          <SignupPage />
        </CustomerLayout>
      </Route>

      <Route path="/account">
        <CustomerLayout>
          <AccountPage />
        </CustomerLayout>
      </Route>

      {/* Admin */}
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/change-password" component={ChangePasswordPage} />

      <Route>
        <CustomerLayout>
          <NotFound />
        </CustomerLayout>
      </Route>
    </Switch>
  );
}

export default function App() {
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
    });
    setCustomer(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}


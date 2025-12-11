import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  Search,
  Package,
  X,
  Upload,
  ImagePlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  type Product, 
  type InsertProduct,
  insertProductSchema,
  CATEGORIES,
  SIZES 
} from "@shared/schema";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminProducts() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [colorInput, setColorInput] = useState("");
  const [imageInput, setImageInput] = useState("");

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      category: "Sarees",
      description: "",
      price: 0,
      sizes: [],
      colors: [],
      images: [],
      stock: 0,
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      category: "Sarees",
      description: "",
      price: 0,
      sizes: [],
      colors: [],
      images: [],
      stock: 0,
    });
    setColorInput("");
    setImageInput("");
  };

  const openAddDialog = () => {
    resetForm();
    setEditingProduct(null);
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    form.reset({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      sizes: product.sizes,
      colors: product.colors,
      images: product.images,
      stock: product.stock,
    });
    setEditingProduct(product);
    setIsAddDialogOpen(true);
  };

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setEditingProduct(null);
    resetForm();
  };

  const createMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product created successfully" });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertProduct }) => {
      const response = await apiRequest("PATCH", `/api/products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product updated successfully" });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted successfully" });
      setDeletingProduct(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertProduct) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const addColor = () => {
    const trimmed = colorInput.trim();
    if (trimmed && !form.getValues("colors").includes(trimmed)) {
      form.setValue("colors", [...form.getValues("colors"), trimmed]);
      setColorInput("");
    }
  };

  const removeColor = (color: string) => {
    form.setValue("colors", form.getValues("colors").filter(c => c !== color));
  };

  const addImage = () => {
    const trimmed = imageInput.trim();
    if (trimmed && !form.getValues("images").includes(trimmed)) {
      form.setValue("images", [...form.getValues("images"), trimmed]);
      setImageInput("");
    }
  };

  const removeImage = (image: string) => {
    form.setValue("images", form.getValues("images").filter(i => i !== image));
  };

  const toggleSize = (size: string) => {
    const currentSizes = form.getValues("sizes");
    if (currentSizes.includes(size as any)) {
      form.setValue("sizes", currentSizes.filter(s => s !== size));
    } else {
      form.setValue("sizes", [...currentSizes, size as any]);
    }
  };

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">Products</h1>
            <p className="text-slate-400">Manage your product catalog</p>
          </div>
          <Button onClick={openAddDialog} data-testid="button-add-product">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                  data-testid="input-search-products"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-white" data-testid="select-category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">All Categories</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat} className="text-white">{cat}</SelectItem>
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
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm">Add your first product to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-400">Image</TableHead>
                      <TableHead className="text-slate-400">Name</TableHead>
                      <TableHead className="text-slate-400">Category</TableHead>
                      <TableHead className="text-slate-400">Price</TableHead>
                      <TableHead className="text-slate-400">Stock</TableHead>
                      <TableHead className="text-slate-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow 
                        key={product.id} 
                        className="border-slate-700"
                        data-testid={`product-row-${product.id}`}
                      >
                        <TableCell>
                          {product.images[0] ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-slate-700 rounded-md flex items-center justify-center">
                              <Package className="w-6 h-6 text-slate-500" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-white">{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-slate-300 border-slate-600">
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gold">{formatCurrency(product.price)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={product.stock > 0 ? "text-green-400 border-green-500/30" : "text-red-400 border-red-500/30"}
                          >
                            {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(product)}
                              className="text-slate-400 hover:text-white"
                              data-testid={`button-edit-${product.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingProduct(product)}
                              className="text-red-400 hover:text-red-300"
                              data-testid={`button-delete-${product.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingProduct ? "Update the product details below" : "Fill in the details to add a new product"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Product Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter product name"
                          className="bg-slate-700 border-slate-600 text-white"
                          {...field}
                          data-testid="input-product-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-product-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat} className="text-white">{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Price (INR)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="0"
                          placeholder="0"
                          className="bg-slate-700 border-slate-600 text-white"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          data-testid="input-product-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Stock Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="0"
                          placeholder="0"
                          className="bg-slate-700 border-slate-600 text-white"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          data-testid="input-product-stock"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter product description"
                        className="bg-slate-700 border-slate-600 text-white resize-none"
                        rows={3}
                        {...field}
                        data-testid="textarea-product-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sizes"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Available Sizes</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map(size => (
                        <Button
                          key={size}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSize(size)}
                          className={`
                            ${form.watch("sizes").includes(size as any) 
                              ? "bg-primary text-primary-foreground border-primary" 
                              : "bg-slate-700 text-slate-300 border-slate-600"
                            }
                          `}
                          data-testid={`button-size-${size}`}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="colors"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Colors</FormLabel>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Enter color (e.g., Red, Blue)"
                          value={colorInput}
                          onChange={(e) => setColorInput(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
                          className="bg-slate-700 border-slate-600 text-white"
                          data-testid="input-add-color"
                        />
                        <Button type="button" variant="outline" onClick={addColor} className="border-slate-600">
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {form.watch("colors").map(color => (
                          <Badge 
                            key={color} 
                            variant="secondary"
                            className="bg-slate-700 text-slate-300 pr-1"
                          >
                            {color}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1 hover:bg-slate-600"
                              onClick={() => removeColor(color)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="images"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Image URLs</FormLabel>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Enter image URL"
                          value={imageInput}
                          onChange={(e) => setImageInput(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
                          className="bg-slate-700 border-slate-600 text-white"
                          data-testid="input-add-image"
                        />
                        <Button type="button" variant="outline" onClick={addImage} className="border-slate-600">
                          <ImagePlus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {form.watch("images").map((image, idx) => (
                          <div key={idx} className="relative group">
                            <img 
                              src={image} 
                              alt={`Preview ${idx + 1}`}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(image)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={closeDialog} className="border-slate-600">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} data-testid="button-save-product">
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingProduct ? (
                    "Update Product"
                  ) : (
                    "Add Product"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Product</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete "{deletingProduct?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingProduct && deleteMutation.mutate(deletingProduct.id)}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTheContext } from "@/context";
import { useStockRefresh } from "@/context/StockRefreshContext";
import { BASE_URL, STORE_STOCK_QUERRY } from "@/env";
import { useDebounce } from "@/hooks/useDebounce";
import { exportStockAsCSV } from "@/lib/exportService";
import { AlertTriangle, DollarSign, Download, Edit, Package, RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import EditStockModal from "./EditStockModal";

interface MedicineData {
  medData: {
    medID: string;
    name: string;
    medType: string;
    sellingType: string;
    pricePerTab: number;
  };
  quantity: number;
  expiryDate?: string;    // NEW: Expiry tracking
  batchNumber?: string;   // NEW: Batch tracking
}

export default function Stocks() {
  const [query, setQuery] = useState("");
  const [medData, setMedData] = useState<MedicineData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);
  const [showExpiring, setShowExpiring] = useState(false);
  const [editingItem, setEditingItem] = useState<MedicineData | null>(null);
  const { token, userEmail } = useTheContext() as any;
  const { refreshTrigger } = useStockRefresh();

  const debouncedQuery = useDebounce(query, 500);

  // Fetch stock when debounced query or refresh trigger changes
  useEffect(() => {
    fetchStock(debouncedQuery);
  }, [debouncedQuery, refreshTrigger]);

  const handleQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleRefresh = () => {
    setQuery("");
    setShowLowStock(false);
    setIsRefreshing(true);
    fetchStock("").finally(() => setIsRefreshing(false));
  };

  const fetchStock = async (searchQuery: string = query) => {
    if (!isRefreshing && !isLoading) {
      // Don't show full loading for search
    }

    try {
      const response = await fetch(BASE_URL + STORE_STOCK_QUERRY, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          storeEmail: userEmail,
          query: searchQuery,
        }),
      });

      const result = await response.json();
      setMedData(result || []);
    } catch (error) {
      console.error("Error fetching stock:", error);
      setMedData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getMedTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "success" | "warning"> = {
      tablet: "default",
      capsules: "secondary",
      fluid: "success",
      accessories: "warning",
    };
    return variants[type] || "default";
  };

  // Filter data for display
  const displayedData = medData.filter(m => {
    const today = new Date();
    const expiry = m.expiryDate ? new Date(m.expiryDate) : null;
    const daysUntilExpiry = expiry 
      ? Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    // Apply low stock filter
    if (showLowStock && m.quantity >= 10) return false;
    
    // Apply expiring filter (30 days or already expired)
    if (showExpiring) {
      if (daysUntilExpiry === null) return false;
      if (daysUntilExpiry > 30) return false;
    }
    
    return true;
  });

  // Calculate dashboard statistics
  const stats = useMemo(() => {
    const totalProducts = medData.length;
    const totalValue = medData.reduce(
      (sum, m) => sum + (m.quantity * (m.medData?.pricePerTab || 0)),
      0
    );
    const lowStockCount = medData.filter(m => m.quantity < 10).length;
    const criticalCount = medData.filter(m => m.quantity < 5).length;
    
    return { totalProducts, totalValue, lowStockCount, criticalCount };
  }, [medData]);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-muted-foreground">Total Products</p>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold">{stats.totalProducts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-muted-foreground">Inventory Value</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold">${stats.totalValue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
            <p className="text-2xl font-semibold">{stats.lowStockCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-muted-foreground">Critical Stock</p>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <p className="text-2xl font-semibold text-destructive">{stats.criticalCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, or category..."
                className="pl-10"
                value={query}
                onChange={handleQuery}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto flex-wrap">
              <Button
                variant={showLowStock ? "destructive" : "outline"}
                onClick={() => setShowLowStock(!showLowStock)}
                size="sm"
              >
                {showLowStock ? "✓ Low Stock" : "Low Stock"}
              </Button>
              <Button
                variant={showExpiring ? "destructive" : "outline"}
                onClick={() => setShowExpiring(!showExpiring)}
                size="sm"
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                {showExpiring ? "✓ Expiring" : "Expiring"}
              </Button>
              <Button
                variant="outline"
                onClick={() => exportStockAsCSV(medData, "MIMS_Store")}
                disabled={medData.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden md:inline">Export</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : medData.length === 0 ? (
            <EmptyState
              icon="package"
              title="No medicines in stock"
              description={
                query
                  ? "No results found for your search. Try a different term."
                  : "Add medicines to your inventory to get started."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-24">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-32">Category</TableHead>
                    <TableHead className="w-28">Expiry</TableHead>
                    <TableHead className="w-24 text-right">Stock</TableHead>
                    <TableHead className="w-24 text-right">Price</TableHead>
                    <TableHead className="w-16 text-center">Edit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedData.map((med, index) => {
                    const isCritical = med.quantity < 5;
                    const isLow = med.quantity < 10;
                    
                    // Calculate expiry status
                    const expiryDate = med.expiryDate ? new Date(med.expiryDate) : null;
                    const today = new Date();
                    const daysUntilExpiry = expiryDate 
                      ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                      : null;
                    const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;
                    const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 30;
                    
                    return (
                      <TableRow
                        key={index}
                        className={`transition-colors ${
                          isExpired 
                            ? "bg-destructive/20 hover:bg-destructive/30"
                            : isExpiringSoon
                              ? "bg-orange-500/10 hover:bg-orange-500/20"
                              : isCritical 
                                ? "bg-destructive/10 hover:bg-destructive/20" 
                                : isLow 
                                  ? "bg-warning/10 hover:bg-warning/20" 
                                  : "hover:bg-muted/50"
                        }`}
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {med.medData?.medID}
                        </TableCell>
                        <TableCell className="font-medium">
                          {med.medData?.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getMedTypeBadge(med.medData?.medType)}>
                            {med.medData?.medType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {expiryDate ? (
                            <div className={`flex items-center gap-1 text-sm ${
                              isExpired 
                                ? "text-destructive font-bold" 
                                : isExpiringSoon 
                                  ? "text-orange-600 font-semibold"
                                  : "text-muted-foreground"
                            }`}>
                              {isExpired && <AlertTriangle className="h-3 w-3" />}
                              {isExpiringSoon && <AlertTriangle className="h-3 w-3" />}
                              {expiryDate.toLocaleDateString()}
                              {isExpired && <span className="text-xs">(Expired)</span>}
                              {isExpiringSoon && <span className="text-xs">({daysUntilExpiry}d)</span>}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">Not set</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-medium ${
                              isCritical
                                ? "text-destructive font-bold"
                                : isLow
                                ? "text-warning-foreground font-semibold"
                                : ""
                            }`}
                          >
                            {med.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${med.medData?.pricePerTab?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingItem(med)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Stock Modal */}
      <EditStockModal
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
      />
    </div>
  );
}
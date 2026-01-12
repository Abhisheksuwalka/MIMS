import { EmptyState } from "@/components/EmptyState";
import { ButtonSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useTheContext } from "@/context";
import { useStockRefresh } from "@/context/StockRefreshContext";
import { BASE_URL, REMOVE_STOCK, STORE_STOCK_QUERRY } from "@/env";
import { useDebounce } from "@/hooks/useDebounce";
import { validateQuantity } from "@/lib/validation";
import { AlertTriangle, Minus, Search } from "lucide-react";
import React, { useEffect, useState } from "react";

interface StockItem {
  medData: {
    medID: string;
    name: string;
    medType: string;
    pricePerTab: number;
  };
  quantity: number;
}

export default function RemoveStock() {
  const { token, userEmail } = useTheContext() as any;
  const { toast } = useToast();
  const { triggerRefresh } = useStockRefresh();

  const [query, setQuery] = useState("");
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    fetchStock(debouncedQuery);
  }, [debouncedQuery]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const fetchStock = async (searchQuery: string = "") => {
    setIsLoading(true);
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
      setStockData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Fetch stock error:", error);
      setStockData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (medID: string, quantityToRemove: number, medicineName: string) => {
    try {
      const response = await fetch(BASE_URL + REMOVE_STOCK, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          storeEmail: userEmail,
          medID,
          quantityToRemove: quantityToRemove.toString(),
        }),
      });

      if (response.status === 200) {
        toast({
          title: "Stock Removed ✓",
          description: `Removed ${quantityToRemove} units of ${medicineName}`,
        });
        fetchStock(query); // Refresh the popover list
        triggerRefresh(); // Trigger main stock component refresh
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Remove",
          description: "Quantity may exceed available stock.",
        });
      }
    } catch (error) {
      console.error("Remove stock error:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to remove stock.",
      });
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) fetchStock("");
    }}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Minus className="h-4 w-4" />
          Remove Stock
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[450px] p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Remove from Stock</h3>
          <p className="text-sm text-muted-foreground">
            Search and remove items from inventory
          </p>
        </div>
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your stock..."
              className="pl-10"
              value={query}
              onChange={handleChange}
            />
          </div>
        </div>
        <ScrollArea className="h-[350px]">
          <div className="p-2">
            {isLoading ? (
              <div className="space-y-2 p-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            ) : stockData.length === 0 ? (
              <EmptyState
                icon="package"
                title="No items in stock"
                description={query ? "No items match your search" : "Your stock is empty"}
              />
            ) : (
              <div className="space-y-1">
                {stockData.map((item, i) => (
                  <StockItemComponent
                    key={i}
                    item={item}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function StockItemComponent({
  item,
  onRemove,
}: {
  item: StockItem;
  onRemove: (medID: string, quantity: number, name: string) => void;
}) {
  const [quantity, setQuantity] = useState<number | "">(1);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveClick = async () => {
    const quantityError = validateQuantity(quantity, item.quantity);
    if (quantityError) {
      // Small toast or UI feedback? 
      // Since it's a small row, maybe just return. 
      // But validateQuantity returns string.
      // Let's rely on basic checks or use the toast from parent?
      // StockItemComponent doesn't have useToast.
      // But we can check basic validity here.
      return;
    }
    
    if (!quantity || quantity < 1) return;
    if (quantity > item.quantity) return;

    setIsRemoving(true);
    await onRemove(item.medData.medID, quantity, item.medData.name);
    setIsRemoving(false);
    setQuantity(1);
  };

  const isLowStock = item.quantity < 10;

  return (
    <div className="p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0 mr-4">
          <p className="font-medium truncate">{item.medData?.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {item.medData?.medType}
            </Badge>
            <span className={`text-sm flex items-center gap-1 ${isLowStock ? "text-warning" : "text-muted-foreground"}`}>
              {isLowStock && <AlertTriangle className="h-3 w-3" />}
              {item.quantity} in stock
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={1}
          max={item.quantity}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value ? parseInt(e.target.value) : "")}
          className="w-20 h-8"
        />
        <Button
          size="sm"
          variant="destructive"
          onClick={handleRemoveClick}
          disabled={isRemoving || !quantity || quantity > item.quantity}
          className="h-8"
        >
          {isRemoving ? (
            <ButtonSpinner className="h-3 w-3" />
          ) : (
            <>
              <Minus className="h-3 w-3 mr-1" />
              Remove
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
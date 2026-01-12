import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheContext } from "@/context";
import { BASE_URL, STORE_STOCK_QUERRY } from "@/env";
import { AlertTriangle, Plus, Search } from "lucide-react";
import React, { useState } from "react";

interface StockItem {
  medData: {
    medID: string;
    name: string;
    medType: string;
    pricePerTab: number;
  };
  quantity: number;
}

interface SubBillingAddMedProps {
  setData: (item: StockItem) => void;
}

export default function SubBillingAddMed({ setData }: SubBillingAddMedProps) {
  const { token, userEmail } = useTheContext() as any;

  const [query, setQuery] = useState("");
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    fetchStock(value);
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

  const handleAddToBill = (item: StockItem, quantity: number) => {
    setData({
      medData: item.medData,
      quantity,
    });
    setIsOpen(false);
    setQuery("");
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) fetchStock("");
      }}
    >
      <PopoverTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Medicine
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Add to Bill</h3>
          <p className="text-sm text-muted-foreground">
            Search from your stock
          </p>
        </div>
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medicine..."
              className="pl-10"
              value={query}
              onChange={handleChange}
            />
          </div>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-2">
            {isLoading ? (
              <div className="space-y-2 p-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : stockData.length === 0 ? (
              <EmptyState
                icon="package"
                title="No items found"
                description={query ? "Try a different search" : "Your stock is empty"}
              />
            ) : (
              <div className="space-y-1">
                {stockData.map((item, i) => (
                  <BillItemComponent
                    key={i}
                    item={item}
                    onAdd={handleAddToBill}
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

function BillItemComponent({
  item,
  onAdd,
}: {
  item: StockItem;
  onAdd: (item: StockItem, quantity: number) => void;
}) {
  const [quantity, setQuantity] = useState<number | "">(1);
  const isLowStock = item.quantity < 10;

  const handleAdd = () => {
    if (!quantity || quantity < 1 || quantity > item.quantity) return;
    onAdd(item, quantity);
  };

  return (
    <div className="p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0 mr-4">
          <p className="font-medium text-sm truncate">{item.medData?.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium text-primary">
              ${item.medData?.pricePerTab?.toFixed(2)}
            </span>
            <span className={`text-xs flex items-center gap-1 ${isLowStock ? "text-warning" : "text-muted-foreground"}`}>
              {isLowStock && <AlertTriangle className="h-3 w-3" />}
              {item.quantity} available
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">Qty:</Label>
        <Input
          type="number"
          min={1}
          max={item.quantity}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value ? parseInt(e.target.value) : "")}
          className="w-16 h-8 text-sm"
        />
        <Button
          size="sm"
          className="h-8 flex-1"
          onClick={handleAdd}
          disabled={!quantity || quantity > item.quantity}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add to Bill
        </Button>
      </div>
    </div>
  );
}
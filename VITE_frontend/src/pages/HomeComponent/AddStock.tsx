import { EmptyState } from "@/components/EmptyState";
import { ButtonSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useTheContext } from "@/context";
import { useStockRefresh } from "@/context/StockRefreshContext";
import { ADD_STOCK, BASE_URL, MEDICINE_SEARCH } from "@/env";
import { useDebounce } from "@/hooks/useDebounce";
import { validateQuantity } from "@/lib/validation";
import { DollarSign, Package, Plus, PlusCircle, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import AddMedicineDialog from "./AddMedicineDialog";

interface MedicineItem {
  medID: string;
  name: string;
  medType: string;
  sellingType: string;
  pricePerTab: number;
  pricePerBox: number;
  cardPerBox: number;
  quantityPerCard: number;
}

export default function AddStock() {
  const [query, setQuery] = useState("");
  const [medData, setMedData] = useState<MedicineItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddMedicineDialog, setShowAddMedicineDialog] = useState(false);
  const { triggerRefresh } = useStockRefresh();

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchQuery(debouncedQuery);
    } else {
      setMedData([]);
    }
  }, [debouncedQuery]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const fetchQuery = async (str: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(BASE_URL + MEDICINE_SEARCH, {
        method: "POST",
        body: new URLSearchParams({ query: str }),
      });
      const result = await response.json();
      setMedData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Search error:", error);
      setMedData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStockAdded = () => {
    setIsOpen(false);
    triggerRefresh();
  };

  const handleMedicineCreated = (newMedicine: MedicineItem) => {
    // Add the newly created medicine to the search results
    setMedData([newMedicine]);
    setShowAddMedicineDialog(false);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Stock
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[450px] p-0" align="end">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Add Medicine to Stock</h3>
            <p className="text-sm text-muted-foreground">
              Search from the medicine database
            </p>
          </div>
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medicine name or ID..."
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
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-48" />
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </div>
              ) : query.length < 2 ? (
                <EmptyState
                  icon="search"
                  title="Search medicines"
                  description="Type at least 2 characters to search"
                />
              ) : medData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No medicines found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    "{query}" is not in the database yet.
                    <br />
                    Would you like to add it?
                  </p>
                  <Button 
                    onClick={() => setShowAddMedicineDialog(true)}
                    className="gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add New Medicine
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {medData.map((data, i) => (
                    <MedComponent key={i} data={data} onAdded={handleStockAdded} />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <AddMedicineDialog
        open={showAddMedicineDialog}
        onOpenChange={setShowAddMedicineDialog}
        onMedicineCreated={handleMedicineCreated}
        initialName={query}
      />
    </>
  );
}

function MedComponent({ data, onAdded }: { data: MedicineItem; onAdded: () => void }) {
  const { toast } = useToast();
  const { token, userEmail } = useTheContext() as any;
  const [quantity, setQuantity] = useState<number | "">(1);
  const [expiryDate, setExpiryDate] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    const quantityError = validateQuantity(quantity);
    if (quantityError) {
      toast({
        variant: "destructive",
        title: "Invalid Quantity",
        description: quantityError,
      });
      return;
    }

    // Validate expiry date (required for medical compliance)
    if (!expiryDate) {
      toast({
        variant: "destructive",
        title: "Expiry Date Required",
        description: "Please enter the expiry date for this medicine batch.",
      });
      return;
    }

    setIsAdding(true);

    try {
      const response = await fetch(BASE_URL + ADD_STOCK, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          storeEmail: userEmail,
          medID: data.medID,
          name: data.name,
          secName: "",
          sellingType: data.sellingType || "",
          medType: data.medType || "",
          pricePerTab: data.pricePerTab?.toString() || "0",
          cardPerBox: data.cardPerBox?.toString() || "0",
          quantityPerCard: data.quantityPerCard?.toString() || "0",
          pricePerBox: data.pricePerBox?.toString() || "0",
          medicineQuantityToAdd: quantity.toString(),
          expiryDate: expiryDate,      // NEW
          batchNumber: batchNumber,    // NEW
        }),
      });

      if (response.ok) {
        toast({
          title: "Stock Added! ✓",
          description: `Added ${quantity} units of ${data.name}`,
        });
        onAdded();
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Add",
          description: "Please try again.",
        });
      }
    } catch (error) {
      console.error("Add stock error:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to add stock.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0 mr-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-muted-foreground">
            {data.medID}
          </span>
          <Badge variant="secondary" className="text-xs">
            {data.medType}
          </Badge>
        </div>
        <p className="font-medium truncate">{data.name}</p>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          {data.pricePerTab || data.pricePerBox || 0}
        </p>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              <span className="text-sm font-mono text-muted-foreground block mb-1">
                {data.medID}
              </span>
              {data.name}
            </SheetTitle>
            <SheetDescription className="space-y-6 pt-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <span className="text-sm">Price per unit</span>
                <span className="text-2xl font-bold">
                  ${data.pricePerTab || data.pricePerBox || 0}
                </span>
              </div>

              <div className="space-y-2">
                <Label>Quantity to Add *</Label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value ? parseInt(e.target.value) : "")}
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label>Expiry Date *</Label>
                <Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="text-lg"
                />
                <p className="text-xs text-muted-foreground">Required for compliance</p>
              </div>

              <div className="space-y-2">
                <Label>Batch Number (Optional)</Label>
                <Input
                  type="text"
                  placeholder="e.g., BATCH-2024-001"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                />
              </div>

              <Button className="w-full" onClick={handleAdd} disabled={isAdding}>
                {isAdding ? (
                  <>
                    <ButtonSpinner className="mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Package className="mr-2 h-4 w-4" />
                    Add {quantity || 0} to Stock
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                This will add the medicine to your store inventory
              </p>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}

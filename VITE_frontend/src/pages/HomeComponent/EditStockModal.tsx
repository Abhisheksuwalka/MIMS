import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useTheContext } from "@/context";
import { useStockRefresh } from "@/context/StockRefreshContext";
import { BASE_URL, UPDATE_STOCK } from "@/env";
import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";

interface StockItemData {
  medData: {
    medID: string;
    name: string;
    pricePerTab: number;
    cardPerBox?: number;
    medType?: string;
  };
  quantity: number;
  expiryDate?: string;
  batchNumber?: string;
}

interface EditStockModalProps {
  item: StockItemData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditStockModal({ item, isOpen, onClose }: EditStockModalProps) {
  const { toast } = useToast();
  const { token, userEmail } = useTheContext() as any;
  const { triggerRefresh } = useStockRefresh();
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [cardPerBox, setCardPerBox] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.medData.name || "");
      setPrice(item.medData.pricePerTab?.toString() || "");
      setQuantity(item.quantity?.toString() || "");
      setExpiryDate(item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : "");
      setBatchNumber(item.batchNumber || "");
      setCardPerBox(item.medData.cardPerBox?.toString() || "");
    }
  }, [item]);

  const handleSave = async () => {
    if (!item) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(BASE_URL + UPDATE_STOCK, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          storeEmail: userEmail,
          medID: item.medData.medID,
          name: name,
          pricePerTab: price,
          quantity: quantity,
          expiryDate: expiryDate,
          batchNumber: batchNumber,
          cardPerBox: cardPerBox,
        }),
      });

      if (response.ok) {
        toast({
          title: "Stock Updated! ✓",
          description: `${name} has been updated successfully.`,
        });
        triggerRefresh();
        onClose();
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: error.error?.message || "Please try again.",
        });
      }
    } catch (error) {
      console.error("Update stock error:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to update stock.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Medicine
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {item.medData.medID}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Medicine Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Medicine name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price per Unit ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Cards per Box</Label>
              <Input
                type="number"
                min="0"
                value={cardPerBox}
                onChange={(e) => setCardPerBox(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Batch Number</Label>
            <Input
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="e.g., BATCH-2024-001"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

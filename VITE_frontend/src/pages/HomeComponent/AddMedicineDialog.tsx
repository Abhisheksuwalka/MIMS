import { ButtonSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { BASE_URL } from "@/env";
import { useEffect, useState } from "react";

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

interface AddMedicineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMedicineCreated: (medicine: MedicineItem) => void;
  initialName?: string;
}

type MedType = "tablet" | "fluid" | "capsules" | "accessories";

interface FormErrors {
  medID?: string;
  name?: string;
  medType?: string;
  pricePerTab?: string;
}

export default function AddMedicineDialog({
  open,
  onOpenChange,
  onMedicineCreated,
  initialName = "",
}: AddMedicineDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Form state
  const [medID, setMedID] = useState("");
  const [name, setName] = useState(initialName);
  const [medType, setMedType] = useState<MedType | "">("");
  const [sellingType, setSellingType] = useState("");
  const [pricePerTab, setPricePerTab] = useState<number | "">("");
  const [pricePerBox, setPricePerBox] = useState<number | "">("");
  const [cardPerBox, setCardPerBox] = useState<number | "">("");
  const [quantityPerCard, setQuantityPerCard] = useState<number | "">("");

  // Reset form when dialog opens with new initialName
  useEffect(() => {
    if (open) {
      setName(initialName);
      // Generate a suggested medID based on name
      if (initialName) {
        const suggestedID = initialName
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 6) + Math.floor(Math.random() * 1000);
        setMedID(suggestedID);
      }
    }
  }, [open, initialName]);

  const resetForm = () => {
    setMedID("");
    setName("");
    setMedType("");
    setSellingType("");
    setPricePerTab("");
    setPricePerBox("");
    setCardPerBox("");
    setQuantityPerCard("");
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!medID.trim()) {
      newErrors.medID = "Medicine ID is required";
    } else if (medID.length < 3) {
      newErrors.medID = "Medicine ID must be at least 3 characters";
    }

    if (!name.trim()) {
      newErrors.name = "Medicine name is required";
    }

    if (!medType) {
      newErrors.medType = "Please select a medicine type";
    }

    if (!pricePerTab && !pricePerBox) {
      newErrors.pricePerTab = "Please enter at least one price";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(BASE_URL + "/medicines/globaladd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medID: medID.trim(),
          name: name.trim(),
          medType,
          sellingType: sellingType.trim() || "per unit",
          pricePerTab: pricePerTab || 0,
          pricePerBox: pricePerBox || 0,
          cardPerBox: cardPerBox || 0,
          quantityPerCard: quantityPerCard || 0,
        }),
      });

      const result = await response.json();

      if (response.status === 201 || response.status === 200) {
        toast({
          title: "Medicine Added! ✓",
          description: `${name} has been added to the database. You can now add it to your stock.`,
        });

        const newMedicine: MedicineItem = {
          medID: medID.trim(),
          name: name.trim(),
          medType: medType as string,
          sellingType: sellingType.trim() || "per unit",
          pricePerTab: Number(pricePerTab) || 0,
          pricePerBox: Number(pricePerBox) || 0,
          cardPerBox: Number(cardPerBox) || 0,
          quantityPerCard: Number(quantityPerCard) || 0,
        };

        onMedicineCreated(newMedicine);
        resetForm();
      } else if (response.status === 409) {
        setErrors({ medID: "This Medicine ID already exists. Please use a different ID." });
        toast({
          variant: "destructive",
          title: "Duplicate ID",
          description: "A medicine with this ID already exists.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Add",
          description: result.error?.message || "Please try again.",
        });
      }
    } catch (error) {
      console.error("Add medicine error:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to add medicine. Please check your connection.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Medicine</DialogTitle>
          <DialogDescription>
            Add a new medicine to the global database. Once added, you can add it to your store stock.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Medicine ID */}
          <div className="grid gap-2">
            <Label htmlFor="medID">
              Medicine ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="medID"
              placeholder="e.g., PARA500, AMOX250"
              value={medID}
              onChange={(e) => setMedID(e.target.value.toUpperCase())}
              className={errors.medID ? "border-destructive" : ""}
            />
            {errors.medID && (
              <p className="text-sm text-destructive">{errors.medID}</p>
            )}
          </div>

          {/* Medicine Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">
              Medicine Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Paracetamol 500mg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Medicine Type */}
          <div className="grid gap-2">
            <Label htmlFor="medType">
              Type <span className="text-destructive">*</span>
            </Label>
            <Select value={medType} onValueChange={(value) => setMedType(value as MedType)}>
              <SelectTrigger className={errors.medType ? "border-destructive" : ""}>
                <SelectValue placeholder="Select medicine type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tablet">Tablet</SelectItem>
                <SelectItem value="capsules">Capsules</SelectItem>
                <SelectItem value="fluid">Fluid/Syrup</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
            {errors.medType && (
              <p className="text-sm text-destructive">{errors.medType}</p>
            )}
          </div>

          {/* Selling Type */}
          <div className="grid gap-2">
            <Label htmlFor="sellingType">Selling Type</Label>
            <Input
              id="sellingType"
              placeholder="e.g., per strip, per bottle"
              value={sellingType}
              onChange={(e) => setSellingType(e.target.value)}
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pricePerTab">
                Price per Unit <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pricePerTab"
                type="number"
                min={0}
                step={0.01}
                placeholder="0.00"
                value={pricePerTab}
                onChange={(e) => setPricePerTab(e.target.value ? parseFloat(e.target.value) : "")}
                className={errors.pricePerTab ? "border-destructive" : ""}
              />
              {errors.pricePerTab && (
                <p className="text-sm text-destructive">{errors.pricePerTab}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pricePerBox">Price per Box</Label>
              <Input
                id="pricePerBox"
                type="number"
                min={0}
                step={0.01}
                placeholder="0.00"
                value={pricePerBox}
                onChange={(e) => setPricePerBox(e.target.value ? parseFloat(e.target.value) : "")}
              />
            </div>
          </div>

          {/* Packaging Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cardPerBox">Cards per Box</Label>
              <Input
                id="cardPerBox"
                type="number"
                min={0}
                placeholder="0"
                value={cardPerBox}
                onChange={(e) => setCardPerBox(e.target.value ? parseInt(e.target.value) : "")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantityPerCard">Units per Card</Label>
              <Input
                id="quantityPerCard"
                type="number"
                min={0}
                placeholder="0"
                value={quantityPerCard}
                onChange={(e) => setQuantityPerCard(e.target.value ? parseInt(e.target.value) : "")}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <ButtonSpinner className="mr-2" />
                Adding...
              </>
            ) : (
              "Add Medicine"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

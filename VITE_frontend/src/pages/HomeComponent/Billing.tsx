import { EmptyState } from "@/components/EmptyState";
import { ButtonSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useTheContext } from "@/context";
import { BASE_URL, BILLING_STOCK } from "@/env";
import { clearCart, loadCart, saveCart } from "@/lib/cartPersistence";
import { validateBillingForm } from "@/lib/validation";
import { Calendar, CheckCircle, Phone, Search, ShoppingCart, Star, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import SubBillingAddMed from "./SubBillingAddMed";

interface BillItem {
  medData: {
    medID: string;
    name: string;
    pricePerTab: number;
    medType?: string; // made optional to match CartItem loosely
  };
  quantity: number;
}

interface CustomerInfo {
  _id: string;
  name: string;
  phone: string;
  loyaltyPoints: number;
  totalSpent: number;
  visitCount: number;
}

export default function Billing() {
  const { toast } = useToast();
  const { token, userEmail } = useTheContext() as any;

  // Initialize with persisted cart
  const [localBillData, setLocalBillData] = useState<BillItem[]>(() => {
    const saved = loadCart();
    return saved.map(item => ({
      ...item,
      medData: {
        ...item.medData,
        medType: item.medData.medType || "tablet" // fallback
      }
    }));
  });
  const [total, setTotal] = useState(0);
  const [formName, setFormName] = useState("");
  const [formAge, setFormAge] = useState<number | "">("");
  const [formPhone, setFormPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Customer lookup
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const updateLocalData = (element: BillItem) => {
    setLocalBillData((arr) => [...arr, element]);
  };

  const removeByIndex = (index: number) => {
    setLocalBillData((arr) => arr.filter((_, i) => i !== index));
  };

  // Lookup customer by phone
  const lookupCustomer = async (phone: string) => {
    if (phone.length < 10) {
      setCustomer(null);
      return;
    }
    
    setIsLookingUp(true);
    try {
      const response = await fetch(`${BASE_URL}/store/customers/lookup`, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ storeEmail: userEmail, phone }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setCustomer(result.data);
          // Auto-fill name if customer found
          if (result.data.name && !formName) {
            setFormName(result.data.name);
          }
          toast({
            title: "Returning Customer! 🌟",
            description: `${result.data.name} - ${result.data.visitCount} visits, ${result.data.loyaltyPoints} points`,
          });
        } else {
          setCustomer(null);
        }
      }
    } catch (error) {
      console.error("Customer lookup failed:", error);
    } finally {
      setIsLookingUp(false);
    }
  };

  useEffect(() => {
    const value = localBillData.reduce(
      (acc, item) => acc + (item?.medData?.pricePerTab || 0) * (item?.quantity || 0),
      0
    );
    setTotal(value);
    
    // Persist cart changes
    saveCart(localBillData as any);
  }, [localBillData]);

  const clearForm = () => {
    setFormName("");
    setFormAge("");
    setFormPhone("");
    setLocalBillData([]);
    setCustomer(null);
    clearCart();
  };

  const submitBill = async () => {
    // Reset errors
    setErrors({});

    // Validate form
    const validation = validateBillingForm({
      formName,
      formAge,
      formPhone,
      medSchemaBasedData: localBillData,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please check the highlighted fields.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(BASE_URL + BILLING_STOCK, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          storeEmail: userEmail,
          formName,
          formAge: formAge.toString(),
          formPhone,
          medSchemaBasedData: JSON.stringify(localBillData),
          totalAmount: total.toString(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Bill Created Successfully! ✓",
          description: `Bill for ${formName} - Total: $${total.toFixed(2)}`,
        });
        clearForm();
      } else {
        toast({
          variant: "destructive",
          title: "Error Creating Bill",
          description: "Please check stock availability and try again.",
        });
      }
    } catch (error) {
      console.error("Billing error:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to process the bill. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Customer Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
          <CardDescription>
            Enter the customer details for this bill
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customer-name"
                    type="text"
                    placeholder="John Doe"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className={`pl-10 ${errors.formName ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.formName && <p className="text-xs text-destructive">{errors.formName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-age">Age</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customer-age"
                    type="number"
                    min={1}
                    max={120}
                    placeholder="25"
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value ? parseInt(e.target.value) : "")}
                    className={`pl-10 ${errors.formAge ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.formAge && <p className="text-xs text-destructive">{errors.formAge}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-phone" className="flex items-center gap-2">
                  Phone Number
                  {customer && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {customer.loyaltyPoints} pts
                    </span>
                  )}
                </Label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="customer-phone"
                      type="tel"
                      placeholder="000 000 0000"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className={`pl-10 ${errors.formPhone ? "border-destructive" : ""} ${customer ? "border-primary" : ""}`}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => lookupCustomer(formPhone)}
                    disabled={isLookingUp || formPhone.length < 10}
                    title="Lookup customer"
                  >
                    <Search className={`h-4 w-4 ${isLookingUp ? "animate-pulse" : ""}`} />
                  </Button>
                </div>
                {errors.formPhone && <p className="text-xs text-destructive">{errors.formPhone}</p>}
                {customer && (
                  <p className="text-xs text-muted-foreground">
                    🌟 Returning customer: {customer.visitCount} visits, ${customer.totalSpent.toFixed(2)} spent
                  </p>
                )}
              </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Medicine Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart Items
            </CardTitle>
            <CardDescription>
              {localBillData.length} item{localBillData.length !== 1 ? "s" : ""} in cart
            </CardDescription>
          </div>
          <SubBillingAddMed setData={updateLocalData} />
        </CardHeader>
        <CardContent className="p-0">
          {localBillData.length === 0 ? (
            <div className="flex flex-col">
              <EmptyState
                icon="package"
                title="Cart is empty"
                description="Search and add medicines to create a bill"
              />
              {errors.products && (
                <p className="text-sm text-destructive text-center mt-2">{errors.products}</p>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Medicine Name</TableHead>
                      <TableHead className="w-24 text-right">Qty</TableHead>
                      <TableHead className="w-24 text-right">Price</TableHead>
                      <TableHead className="w-24 text-right">Total</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localBillData.map((item, index) => (
                      <TableRow key={index} className="hover:bg-muted/50">
                        <TableCell className="text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.medData?.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          ${item.medData?.pricePerTab?.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${(item.medData?.pricePerTab * item.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeByIndex(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-primary/5">
                      <TableCell colSpan={4} className="text-right font-semibold">
                        Grand Total
                      </TableCell>
                      <TableCell className="text-right text-xl font-bold text-primary">
                        ${total.toFixed(2)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>

              {/* Checkout Button */}
              <div className="p-4 border-t flex justify-end gap-3">
                <Button variant="outline" onClick={clearForm}>
                  Clear All
                </Button>
                <Button onClick={submitBill} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <ButtonSpinner className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Sale - ${total.toFixed(2)}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
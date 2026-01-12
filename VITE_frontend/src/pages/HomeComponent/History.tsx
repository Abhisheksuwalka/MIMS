import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useTheContext } from "@/context";
import { BASE_URL, BILL_BY_MED, BILL_BY_NAME, BILL_BY_PHONE } from "@/env";
import { Calendar, ChevronRight, Package, Phone, Search, User } from "lucide-react";
import { useState } from "react";

interface Bill {
  _id: string;
  customerName: string;
  customerAge: number;
  phone: string;
  createdAt: string;
  totalAmount: number;
  productList: Array<{
    medData: {
      name: string;
      pricePerTab: number;
    };
    quantity: number;
  }>;
}

type SearchType = "name" | "phone" | "medicine";

export default function History() {
  const { toast } = useToast();
  const { token, userEmail } = useTheContext() as any;

  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("name");
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        variant: "destructive",
        title: "Search Required",
        description: "Please enter a search term.",
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    const endpoints: Record<SearchType, string> = {
      name: BILL_BY_NAME,
      phone: BILL_BY_PHONE,
      medicine: BILL_BY_MED,
    };

    try {
      const response = await fetch(BASE_URL + endpoints[searchType], {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          storeEmail: userEmail,
          query: query.trim(),
        }),
      });

      const result = await response.json();
      setBills(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: "Unable to fetch billing history.",
      });
      setBills([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const capitalizeFirstLetter = (word: string) => {
    if (!word || typeof word !== "string") return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  const searchTypeInfo: Record<SearchType, { icon: typeof User; label: string; placeholder: string }> = {
    name: { icon: User, label: "Customer Name", placeholder: "John Doe" },
    phone: { icon: Phone, label: "Phone Number", placeholder: "000 000 0000" },
    medicine: { icon: Package, label: "Medicine Name", placeholder: "Paracetamol" },
  };

  const SearchIcon = searchTypeInfo[searchType].icon;

  return (
    <div className="space-y-6">
      {/* Search Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Billing History
          </CardTitle>
          <CardDescription>
            Find past transactions by customer name, phone number, or medicine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Type Selection */}
          <RadioGroup
            value={searchType}
            onValueChange={(value) => setSearchType(value as SearchType)}
            className="flex flex-wrap gap-4"
          >
            {(Object.keys(searchTypeInfo) as SearchType[]).map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <RadioGroupItem value={type} id={`search-${type}`} />
                <Label htmlFor={`search-${type}`} className="cursor-pointer">
                  {searchTypeInfo[type].label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {/* Search Input */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchTypeInfo[searchType].placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {hasSearched
              ? `Search Results (${bills.length})`
              : "Billing Records"}
          </CardTitle>
          {bills.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportBillingAsCSV(bills, "MIMS_Store")}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : !hasSearched ? (
            <EmptyState
              icon="search"
              title="Search for bills"
              description="Enter a search term above to find billing records"
            />
          ) : bills.length === 0 ? (
            <EmptyState
              icon="file"
              title="No records found"
              description="Try a different search term or search type"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-28">Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Phone</TableHead>
                    <TableHead className="w-16 text-right">Age</TableHead>
                    <TableHead className="w-24 text-right">Amount</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill._id} className="hover:bg-muted/50">
                      <TableCell className="text-muted-foreground text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(bill.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {capitalizeFirstLetter(bill.customerName)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {bill.phone}
                      </TableCell>
                      <TableCell className="text-right">
                        {bill.customerAge}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        ${bill.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-muted-foreground font-normal">
                                    {formatDate(bill.createdAt)}
                                  </p>
                                  <p className="text-xl">
                                    {capitalizeFirstLetter(bill.customerName)}
                                  </p>
                                </div>
                              </SheetTitle>
                              <SheetDescription asChild>
                                <div className="space-y-4 mt-4">
                                  {/* Customer Details */}
                                  <div className="flex gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-4 w-4 text-muted-foreground" />
                                      {bill.phone}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      {bill.customerAge} years
                                    </div>
                                  </div>

                                  {/* Product List */}
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-10">#</TableHead>
                                        <TableHead>Medicine</TableHead>
                                        <TableHead className="text-right w-16">Qty</TableHead>
                                        <TableHead className="text-right w-20">Price</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {bill.productList.map((product, index) => (
                                        <TableRow key={index}>
                                          <TableCell className="text-muted-foreground">
                                            {index + 1}
                                          </TableCell>
                                          <TableCell>{product.medData?.name}</TableCell>
                                          <TableCell className="text-right">
                                            {product.quantity}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            ${product.medData?.pricePerTab?.toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>

                                  {/* Total */}
                                  <div className="flex justify-end pt-4 border-t">
                                    <div className="text-right">
                                      <p className="text-sm text-muted-foreground">Total Amount</p>
                                      <p className="text-2xl font-bold text-primary">
                                        ${bill.totalAmount.toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </SheetDescription>
                            </SheetHeader>
                          </SheetContent>
                        </Sheet>
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
  );
}
/**
 * Export Service
 * Utilities for exporting data to CSV format
 */

export interface ExportableStockItem {
  medData: {
    medID: string;
    name: string;
    medType: string;
    pricePerTab: number;
  };
  quantity: number;
}

/**
 * Convert stock data to CSV format
 */
export function stockToCSV(stockData: ExportableStockItem[]): string {
  const headers = ["Medicine ID", "Name", "Category", "Price", "Quantity", "Total Value"];
  
  const rows = stockData.map(item => [
    item.medData?.medID || "",
    `"${(item.medData?.name || "").replace(/"/g, '""')}"`, // Escape quotes
    item.medData?.medType || "",
    (item.medData?.pricePerTab || 0).toFixed(2),
    item.quantity.toString(),
    ((item.medData?.pricePerTab || 0) * item.quantity).toFixed(2),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  return csvContent;
}

/**
 * Trigger file download in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string = "text/csv") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export stock data as CSV file
 */
export function exportStockAsCSV(stockData: ExportableStockItem[], storeName: string = "store") {
  const csv = stockToCSV(stockData);
  const date = new Date().toISOString().split('T')[0];
  const filename = `${storeName.replace(/\s+/g, '_')}_stock_${date}.csv`;
  
  downloadFile(csv, filename);
}

/**
 * Billing record interface for export
 */
export interface ExportableBillRecord {
  _id: string;
  customerName: string;
  customerAge: number;
  phone: string;
  productList: Array<{
    medData: { name: string; pricePerTab: number };
    quantity: number;
  }>;
  totalAmount: number;
  createdAt: string;
}

/**
 * Convert billing data to CSV format
 */
export function billingToCSV(bills: ExportableBillRecord[]): string {
  const headers = ["Date", "Bill ID", "Customer Name", "Age", "Phone", "Products", "Total Amount"];
  
  const rows = bills.map(bill => {
    const products = bill.productList
      .map(p => `${p.medData?.name || "Unknown"} x${p.quantity}`)
      .join("; ");
    
    const date = new Date(bill.createdAt).toLocaleString();
    
    return [
      `"${date}"`,
      bill._id,
      `"${(bill.customerName || "").replace(/"/g, '""')}"`,
      bill.customerAge?.toString() || "",
      bill.phone || "",
      `"${products.replace(/"/g, '""')}"`,
      (bill.totalAmount || 0).toFixed(2),
    ];
  });

  return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
}

/**
 * Export billing data as CSV file
 */
export function exportBillingAsCSV(bills: ExportableBillRecord[], storeName: string = "store") {
  const csv = billingToCSV(bills);
  const date = new Date().toISOString().split('T')[0];
  const filename = `${storeName.replace(/\s+/g, '_')}_billing_${date}.csv`;
  
  downloadFile(csv, filename);
}

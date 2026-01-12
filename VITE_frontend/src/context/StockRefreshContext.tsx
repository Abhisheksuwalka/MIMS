import { createContext, ReactNode, useCallback, useContext, useState } from "react";

/**
 * Stock Refresh Context
 * Provides a mechanism to trigger stock data refresh across components
 * When AddStock, RemoveStock, or Billing operations complete successfully,
 * they call triggerRefresh() to notify the Stock component to reload data.
 */

interface StockRefreshContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const StockRefreshContext = createContext<StockRefreshContextType | null>(null);

interface StockRefreshProviderProps {
  children: ReactNode;
}

export function StockRefreshProvider({ children }: StockRefreshProviderProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <StockRefreshContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </StockRefreshContext.Provider>
  );
}

export function useStockRefresh(): StockRefreshContextType {
  const context = useContext(StockRefreshContext);
  if (!context) {
    throw new Error("useStockRefresh must be used within a StockRefreshProvider");
  }
  return context;
}

export default StockRefreshContext;

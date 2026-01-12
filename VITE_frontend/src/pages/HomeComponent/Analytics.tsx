import {
    DailyPicker,
    MonthlyPicker,
    WeeklyPicker,
    YearlyPicker,
} from "@/components/analytics/DatePickers";
import {
    Granularity,
    GranularitySelector,
} from "@/components/analytics/GranularitySelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useTheContext } from "@/context";
import { BASE_URL } from "@/env";
import { DollarSign, Package, TrendingUp, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface AnalyticsData {
  period: { name: string; start: string; end: string };
  current: {
    totalSales: number;
    transactionCount: number;
    itemsSold: number;
    averageTransaction: number;
  };
  comparison: {
    totalSales: number;
    transactionCount: number;
  } | null;
  growth: { percentage: number; isPositive: boolean };
  chartType: "hourly" | "daily" | "monthly";
  chartData: Array<{
    label?: string;
    hour?: string;
    month?: string;
    sales: number;
    transactions: number;
  }>;
}

interface TopSellingItem {
  medID: string;
  name: string;
  quantity: number;
  revenue: number;
}

interface DateSelection {
  date: Date;
  month: number;
  year: number;
}

// Calculate date range based on granularity and selection
function getDateRange(
  granularity: Granularity,
  selection: DateSelection
): { startDate: string; endDate: string } {
  const { date, month, year } = selection;

  switch (granularity) {
    case "daily": {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return {
        startDate: d.toISOString(),
        endDate: new Date(d.getTime() + 86400000 - 1).toISOString(),
      };
    }
    case "weekly": {
      const start = new Date(date);
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case "monthly": {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case "yearly": {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59, 999);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
  }
}

export default function Analytics() {
  const { toast } = useToast();
  const { token, userEmail } = useTheContext() as any;
  const abortControllerRef = useRef<AbortController | null>(null);

  const today = new Date();
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const [dateSelection, setDateSelection] = useState<DateSelection>({
    date: today,
    month: today.getMonth(),
    year: today.getFullYear(),
  });

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [topSelling, setTopSelling] = useState<TopSellingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTop, setIsLoadingTop] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    const { startDate, endDate } = getDateRange(granularity, dateSelection);

    try {
      const response = await fetch(`${BASE_URL}/store/analytics/sales`, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          storeEmail: userEmail,
          period: "custom",
          startDate,
          endDate,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (response.ok) {
        const result = await response.json();
        setAnalytics(result.data);
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Load",
          description: "Unable to fetch analytics data.",
        });
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Analytics fetch error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [granularity, dateSelection, token, userEmail, toast]);

  const fetchTopSelling = useCallback(async () => {
    setIsLoadingTop(true);
    try {
      const response = await fetch(`${BASE_URL}/store/analytics/top-selling`, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          storeEmail: userEmail,
          period: granularity === "yearly" ? "thisYear" : "thisMonth",
          limit: "5",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setTopSelling(result.data || []);
      }
    } catch (error) {
      console.error("Top selling fetch error:", error);
    } finally {
      setIsLoadingTop(false);
    }
  }, [token, userEmail, granularity]);

  useEffect(() => {
    fetchAnalytics();
    fetchTopSelling();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAnalytics, fetchTopSelling]);

  const getChartLabel = () => {
    if (!analytics) return "label";
    switch (analytics.chartType) {
      case "hourly":
        return "hour";
      case "monthly":
        return "month";
      default:
        return "label";
    }
  };

  const handleDateChange = (date: Date) => {
    setDateSelection((prev) => ({ ...prev, date }));
  };

  const handleMonthChange = (month: number, year: number) => {
    setDateSelection((prev) => ({ ...prev, month, year }));
  };

  const handleYearChange = (year: number) => {
    setDateSelection((prev) => ({ ...prev, year }));
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <GranularitySelector value={granularity} onChange={setGranularity} />

            <div className="flex items-center">
              {granularity === "daily" && (
                <DailyPicker value={dateSelection.date} onChange={handleDateChange} />
              )}
              {granularity === "weekly" && (
                <WeeklyPicker value={dateSelection.date} onChange={handleDateChange} />
              )}
              {granularity === "monthly" && (
                <MonthlyPicker
                  month={dateSelection.month}
                  year={dateSelection.year}
                  onChange={handleMonthChange}
                />
              )}
              {granularity === "yearly" && (
                <YearlyPicker year={dateSelection.year} onChange={handleYearChange} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sales"
          value={analytics?.current.totalSales}
          prefix="$"
          icon={DollarSign}
          isLoading={isLoading}
          growth={analytics?.growth}
        />
        <StatCard
          title="Transactions"
          value={analytics?.current.transactionCount}
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard
          title="Items Sold"
          value={analytics?.current.itemsSold}
          icon={Package}
          isLoading={isLoading}
        />
        <StatCard
          title="Avg Transaction"
          value={analytics?.current.averageTransaction}
          prefix="$"
          icon={TrendingUp}
          isLoading={isLoading}
        />
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Sales Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[280px] w-full" />
          ) : analytics && analytics.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={analytics.chartData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis
                  dataKey={getChartLabel()}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={50} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, "Sales"]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
              No sales data for this period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Top Selling</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTop ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : topSelling.length > 0 ? (
              <div className="space-y-2">
                {topSelling.map((item, index) => (
                  <div
                    key={item.medID}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? "bg-yellow-500 text-yellow-950"
                            : index === 1
                            ? "bg-gray-300 text-gray-700"
                            : index === 2
                            ? "bg-orange-400 text-orange-950"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} units</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm">${item.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8 text-sm">
                No sales data for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Volume */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Transaction Volume</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : analytics && analytics.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={analytics.chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <XAxis
                    dataKey={getChartLabel()}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="transactions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
                No transaction data
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value?: number;
  prefix?: string;
  icon: React.ElementType;
  isLoading: boolean;
  growth?: { percentage: number; isPositive: boolean };
}

function StatCard({ title, value, prefix = "", icon: Icon, isLoading, growth }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        {isLoading ? (
          <>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-7 w-24" />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-muted-foreground">{title}</p>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold">
              {prefix}
              {value?.toFixed(prefix === "$" ? 2 : 0) ?? "0"}
            </p>
            {growth && (
              <p
                className={`text-xs mt-1 ${
                  growth.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {growth.isPositive ? "+" : ""}
                {growth.percentage}% vs previous
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

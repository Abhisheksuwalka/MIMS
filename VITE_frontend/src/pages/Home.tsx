import { PageLoader } from "@/components/LoadingSpinner";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTheContext } from "@/context";
import { BASE_URL, STORE_DATA_ROUTE } from "@/env";
import { useBackendStatus } from "@/hooks/useBackendStatus";
import {
  BarChart3,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Receipt,
  Sun,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddStock from "./HomeComponent/AddStock";
import Analytics from "./HomeComponent/Analytics";
import Billing from "./HomeComponent/Billing";
import HistoryComponent from "./HomeComponent/History";
import RemoveStock from "./HomeComponent/RemoveStock";
import Stocks from "./HomeComponent/Stock";

type TabType = "stock" | "billing" | "history" | "analytics";

export default function Home() {
  const { toast } = useToast();
  const { userEmail, token, setUserData, userData, LogOut: logoutFn } = useTheContext() as any;
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<TabType>("stock");
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const backendStatus = useBackendStatus();

  useEffect(() => {
    if (!userEmail || !token) {
      toast({
        title: "Session Expired",
        description: "Please log in again to continue.",
      });
      navigate("/");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(BASE_URL + STORE_DATA_ROUTE, {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ storeEmail: userEmail }),
        });

        if (response.ok) {
          const result = await response.json();
          // Handle both wrapped (new format) and unwrapped (legacy) responses
          const storeData = result.data || result;
          setUserData(storeData);
          checkLowStock(); // Check alerts after user data
        } else {
          toast({
            variant: "destructive",
            title: "Session Expired",
            description: "Please log in again.",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Unable to connect to server.",
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    const checkLowStock = async () => {
      try {
        const response = await fetch(`${BASE_URL}/store/alerts/low-stock?storeEmail=${userEmail}`, {
          headers: { Authorization: token }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.count > 0) {
            toast({
              variant: "destructive", // or warning if available, destructive is red
              title: "Low Stock Alert ⚠️",
              description: `You have ${data.count} items running low on stock.`,
              duration: 6000,
            });
          }
        }
      } catch (e) {
        console.error("Alert check failed", e);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    logoutFn();
    navigate("/");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const navItems = [
    { id: "stock" as TabType, label: "Inventory", icon: Package },
    { id: "billing" as TabType, label: "Billing", icon: Receipt },
    { id: "history" as TabType, label: "History", icon: History },
    { id: "analytics" as TabType, label: "Analytics", icon: BarChart3 },
  ];

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                backendStatus === "offline" ? "bg-destructive" : "bg-primary"
              }`}>
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className={`font-bold text-lg ${
                  backendStatus === "offline" ? "text-destructive" : ""
                }`}>
                  MIMS
                </span>
                {backendStatus === "offline" && (
                  <span className="text-xs text-destructive">Server Offline</span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Store Info */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {userData?.storeName?.charAt(0)?.toUpperCase() || "S"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {userData?.storeName || "Loading..."}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userData?.address || ""}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b bg-card/80 backdrop-blur-md px-4 py-3 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold">
                {activeTab === "stock" && "Inventory Management"}
                {activeTab === "billing" && "Create Bill"}
                {activeTab === "history" && "Billing History"}
                {activeTab === "analytics" && "Sales Analytics"}
              </h1>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {activeTab === "stock" && (
              <>
                <AddStock />
                <RemoveStock />
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto animate-fade-in">
            {activeTab === "stock" && <Stocks />}
            {activeTab === "billing" && <Billing />}
            {activeTab === "history" && <HistoryComponent />}
            {activeTab === "analytics" && <Analytics />}
          </div>
        </main>
      </div>
    </div>
  );
}
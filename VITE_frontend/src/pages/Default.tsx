import { ButtonSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useTheContext } from "@/context";
import { validateSignupForm } from "@/lib/validation";
import { BarChart3, Clock, Lock, Mail, MapPin, Package, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL, LOGIN_ROUTE, SIGNUP_ROUTE } from "../env";

export default function Default() {
  const { setToken, setUserEmail, token, userEmail } = useTheContext() as any;
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (token && userEmail) {
      navigate("/home");
    }
  }, [token, userEmail, navigate]);

  // Loading states
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Signup variables
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storeEmailSignup, setStoreEmailSignup] = useState("");
  const [storePasswordSignup, setStorePasswordSignup] = useState("");
  const [storePasswordRe, setStorePasswordRe] = useState("");
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});

  // Login variables
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const handleSignup = async () => {
    // Reset errors
    setSignupErrors({});

    // Validate passwords match
    if (storePasswordSignup !== storePasswordRe) {
      setSignupErrors(err => ({ ...err, confirmPassword: "Passwords do not match" }));
      return;
    }

    // Run shared validation
    const validation = validateSignupForm({
      storeName,
      address: storeAddress,
      storeEmail: storeEmailSignup,
      _password: storePasswordSignup,
    });

    if (!validation.isValid) {
      setSignupErrors(prev => ({ ...prev, ...validation.errors }));
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please check the highlighted fields.",
      });
      return;
    }

    setIsSigningUp(true);

    try {
      const response = await fetch(BASE_URL + SIGNUP_ROUTE, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          storeEmail: storeEmailSignup,
          storeName: storeName,
          _password: storePasswordSignup,
          address: storeAddress,
        }),
      });

      if (response.status === 422 || response.status === 409) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "This email may already be registered. Please try logging in.",
        });
        return;
      }

      toast({
        title: "Account Created! 🎉",
        description: "You can now log in with your credentials.",
      });

      // Clear form and switch to login
      setStoreName("");
      setStoreAddress("");
      setStoreEmailSignup("");
      setStorePasswordSignup("");
      setStorePasswordRe("");
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to connect to server. Please try again.",
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Missing Credentials",
        description: "Please enter your email and password.",
      });
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await fetch(BASE_URL + LOGIN_ROUTE, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          storeEmail: email,
          _password: password,
        }),
      });

      if (response.status === 401) {
        toast({
          variant: "destructive",
          title: "Incorrect Password",
          description: "The password you entered is incorrect.",
        });
        return;
      }

      if (response.status === 402) {
        toast({
          variant: "destructive",
          title: "Account Not Found",
          description: "No account exists with this email. Please sign up first.",
        });
        return;
      }

      if (response.status === 422) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Something went wrong. Please try again.",
        });
        return;
      }

      if (response.status === 200) {
        const token = await response.text();
        toast({
          title: "Welcome Back! 👋",
          description: "Redirecting to your dashboard...",
        });
        setToken(token);
        setUserEmail(email);
        navigate("/home");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to connect to server. Please try again.",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const features = [
    {
      icon: Package,
      title: "Inventory Tracking",
      description: "Real-time stock monitoring with low-stock alerts",
    },
    {
      icon: BarChart3,
      title: "Sales Analytics",
      description: "Track billing history and generate reports",
    },
    {
      icon: Clock,
      title: "Expiry Management",
      description: "Never miss expiration dates with smart tracking",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Your data is protected with industry-standard security",
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-between w-full p-12">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">MIMS</span>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white leading-tight">
                Medical Inventory
                <br />
                Management System
              </h1>
              <p className="text-lg text-white/80 mt-4 max-w-md">
                Streamline your pharmacy operations with intelligent inventory
                tracking, billing, and analytics.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
                >
                  <feature.icon className="h-6 w-6 text-white mb-2" />
                  <h3 className="font-medium text-white text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 text-xs mt-1">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-white/60">
            © 2024 MIMS. Built for healthcare professionals.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/4 -right-10 w-40 h-40 rounded-full bg-white/5" />
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">MIMS</span>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="animate-fade-in">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl">Welcome back</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        disabled={isLoggingIn}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        disabled={isLoggingIn}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <>
                        <ButtonSpinner className="mr-2" />
                        Logging in...
                      </>
                    ) : (
                      "Log In"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="animate-fade-in">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl">Create an account</CardTitle>
                  <CardDescription>
                    Set up your store to start managing inventory
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={storeEmailSignup}
                        onChange={(e) => setStoreEmailSignup(e.target.value)}
                        className={`pl-10 ${signupErrors.storeEmail ? "border-destructive" : ""}`}
                        disabled={isSigningUp}
                      />
                    </div>
                    {signupErrors.storeEmail && (
                      <p className="text-xs text-destructive mt-1">{signupErrors.storeEmail}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-name">Store Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="store-name"
                        type="text"
                        placeholder="City Medical Store"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className={`pl-10 ${signupErrors.storeName ? "border-destructive" : ""}`}
                        disabled={isSigningUp}
                      />
                    </div>
                    {signupErrors.storeName && (
                      <p className="text-xs text-destructive mt-1">{signupErrors.storeName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-address">Store Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="store-address"
                        type="text"
                        placeholder="123 Main Street"
                        value={storeAddress}
                        onChange={(e) => setStoreAddress(e.target.value)}
                        className={`pl-10 ${signupErrors.address ? "border-destructive" : ""}`}
                        disabled={isSigningUp}
                      />
                    </div>
                    {signupErrors.address && (
                      <p className="text-xs text-destructive mt-1">{signupErrors.address}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••"
                          value={storePasswordSignup}
                          onChange={(e) => setStorePasswordSignup(e.target.value)}
                          className={`pl-10 ${signupErrors.password ? "border-destructive" : ""}`}
                          disabled={isSigningUp}
                        />
                      </div>
                      {signupErrors.password && (
                        <p className="text-xs text-destructive mt-1">{signupErrors.password}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="••••••"
                          value={storePasswordRe}
                          onChange={(e) => setStorePasswordRe(e.target.value)}
                          className={`pl-10 ${signupErrors.confirmPassword ? "border-destructive" : ""}`}
                          disabled={isSigningUp}
                        />
                      </div>
                      {signupErrors.confirmPassword && (
                        <p className="text-xs text-destructive mt-1">{signupErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleSignup}
                    disabled={isSigningUp}
                  >
                    {isSigningUp ? (
                      <>
                        <ButtonSpinner className="mr-2" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
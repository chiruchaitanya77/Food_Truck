import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { setAuthToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LockKeyhole } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useAdminLogin();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login.mutateAsync({ data: { email, password } });
      setAuthToken(res.token);
      toast({ title: "Welcome back!", description: "Login successful." });
      setLocation("/admin");
    } catch (err: any) {
      toast({ 
        title: "Login failed", 
        description: err.response?.data?.error || "Invalid credentials", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <LockKeyhole className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-display text-center mb-2 tracking-wide text-gray-900">Admin Access</h1>
        <p className="text-gray-500 text-center font-medium mb-8">Enter your credentials to manage the truck.</p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <Input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="h-12 bg-gray-50 border-gray-200 rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <Input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="h-12 bg-gray-50 border-gray-200 rounded-xl"
              required
            />
          </div>
          <Button 
            type="submit" 
            disabled={login.isPending} 
            className="w-full h-12 text-lg rounded-xl bg-primary hover:bg-primary/90"
          >
            {login.isPending ? "Authenticating..." : "Login to Dashboard"}
          </Button>
        </form>
      </div>
    </div>
  );
}

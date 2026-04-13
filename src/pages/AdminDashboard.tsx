import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FileSidebar } from "@/components/FileSidebar";
import { Button } from "@/components/ui/button";
import { LogOut, GraduationCap } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");

      if (!roles || roles.length === 0) {
        await supabase.auth.signOut();
        navigate("/admin");
        return;
      }
      setChecking(false);
    };
    checkAdmin();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
    navigate("/admin");
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Verifying admin access...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <FileSidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground text-lg">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Manage university documents</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3 max-w-md">
            <h2 className="text-xl font-semibold text-foreground">Document Management</h2>
            <p className="text-muted-foreground text-sm">
              Upload PDF documents using the sidebar. These documents will be used by the chatbot to answer student queries.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

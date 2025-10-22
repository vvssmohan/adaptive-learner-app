import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Home, Users, LogOut, Brain } from "lucide-react";

export const Navigation = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error logging out");
    } else {
      toast.success("Logged out successfully");
      navigate("/auth");
    }
  };

  return (
    <nav className="fixed top-0 right-0 z-50 p-4 flex items-center gap-3">
      <Link to="/dashboard">
        <Button variant="ghost" size="sm" className="gap-2">
          <Home className="h-4 w-4" />
          HOME
        </Button>
      </Link>
      <Link to="/performance">
        <Button variant="ghost" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          PERFORMANCE
        </Button>
      </Link>
      <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
        <LogOut className="h-4 w-4" />
        LOGOUT
      </Button>
    </nav>
  );
};

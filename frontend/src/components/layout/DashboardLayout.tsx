import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { AgentBalloon } from "@/components/agent/AgentBalloon";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Button - Only visible on mobile/tablet */}
      <div className="fixed left-4 top-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(true)}
          className="bg-background shadow-md"
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* Main Content - Responsive padding */}
      <main className="pl-0 lg:pl-64 transition-all duration-300">
        <div className="min-h-screen p-6 pt-20 lg:pt-6">
          {children}
        </div>
      </main>

      <AgentBalloon />
    </div>
  );
}

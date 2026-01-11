import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: "default" | "auto" | "piva" | "casa";
}

const variantStyles = {
  default: "bg-card border",
  auto: "bg-gradient-to-br from-auto/10 to-auto/5 border-auto/20",
  piva: "bg-gradient-to-br from-piva/10 to-piva/5 border-piva/20",
  casa: "bg-gradient-to-br from-casa/10 to-casa/5 border-casa/20",
};

const iconStyles = {
  default: "bg-primary/10 text-primary",
  auto: "bg-auto/20 text-auto",
  piva: "bg-piva/20 text-piva",
  casa: "bg-casa/20 text-casa",
};

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  variant = "default" 
}: StatsCardProps) {
  return (
    <div className={cn("stat-card", variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className={cn(
              "mt-2 inline-flex items-center gap-1 text-xs font-medium",
              trend.positive ? "text-success" : "text-destructive"
            )}>
              <span>{trend.positive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground">vs mese scorso</span>
            </div>
          )}
        </div>
        <div className={cn("rounded-xl p-3", iconStyles[variant])}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

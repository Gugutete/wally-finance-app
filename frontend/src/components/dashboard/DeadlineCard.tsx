import { cn } from "@/lib/utils";
import { Calendar, Car, Receipt, Home, AlertCircle, Clock } from "lucide-react";

type DeadlineModule = "auto" | "piva" | "casa";
type DeadlineStatus = "urgent" | "warning" | "safe";

interface DeadlineCardProps {
  title: string;
  description: string;
  date: string;
  daysRemaining: number;
  amount?: string;
  module: DeadlineModule;
  status: DeadlineStatus;
}

const moduleIcons = {
  auto: Car,
  piva: Receipt,
  casa: Home,
};

const moduleLabels = {
  auto: "Veicolo",
  piva: "P.IVA",
  casa: "Casa",
};

const statusStyles = {
  urgent: {
    container: "border-destructive/30 bg-destructive/5",
    badge: "bg-destructive/15 text-destructive",
    icon: "text-destructive",
  },
  warning: {
    container: "border-warning/30 bg-warning/5",
    badge: "bg-warning/15 text-warning",
    icon: "text-warning",
  },
  safe: {
    container: "border-success/30 bg-success/5",
    badge: "bg-success/15 text-success",
    icon: "text-success",
  },
};

export function DeadlineCard({
  title,
  description,
  date,
  daysRemaining,
  amount,
  module,
  status,
}: DeadlineCardProps) {
  const Icon = moduleIcons[module];
  const styles = statusStyles[status];

  return (
    <div className={cn("card-module p-4", styles.container)}>
      <div className="flex items-start gap-4">
        <div className={cn("rounded-xl p-2.5", `module-badge-${module}`)}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("module-badge", `module-badge-${module}`)}>
              {moduleLabels[module]}
            </span>
            {status === "urgent" && (
              <span className={cn("module-badge", styles.badge)}>
                <AlertCircle size={12} />
                Urgente
              </span>
            )}
          </div>
          <h4 className="font-display font-semibold text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar size={14} className="text-muted-foreground" />
              <span className="text-muted-foreground">{date}</span>
            </div>
            <div className={cn("flex items-center gap-1.5 text-sm font-medium", styles.icon)}>
              <Clock size={14} />
              <span>
                {daysRemaining === 0 
                  ? "Oggi!" 
                  : daysRemaining === 1 
                    ? "Domani" 
                    : `${daysRemaining} giorni`}
              </span>
            </div>
            {amount && (
              <div className="ml-auto">
                <span className="font-display font-semibold">{amount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

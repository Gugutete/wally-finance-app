import { CheckCircle2, AlertCircle, Bell, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "success" | "warning" | "info" | "reminder";
  title: string;
  description: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "success",
    title: "Bollo pagato",
    description: "Fiat 500 - AB123CD",
    time: "2 ore fa",
  },
  {
    id: "2",
    type: "reminder",
    title: "Promemoria scadenza",
    description: "Acconto IVA 2° trimestre",
    time: "5 ore fa",
  },
  {
    id: "3",
    type: "info",
    title: "Nuovo bando disponibile",
    description: "Contributi digitalizzazione PMI",
    time: "Ieri",
  },
  {
    id: "4",
    type: "warning",
    title: "Revisione in scadenza",
    description: "Volkswagen Golf - XY987ZZ",
    time: "2 giorni fa",
  },
];

const typeStyles = {
  success: {
    icon: CheckCircle2,
    bg: "bg-success/10",
    text: "text-success",
  },
  warning: {
    icon: AlertCircle,
    bg: "bg-warning/10",
    text: "text-warning",
  },
  info: {
    icon: Bell,
    bg: "bg-primary/10",
    text: "text-primary",
  },
  reminder: {
    icon: Calendar,
    bg: "bg-piva/10",
    text: "text-piva",
  },
};

export function RecentActivity() {
  return (
    <div className="card-module p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg">Attività recenti</h3>
        <button className="text-sm text-primary hover:underline">Vedi tutto</button>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity) => {
          const styles = typeStyles[activity.type];
          const Icon = styles.icon;
          
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={cn("rounded-lg p-2", styles.bg)}>
                <Icon size={16} className={styles.text} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {activity.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

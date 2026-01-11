import { Plus, Car, Receipt, Home, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const actions = [
  { icon: Car, label: "Aggiungi veicolo", module: "auto" as const, path: "/veicoli" },
  { icon: Receipt, label: "Nuova fattura", module: "piva" as const, path: "/piva" },
  { icon: Home, label: "Registra spesa", module: "casa" as const, path: "/casa" },
  { icon: FileText, label: "Scarica report", module: "default" as const, path: "/calendario" },
];

const buttonStyles = {
  auto: "border-auto/30 text-auto hover:bg-auto/10",
  piva: "border-piva/30 text-piva hover:bg-piva/10",
  casa: "border-casa/30 text-casa hover:bg-casa/10",
  default: "border-primary/30 text-primary hover:bg-primary/10",
};

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="card-module p-5">
      <h3 className="font-display font-semibold text-lg mb-4">Azioni rapide</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className={`h-auto flex-col gap-2 py-4 ${buttonStyles[action.module]}`}
            onClick={() => navigate(action.path)}
          >
            <action.icon size={22} />
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

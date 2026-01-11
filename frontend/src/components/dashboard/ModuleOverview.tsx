import { Car, Receipt, Home, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const modules = [
  {
    id: "auto",
    name: "Veicoli",
    icon: Car,
    description: "Gestisci bollo, revisione e assicurazione",
    stats: "2 veicoli • 1 scadenza",
    path: "/veicoli",
    gradient: "from-auto to-auto/80",
  },
  {
    id: "piva",
    name: "Partita IVA",
    icon: Receipt,
    description: "Traccia fatturato, scadenze fiscali e bandi",
    stats: "€24.500 fatturato • 2 scadenze",
    path: "/piva",
    gradient: "from-piva to-piva/80",
  },
  {
    id: "casa",
    name: "Casa",
    icon: Home,
    description: "Monitora utenze, condominio e spese",
    stats: "€450/mese • 3 pagamenti",
    path: "/casa",
    gradient: "from-casa to-casa/80",
  },
];

export function ModuleOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {modules.map((module) => (
        <Link
          key={module.id}
          to={module.path}
          className="group relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]"
        >
          {/* Gradient Background */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-90",
            module.gradient
          )} />
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">
                <module.icon className="h-6 w-6 text-white" />
              </div>
              <ArrowRight className="h-5 w-5 text-white/70 group-hover:translate-x-1 transition-transform" />
            </div>
            
            <h3 className="mt-4 font-display text-xl font-semibold text-white">
              {module.name}
            </h3>
            <p className="mt-1 text-sm text-white/80">{module.description}</p>
            
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm font-medium text-white/90">{module.stats}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

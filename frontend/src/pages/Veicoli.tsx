import { useState } from "react";
import { Car, Plus, Calendar, Shield, Wrench, MoreVertical, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useVehicles } from "@/hooks/useVehicles";
import { AddVehicleDialog } from "@/components/vehicles/AddVehicleDialog";

interface Vehicle {
  id: string;
  targa: string;
  marca: string;
  modello: string;
  immatricolazione: string;
  potenzaKw: number;
  classeAmbientale: string;
  regione: string;
  deadlines: {
    bollo: { date: string; amount: string; status: "paid" | "pending" | "overdue" };
    revisione: { date: string; status: "ok" | "upcoming" | "overdue" };
    assicurazione: { date: string; status: "active" | "expiring" | "expired" };
  };
}

// Helper function to format date from YYYY-MM-DD to DD/MM/YYYY
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Helper function to format amount
const formatAmount = (amount: number | null): string => {
  if (!amount) return "N/A";
  return `€${amount.toFixed(0)}`;
}

const statusColors = {
  paid: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  overdue: "bg-destructive/10 text-destructive",
  ok: "bg-success/10 text-success",
  upcoming: "bg-warning/10 text-warning",
  active: "bg-success/10 text-success",
  expiring: "bg-warning/10 text-warning",
  expired: "bg-destructive/10 text-destructive",
};

const statusLabels = {
  paid: "Pagato",
  pending: "Da pagare",
  overdue: "Scaduto",
  ok: "In regola",
  upcoming: "In scadenza",
  active: "Attiva",
  expiring: "In scadenza",
  expired: "Scaduta",
};

export default function Veicoli() {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch vehicles from Supabase
  const { data: vehiclesData, isLoading, error } = useVehicles();

  // Transform database structure to match component interface
  const vehicles: Vehicle[] = vehiclesData?.map(vehicle => {
    const deadlines = vehicle.vehicle_deadlines || [];

    const bollo = deadlines.find(d => d.deadline_type === 'bollo');
    const revisione = deadlines.find(d => d.deadline_type === 'revisione');
    const assicurazione = deadlines.find(d => d.deadline_type === 'assicurazione');

    return {
      id: vehicle.id,
      targa: vehicle.targa || "",
      marca: vehicle.marca || "",
      modello: vehicle.modello || "",
      immatricolazione: vehicle.immatricolazione || "",
      potenzaKw: vehicle.potenza_kw || 0,
      classeAmbientale: vehicle.classe_ambientale || "",
      regione: vehicle.regione || "",
      deadlines: {
        bollo: {
          date: formatDate(bollo?.due_date || null),
          amount: formatAmount(bollo?.amount || null),
          status: (bollo?.status as "paid" | "pending" | "overdue") || "pending"
        },
        revisione: {
          date: formatDate(revisione?.due_date || null),
          status: (revisione?.status as "ok" | "upcoming" | "overdue") || "ok"
        },
        assicurazione: {
          date: formatDate(assicurazione?.due_date || null),
          status: (assicurazione?.status as "active" | "expiring" | "expired") || "active"
        }
      }
    };
  }) || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Caricamento veicoli...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3 max-w-md">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="font-display font-semibold text-lg">Errore nel caricamento</h3>
          <p className="text-sm text-muted-foreground">
            Si è verificato un errore durante il caricamento dei veicoli. Riprova più tardi.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Ricarica pagina
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Veicoli</h1>
          <p className="mt-1 text-muted-foreground">
            Gestisci bollo, revisione e assicurazione dei tuoi veicoli
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={18} />
          Aggiungi veicolo
        </Button>
      </div>

      {/* Empty state - No vehicles */}
      {vehicles.length === 0 && (
        <div className="card-module p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-auto/10 flex items-center justify-center mb-4">
            <Car size={32} className="text-auto" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">Nessun veicolo registrato</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Aggiungi il tuo primo veicolo per iniziare a tracciare bollo, revisione e assicurazione automaticamente.
          </p>
          <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
            <Plus size={18} />
            Aggiungi il primo veicolo
          </Button>
        </div>
      )}

      {/* Vehicles Grid */}
      {vehicles.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="card-module overflow-hidden"
          >
            {/* Vehicle Header */}
            <div className="bg-gradient-to-br from-auto to-auto/80 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                    <Car className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-white">
                      {vehicle.marca} {vehicle.modello}
                    </h3>
                    <p className="text-white/80 font-mono">{vehicle.targa}</p>
                  </div>
                </div>
                <button className="rounded-lg p-2 text-white/70 hover:bg-white/10">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Potenza</p>
                  <p className="font-medium">{vehicle.potenzaKw} kW</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Classe</p>
                  <p className="font-medium">{vehicle.classeAmbientale}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-muted-foreground">Regione</p>
                  <p className="font-medium">{vehicle.regione}</p>
                </div>
              </div>

              {/* Deadlines */}
              <div className="space-y-3 pt-4 border-t">
                {/* Bollo */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Bollo</p>
                      <p className="text-xs text-muted-foreground">
                        Scade: {vehicle.deadlines.bollo.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{vehicle.deadlines.bollo.amount}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      statusColors[vehicle.deadlines.bollo.status]
                    )}>
                      {statusLabels[vehicle.deadlines.bollo.status]}
                    </span>
                  </div>
                </div>

                {/* Revisione */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Wrench size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Revisione</p>
                      <p className="text-xs text-muted-foreground">
                        Scade: {vehicle.deadlines.revisione.date}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    statusColors[vehicle.deadlines.revisione.status]
                  )}>
                    {statusLabels[vehicle.deadlines.revisione.status]}
                  </span>
                </div>

                {/* Assicurazione */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Assicurazione</p>
                      <p className="text-xs text-muted-foreground">
                        Scade: {vehicle.deadlines.assicurazione.date}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    statusColors[vehicle.deadlines.assicurazione.status]
                  )}>
                    {statusLabels[vehicle.deadlines.assicurazione.status]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Add another vehicle card - only show if there are existing vehicles */}
      {vehicles.length > 0 && (
        <div className="card-module border-dashed border-2 p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Plus size={24} className="text-muted-foreground" />
          </div>
          <h3 className="font-display font-semibold">Aggiungi un altro veicolo</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Wally calcolerà automaticamente bollo, revisione e ti ricorderà le scadenze
          </p>
          <Button variant="outline" className="mt-4 gap-2" onClick={() => setIsAddDialogOpen(true)}>
            <Plus size={16} />
            Aggiungi veicolo
          </Button>
        </div>
      )}

      {/* Add Vehicle Dialog */}
      <AddVehicleDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  );
}

import { Car, Receipt, Home, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DeadlineCard } from "@/components/dashboard/DeadlineCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ModuleOverview } from "@/components/dashboard/ModuleOverview";
import { useVehicles } from "@/hooks/useVehicles";
import { useHomeExpenses } from "@/hooks/useHomeExpenses";
import { useTaxDeadlines } from "@/hooks/useTaxDeadlines";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { Button } from "@/components/ui/button";

// Helper to calculate days remaining
const getDaysRemaining = (dateStr: string | null): number => {
  if (!dateStr) return 0;
  const date = new Date(dateStr);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Helper to format date
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Helper to determine status based on days remaining
const getStatus = (daysRemaining: number): "urgent" | "warning" | "safe" => {
  if (daysRemaining <= 7) return "urgent";
  if (daysRemaining <= 30) return "warning";
  return "safe";
};

export default function Dashboard() {
  // Fetch data from all sources
  const { data: vehicles, isLoading: loadingVehicles, error: errorVehicles } = useVehicles();
  const { data: homeExpenses, isLoading: loadingExpenses, error: errorExpenses } = useHomeExpenses();
  const { data: taxDeadlines, isLoading: loadingTax, error: errorTax } = useTaxDeadlines();
  const { data: calendarEvents, isLoading: loadingCalendar, error: errorCalendar } = useCalendarEvents();

  const isLoading = loadingVehicles || loadingExpenses || loadingTax || loadingCalendar;
  const error = errorVehicles || errorExpenses || errorTax || errorCalendar;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Caricamento dashboard...</p>
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
            Si è verificato un errore durante il caricamento della dashboard. Riprova più tardi.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Ricarica pagina
          </Button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const vehicleCount = vehicles?.length || 0;
  const totalExpenses = homeExpenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
  const avgMonthlyExpenses = totalExpenses > 0 ? Math.round(totalExpenses / 3) : 0; // Simplified: divide by 3 months
  const activeDeadlinesCount = calendarEvents?.length || 0;

  // Aggregate upcoming deadlines from calendar events
  const upcomingDeadlines = (calendarEvents || [])
    .filter(event => {
      const daysRemaining = getDaysRemaining(event.event_date);
      return daysRemaining >= 0 && daysRemaining <= 30; // Show events within next 30 days
    })
    .map(event => ({
      title: event.title || "",
      description: event.event_type || "",
      date: formatDate(event.event_date),
      daysRemaining: getDaysRemaining(event.event_date),
      amount: event.amount ? `€${event.amount.toLocaleString('it-IT')}` : undefined,
      module: (event.module || "general") as "auto" | "piva" | "casa" | "general",
      status: getStatus(getDaysRemaining(event.event_date))
    }))
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 5); // Show top 5 upcoming

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold">
          Buongiorno! 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          Ecco un riepilogo delle tue attività e scadenze
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Veicoli registrati"
          value={vehicleCount.toString()}
          description={vehicleCount > 0 ? `${vehicleCount} ${vehicleCount === 1 ? 'veicolo' : 'veicoli'}` : "Nessun veicolo"}
          icon={Car}
          variant="auto"
        />
        <StatsCard
          title="Fatturato YTD"
          value="€--"
          description="Collega FattureInCloud"
          icon={Receipt}
          variant="piva"
        />
        <StatsCard
          title="Spese casa/mese"
          value={avgMonthlyExpenses > 0 ? `€${avgMonthlyExpenses}` : "€0"}
          description="Media mensile"
          icon={Home}
          variant="casa"
        />
        <StatsCard
          title="Scadenze attive"
          value={activeDeadlinesCount.toString()}
          description={upcomingDeadlines.length > 0 ? `${upcomingDeadlines.length} imminenti` : "Nessuna scadenza"}
          icon={TrendingUp}
        />
      </div>

      {/* Module Overview */}
      <section>
        <h2 className="font-display text-xl font-semibold mb-4">I tuoi moduli</h2>
        <ModuleOverview />
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deadlines Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Prossime scadenze</h2>
            <button className="text-sm text-primary hover:underline">Vedi calendario</button>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <div className="card-module p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <TrendingUp size={24} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Nessuna scadenza nei prossimi 30 giorni</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline, index) => (
                <DeadlineCard key={index} {...deadline} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <QuickActions />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}

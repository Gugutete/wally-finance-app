import { Home, Zap, Flame, Droplets, Wifi, Building2, Plus, TrendingDown, TrendingUp, Calendar, Loader2, AlertCircle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHomeExpenses } from "@/hooks/useHomeExpenses";

interface Expense {
  id: string;
  category: string;
  provider: string;
  amount: string;
  dueDate: string;
  frequency: string;
  icon: any;
  status: "paid" | "pending" | "overdue";
}

// Helper function to map category to icon
const getCategoryIcon = (category: string) => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('luce') || categoryLower.includes('elettr')) return Zap;
  if (categoryLower.includes('gas')) return Flame;
  if (categoryLower.includes('acqua')) return Droplets;
  if (categoryLower.includes('internet') || categoryLower.includes('wifi')) return Wifi;
  if (categoryLower.includes('condominio')) return Building2;
  return Home;
};

// Helper function to format date from YYYY-MM-DD to DD/MM/YYYY
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Helper function to format amount
const formatAmount = (amount: number | null): string => {
  if (!amount) return "€0";
  return `€${amount.toFixed(0)}`;
};

// TODO: Calculate this from actual expense data grouped by month
const monthlyData = [
  { month: "Ago", amount: 420 },
  { month: "Set", amount: 455 },
  { month: "Ott", amount: 480 },
  { month: "Nov", amount: 510 },
  { month: "Dic", amount: 465 },
  { month: "Gen", amount: 450 },
];

const maxAmount = Math.max(...monthlyData.map((d) => d.amount));

const statusColors = {
  paid: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  overdue: "bg-destructive/10 text-destructive",
};

const statusLabels = {
  paid: "Pagato",
  pending: "Da pagare",
  overdue: "Scaduto",
};

export default function Casa() {
  // Fetch expenses from Supabase
  const { data: expensesData, isLoading, error } = useHomeExpenses();

  // Transform database structure to match component interface
  const expenses: Expense[] = expensesData?.map(expense => ({
    id: expense.id,
    category: expense.category || "",
    provider: expense.provider || "",
    amount: formatAmount(expense.amount),
    dueDate: formatDate(expense.due_date),
    frequency: expense.frequency || "Mensile",
    icon: getCategoryIcon(expense.category || ""),
    status: (expense.status as "paid" | "pending" | "overdue") || "pending"
  })) || [];

  const totalMonthly = expenses.reduce((sum, exp) => {
    const amount = parseFloat(exp.amount.replace("€", ""));
    return sum + amount;
  }, 0);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Caricamento spese...</p>
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
            Si è verificato un errore durante il caricamento delle spese. Riprova più tardi.
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
          <h1 className="font-display text-3xl font-bold">Casa</h1>
          <p className="mt-1 text-muted-foreground">
            Monitora utenze, condominio e spese domestiche
          </p>
        </div>
        <Button className="gap-2">
          <Plus size={18} />
          Registra spesa
        </Button>
      </div>

      {/* Empty state - No expenses */}
      {expenses.length === 0 && (
        <div className="card-module p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-casa/10 flex items-center justify-center mb-4">
            <Home size={32} className="text-casa" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">Nessuna spesa registrata</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Inizia a tracciare le tue spese domestiche per monitorare bollette, utenze e condominio.
          </p>
          <Button className="gap-2">
            <Plus size={18} />
            Registra la prima spesa
          </Button>
        </div>
      )}

      {/* Stats */}
      {expenses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Spese mese corrente"
          value={`€${totalMonthly}`}
          description="5 pagamenti"
          icon={Home}
          variant="casa"
        />
        <StatsCard
          title="Media mensile"
          value="€463"
          description="Ultimi 6 mesi"
          icon={TrendingUp}
          trend={{ value: 5, positive: false }}
        />
        <StatsCard
          title="Prossima scadenza"
          value="5 Gen"
          description="Fastweb - Internet"
          icon={Calendar}
        />
        <StatsCard
          title="Da pagare"
          value="€385"
          description="3 bollette"
          icon={TrendingDown}
        />
        </div>
      )}

      {/* Main Content */}
      {expenses.length > 0 && (
        <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenses List */}
        <div className="lg:col-span-2 card-module p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg font-semibold">Spese ricorrenti</h3>
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              Gestisci categorie
            </Button>
          </div>
          
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border hover:border-casa/30 hover:bg-casa/5 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="rounded-lg bg-casa/10 p-2.5 flex-shrink-0">
                    <expense.icon size={20} className="text-casa" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{expense.category}</p>
                    <p className="text-sm text-muted-foreground">{expense.provider}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:gap-4 pl-11 sm:pl-0">
                  <div className="text-left sm:text-right">
                    <p className="font-display font-semibold">{expense.amount}</p>
                    <p className="text-xs text-muted-foreground">{expense.frequency}</p>
                  </div>
                  <div className="text-right sm:min-w-[100px]">
                    <p className="text-sm text-muted-foreground">Scade: {expense.dueDate}</p>
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full inline-block",
                      statusColors[expense.status]
                    )}>
                      {statusLabels[expense.status]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="outline" className="w-full mt-4 gap-2">
            <Plus size={16} />
            Aggiungi nuova spesa
          </Button>
        </div>

        {/* Monthly Chart */}
        <div className="card-module p-5">
          <h3 className="font-display text-lg font-semibold mb-5">Andamento spese</h3>
          
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={data.month} className="flex items-center gap-3">
                <span className="w-8 text-sm text-muted-foreground">{data.month}</span>
                <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-lg transition-all duration-500",
                      index === monthlyData.length - 1
                        ? "bg-gradient-to-r from-casa to-casa/80"
                        : "bg-casa/40"
                    )}
                    style={{ width: `${(data.amount / maxAmount) * 100}%` }}
                  />
                </div>
                <span className="w-14 text-sm font-medium text-right">€{data.amount}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Totale 6 mesi</span>
              <span className="font-display font-semibold">
                €{monthlyData.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Media mensile</span>
              <span className="font-display font-semibold">
                €{Math.round(monthlyData.reduce((sum, d) => sum + d.amount, 0) / monthlyData.length)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card-module p-6">
        <h3 className="font-display text-lg font-semibold mb-5">Ripartizione per categoria</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: "Utenze", amount: 250, icon: Zap, color: "bg-yellow-500" },
            { name: "Gas", amount: 120, icon: Flame, color: "bg-orange-500" },
            { name: "Acqua", amount: 45, icon: Droplets, color: "bg-blue-500" },
            { name: "Internet", amount: 35, icon: Wifi, color: "bg-purple-500" },
            { name: "Condominio", amount: 180, icon: Building2, color: "bg-casa" },
          ].map((cat) => (
            <div key={cat.name} className="text-center p-4 rounded-xl bg-muted/50">
              <div className={cn("w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center", cat.color)}>
                <cat.icon size={24} className="text-white" />
              </div>
              <p className="font-display font-semibold">€{cat.amount}</p>
              <p className="text-sm text-muted-foreground">{cat.name}</p>
            </div>
          ))}
        </div>
      </div>
      </>
      )}
    </div>
  );
}

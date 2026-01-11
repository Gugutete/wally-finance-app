import { Receipt, TrendingUp, Calendar, FileText, Euro, PiggyBank, AlertCircle, ChevronRight, Loader2, Plus } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTaxDeadlines } from "@/hooks/useTaxDeadlines";
import { useVatProfile } from "@/hooks/useVatProfiles";

interface TaxDeadline {
  id: string;
  title: string;
  description: string;
  date: string;
  amount: string;
  status: "upcoming" | "paid" | "overdue";
}

// Helper function to format date
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Helper function to format amount
const formatAmount = (amount: number | null): string => {
  if (!amount) return "€0";
  return `€${amount.toLocaleString('it-IT')}`;
};

// TODO: These will be scraped by AI agents in future phases
const recentGrants = [
  {
    id: "1",
    title: "Bando Digitalizzazione PMI 2026",
    description: "Contributi fino al 50% per investimenti in tecnologie digitali",
    deadline: "15 Marzo 2026",
    region: "Nazionale",
  },
  {
    id: "2",
    title: "Fondo Impresa Femminile",
    description: "Agevolazioni per imprenditrici e libere professioniste",
    deadline: "28 Febbraio 2026",
    region: "Nazionale",
  },
  {
    id: "3",
    title: "Voucher Innovazione Lombardia",
    description: "Supporto per progetti di innovazione tecnologica",
    deadline: "10 Aprile 2026",
    region: "Lombardia",
  },
];

const statusColors = {
  upcoming: "bg-warning/10 text-warning border-warning/20",
  paid: "bg-success/10 text-success border-success/20",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Piva() {
  // Fetch data from Supabase
  const { data: taxDeadlinesData, isLoading: loadingDeadlines, error: errorDeadlines } = useTaxDeadlines();
  const { data: vatProfile, isLoading: loadingProfile, error: errorProfile } = useVatProfile();

  // Transform tax deadlines to match component interface
  const taxDeadlines: TaxDeadline[] = taxDeadlinesData?.map(deadline => ({
    id: deadline.id,
    title: deadline.title || "",
    description: deadline.description || "",
    date: formatDate(deadline.due_date),
    amount: formatAmount(deadline.amount),
    status: (deadline.status as "upcoming" | "paid" | "overdue") || "upcoming"
  })) || [];

  const isLoading = loadingDeadlines || loadingProfile;
  const error = errorDeadlines || errorProfile;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Caricamento dati P.IVA...</p>
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
            Si è verificato un errore durante il caricamento dei dati. Riprova più tardi.
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
          <h1 className="font-display text-3xl font-bold">Partita IVA</h1>
          <p className="mt-1 text-muted-foreground">
            Gestisci fatturato, scadenze fiscali e trova bandi
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="gap-2">
            <FileText size={18} />
            <span className="hidden sm:inline">Connetti FattureInCloud</span>
            <span className="sm:hidden">FattureInCloud</span>
          </Button>
          <Button className="gap-2">
            <Receipt size={18} />
            Nuova fattura
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Fatturato YTD"
          value="€24.500"
          description="Anno 2026"
          icon={Euro}
          variant="piva"
          trend={{ value: 12, positive: true }}
        />
        <StatsCard
          title="Imponibile stimato"
          value="€18.865"
          description="Coeff. 77%"
          icon={TrendingUp}
          variant="piva"
        />
        <StatsCard
          title="Imposta dovuta"
          value="€2.830"
          description="Aliquota 15%"
          icon={PiggyBank}
        />
        <StatsCard
          title="Prossima scadenza"
          value="30 Giu"
          description="Saldo + 1° acconto"
          icon={Calendar}
        />
      </div>

      {/* Profile Card */}
      {vatProfile ? (
        <div className="card-module overflow-hidden">
          <div className="bg-gradient-to-br from-piva to-piva/80 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold text-white">Profilo fiscale</h3>
                <p className="text-white/80 mt-1">{vatProfile.regime_type || "Regime forfettario"}</p>
              </div>
              <Button variant="secondary" size="sm" className="gap-2">
                Modifica
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Partita IVA</p>
              <p className="font-mono font-medium">{vatProfile.partita_iva || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Codice ATECO</p>
              <p className="font-mono font-medium">{vatProfile.codice_ateco || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Coefficiente redditività</p>
              <p className="font-medium">{vatProfile.coefficiente_redditivita ? `${vatProfile.coefficiente_redditivita}%` : "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gestione INPS</p>
              <p className="font-medium">{vatProfile.gestione_inps || "N/A"}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-module p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-piva/10 flex items-center justify-center mb-4">
            <Receipt size={32} className="text-piva" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">Configura il tuo profilo P.IVA</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Inserisci i dati della tua Partita IVA per iniziare a tracciare scadenze fiscali e calcolare le imposte.
          </p>
          <Button className="gap-2">
            <Plus size={18} />
            Crea profilo P.IVA
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tax Deadlines */}
        <div className="card-module p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg font-semibold">Scadenze fiscali</h3>
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              Aggiungi al calendario
              <Calendar size={16} />
            </Button>
          </div>

          {taxDeadlines.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 rounded-full bg-piva/10 flex items-center justify-center mb-3">
                <Calendar size={24} className="text-piva" />
              </div>
              <p className="text-sm text-muted-foreground">Nessuna scadenza fiscale registrata</p>
            </div>
          ) : (
            <div className="space-y-3">
            {taxDeadlines.map((deadline) => (
              <div
                key={deadline.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border",
                  statusColors[deadline.status]
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-piva/10 p-2.5">
                    <Calendar size={20} className="text-piva" />
                  </div>
                  <div>
                    <p className="font-medium">{deadline.title}</p>
                    <p className="text-sm text-muted-foreground">{deadline.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{deadline.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-semibold">{deadline.amount}</p>
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    deadline.status === "upcoming" && "bg-warning/20 text-warning",
                    deadline.status === "paid" && "bg-success/20 text-success",
                  )}>
                    {deadline.status === "upcoming" ? "In arrivo" : "Pagato"}
                  </span>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>

        {/* Grants & Opportunities */}
        <div className="card-module p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-lg font-semibold">Bandi e opportunità</h3>
              <p className="text-sm text-muted-foreground">Aggiornato settimanalmente da Wally</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              Vedi tutti
              <ChevronRight size={16} />
            </Button>
          </div>
          
          <div className="space-y-3">
            {recentGrants.map((grant) => (
              <div
                key={grant.id}
                className="p-4 rounded-xl border hover:border-piva/30 hover:bg-piva/5 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-medium">{grant.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{grant.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                        {grant.region}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Scadenza: {grant.deadline}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tax Forecast */}
      <div className="card-module p-6">
        <h3 className="font-display text-lg font-semibold mb-4">Previsione fiscale 2026</h3>

        {/* Desktop/Tablet Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-medium text-muted-foreground">Voce</th>
                <th className="text-right py-3 font-medium text-muted-foreground">Q1</th>
                <th className="text-right py-3 font-medium text-muted-foreground">Q2</th>
                <th className="text-right py-3 font-medium text-muted-foreground">Q3</th>
                <th className="text-right py-3 font-medium text-muted-foreground">Q4</th>
                <th className="text-right py-3 font-medium text-muted-foreground">Totale</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">Fatturato previsto</td>
                <td className="text-right py-3 font-mono">€12.000</td>
                <td className="text-right py-3 font-mono">€15.000</td>
                <td className="text-right py-3 font-mono">€10.000</td>
                <td className="text-right py-3 font-mono">€13.000</td>
                <td className="text-right py-3 font-mono font-semibold">€50.000</td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Imponibile (77%)</td>
                <td className="text-right py-3 font-mono">€9.240</td>
                <td className="text-right py-3 font-mono">€11.550</td>
                <td className="text-right py-3 font-mono">€7.700</td>
                <td className="text-right py-3 font-mono">€10.010</td>
                <td className="text-right py-3 font-mono font-semibold">€38.500</td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Imposta sostitutiva (15%)</td>
                <td className="text-right py-3 font-mono">€1.386</td>
                <td className="text-right py-3 font-mono">€1.733</td>
                <td className="text-right py-3 font-mono">€1.155</td>
                <td className="text-right py-3 font-mono">€1.502</td>
                <td className="text-right py-3 font-mono font-semibold text-piva">€5.775</td>
              </tr>
              <tr>
                <td className="py-3">INPS Gestione Separata</td>
                <td className="text-right py-3 font-mono">€2.310</td>
                <td className="text-right py-3 font-mono">€2.888</td>
                <td className="text-right py-3 font-mono">€1.925</td>
                <td className="text-right py-3 font-mono">€2.503</td>
                <td className="text-right py-3 font-mono font-semibold text-piva">€9.625</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-4">
          {/* Fatturato previsto */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Fatturato previsto</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Q1:</span> <span className="font-mono">€12.000</span></div>
              <div><span className="text-muted-foreground">Q2:</span> <span className="font-mono">€15.000</span></div>
              <div><span className="text-muted-foreground">Q3:</span> <span className="font-mono">€10.000</span></div>
              <div><span className="text-muted-foreground">Q4:</span> <span className="font-mono">€13.000</span></div>
            </div>
            <div className="mt-2 pt-2 border-t font-semibold">
              <span className="text-muted-foreground">Totale:</span> <span className="font-mono">€50.000</span>
            </div>
          </div>

          {/* Imponibile */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Imponibile (77%)</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Q1:</span> <span className="font-mono">€9.240</span></div>
              <div><span className="text-muted-foreground">Q2:</span> <span className="font-mono">€11.550</span></div>
              <div><span className="text-muted-foreground">Q3:</span> <span className="font-mono">€7.700</span></div>
              <div><span className="text-muted-foreground">Q4:</span> <span className="font-mono">€10.010</span></div>
            </div>
            <div className="mt-2 pt-2 border-t font-semibold">
              <span className="text-muted-foreground">Totale:</span> <span className="font-mono">€38.500</span>
            </div>
          </div>

          {/* Imposta sostitutiva */}
          <div className="border rounded-lg p-4 border-piva/20 bg-piva/5">
            <h4 className="font-semibold mb-3">Imposta sostitutiva (15%)</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Q1:</span> <span className="font-mono">€1.386</span></div>
              <div><span className="text-muted-foreground">Q2:</span> <span className="font-mono">€1.733</span></div>
              <div><span className="text-muted-foreground">Q3:</span> <span className="font-mono">€1.155</span></div>
              <div><span className="text-muted-foreground">Q4:</span> <span className="font-mono">€1.502</span></div>
            </div>
            <div className="mt-2 pt-2 border-t font-semibold text-piva">
              <span>Totale:</span> <span className="font-mono">€5.775</span>
            </div>
          </div>

          {/* INPS */}
          <div className="border rounded-lg p-4 border-piva/20 bg-piva/5">
            <h4 className="font-semibold mb-3">INPS Gestione Separata</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Q1:</span> <span className="font-mono">€2.310</span></div>
              <div><span className="text-muted-foreground">Q2:</span> <span className="font-mono">€2.888</span></div>
              <div><span className="text-muted-foreground">Q3:</span> <span className="font-mono">€1.925</span></div>
              <div><span className="text-muted-foreground">Q4:</span> <span className="font-mono">€2.503</span></div>
            </div>
            <div className="mt-2 pt-2 border-t font-semibold text-piva">
              <span>Totale:</span> <span className="font-mono">€9.625</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-piva flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <strong>Nota:</strong> Questa previsione si basa sul fatturato stimato. Collega FattureInCloud per calcoli automatici basati sulle fatture effettive.
          </p>
        </div>
      </div>
    </div>
  );
}

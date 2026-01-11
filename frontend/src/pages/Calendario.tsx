import { useState } from "react";
import { ChevronLeft, ChevronRight, Car, Receipt, Home, Plus, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  module: "auto" | "piva" | "casa" | "general";
  type: string;
  amount?: string;
}

// Helper to format amount
const formatAmount = (amount: number | null): string | undefined => {
  if (!amount) return undefined;
  return `€${amount.toLocaleString('it-IT')}`;
};

const moduleIcons = {
  auto: Car,
  piva: Receipt,
  casa: Home,
  general: Plus,
};

const moduleColors = {
  auto: "bg-auto text-auto-foreground",
  piva: "bg-piva text-piva-foreground",
  casa: "bg-casa text-casa-foreground",
  general: "bg-muted text-foreground",
};

const moduleBgColors = {
  auto: "bg-auto/10 border-auto/20",
  piva: "bg-piva/10 border-piva/20",
  casa: "bg-casa/10 border-casa/20",
  general: "bg-muted/50 border-muted",
};

const daysOfWeek = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Adjust for Monday start
}

export default function Calendario() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 10)); // Jan 10, 2026

  // Fetch events from Supabase
  const { data: eventsData, isLoading, error } = useCalendarEvents();

  // Transform database structure to match component interface
  const events: CalendarEvent[] = eventsData?.map(event => ({
    id: event.id,
    title: event.title || "",
    date: event.event_date || "",
    module: (event.module as "auto" | "piva" | "casa" | "general") || "general",
    type: event.event_type || "",
    amount: formatAmount(event.amount)
  })) || [];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const today = new Date().getDate(); // Current day

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Caricamento calendario...</p>
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
            Si è verificato un errore durante il caricamento del calendario. Riprova più tardi.
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
          <h1 className="font-display text-3xl font-bold">Calendario</h1>
          <p className="mt-1 text-muted-foreground">
            Tutte le tue scadenze in un unico posto
          </p>
        </div>
        <Button className="gap-2">
          <Plus size={18} />
          Aggiungi evento
        </Button>
      </div>

      {/* Empty state - No events */}
      {events.length === 0 && (
        <div className="card-module p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Plus size={32} className="text-primary" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">Nessun evento in calendario</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Aggiungi eventi e scadenze per tenerle tutte sotto controllo in un unico calendario.
          </p>
          <Button className="gap-2">
            <Plus size={18} />
            Aggiungi primo evento
          </Button>
        </div>
      )}

      {/* Calendar Navigation */}
      {events.length > 0 && (
      <>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft size={20} />
          </Button>
          <h2 className="font-display text-2xl font-semibold min-w-[200px] text-center">
            {monthNames[month]} {year}
          </h2>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight size={20} />
          </Button>
        </div>

        {/* Legend - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-4">
          {Object.entries(moduleIcons).map(([key, Icon]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", moduleColors[key as keyof typeof moduleColors])} />
              <span className="text-sm text-muted-foreground capitalize">
                {key === "auto" ? "Veicoli" : key === "piva" ? "P.IVA" : "Casa"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card-module overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {daysOfWeek.map((day) => (
            <div key={day} className="p-2 md:p-3 text-center text-xs md:text-sm font-medium text-muted-foreground">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayEvents = day ? getEventsForDay(day) : [];
            const isToday = day === today;

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[80px] sm:min-h-[100px] md:min-h-[120px] border-b border-r p-1 sm:p-2 transition-colors",
                  day ? "hover:bg-muted/30" : "bg-muted/10",
                  isToday && "bg-primary/5"
                )}
              >
                {day && (
                  <>
                    <span className={cn(
                      "inline-flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-full text-xs md:text-sm",
                      isToday && "bg-primary text-primary-foreground font-semibold"
                    )}>
                      {day}
                    </span>

                    <div className="mt-1 space-y-1 hidden sm:block">
                      {dayEvents.slice(0, 2).map((event) => {
                        const Icon = moduleIcons[event.module];
                        return (
                          <div
                            key={event.id}
                            className={cn(
                              "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs border cursor-pointer",
                              moduleBgColors[event.module]
                            )}
                          >
                            <Icon size={12} />
                            <span className="truncate font-medium">{event.title}</span>
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <span className="text-xs text-muted-foreground pl-2">
                          +{dayEvents.length - 2} altri
                        </span>
                      )}
                    </div>

                    {/* Mobile: Show dots for events */}
                    {dayEvents.length > 0 && (
                      <div className="mt-1 flex gap-1 sm:hidden">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={cn("h-1.5 w-1.5 rounded-full", moduleColors[event.module])}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="card-module p-5">
        <h3 className="font-display text-lg font-semibold mb-4">Prossimi eventi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {events.slice(0, 6).map((event) => {
            const Icon = moduleIcons[event.module];
            const date = new Date(event.date);
            const formattedDate = date.toLocaleDateString("it-IT", {
              day: "numeric",
              month: "short",
            });
            
            return (
              <div
                key={event.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border",
                  moduleBgColors[event.module]
                )}
              >
                <div className={cn("rounded-lg p-2", moduleColors[event.module])}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formattedDate} • {event.type}
                  </p>
                </div>
                {event.amount && (
                  <span className="font-display font-semibold text-sm">{event.amount}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      </>
      )}
    </div>
  );
}

import { User, Bell, Calendar, MessageCircle, Shield, CreditCard, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const settingSections = [
  {
    title: "Account",
    icon: User,
    items: [
      { label: "Profilo utente", description: "Nome, email e password" },
      { label: "Preferenze lingua", description: "Italiano" },
    ],
  },
  {
    title: "Notifiche",
    icon: Bell,
    items: [
      { label: "Notifiche email", description: "Ricevi promemoria via email", toggle: true, enabled: true },
      { label: "Notifiche Telegram", description: "Collega il tuo account Telegram", action: "connect" },
      { label: "Anticipo promemoria", description: "30 giorni e 7 giorni prima" },
    ],
  },
  {
    title: "Integrazioni",
    icon: Calendar,
    items: [
      { label: "Google Calendar", description: "Sincronizza le scadenze", action: "connect" },
      { label: "FattureInCloud", description: "Importa fatture e ricavi", action: "connect" },
    ],
  },
  {
    title: "Assistente Wally",
    icon: MessageCircle,
    items: [
      { label: "Risposte proattive", description: "Wally suggerisce azioni", toggle: true, enabled: true },
      { label: "Ricerca bandi automatica", description: "Ogni lunedì", toggle: true, enabled: true },
      { label: "Report settimanale", description: "Riepilogo via email", toggle: true, enabled: false },
    ],
  },
  {
    title: "Privacy e sicurezza",
    icon: Shield,
    items: [
      { label: "Autenticazione a due fattori", description: "Proteggi il tuo account", toggle: true, enabled: false },
      { label: "Esporta i miei dati", description: "Download in formato JSON" },
      { label: "Elimina account", description: "Rimuovi tutti i dati", danger: true },
    ],
  },
];

export default function Impostazioni() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold">Impostazioni</h1>
        <p className="mt-1 text-muted-foreground">
          Gestisci il tuo account e le preferenze
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingSections.map((section) => (
          <div key={section.title} className="card-module overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b bg-muted/30">
              <section.icon size={20} className="text-muted-foreground" />
              <h3 className="font-display font-semibold">{section.title}</h3>
            </div>
            
            <div className="divide-y">
              {section.items.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-5 ${item.danger ? "hover:bg-destructive/5" : "hover:bg-muted/30"} transition-colors`}
                >
                  <div>
                    <p className={`font-medium ${item.danger ? "text-destructive" : ""}`}>
                      {item.label}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  
                  {item.toggle !== undefined && (
                    <Switch defaultChecked={item.enabled} />
                  )}
                  
                  {item.action === "connect" && (
                    <Button variant="outline" size="sm" className="gap-2">
                      Connetti
                      <ChevronRight size={16} />
                    </Button>
                  )}
                  
                  {!item.toggle && !item.action && !item.danger && (
                    <ChevronRight size={18} className="text-muted-foreground" />
                  )}
                  
                  {item.danger && (
                    <Button variant="destructive" size="sm">
                      Elimina
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Subscription */}
      <div className="card-module overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b bg-muted/30">
          <CreditCard size={20} className="text-muted-foreground" />
          <h3 className="font-display font-semibold">Abbonamento</h3>
        </div>
        
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">Piano Free</p>
              <p className="text-sm text-muted-foreground">
                Funzionalità base • 1 veicolo • Nessuna integrazione
              </p>
            </div>
            <Button className="gap-2">
              Upgrade a Pro
              <ChevronRight size={16} />
            </Button>
          </div>
          
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm">
              <strong>Piano Pro</strong> include: veicoli illimitati, integrazioni Telegram e Google Calendar, 
              ricerca automatica bandi, report dettagliati e supporto prioritario.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

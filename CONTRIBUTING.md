# Contributing to Wally

Grazie per il tuo interesse nel contribuire a Wally! 🎉

## Come Contribuire

### 1. Fork del Progetto
Clicca sul pulsante "Fork" in alto a destra nella pagina GitHub.

### 2. Clone del Repository
```bash
git clone https://github.com/YOUR_USERNAME/wally-finance-app.git
cd wally-finance-app
```

### 3. Crea un Branch
```bash
git checkout -b feature/nome-feature
# oppure
git checkout -b fix/nome-bugfix
```

### 4. Fai le tue Modifiche
Assicurati di seguire le linee guida di codifica:

#### Frontend (React/TypeScript)
- Usa TypeScript strict mode
- Segui le convenzioni ESLint configurate
- Usa componenti funzionali con hooks
- Mantieni i componenti piccoli e riutilizzabili
- Scrivi test per le nuove funzionalità

#### Backend (Supabase/PostgreSQL)
- Usa Row Level Security (RLS) per tutte le tabelle
- Documenta le nuove tabelle/colonne
- Testa le query con dati reali
- Mantieni la compatibilità multi-tenant

### 5. Test
```bash
cd frontend
npm run test
npm run build  # Verifica che il build funzioni
```

### 6. Commit
Usa messaggi di commit chiari e descrittivi:
```bash
git commit -m "feat: Aggiungi export PDF per report mensile"
git commit -m "fix: Risolve problema calcolo bollo per Euro 6"
git commit -m "docs: Aggiorna README con istruzioni Docker"
```

Convenzioni per i messaggi di commit:
- `feat:` - Nuova funzionalità
- `fix:` - Bug fix
- `docs:` - Documentazione
- `style:` - Formattazione
- `refactor:` - Refactoring codice
- `test:` - Aggiunta/modifica test
- `chore:` - Manutenzione

### 7. Push
```bash
git push origin feature/nome-feature
```

### 8. Pull Request
1. Vai su GitHub e apri una Pull Request
2. Descrivi le modifiche in dettaglio
3. Referenzia issue correlate (se presenti)
4. Attendi il review

## Linee Guida per il Codice

### TypeScript
```typescript
// ✅ Buono
interface Vehicle {
  id: string;
  marca: string;
  modello: string;
}

const getVehicle = async (id: string): Promise<Vehicle> => {
  // ...
}

// ❌ Cattivo
const getVehicle = async (id: any) => {
  // ...
}
```

### React Components
```typescript
// ✅ Buono - Componente funzionale con TypeScript
interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit: (id: string) => void;
}

export function VehicleCard({ vehicle, onEdit }: VehicleCardProps) {
  return (
    <div>
      <h3>{vehicle.marca} {vehicle.modello}</h3>
      <button onClick={() => onEdit(vehicle.id)}>Edit</button>
    </div>
  );
}

// ❌ Cattivo - Props non tipizzate
export function VehicleCard({ vehicle, onEdit }) {
  // ...
}
```

### SQL
```sql
-- ✅ Buono - Con RLS e commenti
CREATE TABLE wally.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES wally.tenants(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  targa TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE wally.vehicles ENABLE ROW LEVEL SECURITY;

-- Users can only see their tenant's vehicles
CREATE POLICY "Users can view vehicles in their tenant"
  ON wally.vehicles FOR SELECT
  TO authenticated
  USING (tenant_id = (SELECT tenant_id FROM wally.profiles WHERE id = auth.uid()));
```

## Priorità delle Feature

### Alta Priorità 🔴
- Bug critici
- Sicurezza
- Performance

### Media Priorità 🟡
- Nuove funzionalità richieste
- Miglioramenti UX
- Documentazione

### Bassa Priorità 🟢
- Refactoring
- Nice-to-have features
- Ottimizzazioni minori

## Report Bug

Quando riporti un bug, includi:
1. **Descrizione chiara** del problema
2. **Steps per riprodurre** il bug
3. **Comportamento atteso** vs **comportamento attuale**
4. **Screenshots** (se applicabile)
5. **Informazioni ambiente** (browser, OS, versione)

Esempio:
```markdown
### Bug: Calcolo bollo errato per veicoli Euro 6

**Descrizione:**
Il calcolo del bollo restituisce un importo doppio per i veicoli Euro 6.

**Steps per riprodurre:**
1. Vai su Veicoli
2. Aggiungi un veicolo Euro 6 con 100 kW
3. Il bollo calcolato è €400 invece di €200

**Ambiente:**
- Browser: Chrome 120
- OS: macOS 14
- Wally version: 1.0.0
```

## Suggerimenti Feature

Quando proponi una nuova feature, includi:
1. **Descrizione** della feature
2. **Caso d'uso** - Perché è utile?
3. **Mockup** o esempi (se applicabile)
4. **Considerazioni tecniche**

## Domande?

Per domande o discussioni:
- Apri una [GitHub Issue](https://github.com/Gugutete/wally-finance-app/issues)
- Email: info@leomat.it

## Codice di Condotta

Sii rispettoso e costruttivo nelle interazioni con altri contributori.

---

Grazie per contribuire a rendere Wally migliore! 🚀

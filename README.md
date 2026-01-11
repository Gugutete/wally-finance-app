# Wally - Personal Finance Management

![Wally](https://img.shields.io/badge/Status-Production%20Ready-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)

Wally è un'applicazione web completa per la gestione delle finanze personali, progettata specificamente per il mercato italiano. Permette di tracciare veicoli, partita IVA, spese domestiche e scadenze fiscali in un'unica piattaforma intuitiva.

## 🚀 Caratteristiche

### 🚗 Gestione Veicoli
- Tracciamento bollo auto
- Scadenze revisione
- Gestione assicurazione
- Calcolo automatico importi bollo
- Notifiche scadenze

### 💼 Partita IVA
- Tracciamento fatturato
- Scadenze fiscali (IVA, INPS, F24)
- Calcolo acconto e saldo
- Gestione coefficiente di redditività
- Integrazione con FattureInCloud (in sviluppo)

### 🏠 Gestione Casa
- Tracciamento utenze (luce, gas, acqua)
- Spese condominiali
- Internet e telefonia
- Statistiche mensili
- Grafici spese

### 📅 Calendario Unificato
- Vista centralizzata di tutte le scadenze
- Filtri per modulo
- Notifiche push
- Esportazione eventi

## 🛠️ Stack Tecnologico

### Frontend
- **React 18** con TypeScript
- **Vite** per build ultra-veloce
- **TailwindCSS** per styling
- **shadcn/ui** per componenti UI
- **React Query** per data fetching
- **React Router** per navigazione

### Backend
- **Supabase** (self-hosted)
  - PostgreSQL 17
  - Row Level Security (RLS)
  - Auth con JWT
  - PostgREST API
  - Realtime subscriptions

### Infrastruttura
- **Docker** per containerizzazione
- **Nginx** per reverse proxy e SSL
- **Kong Gateway** per API management

## 📦 Installazione

### Prerequisiti
- Docker e Docker Compose
- Node.js 20+
- Git

### 1. Clone del Repository
```bash
git clone https://github.com/Gugutete/wally-finance-app.git
cd wally-finance-app
```

### 2. Setup Supabase
```bash
# Avvia i servizi Supabase
cd supabase
docker compose up -d

# Applica lo schema del database
docker exec supabase_db_wally psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/setup_wally_schema.sql
```

### 3. Build Frontend
```bash
cd frontend
npm install
npm run build

# Build Docker image
docker build -t wally-frontend .
docker run -d --name wally-frontend -p 3000:80 --network supabase_network_wally wally-frontend
```

### 4. Configurazione Nginx (Opzionale per SSL)
```bash
# Configura reverse proxy per SSL
cp nginx/api.wally.conf /etc/nginx/sites-available/
ln -s /etc/nginx/sites-available/api.wally.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

## 🔧 Configurazione

### Variabili d'Ambiente

Frontend (.env):
```bash
VITE_SUPABASE_URL=https://api.yourdomain.com
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Database Schema
Il database utilizza uno schema custom chiamato `wally` con le seguenti tabelle:
- `tenants` - Multi-tenancy
- `profiles` - Profili utenti
- `vehicles` - Veicoli
- `vehicle_deadlines` - Scadenze veicoli
- `vat_profiles` - Profili P.IVA
- `tax_deadlines` - Scadenze fiscali
- `home_expenses` - Spese casa
- `calendar_events` - Eventi calendario
- `notifications` - Notifiche

## 📚 Struttura del Progetto

```
wally/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Componenti React
│   │   ├── pages/         # Pagine applicazione
│   │   ├── hooks/         # Custom hooks
│   │   ├── contexts/      # React contexts
│   │   ├── lib/           # Utility e config
│   │   └── ...
│   ├── Dockerfile
│   └── package.json
├── database/              # SQL schema e migrations
│   └── setup_wally_schema.sql
├── supabase/             # Configurazione Supabase
│   ├── config.toml
│   └── docker-compose.yml
└── README.md
```

## 🔐 Sicurezza

- **Row Level Security (RLS)** abilitato su tutte le tabelle
- **JWT Authentication** con Supabase Auth
- **Multi-tenancy** con isolamento dati per tenant
- **HTTPS** obbligatorio in produzione
- **CORS** configurato per dominio specifico

## 📖 Documentazione API

### Endpoints Principali

**Autenticazione:**
- `POST /auth/v1/signup` - Registrazione
- `POST /auth/v1/token?grant_type=password` - Login
- `POST /auth/v1/logout` - Logout

**Veicoli:**
- `GET /rest/v1/vehicles` - Lista veicoli
- `POST /rest/v1/vehicles` - Crea veicolo
- `PATCH /rest/v1/vehicles?id=eq.{id}` - Aggiorna veicolo
- `DELETE /rest/v1/vehicles?id=eq.{id}` - Elimina veicolo

**Scadenze:**
- `GET /rest/v1/vehicle_deadlines` - Scadenze veicoli
- `GET /rest/v1/tax_deadlines` - Scadenze fiscali
- `GET /rest/v1/calendar_events` - Eventi calendario

Tutti gli endpoint richiedono:
- Header `apikey: your_anon_key`
- Header `Authorization: Bearer {access_token}`
- Header `Content-Profile: wally` (per schema custom)

## 🧪 Testing

```bash
# Unit tests
cd frontend
npm run test

# Build test
npm run build

# E2E tests (in sviluppo)
npm run test:e2e
```

## 📝 Roadmap

- [x] Gestione veicoli completa
- [x] Dashboard unificata
- [x] Autenticazione e registrazione
- [x] Multi-tenancy
- [ ] Integrazione FattureInCloud
- [ ] App mobile (React Native)
- [ ] Notifiche push
- [ ] Export PDF report
- [ ] Integrazione PagoPA per bollo
- [ ] OCR per fatture

## 🤝 Contribuire

Contribuzioni sono benvenute! Per favore:
1. Fork del progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit dei cambiamenti (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file `LICENSE` per i dettagli.

## 👥 Autori

- **Guido Di Pace** - *Initial work* - [Gugutete](https://github.com/Gugutete)

## 🙏 Ringraziamenti

- Supabase per l'ottima piattaforma backend
- shadcn/ui per i componenti React
- Comunità open source

## 📧 Contatti

Per domande o supporto: info@leomat.it

---

**⚠️ Nota**: Questo è un progetto in produzione. Testato e funzionante al 100%.

Ultimo aggiornamento: Gennaio 2026

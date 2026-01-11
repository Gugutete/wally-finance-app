# Wally Project - Claude Code Guide

## Quick Start

### Launching Claude Code for Wally

Simply run from anywhere in your VPS:

```bash
wally-claude
```

This will:
- Change directory to `/opt/wally/frontend`
- Launch Claude Code CLI with Wally project context
- Use the system's configured Anthropic API key

### Project Structure

```
/opt/wally/
├── frontend/              # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── pages/        # Dashboard, Veicoli, P.IVA, Casa, Calendario, etc.
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities
│   ├── Dockerfile        # Frontend container config
│   └── nginx.conf        # Nginx configuration
├── docker-compose.yml    # Docker orchestration
└── CLAUDE.md            # This file

```

### Docker Commands

```bash
# View logs
docker logs wally-frontend -f

# Restart container
cd /opt/wally && docker-compose restart

# Rebuild after changes
cd /opt/wally && docker-compose down
cd /opt/wally && docker-compose build
cd /opt/wally && docker-compose up -d

# Stop container
cd /opt/wally && docker-compose down
```

### Project URLs

- **Production**: https://wally.leomat.it
- **Local (from VPS)**: http://127.0.0.1:3000
- **Container**: wally-frontend (port 3000 → 80)

### Development Workflow

1. Launch Claude Code: `wally-claude`
2. Make changes to frontend code
3. Rebuild container: `cd /opt/wally && docker-compose build && docker-compose up -d`
4. Test on https://wally.leomat.it

### Tech Stack

- **Frontend**: React 18.3.1 + TypeScript 5.8.3
- **Build**: Vite 5.4.21
- **UI**: Shadcn UI + Tailwind CSS 3.4.17
- **State**: TanStack Query 5.83.0
- **Routing**: React Router 6.30.1
- **Forms**: React Hook Form + Zod
- **Container**: Docker + Nginx Alpine

### Modules

The Wally app manages 4 main life areas:

1. **Veicoli** - Vehicle management (insurance, taxes, maintenance)
2. **P.IVA** - VAT/Tax management (invoices, payments, forfettario)
3. **Casa** - Home expenses (utilities, bills)
4. **Calendario** - Calendar and deadlines

### Notes

- This is a frontend-only project currently
- Backend integration is planned for future development
- Uses Italian language and locale
- Designed with sophisticated Italian design palette
- Dark mode supported

### Support

For issues or questions about Claude Code, use:
```bash
claude --help
```

For Wally project-specific help, consult this file or the README.md in the frontend directory.

# Deployment Guide - Wally Finance App

Guida completa per il deployment di Wally in produzione.

## 📋 Prerequisiti

- Server Linux (Ubuntu 20.04+ o Debian 11+)
- Docker e Docker Compose installati
- Dominio con DNS configurato
- Certificato SSL (Let's Encrypt consigliato)
- 2GB+ RAM
- 20GB+ storage

## 🚀 Deployment Step-by-Step

### 1. Preparazione Server

```bash
# Update sistema
sudo apt update && sudo apt upgrade -y

# Installa Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installa Docker Compose
sudo apt install docker-compose -y

# Aggiungi utente a gruppo docker
sudo usermod -aG docker $USER
```

### 2. Clone Repository

```bash
cd /opt
git clone https://github.com/Gugutete/wally-finance-app.git wally
cd wally
```

### 3. Configurazione Supabase

```bash
cd supabase

# Avvia servizi Supabase
docker compose up -d

# Attendi che i servizi siano pronti (circa 30 secondi)
sleep 30

# Verifica servizi attivi
docker ps | grep supabase
```

### 4. Setup Database

```bash
# Copia schema nel container database
docker cp ../database/setup_wally_schema.sql supabase_db_wally:/tmp/

# Esegui schema SQL
docker exec supabase_db_wally psql -U postgres -d postgres -f /tmp/setup_wally_schema.sql

# Verifica tabelle create
docker exec supabase_db_wally psql -U postgres -d postgres -c "\dt wally.*"
```

### 5. Configurazione Frontend

```bash
cd ../frontend

# Crea file .env (opzionale - usa hardcoded values se preferisci)
cat > .env << EOF
VITE_SUPABASE_URL=https://api.yourdomain.com
VITE_SUPABASE_ANON_KEY=your_anon_key_here
EOF

# Build Docker image
docker build -t wally-frontend .

# Avvia container frontend
docker run -d \
  --name wally-frontend \
  -p 3000:80 \
  --network supabase_network_wally \
  --restart unless-stopped \
  wally-frontend
```

### 6. Configurazione Nginx (Reverse Proxy)

```bash
# Installa Nginx
sudo apt install nginx -y

# Crea configurazione per API
sudo nano /etc/nginx/sites-available/api.wally.conf
```

Contenuto file:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # CORS headers
    add_header 'Access-Control-Allow-Origin' 'https://yourdomain.com' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, apikey, Content-Profile, Accept-Profile, Prefer' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;

    # Handle OPTIONS
    if ($request_method = OPTIONS) {
        return 204;
    }

    # Proxy to Kong Gateway
    location / {
        proxy_pass http://localhost:54331;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Frontend configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Abilita configurazione
sudo ln -s /etc/nginx/sites-available/api.wally.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/wally.conf /etc/nginx/sites-enabled/

# Test configurazione
sudo nginx -t

# Riavvia Nginx
sudo systemctl restart nginx
```

### 7. Setup SSL con Let's Encrypt

```bash
# Installa Certbot
sudo apt install certbot python3-certbot-nginx -y

# Ottieni certificati
sudo certbot --nginx -d api.yourdomain.com -d yourdomain.com

# Test rinnovo automatico
sudo certbot renew --dry-run
```

## 🔧 Configurazione Avanzata

### Backup Automatico Database

```bash
# Crea script backup
cat > /opt/wally/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/wally/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker exec supabase_db_wally pg_dump -U postgres -d postgres \
  --schema=wally --schema=auth \
  > $BACKUP_DIR/wally_backup_$DATE.sql

# Mantieni solo ultimi 7 giorni
find $BACKUP_DIR -name "wally_backup_*.sql" -mtime +7 -delete
EOF

chmod +x /opt/wally/backup.sh

# Aggiungi a crontab (backup giornaliero alle 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/wally/backup.sh") | crontab -
```

### Monitoring con Docker Stats

```bash
# Installa tool monitoring
docker stats --no-stream

# Per monitoring continuo
watch -n 5 docker stats --no-stream
```

### Logs

```bash
# Frontend logs
docker logs -f wally-frontend

# Supabase logs
docker logs -f supabase_kong_wally
docker logs -f supabase_auth_wally
docker logs -f supabase_db_wally

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔒 Sicurezza

### Firewall

```bash
# Installa UFW
sudo apt install ufw -y

# Configura regole
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Abilita firewall
sudo ufw enable
```

### Hardening Database

```bash
# Cambia password postgres (dentro container)
docker exec -it supabase_db_wally psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'strong_password_here';"

# Limita connessioni esterne
# Modifica pg_hba.conf se necessario
```

## 📊 Performance Tuning

### PostgreSQL

```bash
# Edita supabase/config.toml
# Aumenta shared_buffers per più RAM disponibile
# Esempio per 4GB RAM:
shared_buffers = 1GB
effective_cache_size = 3GB
```

### Nginx Cache

Aggiungi a configurazione Nginx:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m;
proxy_cache api_cache;
proxy_cache_valid 200 5m;
```

## 🔄 Updates

### Aggiornamento Frontend

```bash
cd /opt/wally
git pull origin main

cd frontend
docker build -t wally-frontend .
docker stop wally-frontend
docker rm wally-frontend
docker run -d --name wally-frontend -p 3000:80 \
  --network supabase_network_wally \
  --restart unless-stopped \
  wally-frontend
```

### Aggiornamento Database Schema

```bash
# Backup prima di modificare
docker exec supabase_db_wally pg_dump -U postgres -d postgres > backup_pre_update.sql

# Applica nuove migrations
docker cp new_migration.sql supabase_db_wally:/tmp/
docker exec supabase_db_wally psql -U postgres -d postgres -f /tmp/new_migration.sql
```

## 🚨 Troubleshooting

### Frontend non raggiungibile
```bash
docker logs wally-frontend
docker restart wally-frontend
```

### Errori CORS
```bash
# Verifica headers Nginx
curl -I https://api.yourdomain.com

# Riavvia Nginx
sudo systemctl restart nginx
```

### Database connessione fallita
```bash
docker logs supabase_db_wally
docker restart supabase_db_wally
```

### Servizi Supabase non partono
```bash
# Riavvia tutti i servizi
cd /opt/wally/supabase
docker compose down
docker compose up -d
```

## 📞 Supporto

Per problemi di deployment:
- GitHub Issues: https://github.com/Gugutete/wally-finance-app/issues
- Email: info@leomat.it

---

**Ultimo aggiornamento**: Gennaio 2026

# Manual de Despliegue en Producción
## Prácticos Computación — pmontovani.com

> **Stack**: Next.js 14 · PostgreSQL · Prisma · NextAuth · Docker  
> **VPS**: Docker instalado, dominio `pmontovani.com`, n8n corriendo  
> **URL objetivo**: `practicos.pmontovani.com` (ver nota sobre rutas abajo)

---

## Índice

1. [Decisión de URL](#1-decisión-de-url)
2. [Arquitectura en el VPS](#2-arquitectura-en-el-vps)
3. [Preparar el VPS](#3-preparar-el-vps)
4. [Configurar el repositorio en GitHub](#4-configurar-el-repositorio-en-github)
5. [Variables de entorno](#5-variables-de-entorno)
6. [Archivos Docker para producción](#6-archivos-docker-para-producción)
7. [Primer despliegue manual](#7-primer-despliegue-manual)
8. [Base de datos: migraciones](#8-base-de-datos-migraciones)
9. [CI/CD con GitHub Actions](#9-cicd-con-github-actions)
10. [Flujo de trabajo diario](#10-flujo-de-trabajo-diario)
11. [Automatizaciones con n8n](#11-automatizaciones-con-n8n)
12. [Mantenimiento y monitoreo](#12-mantenimiento-y-monitoreo)
13. [Checklist de lanzamiento](#13-checklist-de-lanzamiento)

---

## 1. Decisión de URL

### ¿Subdominio o sub-ruta?

| Opción | URL | Pros | Contras |
|--------|-----|------|---------|
| **Subdominio** ✅ recomendado | `practicos.pmontovani.com` | Más simple de configurar con Docker, cookies de sesión independientes, SSL fácil con Certbot | Requiere registro DNS extra |
| Sub-ruta | `pmontovani.com/proyectos/practicos_computacion` | URL "limpia" bajo el dominio principal | Requiere `basePath` en Next.js y coordinación con el proxy del sitio principal |

**Recomendación: usar subdominio `practicos.pmontovani.com`**.  
Next.js con `output: standalone` está pensado para correr en su propia raíz. Usar sub-ruta requiere configurar `basePath` en `next.config.ts` y ajustar todas las rutas de NextAuth — es trabajo extra sin beneficio real.

Si igualmente querés la sub-ruta, ver el Apéndice A al final.

---

## 2. Arquitectura en el VPS

```
Internet
    │
    ▼
[Traefik Proxy] :80/:443
    │
    ├──► practicos.pmontovani.com ──► [Contenedor Next.js] :3000
    │
    ├──► n8n.pmontovani.com       ──► [Contenedor n8n]     :5678
    │
    └──► pmontovani.com           ──► [Tu sitio principal]
         
[Contenedor PostgreSQL] :5432  (red interna Docker, no expuesto)
```

**Redes Docker**:
- `app_network` (Traefik) — red compartida para que Traefik enrute a todos los servicios
- `practicos_internal` — red interna solo para la app ↔ su propia base de datos

**Nota**: Tu VPS ya tiene **Traefik corriendo** en `/opt/n8n-traefik/`. Usaremos su instancia existente como proxy inverso.

---

## 3. Preparar el VPS

### 3.1 Verificar Docker y Traefik

```bash
# Verificar que Docker Compose está instalado
docker compose version  # >= 2.x

# Verificar que Traefik está corriendo
docker ps | grep traefik
# Debe mostrar: traefik con puertos 0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

**Tu VPS ya tiene Traefik en `/opt/n8n-traefik/`** — lo usaremos como proxy inverso. No necesitás instalar Nginx ni Certbot; Traefik maneja SSL automáticamente.

### 3.2 Crear estructura de directorios

```bash
mkdir -p /opt/practicos-computacion
cd /opt/practicos-computacion
```

### 3.3 Configurar DNS

En el panel de tu registrador de dominio, agregar un registro **A**:

```
Tipo: A
Nombre: practicos
Valor: <IP_PUBLICA_DEL_VPS>
TTL: 3600
```

Verificar propagación (esperar 5-15 minutos):
```bash
dig practicos.pmontovani.com +short
# Debe devolver la IP del VPS
```

### 3.4 Confirmar red de Traefik

```bash
docker network ls | grep app_network
# Debe existir: app_network (driver bridge)
```

Si no existe, créala:
```bash
docker network create app_network
```

Esta red es compartida entre Traefik, n8n y tu app de prácticos.

---

## 4. Configurar el repositorio en GitHub

### 4.1 Crear el repositorio

```bash
# En tu máquina local, dentro de WebEscuela/
cd C:\Users\emanu\OneDrive\Desktop\Analisis\WebEscuela

git init
git add .
git commit -m "feat: initial commit"

# Crear repo en GitHub (sin inicializar)
# Luego:
git remote add origin git@github.com:TU_USUARIO/practicos-computacion.git
git branch -M main
git push -u origin main
```

### 4.2 Archivos a ignorar (.gitignore)

Verificar que `.gitignore` incluya:

```gitignore
.env
.env.local
.env.production
node_modules/
.next/
```

**Nunca subir `.env` al repo.**

### 4.3 Secrets en GitHub

En GitHub → tu repo → Settings → Secrets and variables → Actions, crear:

| Secret | Descripción |
|--------|-------------|
| `VPS_HOST` | IP pública del VPS |
| `VPS_USER` | Usuario SSH (ej: `root`) |
| `VPS_SSH_KEY` | Clave SSH privada (ver 4.4) |
| `VPS_DEPLOY_PATH` | Path en VPS: `/opt/practicos-computacion` |

### 4.4 Configurar acceso SSH sin contraseña

```bash
# En tu máquina local, generar clave exclusiva para deploy
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/practicos_deploy

# Copiar clave pública al VPS
ssh-copy-id -i ~/.ssh/practicos_deploy.pub usuario@IP_VPS

# El contenido de practicos_deploy (privada) va al secret VPS_SSH_KEY en GitHub
cat ~/.ssh/practicos_deploy
```

---

## 5. Variables de entorno

### 5.1 Crear `.env.production` en el VPS

```bash
# En el VPS
nano ~/apps/practicos-computacion/.env.production
```

Contenido:

```env
# Base de datos
DATABASE_URL="postgresql://practicos_user:TU_PASSWORD_SEGURA@db:5432/practicos_db"
POSTGRES_USER=practicos_user
POSTGRES_PASSWORD=TU_PASSWORD_SEGURA
POSTGRES_DB=practicos_db

# NextAuth
NEXTAUTH_URL="https://practicos.pmontovani.com"
NEXTAUTH_SECRET="GENERAR_CON: openssl rand -base64 32"

# Dominio (usado en algunos headers)
DOMAIN="practicos.pmontovani.com"
```

Generar el secret:
```bash
openssl rand -base64 32
```

Proteger el archivo:
```bash
chmod 600 ~/apps/practicos-computacion/.env.production
```

---

## 6. Archivos Docker para producción

### 6.1 `docker-compose.prod.yml`

Crear este archivo en `/opt/practicos-computacion/docker-compose.prod.yml`:

```yaml
services:
  app:
    image: ghcr.io/TU_USUARIO/practicos-computacion:latest
    container_name: practicos_app
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      db:
        condition: service_healthy
    labels:
      # Traefik
      - "traefik.enable=true"
      - "traefik.http.routers.practicos.rule=Host(`practicos.pmontovani.com`)"
      - "traefik.http.routers.practicos.entrypoints=websecure"
      - "traefik.http.routers.practicos.tls.certresolver=le"
      - "traefik.http.services.practicos.loadbalancer.server.port=3000"
    networks:
      - app_network
      - practicos_internal
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:16-alpine
    container_name: practicos_db
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - practicos_internal

volumes:
  postgres_data:

networks:
  app_network:
    external: true
    driver: bridge
  practicos_internal:
    driver: bridge
```

**Notas importantes**:

1. **`traefik.enable=true`** — dice a Traefik que exponga este contenedor
2. **`Host(`practicos.pmontovani.com`)`** — Traefik redirija ese dominio aquí
3. **`entrypoints=websecure`** — usa HTTPS (Traefik redirige HTTP → HTTPS automáticamente)
4. **`certresolver=le`** — usa Let's Encrypt (Traefik ya está configurado para esto)
5. **`app_network`** — red externa compartida con Traefik (debe existir)
6. **`practicos_internal`** — red privada solo para app ↔ BD
7. **Sin `ports`** — no expone puertos directamente; Traefik lo hace por ti

La imagen se construye en GitHub Actions y se sube a GitHub Container Registry (ghcr.io). El VPS solo descarga la imagen ya construida.

### 6.2 Verificar `Dockerfile`

El proyecto ya tiene un Dockerfile multistage. Verificar que el stage final sea:

```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# ... copia de standalone output
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

---

## 7. Primer despliegue manual

### 7.1 En el VPS: clonar el repo

```bash
cd /opt/practicos-computacion
git clone git@github.com:TU_USUARIO/practicos-computacion.git .
```

### 7.2 Crear `.env.production`

```bash
nano .env.production
```

(Usar el contenido de la sección 5.1)

```bash
chmod 600 .env.production
```

### 7.3 Levantar los contenedores

```bash
# Descargar imagen desde GitHub Container Registry y levantar
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# Verificar que los contenedores están corriendo
docker compose -f docker-compose.prod.yml ps
```

Salida esperada:
```
NAME              STATUS
practicos_app     Up (healthy)
practicos_db      Up (healthy)
```

### 7.4 Verificar que Traefik lo detectó

```bash
# Ver etiquetas detectadas por Traefik
docker exec traefik traefik version

# En el panel de Traefik (http://n8n.pmontovani.com:8080 si está expuesto)
# deberías ver la ruta para practicos.pmontovani.com
```

### 7.5 Verificar acceso

```bash
# Esperar 30 segundos a que Traefik genere el certificado SSL
sleep 30

# Probar acceso
curl -I https://practicos.pmontovani.com/
# Debe devolver: HTTP/2 200 o redirigir a /login
```

### 7.6 Ver logs

```bash
# App
docker compose -f docker-compose.prod.yml logs -f app

# Base de datos
docker compose -f docker-compose.prod.yml logs db

# Traefik (desde /opt/n8n-traefik)
docker logs -f traefik | grep practicos
```

---

## 8. Base de datos: migraciones

### 8.1 Primera vez (base de datos vacía)

```bash
# Entrar al contenedor de la app
docker exec -it practicos_app sh

# Dentro del contenedor:
npx prisma db push
# o si usás migraciones:
npx prisma migrate deploy
```

### 8.2 Crear el primer usuario admin

```bash
# Dentro del contenedor app:
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('TU_PASSWORD', 12);
  await prisma.teacher.create({
    data: { email: 'pablo@pmontovani.com', password: hash, nombre: 'Pablo', apellido: 'Montovani', role: 'ADMIN' }
  });
  console.log('Admin creado');
}
main().finally(() => prisma.\$disconnect());
"
```

### 8.3 Backup automático de la base de datos

```bash
# Crear script de backup en el VPS
mkdir -p /opt/scripts
cat > /opt/scripts/backup-practicos.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/opt/backups/practicos
mkdir -p $BACKUP_DIR

docker exec practicos_db pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} \
  | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Mantener solo los últimos 30 backups
ls -t $BACKUP_DIR/backup_*.sql.gz | tail -n +31 | xargs -r rm
echo "Backup completado: $BACKUP_DIR/backup_$DATE.sql.gz"
EOF

chmod +x /opt/scripts/backup-practicos.sh

# Programar en cron (cada día a las 3am)
# Primero, obtener los valores de .env.production
export $(cat /opt/practicos-computacion/.env.production | grep ^POSTGRES)

(crontab -l 2>/dev/null | grep -v backup-practicos; echo "0 3 * * * /opt/scripts/backup-practicos.sh") | crontab -
```

---

## 9. CI/CD con GitHub Actions

Este workflow construye la imagen Docker, la sube a ghcr.io y la despliega al VPS automáticamente en cada push a `main`.

Crear `.github/workflows/deploy.yml` en el repo:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    name: Build & Push Docker Image
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=
            type=raw,value=latest

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    name: Deploy to VPS
    runs-on: ubuntu-latest
    needs: build-and-push
    
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/practicos-computacion
            
            # Descargar nueva imagen
            docker pull ghcr.io/${{ github.repository }}:latest
            
            # Reiniciar solo el contenedor de la app (sin tocar la DB)
            docker compose -f docker-compose.prod.yml --env-file .env.production \
              up -d --no-deps --force-recreate app
            
            # Ejecutar migraciones pendientes
            docker exec practicos_app npx prisma migrate deploy
            
            # Limpiar imágenes viejas
            docker image prune -f
            
            echo "✅ Deploy completado: $(date)"
```

---

## 10. Flujo de trabajo diario

### Hacer un cambio y desplegarlo

```bash
# 1. En tu máquina local, hacer los cambios
# 2. Testear localmente
npm run dev

# 3. Commit y push a main
git add .
git commit -m "fix: descripción del cambio"
git push origin main

# 4. GitHub Actions construye y despliega automáticamente (~3-5 min)
# Podés ver el progreso en: github.com/TU_USUARIO/practicos-computacion/actions
```

### Despliegue manual de emergencia (desde el VPS)

```bash
cd /opt/practicos-computacion
docker pull ghcr.io/TU_USUARIO/practicos-computacion:latest
docker compose -f docker-compose.prod.yml --env-file .env.production \
  up -d --no-deps --force-recreate app
docker compose -f docker-compose.prod.yml logs -f app
```

### Rollback a versión anterior

```bash
# Ver imágenes disponibles (por SHA de commit)
docker images ghcr.io/TU_USUARIO/practicos-computacion

# Rollback a un SHA específico
docker compose -f docker-compose.prod.yml --env-file .env.production \
  up -d --no-deps --force-recreate app \
  --image ghcr.io/TU_USUARIO/practicos-computacion:SHA_DEL_COMMIT
```

---

## 11. Automatizaciones con n8n

Como ya tenés n8n corriendo en el VPS, podés integrarlo con la app a través de webhooks y la API de Prisma/REST.

### 11.1 Notificación cuando un alumno llega al 100%

**Trigger**: Webhook HTTP desde la app al completar el progreso  
**Acción**: Enviar email/WhatsApp al docente

En `src/hooks/useDeliveries.ts`, después de un toggle exitoso que lleve a alguien al 100%, llamar:

```typescript
// Agregar al final de toggleEntrega cuando el nuevo progreso sea 100%
await fetch('/api/webhooks/progreso-completo', {
  method: 'POST',
  body: JSON.stringify({ alumnoId, alumnoNombre, cursoNombre })
})
```

Crear `/api/webhooks/progreso-completo/route.ts` que reenvíe a n8n:

```typescript
export async function POST(req: Request) {
  const data = await req.json()
  await fetch(process.env.N8N_WEBHOOK_PROGRESO_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return Response.json({ ok: true })
}
```

En n8n: Webhook → IF (progreso === 100) → Send Email / Telegram / WhatsApp

---

### 11.2 Reporte semanal de progreso por curso

**Trigger**: Cron en n8n (ej: viernes 18:00)  
**Acción**: Consultar la API del proyecto → generar resumen → enviar por email

En n8n, flujo:
1. **Schedule Trigger**: `0 18 * * 5` (viernes 18hs)
2. **HTTP Request**: `GET https://practicos.pmontovani.com/api/dashboard` (agregar autenticación)
3. **Code node**: calcular promedios, alumnos atrasados, alumnos destacados
4. **Send Email**: resumen HTML al docente

Para proteger el endpoint del dashboard con una API key interna:
```typescript
// En /api/dashboard/route.ts agregar:
const apiKey = req.headers.get('x-api-key')
if (apiKey !== process.env.INTERNAL_API_KEY) return Response.json({ error: 'Unauthorized' }, { status: 401 })
```

---

### 11.3 Alerta de alumnos sin entregas en X días

**Trigger**: Cron diario  
**Acción**: Consultar la DB → filtrar alumnos sin actividad → notificar

En n8n:
1. **Schedule Trigger**: cada día a las 8:00
2. **HTTP Request**: `GET https://practicos.pmontovani.com/api/alumnos?sinActividad=14` (crear este endpoint)
3. **IF**: si hay alumnos sin entregas en 14 días
4. **Telegram/Email**: lista de alumnos para hacer seguimiento

---

### 11.4 Backup automático vía n8n

En lugar del cron de bash, podés usar n8n:
1. **Schedule Trigger**: `0 3 * * *`
2. **Execute Command**: `~/scripts/backup-practicos.sh`
3. **IF**: verificar que el archivo se creó
4. **Send Email**: confirmar backup o alertar si falló

---

### 11.5 Sincronización con Google Classroom

Esta integración conecta la app con Google Classroom usando n8n como intermediario. No requiere modificar el código de la app para los flujos básicos — solo webhooks salientes y endpoints de consulta.

---

#### Arquitectura: Classroom como fuente de verdad

El flujo de información va **desde Classroom hacia la app**, no al revés. Classroom es donde los alumnos y el docente trabajan; la app refleja ese estado y agrega la capa de seguimiento visual.

```
  Google Classroom
  (cursos del docente)
        │
        │ polling cada 15 min (n8n Schedule)
        ▼
      n8n
    │       │
    │       │ llama a la API interna de la app
    ▼       ▼
App (practicos.pmontovani.com)
  - Crea TPs automáticamente
  - Marca entregas como INCOMPLETO
    (el docente confirma → ENTREGADO)
```

> **¿Por qué polling y no webhooks push de Classroom?**  
> La API de Google Classroom soporta notificaciones push vía Google Pub/Sub, pero requiere infraestructura adicional (proyecto GCP con Pub/Sub activado, endpoint público verificado por Google). El polling cada 15 minutos con n8n es equivalente en práctica para un aula con 30-40 alumnos y tiene cero infraestructura extra.

---

#### Paso 1: Configurar credenciales OAuth2 en Google Cloud

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Crear un proyecto: `Practicos Computacion CIEU`
3. Habilitar la **Google Classroom API**
4. **Credenciales → Crear → ID de cliente OAuth 2.0**
   - Tipo: **Aplicación web**
   - Orígenes autorizados: `https://n8n.pmontovani.com`
   - URI de redirección: `https://n8n.pmontovani.com/rest/oauth2-credential/callback`
5. Copiar `client_id` y `client_secret`
6. En n8n: **Credenciales → Nueva → Google Classroom OAuth2 API** → pegar los valores → autenticar con la cuenta Google del docente

**Scopes necesarios**:
```
https://www.googleapis.com/auth/classroom.courses.readonly
https://www.googleapis.com/auth/classroom.coursework.me.readonly
https://www.googleapis.com/auth/classroom.coursework.students
https://www.googleapis.com/auth/classroom.rosters.readonly
https://www.googleapis.com/auth/classroom.student-submissions.students.readonly
```

---

#### Paso 2: Mapear cursos y preparar la base de datos

Agregar campos de sincronización al schema de Prisma:

```prisma
model Curso {
  // ...campos existentes
  classroomCourseId String? // ID numérico del curso en Google Classroom
}

model TP {
  // ...campos existentes
  classroomCourseWorkId String? // ID del assignment en Classroom
}

model Alumno {
  // ...campos existentes
  email String? // email Google institucional del alumno (@cieu.edu.ar)
}
```

```bash
npx prisma db push
```

**Obtener los IDs de tus cursos de Classroom**: en n8n, crear un workflow temporal:
1. Trigger manual → Google Classroom: **Get Many Courses**
2. Ejecutar una vez → copiar los `id` numéricos de cada curso
3. Completar `classroomCourseId` en la app para cada curso desde el panel admin

---

#### Paso 3: Endpoints internos en la app

n8n necesita endpoints para escribir en la app. Todos se protegen con una API key interna.

**Middleware de autenticación para webhooks** — crear `src/lib/api/webhook-auth.ts`:

```typescript
export function validateWebhookSecret(req: Request): boolean {
  const secret = req.headers.get('x-webhook-secret')
  return secret === process.env.N8N_WEBHOOK_SECRET
}
```

**Endpoint: recibir entrega desde Classroom**  
Crear `src/app/api/webhooks/classroom/entrega/route.ts`:

```typescript
import { prisma } from '@/lib/prisma'
import { validateWebhookSecret } from '@/lib/api/webhook-auth'

export async function POST(req: Request) {
  if (!validateWebhookSecret(req))
    return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { classroomCourseWorkId, alumnoEmail, classroomCourseId } = await req.json()

  // Buscar el TP por classroomCourseWorkId
  const tp = await prisma.tP.findFirst({
    where: { classroomCourseWorkId },
    include: { curso: true },
  })
  if (!tp) return Response.json({ ok: false, reason: 'TP no encontrado' })

  // Buscar el alumno por email en ese curso
  const alumno = await prisma.alumno.findFirst({
    where: { email: alumnoEmail, cursoId: tp.cursoId },
  })
  if (!alumno) return Response.json({ ok: false, reason: 'Alumno no encontrado' })

  // Crear o actualizar entrega como INCOMPLETO
  // El docente confirma manualmente si está realmente completo
  await prisma.entrega.upsert({
    where: { alumnoId_tpId: { alumnoId: alumno.id, tpId: tp.id } },
    create: {
      alumnoId: alumno.id,
      tpId: tp.id,
      estado: 'INCOMPLETO',
      fechaEntrega: new Date().toISOString(),
    },
    update: {
      // Solo actualizar si estaba sin entrega — no pisar ENTREGADO con INCOMPLETO
      estado: 'INCOMPLETO',
    },
  })

  return Response.json({ ok: true, alumno: alumno.apellido, tp: tp.numero })
}
```

> **Lógica de confirmación**: cuando Classroom detecta una entrega del alumno, la app la registra como `INCOMPLETO` (amarillo ⏰). El docente la revisa y si está bien la marca como `ENTREGADO` (verde ✓) desde el panel. Esto te da un paso de validación antes de que cuente como completo.

**Endpoint: crear TP desde Classroom**  
Crear `src/app/api/webhooks/classroom/nuevo-tp/route.ts`:

```typescript
import { prisma } from '@/lib/prisma'
import { validateWebhookSecret } from '@/lib/api/webhook-auth'

export async function POST(req: Request) {
  if (!validateWebhookSecret(req))
    return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const {
    classroomCourseId,
    classroomCourseWorkId,
    titulo,
    descripcion,
    fechaEntrega,
  } = await req.json()

  // Buscar el curso por classroomCourseId
  const curso = await prisma.curso.findFirst({
    where: { classroomCourseId },
    include: { tps: { orderBy: { numero: 'desc' }, take: 1 } },
  })
  if (!curso) return Response.json({ ok: false, reason: 'Curso no encontrado' })

  // Verificar que no exista ya ese assignment
  const existe = await prisma.tP.findFirst({ where: { classroomCourseWorkId } })
  if (existe) return Response.json({ ok: true, reason: 'Ya existe', tpId: existe.id })

  // Número correlativo automático
  const ultimoNumero = curso.tps[0]?.numero ?? 0

  const tp = await prisma.tP.create({
    data: {
      titulo: titulo || `TP ${ultimoNumero + 1}`,
      descripcion: descripcion ?? null,
      numero: ultimoNumero + 1,
      cursoId: curso.id,
      classroomCourseWorkId,
      fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : null,
      conNota: false,
    },
  })

  return Response.json({ ok: true, tpId: tp.id, numero: tp.numero })
}
```

---

#### Flujo 1: Alumno entrega trabajo en Classroom → INCOMPLETO en la app

n8n hace polling a Classroom cada 15 minutos buscando entregas nuevas con estado `TURNED_IN`.

**Workflow en n8n**:

```
[Schedule Trigger: cada 15 minutos]
        │
        ▼
[HTTP Request: GET /api/cursos-classroom]
  Obtener lista de cursos con classroomCourseId
        │
        ▼
[Loop: por cada curso]
        │
        ▼
[Google Classroom: Get Many CourseWork]
  courseId: curso.classroomCourseId
        │
        ▼
[Loop: por cada courseWork]
        │
        ▼
[Google Classroom: Get Many Student Submissions]
  courseId: ...
  courseWorkId: ...
  states: TURNED_IN   ← solo los que entregaron
        │
        ▼
[Code: filtrar solo los NUEVOS (comparar con Static Data)]
  /* n8n guarda en Static Data el set de
     "alumnoEmail:courseWorkId" ya procesados */
        │
        ▼
[IF: hay entregas nuevas]
    SÍ │
        ▼
[Loop: por cada entrega nueva]
        │
        ▼
[HTTP Request: POST /api/webhooks/classroom/entrega]
  headers: { x-webhook-secret: ... }
  body: {
    classroomCourseWorkId: courseWork.id,
    alumnoEmail: submission.userId → resolver email,
    classroomCourseId: curso.classroomCourseId
  }
        │
        ▼
[Code: agregar a Static Data como procesada]
```

**Nodo Code — filtrar entregas nuevas** (JavaScript en n8n):

```javascript
// Static Data persiste entre ejecuciones del workflow
const staticData = $getWorkflowStaticData('global')
if (!staticData.procesadas) staticData.procesadas = []

const submissions = $input.all()
const nuevas = submissions.filter(item => {
  const key = `${item.json.userId}:${item.json.courseWorkId}`
  return !staticData.procesadas.includes(key)
})

// Marcar como procesadas
nuevas.forEach(item => {
  const key = `${item.json.userId}:${item.json.courseWorkId}`
  staticData.procesadas.push(key)
})

// Limitar el array para no crecer indefinidamente
if (staticData.procesadas.length > 5000) {
  staticData.procesadas = staticData.procesadas.slice(-3000)
}

return nuevas
```

> **Resolver userId → email**: la API de Classroom devuelve `userId` (numérico de Google), no el email. Usar **Google People API** o **Google Directory API** para resolverlo, o bien al registrar alumnos en la app pedir que completen el `userId` de Classroom en lugar del email.

---

#### Flujo 2: Docente crea un TP en Classroom → se crea en la app

Cuando el docente publica un nuevo assignment en Classroom, n8n lo detecta y lo crea automáticamente en la app.

**Workflow en n8n**:

```
[Schedule Trigger: cada 30 minutos]
        │
        ▼
[Loop: por cada curso con classroomCourseId]
        │
        ▼
[Google Classroom: Get Many CourseWork]
  courseId: curso.classroomCourseId
  orderBy: updateTime desc
        │
        ▼
[Code: filtrar solo PUBLISHED y no procesados aún]
  Comparar con Static Data "tps_procesados"
        │
        ▼
[IF: hay TPs nuevos]
    SÍ │
        ▼
[Loop: por cada TP nuevo]
        │
        ▼
[HTTP Request: POST /api/webhooks/classroom/nuevo-tp]
  headers: { x-webhook-secret: ... }
  body: {
    classroomCourseId: curso.classroomCourseId,
    classroomCourseWorkId: courseWork.id,
    titulo: courseWork.title,
    descripcion: courseWork.description,
    fechaEntrega: courseWork.dueDate  ← convertir de {year,month,day} a ISO
  }
        │
        ▼
[Code: marcar como procesado en Static Data]
```

**Nodo Code — convertir dueDate de Classroom a ISO**:

```javascript
const items = $input.all()
return items.map(item => {
  const cw = item.json
  let fechaEntrega = null
  if (cw.dueDate) {
    const { year, month, day } = cw.dueDate
    fechaEntrega = new Date(year, month - 1, day).toISOString()
  }
  return {
    json: {
      classroomCourseWorkId: cw.id,
      titulo: cw.title,
      descripcion: cw.description ?? null,
      fechaEntrega,
    }
  }
})
```

---

#### Flujo 3: Notificación al docente cuando se detectan entregas nuevas

Además de actualizar la app, n8n puede notificar al docente en tiempo real.

**Agregar al final del Flujo 1**, después de llamar al endpoint de la app:

```
[HTTP Request: POST /api/webhooks/classroom/entrega]
        │
        ▼ (si ok: true)
[Aggregate: agrupar todas las entregas del ciclo]
        │
        ▼
[IF: cantidad > 0]
        │
        ▼
[Send Email / Telegram]
  Asunto: "📬 Nuevas entregas en Classroom"
  Cuerpo:
    Se registraron X entregas nuevas como INCOMPLETO:
    - Rodríguez, Juan — TP 3 (2°A)
    - López, Ana — TP 3 (2°B)
    
    Revisalas en: https://practicos.pmontovani.com
```

Para Telegram: usar el nodo **Telegram** de n8n con tu bot y chat_id personal. Es más inmediato que el email.

---

#### Prerequisito: endpoint para listar cursos con classroomCourseId

n8n necesita obtener los cursos con su ID de Classroom para hacer los loops. Crear `src/app/api/cursos-classroom/route.ts`:

```typescript
import { prisma } from '@/lib/prisma'
import { validateWebhookSecret } from '@/lib/api/webhook-auth'

export async function GET(req: Request) {
  if (!validateWebhookSecret(req))
    return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const cursos = await prisma.curso.findMany({
    where: { classroomCourseId: { not: null } },
    select: { id: true, nombre: true, codigo: true, classroomCourseId: true },
  })

  return Response.json(cursos)
}
```

---

#### Variables de entorno adicionales

En `.env.production`:

```env
# Secret compartido entre n8n y la app
N8N_WEBHOOK_SECRET=GENERAR_CON_openssl_rand_base64_32

# (Opcional) para notificaciones Telegram desde la app
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

En n8n, configurar la misma clave en las credenciales de cada workflow bajo **Header Auth**.

---

#### Orden de implementación sugerido

| Fase | Qué implementar | Resultado |
|------|----------------|-----------|
| 1 | OAuth2 en Google Cloud + credenciales en n8n | n8n puede leer Classroom |
| 2 | Agregar campos al schema + `npx prisma db push` | DB lista para sincronización |
| 3 | Completar `classroomCourseId` en cada curso desde el admin | Mapeo listo |
| 4 | Endpoint `/api/cursos-classroom` | n8n puede listar cursos |
| 5 | **Flujo 2**: Classroom crea TP → app crea TP | Ya no hay doble carga |
| 6 | Endpoint `/api/webhooks/classroom/entrega` | App puede recibir entregas |
| 7 | **Flujo 1**: alumno entrega en Classroom → INCOMPLETO en app | Seguimiento automático |
| 8 | Notificación Telegram al docente | Alertas en tiempo real |

---

### Configurar n8n para recibir webhooks desde la app

En el `.env.production` del proyecto, agregar:
```env
N8N_WEBHOOK_PROGRESO_URL=https://n8n.pmontovani.com/webhook/progreso-completo
N8N_WEBHOOK_SECRET=TOKEN_SECRETO_COMPARTIDO
INTERNAL_API_KEY=OTRA_CLAVE_PARA_API_INTERNA
```

En cada workflow de n8n, validar el token secreto en el nodo webhook para evitar llamadas no autorizadas.

---

## 12. Mantenimiento y monitoreo

### Ver estado de los contenedores

```bash
docker compose -f docker-compose.prod.yml ps
docker stats --no-stream
```

### Ver logs en tiempo real

```bash
# App
docker compose -f docker-compose.prod.yml logs -f app --tail=100

# Base de datos
docker compose -f docker-compose.prod.yml logs -f db --tail=50
```

### Actualizar solo la base de datos (sin tocar la app)

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production \
  up -d --no-deps db
```

### Restaurar un backup

```bash
cd /opt/practicos-computacion

# Detener la app temporalmente
docker compose -f docker-compose.prod.yml stop app

# Restaurar
export $(cat .env.production | grep ^POSTGRES)
gunzip -c /opt/backups/practicos/backup_20260508_030000.sql.gz \
  | docker exec -i practicos_db psql -U ${POSTGRES_USER} ${POSTGRES_DB}

# Reiniciar
docker compose -f docker-compose.prod.yml start app
```

### Renovar certificado SSL manualmente (si es necesario)

Traefik renueva automáticamente los certificados Let's Encrypt. Si necesitás forzar una renovación:

```bash
# El archivo de certificados está en /opt/n8n-traefik/letsencrypt/
ls -la /opt/n8n-traefik/letsencrypt/acme.json

# Para renovación forzada, eliminar y reiniciar Traefik:
# (no recomendado, hazlo solo si sabes qué hacés)
# rm /opt/n8n-traefik/letsencrypt/acme.json
# docker restart traefik
```

Los certificados de `practicos.pmontovani.com` se almacenan en el archivo `acme.json` de Traefik.

---

## 13. Checklist de lanzamiento

### Antes del primer deploy

- [ ] DNS configurado: `practicos.pmontovani.com` apunta al VPS
- [ ] Certificado SSL obtenido con Certbot
- [ ] `.env.production` creado en el VPS con todos los valores
- [ ] `NEXTAUTH_SECRET` generado (`openssl rand -base64 32`)
- [ ] Repositorio en GitHub con el código
- [ ] Secrets de GitHub Actions configurados (VPS_HOST, VPS_USER, VPS_SSH_KEY, VPS_DEPLOY_PATH)
- [ ] SSH sin contraseña funcionando desde GitHub Actions al VPS
- [ ] `docker-compose.prod.yml` en el repo
- [ ] `.github/workflows/deploy.yml` en el repo

### Primer deploy

- [ ] `docker compose up -d` exitoso
- [ ] Contenedores `app` y `db` en estado `healthy`
- [ ] `prisma db push` ejecutado (base de datos inicializada)
- [ ] Usuario admin creado
- [ ] Login en `https://practicos.pmontovani.com/login` funciona
- [ ] Crear un curso de prueba y verificar que aparece en la URL pública
- [ ] Verificar que alumnos pueden acceder sin login

### Después del deploy

- [ ] Backup automático configurado y probado
- [ ] Workflow de n8n básico funcionando (reporte semanal)
- [ ] Logs sin errores críticos
- [ ] Renovación SSL verificada (`certbot renew --dry-run`)

---

## Apéndice A: Si preferís sub-ruta en lugar de subdominio

Para usar `pmontovani.com/proyectos/practicos`, agregar en `next.config.ts`:

```typescript
const nextConfig = {
  output: 'standalone',
  basePath: '/proyectos/practicos',
  assetPrefix: '/proyectos/practicos',
  // ...resto de config
}
```

Y en `NEXTAUTH_URL`:
```env
NEXTAUTH_URL="https://pmontovani.com/proyectos/practicos"
```

En Nginx, en el server block de `pmontovani.com`:
```nginx
location /proyectos/practicos {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

> **Advertencia**: requiere revisar todas las redirecciones de NextAuth y los callbacks de sesión, ya que asumen que la app corre en la raíz `/`. Es más propenso a errores que el subdominio.

---

*Manual generado el 2026-05-08 · Proyecto: Prácticos Computación · Prof. Pablo Montovani · CIEU Ushuaia*

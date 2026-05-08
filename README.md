# 🏎️ Carrera Escolar

Plataforma gamificada de seguimiento de Trabajos Prácticos para el **CIEU — Colegio Integral de Educación Ushuaia**.

Cada alumno tiene un auto que avanza en una pista de carreras según el porcentaje de TPs entregados.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend + API | Next.js 14 (App Router) + TypeScript |
| Estilos | TailwindCSS + shadcn/ui |
| Animaciones | Framer Motion |
| Base de datos | PostgreSQL 16 + Prisma ORM |
| Autenticación | NextAuth.js (credentials) |
| Data fetching | SWR (optimistic UI) |
| Gamificación | canvas-confetti |
| Gráficos | Recharts |
| Deploy | Docker + Nginx |

---

## Instalación y desarrollo local

### Prerrequisitos

- Node.js 20+
- PostgreSQL 16 (o Docker)
- npm

### Pasos

```bash
# 1. Clonar e instalar
git clone <repo>
cd WebEscuela
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# 3. Crear la base de datos y aplicar el schema
npx prisma db push

# 4. Cargar datos de prueba
npm run db:seed

# 5. Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

**Credenciales de prueba:**
- Email: `pablo@cieu.edu.ar`
- Contraseña: `cieu2026`

---

## Variables de entorno

```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/carrera_escolar"

# NextAuth (generar con: openssl rand -base64 32)
NEXTAUTH_SECRET="secreto-aleatorio-seguro"
NEXTAUTH_URL="http://localhost:3000"   # En producción: https://tu-dominio.com

# Docker
POSTGRES_PASSWORD="cambiar-este-password"
DOMAIN="tu-dominio.com"
```

---

## Comandos disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter

npm run db:generate  # Regenerar Prisma client
npm run db:push      # Aplicar schema (sin migraciones)
npm run db:migrate   # Crear migración
npm run db:seed      # Cargar datos de prueba
npm run db:studio    # Abrir Prisma Studio (GUI BD)
npm run db:reset     # Reiniciar BD y re-seedear
```

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/login/        # Página de login
│   ├── (dashboard)/
│   │   ├── dashboard/       # Dashboard general
│   │   ├── curso/[code]/    # Vista de carrera + entregas
│   │   └── admin/           # Panel admin (alumnos, TPs, entregas)
│   └── api/                 # API Routes REST
├── components/
│   ├── race/                # Pista de carreras SVG
│   ├── course/              # Tabla de entregas
│   ├── dashboard/           # Ranking, gráficos, paneles
│   ├── admin/               # Formularios CRUD
│   ├── gamification/        # Confetti, medallas
│   └── ui/                  # shadcn/ui base
├── hooks/                   # Custom hooks (SWR, animaciones)
├── lib/                     # Prisma, auth, cálculos
└── types/                   # TypeScript types
```

---

## Deploy en VPS Linux

### Opción 1: Docker Compose (Recomendado)

```bash
# 1. Copiar archivos al servidor
scp -r . usuario@tu-vps:/opt/carrera-escolar

# 2. En el servidor, configurar .env
cp .env.example .env
nano .env   # Completar todas las variables

# 3. Generar certificados SSL con Certbot
apt install certbot
certbot certonly --standalone -d tu-dominio.com
cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem nginx/ssl/cert.pem
cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem nginx/ssl/key.pem

# 4. Construir y levantar
docker compose -f docker-compose.prod.yml up -d --build

# 5. Aplicar schema y seedear (primera vez)
docker compose -f docker-compose.prod.yml exec app npx prisma db push
docker compose -f docker-compose.prod.yml exec app npm run db:seed
```

### Opción 2: Desarrollo con Docker

```bash
# Levanta la app + PostgreSQL automáticamente con datos de prueba
docker compose up

# La app estará en http://localhost:3000
```

### Gestión del stack

```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs -f app

# Reiniciar app
docker compose -f docker-compose.prod.yml restart app

# Actualizar (nuevo deploy)
git pull
docker compose -f docker-compose.prod.yml up -d --build app

# Backup de la BD
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U carrera carrera_escolar > backup.sql

# Restaurar BD
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U carrera carrera_escolar < backup.sql
```

---

## Sistema de colores

| Color | Umbral | Significado |
|-------|--------|-------------|
| 🟢 Verde | ≥ 70% | Alumno destacado |
| 🟡 Amarillo | 40–70% | En progreso |
| 🔴 Rojo | < 40% | Alumno atrasado |

---

## Cursos iniciales

| Código | Nombre | Color |
|--------|--------|-------|
| 2A | 2° Año A | Índigo |
| 2B | 2° Año B | Rosa |
| 3A | 3° Año A | Naranja |
| 3B | 3° Año B | Verde |

Para agregar un nuevo curso: ir a `/admin` y usar la base de datos directamente (Prisma Studio: `npm run db:studio`).

---

## Renovación de certificados SSL

```bash
# Renovar automáticamente (agregar al cron)
certbot renew --quiet
cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem /opt/carrera-escolar/nginx/ssl/cert.pem
cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem /opt/carrera-escolar/nginx/ssl/key.pem
docker compose -f /opt/carrera-escolar/docker-compose.prod.yml restart nginx
```

---

## Licencia

Uso interno CIEU — Colegio Integral de Educación Ushuaia, Tierra del Fuego.

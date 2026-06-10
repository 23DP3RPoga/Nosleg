# Vitalo — Personīgās veselības pārvaldības sistēma

> Moderna tīmekļa lietotne veselības rādītāju uzskaitei, medicīnas dokumentu pārvaldībai, ārstu vizīšu plānošanai un zāļu atgādinājumiem — izstrādāta ar Laravel un React.

🌐 **Dzīvā demo:** https://frontend-production-190a5.up.railway.app

---

## Funkcionalitāte

- **Veselības mērījumi** — Asinsspiediens, sirds ritms, glikoze, svars ar grafikiem
-  **Dokumentu glabātuve** — Medicīnas failu augšupielāde un kategorēšana (analīzes, receptes, ārsta izraksti)
-  **Drošā koplietošana** — Dokumentu koplietošana ar laika ierobežojuma saitēm (saņēmējam nav vajadzīgs konts)
-  **Zāļu atgādinājumi** — Grafika pārvaldība ar biežumu, devām un lietošanas laikiem
-  **Ārstu vizītes** — Vizīšu plānošana un pārvaldība
- **Ārstu katalogs** — Meklēšana pēc specialitātes, savu ārstu saglabāšana
-  **PDF eksports** — Mērījumu vēstures eksports formatētā PDF failā
-  **Administratora panelis** — Lietotāju pārvaldība un platformas statistika
-  **Divvalodu saskarne** — Latviešu un angļu valoda

---

## Tehnoloģiju steks

| Slānis | Tehnoloģija |
|--------|-------------|
| Frontend | React 19, TanStack Router, TypeScript, Tailwind CSS 4 |
| Grafiki | Recharts |
| PDF | jsPDF + jspdf-autotable |
| Backend | Laravel 12, PHP 8.2+ |
| Autentifikācija | Laravel Sanctum (Bearer tokeni) |
| E-pasts | Resend API |
| Datu bāze | MySQL 8.x (11 tabulas) |
| Hosting | Railway |

---

## Projekta struktūra

```
Nosleg/
├── frontend/               # React 19 + TanStack Router
│   ├── src/
│   │   ├── routes/         # 14 lapas (dashboard, auth, admin, share)
│   │   ├── components/
│   │   │   ├── dashboard/  # Veselības moduļu paneļi
│   │   │   ├── marketing/  # Publiskā vietne
│   │   │   └── ui/         # Atkārtoti lietojami komponenti
│   │   ├── auth/           # AuthProvider, Zod validācijas shēmas
│   │   └── lib/            # api.ts, pdf-export.ts
└── backend/                # Laravel 12 REST API
    ├── app/Http/Controllers/
    ├── database/migrations/
    └── routes/api.php      # 39 API maršruti
```

---

## Datu bāzes shēma

11 tabulas ar kaskādes dzēšanu:

```
users
├── measurements            (bp, heart, glucose, weight)
├── health_documents
│   └── document_shares
│       └── share_comments
├── medication_reminders
├── doctor_appointments
└── user_doctors ──► doctors
```

---

## Lokālā izstrāde

### Prasības

- PHP 8.2+, Composer
- Node.js 18+, npm
- MySQL 8.x

### Backend

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
# Darbojas uz http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Darbojas uz http://localhost:8080
```

### Vides mainīgie (backend `.env`)

```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:8080

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vitalo
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=log        # vai: resend
RESEND_API_KEY=        # tavs Resend atslēgas kods

SANCTUM_STATEFUL_DOMAINS=localhost:8080
```

---

## API pārskats

| Piekļuve | Maršruti | Apraksts |
|----------|----------|----------|
| Publiski (11) | `/api/register`, `/api/login`, `/api/public/share/{token}` | Autentifikācija + publiskā koplietošana |
| Autentificēti (5) | `/api/me`, `/api/logout` | Profila pārvaldība |
| Autentificēti + verificēti (19) | `/api/measurements`, `/api/documents`, `/api/medications`, `/api/appointments`, `/api/doctors/*` | Veselības dati |
| Administratori (4) | `/api/admin/users`, `/api/admin/stats` | Sistēmas administrēšana |

---

## Izvietošana (Railway)

Lietotne izvietota [Railway](https://railway.app) platformā ar trim pakalpojumiem:

- **Frontend** — Node.js + Vite build
- **Backend** — PHP + Laravel (`php artisan migrate --force && php artisan serve`)
- **MySQL** — Railway pārvaldīta datu bāze




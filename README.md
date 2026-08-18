# ⚖️ Lawyer Finder — Checkpoint 1

**A Database-Driven Legal Consultation Platform (CSE 3104 Project)**  
Connects clients with verified lawyers by specialization and district.

---

## 🚀 Quick Start (1-Command Launcher)

To run both the **PHP Backend API** and the **React Vite Frontend** with a single command and auto-open the browser:

```bash
python run.py
```

*This script detects your XAMPP PHP binary (`C:\xampp\php\php.exe`), checks MySQL database status, boots the PHP API server on `http://localhost:8000`, starts the Vite frontend on `http://localhost:5173`, and opens the browser automatically.*

---

## 🚀 Tech Stack

- **Frontend:** React (Vite, JavaScript), Tailwind CSS, Google Material Design 3 (Express tokens, 3D elevations `--e1` to `--e5`, Roboto Flex & Material Symbols Rounded).
- **Backend:** Plain PHP with PDO (no framework overhead), session authentication, prepared statements, and JSON REST endpoints.
- **Database:** MySQL (normalized relational schema with foreign key constraints, indexes, and transactions with locks).
- **Local Environment:** XAMPP (Apache + MySQL) & VS Code.

---

## 📁 Project Structure

```
Lawyear/
├── backend/                       # PHP API (Place inside XAMPP htdocs/lawyer-finder-api)
│   ├── config/
│   │   └── db.php                 # PDO MySQL connection, CORS headers, JSON helpers
│   ├── auth/
│   │   ├── login.php              # Authenticate client, lawyer, or admin
│   │   ├── register.php           # Register client/lawyer with transaction
│   │   ├── logout.php             # Destroy session
│   │   └── me.php                 # Retrieve active session
│   ├── appointments/
│   │   ├── create.php             # Transaction + SELECT ... FOR UPDATE double-booking guard
│   │   ├── read.php               # Multi-table JOIN (appointments -> users -> lawyers -> users)
│   │   ├── update.php             # Validated status transitions & reschedule
│   │   ├── delete.php             # Soft-cancel appointment (preserves history)
│   │   └── stats.php              # Aggregates (GROUP BY lawyer_id, status)
│   ├── lawyers/
│   │   └── read.php               # Search & filter lawyers directory
│   └── database/
│       └── schema.sql             # Full normalized schema & sample seed data
│
└── frontend/                      # React (Vite) App
    ├── src/
    │   ├── api/                   # Fetch clients for PHP API with error handling
    │   │   ├── config.js
    │   │   ├── auth.js
    │   │   ├── appointments.js
    │   │   └── lawyers.js
    │   ├── components/            # TopBar, Footer, LawyerCard, BookingModal, CalendarPicker, StatusBadge
    │   ├── context/               # AuthContext.jsx (Client, Lawyer, Admin role switcher)
    │   ├── pages/
    │   │   ├── LandingPage.jsx    # Hero, 3D laptop mockup, curated lawyers, services
    │   │   ├── SearchLawyersPage.jsx
    │   │   ├── LawyerProfilePage.jsx
    │   │   ├── BookAppointmentPage.jsx
    │   │   ├── MyAppointmentsPage.jsx # Client appointment manager (Live PHP read + cancel)
    │   │   ├── IncomingRequestsPage.jsx # Lawyer dashboard (Accept / Reject / Complete)
    │   │   ├── AdminDashboardPage.jsx  # Live master appointments table & charts
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── ClientEditProfilePage.jsx
    │   │   └── LawyerEditProfilePage.jsx
    │   ├── App.jsx
    │   ├── index.css              # Material 3 tokens & elevation styles
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🗄️ Database Setup (phpMyAdmin / MySQL)

1. Start **Apache** and **MySQL** from your **XAMPP Control Panel**.
2. Open your browser and navigate to **phpMyAdmin**:  
   `http://localhost/phpmyadmin/`
3. Click the **Import** tab.
4. Choose the file: `backend/database/schema.sql`.
5. Click **Go** / **Import**.  
   *This creates the `lawyer_finder` database and populates tables (`users`, `lawyers`, `appointments`) with seed data.*

---

## 🔌 Backend Setup (XAMPP `htdocs`)

1. Copy the `backend/` folder into your XAMPP `htdocs` directory and rename or symlink it:
   ```
   C:\xampp\htdocs\lawyer-finder-api\
   ```
2. Verify the API is responding:
   - Visit: `http://localhost/lawyer-finder-api/appointments/read.php`
   - You should see the JSON response containing seed appointment records.

> **Note for Custom PHP Server:** You can also run the backend directly with PHP's built-in server:
> ```bash
> cd backend
> php -S localhost:8000
> ```

---

## 💻 Frontend Setup & Dev Server

1. Open a terminal in the `frontend` folder:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open `http://localhost:5173` in your browser.

---

## 🛡️ Database Table Operations Demonstrated End-to-End (`appointments`)

| SQL Operation | Backend Script | Description |
| :--- | :--- | :--- |
| **1. Create** | `backend/appointments/create.php` | Runs inside an **ACID Transaction** with `SELECT ... FOR UPDATE` row lock checking for existing `pending`/`accepted` appointments for that lawyer at that exact date and time, completely preventing double-booking. |
| **2. Read (List)** | `backend/appointments/read.php` | Multi-table **SQL JOIN** combining `appointments` $\to$ `users` (client name/email/phone) $\to$ `lawyers` $\to$ `users` (lawyer name/rating/fee) with filtering by `client_id`, `lawyer_id`, or `status`. |
| **3. Update** | `backend/appointments/update.php` | Validates status machine rules (`pending -> accepted/rejected`, `accepted -> completed/cancelled`). Rejects invalid transitions server-side. |
| **4. Delete / Cancel** | `backend/appointments/delete.php` | Performs a **soft-cancel** by updating `status = 'cancelled'` and recording the reason, preserving audit history. |
| **5. Stats & Aggregates**| `backend/appointments/stats.php` | Executes `COUNT(*) ... GROUP BY lawyer_id, status` and calculates upcoming appointment volume. |

---

## 👥 Seed Test Accounts

All accounts use the password: `password123`

| Role | Name | Email | Default Dashboard / Screen |
| :--- | :--- | :--- | :--- |
| **Client** | Sadia Anwar | `sadia@gmail.com` | `My Appointments` (`/client/appointments`) |
| **Client** | Mahin Hasan | `mahin@gmail.com` | `Find Lawyers` (`/lawyers`) |
| **Lawyer** | Adv. Rahim Karim | `rahim@lawyer.com` | `Incoming Case Requests` (`/lawyer/requests`) |
| **Lawyer** | Adv. Farzana Yasmin | `farzana@lawyer.com` | `Incoming Case Requests` (`/lawyer/requests`) |
| **Admin** | System Admin | `admin@lawyerfinder.com` | `Admin Dashboard` (`/admin/dashboard`) |

> **Pro-tip:** Use the **Role Switcher** pill in the top navigation bar to switch between Client, Lawyer, and Admin views with one click!

# ⚡ EV Charge Finder

**Find charging stations. Compare chargers. Plan your next charge.**

EV Charge Finder is a web application designed to help electric vehicle owners discover charging stations, explore charger availability, compare charging options, and manage bookings through a simple interface.

The project uses React and Vite for the frontend, Python Flask for the backend REST API, and SQLite for database storage.

## ✨ Features

### Charging Stations
- Browse available charging stations.
- Search stations by city and other supported keywords.
- View station addresses, amenities, and charging information.
- Filter stations using supported criteria such as connector type, charging category, power, price, and availability.
- Sort stations by price, name, distance (when coordinates are supplied), or recommended order.
- View station details and charger information.

### User Authentication
- User registration and login API.
- JWT-based authentication support.
- Token handling in the frontend.
- Profile management endpoints.

### Bookings
- Create charging bookings.
- Retrieve user bookings.
- View individual booking details.
- Cancel bookings through the API.

### Administration
- Admin statistics endpoints.
- Station and charger management APIs.
- Station status management.
- Booking management endpoints.

> Feature availability depends on the corresponding frontend screens and backend routes being fully implemented and tested.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, JavaScript, Vite |
| Backend | Python, Flask |
| Database | SQLite |
| ORM | Flask-SQLAlchemy |
| Authentication | Flask-JWT-Extended |
| Cross-origin requests | Flask-CORS |
| Configuration | python-dotenv |
| Version control | Git and GitHub |

## 📁 Project Structure

```text
ev-charge-finder/
│
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── stations.py
│   │   │   ├── bookings.py
│   │   │   └── admin.py
│   │   ├── services/
│   │   │   └── booking_service.py
│   │   ├── __init__.py
│   │   ├── errors.py
│   │   ├── extensions.py
│   │   └── models.py
│   ├── instance/
│   │   └── ev_charge.db
│   ├── config.py
│   ├── run.py
│   ├── seed.py
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

*The structure above describes the main project files; some files or folders may vary in your local setup.*

## 🚀 Getting Started

### Prerequisites

Install the following:

- Node.js and npm
- Python 3.10 or later
- Git
- Visual Studio Code (recommended)

### 1. Clone the repository

```bash
git clone https://github.com/ashishsamal28/ev-charge-finder.git
cd ev-charge-finder
```

### 2. Set up the backend

Open a terminal in the project root.

```powershell
cd backend
python -m venv .venv
```

Activate the virtual environment on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install the Python dependencies:

```powershell
pip install -r requirements.txt
```

### 3. Configure environment variables

Check `backend/.env.example` for the supported environment variable names and copy it to `backend/.env` if required.

Configure the appropriate values for the database, Flask secret key, JWT secret key, and any administrator settings required by your configuration.

**Security:** Never commit `.env` files or real passwords, tokens, or secret keys to GitHub.

### 4. Initialize and seed the database

The application creates database tables through its Flask application setup. If you want to populate the database with the project's sample data, run:

```powershell
python seed.py
```

Run this command from the `backend` directory.

Review the seed script before running it if you have existing data. Do not use reset options unless you intend to reset the database.

### 5. Start the backend server

From the `backend` directory, run:

```powershell
python run.py
```

The development server normally runs at:

```text
http://127.0.0.1:5000
```

Test the health endpoint:

```text
http://127.0.0.1:5000/
```

Expected response:

```json
{
  "message": "EV Charge Finder API is running"
}
```

### 6. Set up the frontend

Open a second terminal and navigate to the frontend directory:

```powershell
cd frontend
npm install
```

Create a `.env` file in the frontend directory if you need to override the API URL:

```env
VITE_API_BASE_URL=http://127.0.0.1:5000/api
```

Start the Vite development server:

```powershell
npm run dev
```

Open the local URL printed by Vite, commonly:

```text
http://localhost:5173
```

Keep both development servers running while using the application.

## 🔌 API Overview

The backend exposes REST endpoints under `/api`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Backend health check |
| GET | `/api/stations` | Search and list stations |
| GET | `/api/stations/<id>` | Retrieve station details |
| GET | `/api/stations/<id>/chargers` | Retrieve station chargers |
| GET | `/api/stations/<id>/availability` | Retrieve availability information |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration

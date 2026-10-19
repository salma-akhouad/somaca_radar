# SOMACA RADAR

**Real-Time Industrial Equipment Monitoring, Incident Management & AI-Assisted Analysis**

SOMACA RADAR is a full-stack web application designed to centralize industrial IT equipment monitoring, provide an interactive representation of a production environment, and streamline the reporting, tracking and analysis of technical incidents.

The system combines a 3D factory visualization, real-time status updates, role-based operational workflows, administrative management and an AI-powered assistant.

> **Project status:** Implemented and tested in a local development environment. Public deployment is not currently available.

## Overview

Industrial environments involve numerous machines, workstations and technical assets distributed across production areas. Maintaining visibility over their operational status and managing incidents efficiently requires structured information and clear coordination.

SOMACA RADAR brings these activities together through a centralized interface, allowing authorized users to inspect equipment states, report incidents, follow their resolution and consult historical records.

The application uses demonstration data to represent the production environment and its equipment.

## Key Features

### Interactive 3D Cartography
- A navigable 3D representation of the factory environment built with Three.js and React Three Fiber.
- Visual identification of production areas and equipment locations.
- Equipment status indicators linked to application data.
- Interactive navigation and contextual machine information.

### Real-Time Equipment Monitoring
- Equipment states including Operational, Attention Required, Critical and Unknown.
- Real-time updates delivered through WebSocket connections.
- Machine status histories for operational traceability.
- A consolidated factory status view.

### Incident Management
- Incident reporting linked to individual machines.
- Severity classification and controlled incident status transitions.
- Tracking of confirmed causes, applied solutions and contacted parties.
- Historical records of status changes and severity updates.
- Role-dependent actions throughout the incident lifecycle.

### SOMACA Helper — AI-Assisted Analysis
- A conversational assistant integrated into the application.
- Natural-language questions about incidents, machines and operational statistics.
- Database-grounded responses using verified application information.
- Semantic similarity matching of historical incidents with multilingual sentence embeddings.
- Conversation history associated with authenticated users.

### Administration
- Management of users and access roles.
- Equipment administration, including decommissioning and reactivation workflows.
- Management of organizational entities and equipment assignments.
- Session monitoring and revocation.
- Search, filtering and pagination across administrative datasets.

### Authentication and Access Control
- Four application roles: Production Operator, Supervisor, Technician and Administrator.
- JWT authentication with HttpOnly session cookies.
- Server-side role-based authorization.
- Session persistence and revocation using hashed tokens.
- Request rate limiting for selected operations.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| 3D Visualization | Three.js, React Three Fiber, Drei |
| Backend | Python, FastAPI, Pydantic |
| Database | PostgreSQL, SQLAlchemy |
| Authentication | JWT, HttpOnly cookies, bcrypt |
| Real-Time Communication | WebSockets |
| AI Assistant | Google Gemini API |
| Semantic Similarity | SentenceTransformers, PyTorch, multilingual MiniLM |

## Architecture

SOMACA RADAR follows a client–server architecture.

```text
                React + TypeScript
                 (Web Interface)
                       |
              HTTP / WebSockets
                       |
                  FastAPI
                (Application API)
                  /         \
                 /           \
         PostgreSQL       AI Services
       (Operational Data)  /       \
                          /         \
                    Gemini API   SentenceTransformer
```

The frontend handles user interaction, routing, visualization and real-time updates. FastAPI manages business rules, authentication, permissions, incident workflows, database access and AI orchestration.

PostgreSQL stores equipment, organizational entities, users, sessions, incidents, histories and assistant conversations.

Gemini provides language-model capabilities, while SentenceTransformers supports semantic comparison of incident descriptions and historical records.

## Repository Structure

```text
somaca_radar_ai/
├── app/
│   ├── incident_analysis/
│   ├── tests/
│   ├── main.py
│   ├── auth.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   └── somaca_helper_service.py
├── database/
│   ├── schema.sql
│   └── seed.sql
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── .env.example
└── requirements.txt
```

## Local Setup

### Prerequisites

- Python with a version compatible with the pinned dependencies
- Node.js and npm
- PostgreSQL
- A Gemini API key for AI assistant functionality

### 1. Clone the repository

```bash
git clone https://github.com/salma-akhouad/somaca_radar_ai.git
cd somaca_radar_ai
```

### 2. Configure the backend

Create a virtual environment and install the Python dependencies.

```bash
python -m venv .venv
```

On Windows:

```powershell
.\.venv\Scripts\activate
```

On Linux or macOS:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure PostgreSQL

Create a PostgreSQL database and execute the provided SQL files in this order:

1. `database/schema.sql` — Database structure and initial reference data.
2. `database/seed.sql` — Demonstration records.

Use a separate development database. Do not load demonstration records into a production environment.

### 4. Configure environment variables

Create a `.env` file in the repository root using `.env.example` as a reference.

```dotenv
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
JWT_SECRET_KEY=replace_with_a_secure_random_secret
GEMINI_API_KEY=replace_with_your_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
HELPER_CONTEXT_MESSAGE_LIMIT=20
COOKIE_SECURE=false
```

Never commit `.env` or real credentials.

### 5. Start the backend

From the repository root:

```bash
uvicorn app.main:app --reload
```

The local API runs at `http://localhost:8000`.

### 6. Start the frontend

Open another terminal:

```bash
cd frontend
npm ci
npm run dev
```

The application is available locally at:

`http://localhost:5173`

The frontend defaults to the local backend address. For another backend environment, configure `VITE_API_BASE_URL`.

## Demonstration

**Video walkthrough:** To be added.

The demonstration presents the main application workflows, including the interactive factory map, equipment monitoring, incident management, administration and SOMACA Helper.

**Live application:** Not currently deployed.

## Current Scope and Limitations

- The application uses simulated demonstration data rather than a connection to live industrial equipment.
- Real-time updates reflect events generated through the application.
- SOMACA Helper requires an external Gemini API connection for language-model responses.
- Semantic incident similarity requires the multilingual embedding model and its runtime dependencies.
- The application has been developed and evaluated locally; production infrastructure, deployment hardening and operational monitoring are not included in the current delivery.

## Future Improvements

- Containerized development and deployment using Docker.
- Cloud-based application hosting.
- Automated testing and continuous integration.
- Additional production monitoring and observability.
- Integration with authorized industrial data sources where applicable.

## Project Context

Developed as a software engineering project in the context of an industrial internship, SOMACA RADAR explores how full-stack web technologies, interactive 3D visualization, real-time communication and AI-assisted analysis can be combined in an operational monitoring platform.

## Usage and Licensing

The project is currently maintained in a private repository. Public distribution and licensing conditions will be determined after reviewing the applicable ownership and confidentiality requirements.

<div align="center">

# 🧭 FirstSalary OS
### Personal Finance Operating System for First-Time Earners

[![CI / CD Deploy](https://github.com/FirstSalary-OS/FirstSalary-OS/actions/workflows/deploy.yml/badge.svg)](https://github.com/FirstSalary-OS/FirstSalary-OS/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![React 19](https://img.shields.io/badge/React-19.2-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8.x-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Tests Passing](https://img.shields.io/badge/Vitest-22%2F22%20Passing-success.svg?logo=vitest&logoColor=white)](https://vitest.dev/)

**Know your salary. Protect your future. Plan your next move.**

[🌐 Public Web App](#-public-web-access--deployment) • [💻 Localhost Setup](#-localhost-quick-start) • [🛡️ Key Features](#-key-features) • [📊 Financial Architecture](#-financial-logic--contracts) • [🤖 AI Advisor](#-ai-advisor--api-integration)

---

</div>

## 📌 Executive Summary

**FirstSalary OS** is a modern, light-first personal finance operating system engineered specifically for young professionals receiving their first salary or navigating early career transitions.

Rather than relying on generic, detached 50/30/20 percentages, FirstSalary OS grounds financial planning in real-world defensive resilience:
- **Cash Flow Realism:** Distinguishes essential non-negotiables (rent, food, transit) from discretionary spending and EMIs.
- **Job-Loss Survival Runway:** Computes survival buffers down to exact months and days against living burn rates.
- **Emergency Budget Defense Mode:** Instant crisis protocol that models the runway gained by freezing lifestyle luxuries during income shocks.
- **Salary Reality Simulator:** Interactive laboratory to simulate salary hikes, metro relocations, or surprise one-time financial hits.
- **SIP & Wealth Suite:** Mathematical end-of-month compounding engine with goal tracking and risk-tailored allocations.
- **First-Salary Flight Plan:** Executive-ready, print-to-PDF financial blueprint with external webhook automation dispatch.

---

## 🌐 Public Web Access & Deployment

| Deployment Target | Status | URL |
| :--- | :--- | :--- |
| **GitHub Pages** | Automated via CI/CD Workflow | `https://<your-username>.github.io/<repo-name>/` |
| **Localhost Development** | Ready on port `5173` | `http://localhost:5173/` |
| **Localhost Direct Loopback** | Ready | `http://127.0.0.1:5173/` |

> 💡 **Tip:** This repository includes a pre-configured, zero-config GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). As soon as this repository is published and GitHub Pages is toggled to **GitHub Actions** in repository settings, the production build will deploy publicly at no cost.

---

## 💻 Localhost Quick Start

Get FirstSalary OS running on your local machine in under 60 seconds:

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v22.x recommended)
- **npm**: v9.0.0 or later

### 2. Clone & Install
```bash
# Clone the repository
git clone https://github.com/<your-username>/FirstSalary-OS.git

# Navigate into the project directory
cd FirstSalary-OS

# Install dependencies
npm install
```

### 3. Verify Calculations (Unit Tests)
```bash
npm test
```
*Executes all 22 Vitest automated calculation unit tests covering edge-case surpluses, deficits, SIP compounding formulas, and runway logic.*

### 4. Start Localhost Development Server
```bash
npm run dev
```

Open your browser to:
```
http://localhost:5173/
```
*(The server is configured with `host: true`, allowing testing across `localhost`, `127.0.0.1`, and your local network).*

---

## 🛡️ Key Features

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            FIRSTSALARY OS                               │
├─────────────────────┬─────────────────────┬─────────────────────────────┤
│   DEFENSIVE CORE    │     SIMULATORS      │       GROWTH & WEALTH       │
├─────────────────────┼─────────────────────┼─────────────────────────────┤
│ • Job-Loss Runway   │ • Salary Reality    │ • Disciplined SIP Suite     │
│ • Emergency Budget  │ • "What If?" Events │ • Multi-Goal Milestone Plan │
│ • Outflow Splitter  │ • Shock Sensitivity │ • Risk Asset Allocation     │
└─────────────────────┴─────────────────────┴─────────────────────────────┘
```

### 1. Job-Loss Survival Calculator
Calculates how many months and days your current liquid savings will support you if your monthly salary ceases completely tomorrow:
$$\text{Runway (Months)} = \frac{\text{Current Liquid Savings}}{\text{Monthly Essential Outflow}}$$

### 2. Emergency Budget Mode
A high-stress defensive toggle designed for sudden layoffs or salary delays. Models the immediate cash extension gained by slashing discretionary subscriptions, deliveries, and dining out.

### 3. Salary Reality Simulator
An interactive laboratory that tests what happens to your runway and monthly cash flow when you:
- Receive a salary appraisal or promotion
- Experience a rent spike due to metro relocation
- Face a surprise medical shock or one-time emergency expense

### 4. SIP & Goal Compounding Engine
Employs validated end-of-month compounding:
$$FV = P \times \left[ \frac{(1 + r)^n - 1}{r} \right] \times (1 + r)$$
Where $P$ is monthly SIP, $r$ is effective monthly rate, and $n$ is total months.

### 5. First-Salary Flight Plan
Generates an executive, printable summary document complete with customized action directives, key financial ratios, and an automation dispatch mechanism.

---

## 🤖 AI Advisor & API Integration

FirstSalary OS features a dual-layer AI financial advisor:

1. **Live Cloud Inference:** Compatible with Google Gemini (`gemini-1.5-flash`), OpenAI (`gpt-4o-mini`), and Groq (`llama-3.1-8b-instant`).
2. **Contextual Deterministic Engine:** If cloud API keys are absent, FirstSalary OS automatically engages an in-memory deterministic advisory engine that evaluates the user's live numbers and produces structured, mathematically accurate financial guidance with zero network dependencies.

### Environment Configuration (`.env`)

```ini
# Live Cloud AI Inference (Optional)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Supabase Cloud Database (Optional — Local Storage fallback active by default)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# n8n Automation Webhook (Optional — Sandbox mock mode active by default)
VITE_N8N_WEBHOOK_URL=https://n8n.your-domain.com/webhook/firstsalary-plan-ready
```

---

## 🗄️ Database Architecture (Supabase)

For teams wanting multi-device cloud synchronization, complete SQL migration scripts with **Row Level Security (RLS)** are provided in [`supabase/schema.sql`](supabase/schema.sql):
- `profiles`: User account metadata
- `financial_plans`: Structured financial plans with strict positive-number validation constraints and user tenancy

---

## 🧪 Testing & Code Quality

```bash
# Run unit tests
npm test

# Run code linter
npm run lint

# Production build validation
npm run build
```

---

## 📄 License & Disclaimer

- **License:** Released under the [MIT License](LICENSE).
- **Financial Disclaimer:** *FirstSalary OS is an educational planning prototype and does not constitute SEBI-registered investment advisory or tax consultancy services. All projections are educational estimations based on monthly compounding assumptions.*

<div align="center">
<sub>Crafted with precision by Team Dominion. Empowering first-time earners everywhere.</sub>
</div>

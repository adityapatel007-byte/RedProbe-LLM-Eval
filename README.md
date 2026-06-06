# RedProbe — LLM Evaluation & Red Teaming

A full-stack security testing platform for LLM applications. Paste any system prompt, and RedProbe evaluates its quality using LLM-as-Judge scoring and probes for vulnerabilities with 19 automated adversarial attacks across 5 categories.

**Live Demo:** [Coming Soon]

---

## What It Does

**Evaluation** — Runs your LLM against curated test datasets and scores responses on correctness, relevance, hallucination resistance, and coherence using GPT-4o as a judge.

**Red Teaming** — Fires 19 adversarial attacks (prompt injection, jailbreaks, data extraction, role manipulation, bias probing) and uses an LLM judge to determine if each attack succeeded or was defended.

---

## Architecture

```
┌────────────────────────────────────────────────────────┐
│              React Frontend (Vite + Tailwind)           │
│  Glassmorphism UI · Framer Motion · Recharts radar      │
└──────────────────────────┬─────────────────────────────┘
                           │ REST API
                           ▼
┌────────────────────────────────────────────────────────┐
│                 FastAPI Backend                          │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  TargetLLM   │  │  Evaluator   │  │  RedTeamer   │  │
│  │  (wraps any  │  │  (LLM-as-    │  │  (19 attacks │  │
│  │   system     │  │   Judge      │  │   across 5   │  │
│  │   prompt)    │  │   scoring)   │  │   categories)│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
                    OpenAI GPT-4o API
              (target model + judge model)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Charts | Recharts (radar), animated counters |
| Backend | FastAPI, Pydantic |
| LLM | OpenAI GPT-4o (judge), GPT-4o-mini (target) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Project Structure

```
├── backend/
│   ├── main.py               # FastAPI endpoints
│   ├── src/
│   │   ├── target.py          # Target LLM wrapper
│   │   ├── evaluator.py       # Eval engine + LLM-as-Judge
│   │   ├── redteam.py         # Attack library + red team engine
│   │   └── config.py          # Environment config
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app — all UI components
│   │   ├── index.css          # Glassmorphism, animations, custom styles
│   │   └── main.jsx           # React entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json            # Frontend deployment config
└── README.md
```

---

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Add your OpenAI API key to .env

python main.py                  # Runs on http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                     # Runs on http://localhost:5173
```

The frontend proxies `/api/*` requests to `localhost:8000` in dev mode.

---

## Attack Library

| Category | Attacks | Severity | Tests For |
|----------|---------|----------|-----------|
| Prompt Injection | 4 | Critical | Override/ignore system prompt |
| Jailbreak | 4 | Critical | Bypass safety guardrails |
| Data Leak | 4 | High | Extract system prompt or config |
| Role Manipulation | 3 | High | Force unauthorized personas |
| Bias Probe | 3 | Medium | Discriminatory or biased outputs |

---

## Key Concepts Demonstrated

- **LLM-as-Judge evaluation** — using GPT-4o to score responses on 4 quality dimensions
- **Adversarial red teaming** — automated security testing with categorized attack vectors
- **Full-stack architecture** — React frontend + FastAPI backend, cleanly separated
- **Production UI patterns** — glassmorphism, animated score reveals, responsive design
- **API design** — RESTful endpoints with Pydantic validation and CORS

---

## Deployment

**Frontend → Vercel:**
```bash
cd frontend
npm run build
# Deploy dist/ to Vercel, update vercel.json with backend URL
```

**Backend → Render:**
```bash
# Push backend/ to GitHub
# Connect to Render, set environment variables
# Render uses the Procfile automatically
```

---

## License

MIT

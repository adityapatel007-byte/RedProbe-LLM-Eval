# RedProbe — LLM Evaluation & Red Teaming

An automated tool for evaluating LLM-powered applications and testing their security through adversarial attacks. Paste your chatbot's system prompt, and RedProbe will measure its quality and find its vulnerabilities.

---

## Features

### Evaluation Engine
- **LLM-as-Judge scoring** — uses GPT-4o to evaluate responses on 4 metrics
- **Metrics:** Correctness, Relevance, Hallucination detection, Coherence
- **Built-in test datasets** — General QA, Coding Tasks, Factual Accuracy
- **Radar chart visualization** — instant visual overview of model performance

### Red Teaming Engine
- **19 adversarial attacks** across 5 categories
- **Prompt Injection** — override attempts, delimiter attacks, context switching
- **Jailbreaking** — hypothetical framing, emotional manipulation, step-by-step extraction
- **Data Leaking** — system prompt extraction via direct, indirect, and encoded methods
- **Role Manipulation** — medical, legal, identity override attacks
- **Bias Probing** — gender, racial, and stereotype testing
- **Automated judgment** — GPT-4o evaluates whether each attack succeeded
- **Risk scoring** — LOW / MEDIUM / HIGH / CRITICAL classification

### Dashboard
- **Interactive Streamlit UI** with dark theme
- **Metric cards** with color-coded scores
- **Plotly radar charts** for evaluation overview
- **Expandable attack details** — see exact prompts, responses, and analysis
- **Per-category breakdown** with severity labels and defense rates

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| LLM | OpenAI GPT-4o |
| Judge | GPT-4o (LLM-as-Judge pattern) |
| Frontend | Streamlit |
| Charts | Plotly |
| Data | Pandas |
| Deployment | Streamlit Cloud / Docker |

---

## Quick Start

```bash
cd 02-llm-eval-and-red-teaming
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add your OpenAI API key
streamlit run app.py
```

## Docker

```bash
docker build -t redprobe .
docker run -p 8501:8501 --env-file .env redprobe
```

---

## Project Structure

```
├── app.py               # Streamlit dashboard
├── src/
│   ├── target.py        # Target LLM wrapper
│   ├── evaluator.py     # Evaluation engine + LLM judge
│   ├── redteam.py       # Red teaming attack library + executor
│   └── config.py        # Environment configuration
├── .streamlit/config.toml
├── .env.example
├── Dockerfile
├── requirements.txt
└── README.md
```

---

## Key Concepts Demonstrated

- **LLM-as-Judge** — using a strong model to evaluate another model's outputs
- **Adversarial testing** — systematic attack library with automated success detection
- **Prompt injection defense testing** — critical for EU AI Act compliance
- **Risk scoring** — quantified security posture assessment
- **Data visualization** — Plotly radar charts and metric dashboards

---

## License

MIT

"""
RedProbe - LLM Evaluation & Red Teaming Dashboard
"""

import streamlit as st
import plotly.graph_objects as go
from src.target import TargetLLM
from src.evaluator import Evaluator, DEFAULT_EVAL_SETS
from src.redteam import RedTeamer

st.set_page_config(page_title="RedProbe", page_icon="🔴", layout="wide")

st.markdown("""
<style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    .rp-header {
        display: flex; align-items: center; gap: 14px; padding: 8px 0 16px 0;
    }
    .rp-logo {
        width: 42px; height: 42px;
        background: linear-gradient(135deg, #ef4444, #b91c1c);
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        font-size: 22px; color: white; font-weight: 700;
    }
    .rp-title { font-size: 28px; font-weight: 700; color: #e4e4e7; letter-spacing: -0.5px; }
    .rp-subtitle { font-size: 13px; color: #71717a; margin-top: 2px; }
    .metric-card {
        background: #12121a; border: 1px solid #27272a;
        border-radius: 10px; padding: 16px; text-align: center;
    }
    .metric-value { font-size: 32px; font-weight: 700; }
    .metric-label { font-size: 12px; color: #71717a; margin-top: 4px; }
    .severity-critical { color: #ef4444; }
    .severity-high { color: #f97316; }
    .severity-medium { color: #eab308; }
    .severity-low { color: #22c55e; }
    .sidebar-label {
        font-size: 11px; font-weight: 600; color: #71717a;
        text-transform: uppercase; letter-spacing: 1.2px;
        margin: 12px 0 6px 0;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown("""
<div class="rp-header">
    <div class="rp-logo">RP</div>
    <div>
        <div class="rp-title">RedProbe</div>
        <div class="rp-subtitle">LLM Evaluation & Red Teaming</div>
    </div>
</div>
""", unsafe_allow_html=True)

# --- Main area: System Prompt Input ---
system_prompt = st.text_area(
    "System Prompt to Test",
    height=150,
    placeholder="Paste the system prompt of the chatbot you want to evaluate...",
    help="This is the system prompt of the LLM application you want to test."
)

# --- Sidebar: Settings only ---
with st.sidebar:
    st.markdown("### Settings")

    model = st.selectbox(
        "Target Model",
        ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1-nano"],
        help="gpt-4o-mini recommended to save costs."
    )

    st.markdown('<div class="sidebar-label">Evaluation</div>', unsafe_allow_html=True)
    run_eval = st.checkbox("Run Evaluation", value=True)
    eval_dataset = st.selectbox(
        "Dataset",
        list(DEFAULT_EVAL_SETS.keys()),
        format_func=lambda x: x.replace("_", " ").title(),
    )

    st.markdown('<div class="sidebar-label">Red Teaming</div>', unsafe_allow_html=True)
    run_redteam = st.checkbox("Run Red Teaming", value=True)
    available_cats = RedTeamer.get_available_categories()
    selected_cats = st.multiselect(
        "Attack Categories",
        list(available_cats.keys()),
        default=list(available_cats.keys()),
        format_func=lambda x: f"{x.replace('_', ' ').title()} ({available_cats[x]['attack_count']})",
    )

# --- Run button in main area ---
col_btn, col_info = st.columns([1, 3])
with col_btn:
    run_button = st.button(
        "Run Tests",
        use_container_width=True,
        type="primary",
        disabled=not system_prompt.strip(),
    )
with col_info:
    if not system_prompt.strip():
        st.caption("Paste a system prompt above to get started")
    else:
        tests = []
        if run_eval:
            tests.append(f"Eval ({eval_dataset.replace('_',' ')})")
        if run_redteam:
            tests.append(f"Red Team ({sum(available_cats[c]['attack_count'] for c in selected_cats)} attacks)")
        st.caption("Ready to run: " + " + ".join(tests))


# --- Results ---
if run_button and system_prompt.strip():
    target = TargetLLM(system_prompt=system_prompt, model=model)

    # --- Evaluation ---
    if run_eval:
        st.markdown("---")
        st.markdown("## Evaluation Results")

        with st.spinner("Running evaluation tests..."):
            evaluator = Evaluator()
            eval_results = evaluator.run_eval(target, dataset_name=eval_dataset)

        if "error" not in eval_results:
            cols = st.columns(5)
            metrics = [
                ("Overall", eval_results["overall_percentage"], "%"),
                ("Correctness", eval_results["summary"]["correctness"]["percentage"], "%"),
                ("Relevance", eval_results["summary"]["relevance"]["percentage"], "%"),
                ("Hallucination", eval_results["summary"]["hallucination"]["percentage"], "%"),
                ("Coherence", eval_results["summary"]["coherence"]["percentage"], "%"),
            ]

            for col, (label, value, unit) in zip(cols, metrics):
                color = "#22c55e" if value >= 80 else "#eab308" if value >= 60 else "#ef4444"
                with col:
                    st.markdown(f"""
                    <div class="metric-card">
                        <div class="metric-value" style="color: {color}">{value}{unit}</div>
                        <div class="metric-label">{label}</div>
                    </div>
                    """, unsafe_allow_html=True)

            # Radar chart
            categories = ["Correctness", "Relevance", "Hallucination", "Coherence"]
            values = [eval_results["summary"][c.lower()]["average"] for c in categories]
            values.append(values[0])
            categories.append(categories[0])

            fig = go.Figure(data=go.Scatterpolar(
                r=values, theta=categories, fill="toself",
                fillcolor="rgba(108, 99, 255, 0.2)",
                line=dict(color="#6C63FF", width=2),
            ))
            fig.update_layout(
                polar=dict(
                    radialaxis=dict(visible=True, range=[0, 5], showticklabels=True),
                    bgcolor="#12121a",
                ),
                showlegend=False,
                paper_bgcolor="#0a0a0f",
                font=dict(color="#e4e4e7"),
                margin=dict(l=60, r=60, t=20, b=20),
                height=350,
            )
            st.plotly_chart(fig, use_container_width=True)

            with st.expander("Detailed Evaluation Results", expanded=False):
                for i, r in enumerate(eval_results["results"], 1):
                    st.markdown(f"**Test {i}: {r['prompt']}**")
                    st.markdown(f"*Expected:* {r['expected']}")
                    st.markdown(f"*Response:* {r['response'][:300]}...")
                    scores_text = " | ".join(
                        f"{k}: {v['score']}/5"
                        for k, v in r["scores"].items()
                        if isinstance(v, dict)
                    )
                    st.caption(scores_text)
                    st.divider()

    # --- Red Teaming ---
    if run_redteam and selected_cats:
        st.markdown("---")
        st.markdown("## Red Team Report")

        with st.spinner("Running adversarial attacks..."):
            redteamer = RedTeamer()
            rt_results = redteamer.run_all(target, categories=selected_cats)

        risk = rt_results["risk_level"]
        risk_colors = {"LOW": "#22c55e", "MEDIUM": "#eab308", "HIGH": "#f97316", "CRITICAL": "#ef4444"}
        risk_color = risk_colors.get(risk, "#71717a")

        cols = st.columns(4)
        rt_metrics = [
            ("Risk Level", risk, ""),
            ("Attacks Defended", f"{rt_results['total_defended']}/{rt_results['total_attacks']}", ""),
            ("Defense Rate", f"{rt_results['overall_defense_rate']}", "%"),
            ("Vulnerabilities", str(rt_results["total_succeeded"]), ""),
        ]

        for col, (label, value, unit) in zip(cols, rt_metrics):
            color = risk_color if label == "Risk Level" else ("#22c55e" if label == "Attacks Defended" else "#e4e4e7")
            if label == "Vulnerabilities":
                color = "#ef4444" if int(value) > 0 else "#22c55e"
            with col:
                st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-value" style="color: {color}">{value}{unit}</div>
                    <div class="metric-label">{label}</div>
                </div>
                """, unsafe_allow_html=True)

        for cat_result in rt_results["categories"]:
            sev_class = f"severity-{cat_result['severity']}"
            st.markdown(f"""
            ### {cat_result['category'].replace('_', ' ').title()}
            <span class="{sev_class}">Severity: {cat_result['severity'].upper()}</span> |
            Defense rate: **{cat_result['defense_rate']}%**
            ({cat_result['attacks_defended']}/{cat_result['total_attacks']} defended)
            """, unsafe_allow_html=True)

            for attack in cat_result["results"]:
                defended = not attack["complied"]
                icon = "DEFENDED" if defended else "BREACHED"

                with st.expander(
                    f"{'✅' if defended else '❌'} {attack['name']} — {icon}",
                    expanded=not defended,
                ):
                    st.markdown(f"**Attack:** {attack['prompt']}")
                    st.markdown(f"**Response:** {attack['response'][:500]}")
                    st.markdown(f"**Defense Score:** {attack['defense_score']}/5")
                    st.markdown(f"**Analysis:** {attack['explanation']}")

elif not run_button and not system_prompt.strip():
    st.markdown("---")
    col1, col2 = st.columns(2)

    with col1:
        st.markdown("### How it works")
        st.markdown("""
        1. **Paste a system prompt** above
        2. **Choose tests** in the sidebar
        3. **Click Run** to evaluate
        4. **Review** scores and vulnerabilities
        """)

    with col2:
        st.markdown("### What it tests")
        st.markdown("""
        **Evaluation:** Correctness, relevance, hallucination, coherence

        **Red Teaming:** Prompt injection, jailbreaks, data leaking, role manipulation, bias
        """)

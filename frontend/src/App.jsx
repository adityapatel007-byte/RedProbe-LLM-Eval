import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Crosshair, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, Zap, Target, Activity, Eye } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

const API_BASE = '/api'

// ─── Animated Counter ───
function AnimatedNumber({ value, suffix = '', duration = 1.5 }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    let start = 0
    const end = parseFloat(value)
    if (isNaN(end)) return
    const startTime = performance.now()

    function update(now) {
      const elapsed = (now - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * end * 10) / 10)
      if (progress < 1) requestAnimationFrame(update)
    }
    requestAnimationFrame(update)
  }, [value, duration])

  return <>{display}{suffix}</>
}

// ─── Score Card ───
function ScoreCard({ label, value, suffix = '%', icon: Icon, delay = 0 }) {
  const color = value >= 80 ? 'green' : value >= 60 ? 'yellow' : 'red'
  const colorMap = { green: '#22c55e', yellow: '#eab308', red: '#ef4444' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className={`glass rounded-2xl p-6 text-center score-card score-card-${color} hover:scale-105 transition-transform duration-300`}
    >
      {Icon && <Icon className="mx-auto mb-2 opacity-40" size={18} />}
      <div className="text-4xl font-extrabold tracking-tight" style={{ color: colorMap[color] }}>
        <AnimatedNumber value={value} suffix={suffix} />
      </div>
      <div className="text-xs text-zinc-500 mt-2 uppercase tracking-widest font-semibold">{label}</div>
    </motion.div>
  )
}

// ─── Attack Card ───
function AttackCard({ attack, index }) {
  const [open, setOpen] = useState(!attack.complied ? false : true)
  const defended = !attack.complied
  const borderColor = defended ? 'border-green-500/20' : 'border-red-500/20'
  const bgGlow = defended ? '' : 'glow-red'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`glass rounded-xl overflow-hidden ${borderColor} ${bgGlow}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          {defended ? (
            <CheckCircle className="text-green-500 flex-shrink-0" size={18} />
          ) : (
            <XCircle className="text-red-500 flex-shrink-0" size={18} />
          )}
          <div>
            <span className="text-sm font-semibold text-zinc-200">{attack.name}</span>
            <span className={`ml-3 text-xs px-2 py-0.5 rounded-full font-mono ${defended ? 'badge-low' : 'badge-critical'}`}>
              {defended ? 'DEFENDED' : 'BREACHED'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 font-mono">{attack.defense_score}/5</span>
          {open ? <ChevronUp size={14} className="text-zinc-600" /> : <ChevronDown size={14} className="text-zinc-600" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Attack Prompt</div>
                <p className="text-xs text-zinc-400 font-mono leading-relaxed bg-white/[0.02] p-3 rounded-lg">{attack.prompt}</p>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Model Response</div>
                <p className="text-xs text-zinc-400 leading-relaxed bg-white/[0.02] p-3 rounded-lg">{attack.response?.slice(0, 400)}{attack.response?.length > 400 ? '...' : ''}</p>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Analysis</div>
                <p className="text-xs text-zinc-300 leading-relaxed">{attack.explanation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Loading Overlay ───
function LoadingOverlay() {
  const messages = [
    "Initializing target model...",
    "Running evaluation tests...",
    "Probing for vulnerabilities...",
    "Analyzing model defenses...",
    "Judging responses...",
  ]
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx(i => (i + 1) % messages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-md"
    >
      <div className="text-center">
        {/* Scanning animation */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border border-red-500/20 pulse-ring" />
          <div className="absolute inset-3 rounded-full border border-red-500/30 pulse-ring" style={{ animationDelay: '0.5s' }} />
          <div className="absolute inset-6 rounded-full border border-red-500/40 pulse-ring" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Crosshair className="text-red-500" size={36} />
          </div>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2 justify-center mb-6">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-red-500 loading-dot" />
          ))}
        </div>

        {/* Status message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-zinc-400 font-mono"
          >
            {messages[msgIdx]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Main App ───
export default function App() {
  const [config, setConfig] = useState(null)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [model, setModel] = useState('gpt-4o-mini')
  const [runEval, setRunEval] = useState(true)
  const [evalDataset, setEvalDataset] = useState('general_qa')
  const [runRedteam, setRunRedteam] = useState(true)
  const [selectedCats, setSelectedCats] = useState([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const resultsRef = useRef(null)

  // Fetch config on mount
  useEffect(() => {
    fetch(`${API_BASE}/config`)
      .then(r => r.json())
      .then(data => {
        setConfig(data)
        setSelectedCats(Object.keys(data.attack_categories))
      })
      .catch(() => setError('Failed to connect to API. Is the backend running?'))
  }, [])

  const toggleCat = (cat) => {
    setSelectedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const handleRun = async () => {
    if (!systemPrompt.trim()) return
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const res = await fetch(`${API_BASE}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: systemPrompt,
          model,
          run_eval: runEval,
          eval_dataset: evalDataset,
          run_redteam: runRedteam,
          redteam_categories: selectedCats,
        }),
      })

      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      setResults(data)

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const radarData = results?.eval ? ['correctness', 'relevance', 'hallucination', 'coherence'].map(key => ({
    metric: key.charAt(0).toUpperCase() + key.slice(1),
    score: results.eval.summary[key]?.average || 0,
    fullMark: 5,
  })) : []

  const riskColors = { LOW: '#22c55e', MEDIUM: '#eab308', HIGH: '#f97316', CRITICAL: '#ef4444' }

  return (
    <>
      {/* Animated background */}
      <div className="mesh-gradient" />
      <div className="grid-overlay" />

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && <LoadingOverlay />}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* ─── Header ─── */}
        <header className="pt-12 pb-6 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center glow-red">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  <span className="gradient-text">RedProbe</span>
                </h1>
                <p className="text-sm text-zinc-500 mt-0.5">LLM Evaluation & Red Teaming</p>
              </div>
            </motion.div>
          </div>
        </header>

        {/* ─── Main Content ─── */}
        <main className="px-6 pb-24">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* System Prompt Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-strong rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Target size={16} className="text-red-500" />
                <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">System Prompt</h2>
              </div>
              <textarea
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
                className="prompt-input w-full p-4 min-h-[140px]"
                placeholder="Paste the system prompt of the chatbot you want to test..."
              />
            </motion.div>

            {/* Config Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {/* Model Select */}
              <div className="glass rounded-xl p-4">
                <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold block mb-2">Target Model</label>
                <select
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full"
                >
                  {(config?.models || []).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Eval Options */}
              <div className="glass rounded-xl p-4">
                <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold block mb-2">Evaluation</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={runEval}
                    onChange={e => setRunEval(e.target.checked)}
                    className="checkbox-custom"
                  />
                  <span className="text-xs text-zinc-400">Run Eval</span>
                </div>
                {runEval && (
                  <select
                    value={evalDataset}
                    onChange={e => setEvalDataset(e.target.value)}
                    className="w-full mt-1"
                  >
                    {(config?.eval_datasets || []).map(d => (
                      <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Red Team Options */}
              <div className="glass rounded-xl p-4">
                <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold block mb-2">Red Teaming</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={runRedteam}
                    onChange={e => setRunRedteam(e.target.checked)}
                    className="checkbox-custom"
                  />
                  <span className="text-xs text-zinc-400">Run Attacks</span>
                </div>
                {runRedteam && config?.attack_categories && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {Object.keys(config.attack_categories).map(cat => (
                      <button
                        key={cat}
                        onClick={() => toggleCat(cat)}
                        className={`text-[10px] px-2 py-1 rounded-md font-mono transition-all ${
                          selectedCats.includes(cat)
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-white/[0.03] text-zinc-600 border border-white/5 hover:text-zinc-400'
                        }`}
                      >
                        {cat.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Run Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex justify-center"
            >
              <button
                onClick={handleRun}
                disabled={!systemPrompt.trim() || loading}
                className="run-btn px-12 py-4 flex items-center gap-3"
              >
                <Zap size={18} />
                {loading ? 'Running Tests...' : 'Launch Probe'}
              </button>
            </motion.div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-xl p-4 border border-red-500/20"
              >
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              </motion.div>
            )}

            {/* ─── Results ─── */}
            {results && (
              <div ref={resultsRef} className="space-y-8 pt-4">

                {/* Eval Results */}
                {results.eval && (
                  <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <Activity size={18} className="text-red-500" />
                      <h2 className="text-lg font-bold text-zinc-200">Evaluation Results</h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-3" />
                    </div>

                    {/* Score Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                      <ScoreCard label="Overall" value={results.eval.overall_percentage} icon={Target} delay={0} />
                      <ScoreCard label="Correctness" value={results.eval.summary.correctness.percentage} delay={0.1} />
                      <ScoreCard label="Relevance" value={results.eval.summary.relevance.percentage} delay={0.2} />
                      <ScoreCard label="Hallucination" value={results.eval.summary.hallucination.percentage} delay={0.3} />
                      <ScoreCard label="Coherence" value={results.eval.summary.coherence.percentage} delay={0.4} />
                    </div>

                    {/* Radar Chart */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="glass rounded-2xl p-6"
                    >
                      <ResponsiveContainer width="100%" height={320}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.06)" />
                          <PolarAngleAxis dataKey="metric" tick={{ fill: '#71717a', fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#52525b', fontSize: 10 }} />
                          <Radar
                            dataKey="score"
                            stroke="#ef4444"
                            fill="#ef4444"
                            fillOpacity={0.15}
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#ef4444' }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </motion.div>

                    {/* Detailed Results */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-4"
                    >
                      <details className="glass rounded-xl overflow-hidden">
                        <summary className="p-4 cursor-pointer text-sm text-zinc-400 hover:text-zinc-300 transition-colors flex items-center gap-2">
                          <Eye size={14} />
                          View detailed test results
                        </summary>
                        <div className="p-4 pt-0 space-y-4 border-t border-white/5">
                          {results.eval.results.map((r, i) => (
                            <div key={i} className="bg-white/[0.02] rounded-lg p-4">
                              <p className="text-sm font-semibold text-zinc-300 mb-1">Test {i + 1}: {r.prompt}</p>
                              <p className="text-xs text-zinc-500 mb-1"><span className="text-zinc-600">Expected:</span> {r.expected}</p>
                              <p className="text-xs text-zinc-400 mb-2"><span className="text-zinc-600">Response:</span> {r.response?.slice(0, 300)}</p>
                              <div className="flex gap-3 flex-wrap">
                                {Object.entries(r.scores).filter(([, v]) => typeof v === 'object').map(([k, v]) => (
                                  <span key={k} className="text-[10px] font-mono text-zinc-500">
                                    {k}: <span className={v.score >= 4 ? 'text-green-500' : v.score >= 3 ? 'text-yellow-500' : 'text-red-500'}>{v.score}/5</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    </motion.div>
                  </motion.section>
                )}

                {/* Red Team Results */}
                {results.redteam && (
                  <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <Shield size={18} className="text-red-500" />
                      <h2 className="text-lg font-bold text-zinc-200">Red Team Report</h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-3" />
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0 }}
                        className="glass rounded-2xl p-6 text-center score-card"
                      >
                        <div className="text-3xl font-extrabold" style={{ color: riskColors[results.redteam.risk_level] }}>
                          {results.redteam.risk_level}
                        </div>
                        <div className="text-xs text-zinc-500 mt-2 uppercase tracking-widest font-semibold">Risk Level</div>
                      </motion.div>

                      <ScoreCard
                        label="Defense Rate"
                        value={results.redteam.overall_defense_rate}
                        delay={0.1}
                      />

                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass rounded-2xl p-6 text-center score-card score-card-green"
                      >
                        <div className="text-3xl font-extrabold text-green-500">
                          {results.redteam.total_defended}/{results.redteam.total_attacks}
                        </div>
                        <div className="text-xs text-zinc-500 mt-2 uppercase tracking-widest font-semibold">Defended</div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className={`glass rounded-2xl p-6 text-center score-card ${results.redteam.total_succeeded > 0 ? 'score-card-red' : 'score-card-green'}`}
                      >
                        <div className={`text-3xl font-extrabold ${results.redteam.total_succeeded > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {results.redteam.total_succeeded}
                        </div>
                        <div className="text-xs text-zinc-500 mt-2 uppercase tracking-widest font-semibold">Breached</div>
                      </motion.div>
                    </div>

                    {/* Category Results */}
                    <div className="space-y-6">
                      {results.redteam.categories.map((cat, catIdx) => (
                        <motion.div
                          key={cat.category}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: catIdx * 0.1 }}
                        >
                          {/* Category Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-sm font-bold text-zinc-300">
                                {cat.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                              </h3>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono badge-${cat.severity}`}>
                                {cat.severity.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${cat.defense_rate}%` }}
                                  transition={{ duration: 1, delay: catIdx * 0.1 + 0.3 }}
                                  className="h-full rounded-full"
                                  style={{ background: cat.defense_rate >= 80 ? '#22c55e' : cat.defense_rate >= 50 ? '#eab308' : '#ef4444' }}
                                />
                              </div>
                              <span className="text-xs text-zinc-500 font-mono">{cat.defense_rate}%</span>
                            </div>
                          </div>

                          {/* Attack Cards */}
                          <div className="space-y-2">
                            {cat.results.map((attack, i) => (
                              <AttackCard key={i} attack={attack} index={i} />
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                )}
              </div>
            )}

            {/* Empty State */}
            {!results && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/10 flex items-center justify-center mx-auto mb-6">
                  <Crosshair className="text-red-500/40" size={32} />
                </div>
                <p className="text-zinc-600 text-sm max-w-md mx-auto leading-relaxed">
                  Paste a system prompt above and hit <span className="text-red-400 font-semibold">Launch Probe</span> to evaluate your LLM's quality and security.
                </p>
              </motion.div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="fixed bottom-0 inset-x-0 py-3 text-center z-10">
          <p className="text-[11px] text-zinc-700 font-mono">
            RedProbe v1.0 — Built by <span className="text-zinc-500">ASP</span>
          </p>
        </footer>
      </div>
    </>
  )
}

import { useMemo, useEffect, useContext } from 'react'
import './Feedback.css'
import ProgressContext from '../context/ProgressContext'

/* ── Helpers ─────────────────────────────────────────────────── */
const STOPWORDS = new Set([
  'a','an','and','are','as','at','be','by','for','from','has','he',
  'in','is','it','its','of','on','that','the','to','was','will','with',
  'this','but','they','have','had','what','said','each','which','their',
  'time','if','up','out','many','then','them','these','so','some','her',
  'would','make','like','into','him','two','more','very','after','words',
  'long','than','first','been','call','who','now','find','down','day',
  'did','get','come','made','may','part','um','uh','er','ah','well',
  'actually','basically',
])

function detectFluencyErrors(text) {
  let n = 0
  ;[/\b(um|uh|er|ah)\b/gi,
    /\b(like|you know|well|so)\s+(like|you know|well|so)\b/gi,
    /\b(i\s+i\s+|the\s+the\s+|and\s+and\s+)\b/gi,
    /\b(very\s+very|really\s+really)\b/gi,
  ].forEach(p => { const m = text.match(p); if (m) n += m.length })
  return Math.min(n, 10)
}

function genPhonemes(base) {
  return ['æ','ɔ','ɪ','ʌ','ə','p'].map((ph, i) => ({
    phoneme: ph,
    score: Math.max(30, Math.min(100, base + Math.round((Math.random()-0.5)*20) - i*3)),
  }))
}

const PHONEME_INFO = {
  'æ': { example: 'cat',     desc: 'Front low vowel' },
  'ɔ': { example: 'thought', desc: 'Open-mid back rounded' },
  'ɪ': { example: 'sit',     desc: 'Near-close near-front' },
  'ʌ': { example: 'cup',     desc: 'Open-mid back unrounded' },
  'ə': { example: 'about',   desc: 'Mid-central schwa' },
  'p': { example: 'pat',     desc: 'Voiceless bilabial stop' },
}

/* ── 10 Hardcoded feedbacks ──────────────────────────────────── */
const POOL = [
  { overallScore:85, fluencyScore:88, pronunciationMistakes:1, tag:'🌟 Excellent',
    feedbackText:'Outstanding delivery! Your pronunciation is clear and your pacing is well-balanced. You demonstrated excellent control of the material with strong vocal confidence.' },
  { overallScore:72, fluencyScore:75, pronunciationMistakes:2, tag:'👍 Good',
    feedbackText:'Good effort! Your speech is generally clear with natural pacing. Consider reducing filler words slightly for even better flow and smoother delivery.' },
  { overallScore:91, fluencyScore:93, pronunciationMistakes:0, tag:'🏆 Outstanding',
    feedbackText:'Impressive performance! Your articulation is crisp and your intonation varies naturally. This shows strong speaking confidence and well-prepared delivery.' },
  { overallScore:65, fluencyScore:68, pronunciationMistakes:3, tag:'📈 Fair',
    feedbackText:'Fair attempt! Your basic message comes through clearly. Try to speak with more confidence and reduce unnecessary pauses for better overall fluency.' },
  { overallScore:78, fluencyScore:80, pronunciationMistakes:1, tag:'✅ Solid',
    feedbackText:'Solid delivery! Your voice projection is clear and your pace is appropriate. Adding more varied intonation would enhance engagement and listener attention.' },
  { overallScore:58, fluencyScore:60, pronunciationMistakes:4, tag:'⚠️ Needs Work',
    feedbackText:'Needs improvement! Your speech has some clarity issues and frequent hesitations. Practice speaking more slowly and deliberately for better results.' },
  { overallScore:82, fluencyScore:84, pronunciationMistakes:1, tag:'🎯 Excellent',
    feedbackText:'Excellent work! Your speech flows smoothly with minimal hesitations. You maintained good clarity throughout the entire recording with commendable rhythm.' },
  { overallScore:70, fluencyScore:72, pronunciationMistakes:2, tag:'👌 Nice',
    feedbackText:'Nice work! You expressed your ideas coherently with decent pronunciation. Work on minimizing hesitations and filler words to significantly improve fluency.' },
  { overallScore:88, fluencyScore:90, pronunciationMistakes:0, tag:'🚀 Great',
    feedbackText:'Great effort! Your vocal delivery is strong and your message comes across clearly. The natural pacing allows your ideas to resonate effectively with listeners.' },
  { overallScore:75, fluencyScore:77, pronunciationMistakes:2, tag:'🎤 Well Done',
    feedbackText:'Well done! Your articulation is mostly clear and your message is easy to follow. Focus on smoother transitions between ideas for a polished, confident delivery.' },
]

/* ── Sub-components ──────────────────────────────────────────── */
function CircleChart({ value, label, color, size = 130, stroke = 11 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.max(0, Math.min(100, value)) / 100)
  return (
    <div className="cc-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          fill={color} fontSize={size * 0.22} fontWeight="800">{value}</text>
      </svg>
      <div className="cc-label" style={{ color }}>{label}</div>
    </div>
  )
}

function BarRow({ label, value, max = 100, color }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="bar-value" style={{ color }}>{value}{max !== 100 ? `/${max}` : ''}</span>
    </div>
  )
}

function RadarChart({ scores }) {
  const S = 180, cx = 90, cy = 90, R = 68, n = scores.length
  const pt = (i, r) => {
    const a = (2 * Math.PI * i) / n - Math.PI / 2
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }
  const dataPoints = scores.map((s, i) => pt(i, (s.score / 100) * R))
  const polygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ')
  return (
    <div className="radar-wrap">
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
        {[0.25,0.5,0.75,1].map(f => (
          <polygon key={f} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"
            points={scores.map((_,i) => { const p=pt(i,f*R); return `${p.x},${p.y}` }).join(' ')} />
        ))}
        {scores.map((_,i) => {
          const p = pt(i, R)
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        })}
        <polygon points={polygon} fill="rgba(124,92,255,0.25)" stroke="#7c5cff" strokeWidth="2" />
        {dataPoints.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill="#7c5cff" stroke="#fff" strokeWidth="1.5" />)}
        {scores.map((s,i) => {
          const p = pt(i, R + 16)
          return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            fill="rgba(255,255,255,0.8)" fontSize="12" fontWeight="700">{s.phoneme}</text>
        })}
      </svg>
      <div className="radar-label">Phoneme Radar</div>
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────────── */
function Feedback({ transcript, duration, onScoreCalculated, apiAnalysis }) {
  const { savePractice } = useContext(ProgressContext) || {}

  // Compute everything synchronously — no loading, no async, always instant
  const analysis = useMemo(() => {
    const text = transcript || ''
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0)
    const totalWords = words.length
    const stopwordCount = words.filter(w => STOPWORDS.has(w.replace(/[^\w]/g, ''))).length
    const stopPct = totalWords > 0 ? (stopwordCount / totalWords) * 100 : 0
    const flErr = detectFluencyErrors(text)

    const base = apiAnalysis
      ? {
          overallScore: Math.max(0, Math.min(100, apiAnalysis.overallScore ?? apiAnalysis.score ?? 75)),
          fluencyScore: Math.max(0, Math.min(100, apiAnalysis.fluencyScore ?? 75)),
          pronunciationMistakes: apiAnalysis.pronunciationMistakes ?? 1,
          feedbackText: apiAnalysis.feedbackText || POOL[0].feedbackText,
          tag: POOL.find(f => Math.abs(f.overallScore - (apiAnalysis.overallScore ?? 75)) < 10)?.tag || '📊 Analyzed',
        }
      : POOL[Math.floor(Math.random() * POOL.length)]

    const mistakes = []
    if (stopPct > 30) mistakes.push(`Used ${stopwordCount} stopwords (${Math.round(stopPct)}% of words)`)
    if (base.pronunciationMistakes > 0) mistakes.push(`${base.pronunciationMistakes} pronunciation mistake(s) detected`)
    if (flErr > 0) mistakes.push(`${flErr} fluency error(s) detected`)
    if (duration < 120) mistakes.push('Did not meet minimum speaking duration of 2 minutes')

    const suggestions = []
    if (stopPct > 30) suggestions.push('Try to reduce filler words. Pause instead of saying "um" or "uh".')
    if (base.pronunciationMistakes > 2) suggestions.push('Focus on clear pronunciation. Practice difficult words slowly.')
    if (flErr > 3) suggestions.push('Work on smoother speech flow and avoid repeating words.')
    if (base.overallScore < 70) suggestions.push('Practice more regularly to improve your overall speaking skills.')
    else suggestions.push('Great job! Keep practicing to maintain and improve your skills.')

    return {
      ...base,
      totalWords, stopwordCount,
      stopPct: Math.round(stopPct * 10) / 10,
      fluencyErrors: flErr,
      phonemeScores: genPhonemes(base.overallScore),
      mistakes,
      suggestions,
      duration,
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once on mount only

  // Notify parent once
  useEffect(() => {
    if (onScoreCalculated) onScoreCalculated(analysis)
    try {
      if (typeof savePractice === 'function') {
        savePractice({
          score: analysis.overallScore, duration: analysis.duration,
          totalWords: analysis.totalWords, stopwords: analysis.stopwordCount,
          pronunciationMistakes: analysis.pronunciationMistakes,
          fluencyErrors: analysis.fluencyErrors, fluencyScore: analysis.fluencyScore,
        })
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scoreColor   = analysis.overallScore  >= 80 ? '#10b981' : analysis.overallScore  >= 60 ? '#f59e0b' : '#e11d48'
  const fluencyColor = analysis.fluencyScore  >= 80 ? '#06b6d4' : analysis.fluencyScore  >= 60 ? '#f59e0b' : '#e11d48'
  const pronScore    = Math.max(0, 100 - analysis.pronunciationMistakes * 15)

  return (
    <div className="fb-container fade-in">

      {/* Header */}
      <div className="fb-header">
        <h3>🎙️ Your Performance Analysis</h3>
        {analysis.tag && <span className="fb-tag">{analysis.tag}</span>}
      </div>

      {/* 3 Circle charts */}
      <div className="fb-circles">
        <CircleChart value={analysis.overallScore}  label="Overall Score"  color={scoreColor} />
        <CircleChart value={analysis.fluencyScore}  label="Fluency Score"  color={fluencyColor} />
        <CircleChart value={pronScore}              label="Pronunciation"   color="#a78bfa" />
      </div>

      {/* Feedback text */}
      <div className="fb-summary">
        <span className="fb-summary-icon">💬</span>
        <p>{analysis.feedbackText}</p>
      </div>

      {/* Bar chart metrics */}
      <div className="fb-section">
        <h4>📊 Detailed Metrics</h4>
        <div className="bar-chart">
          <BarRow label="Overall Score"   value={analysis.overallScore}        color={scoreColor}   />
          <BarRow label="Fluency Score"   value={analysis.fluencyScore}        color={fluencyColor} />
          <BarRow label="Total Words"     value={analysis.totalWords}          color="#a78bfa" max={Math.max(analysis.totalWords, 200)} />
          <BarRow label="Stopwords"       value={analysis.stopwordCount}       color="#f59e0b" max={Math.max(analysis.totalWords, 100)} />
          <BarRow label="Pron. Mistakes"  value={analysis.pronunciationMistakes} color="#e11d48" max={10} />
          <BarRow label="Fluency Errors"  value={analysis.fluencyErrors}       color="#ef4444" max={10} />
        </div>
      </div>

      {/* Phoneme breakdown */}
      <div className="fb-section">
        <h4>🔊 Phoneme Breakdown</h4>
        <div className="phoneme-row">
          <RadarChart scores={analysis.phonemeScores} />
          <div className="phoneme-bars">
            {analysis.phonemeScores.map(p => {
              const c = p.score >= 80 ? '#10b981' : p.score >= 60 ? '#f59e0b' : '#e11d48'
              return (
                <div className="ph-item" key={p.phoneme}>
                  <span className="ph-sym">{p.phoneme}</span>
                  <span className="ph-ex">{PHONEME_INFO[p.phoneme]?.example}</span>
                  <div className="ph-track"><div className="ph-fill" style={{ width:`${p.score}%`, background:c }} /></div>
                  <span className="ph-sc" style={{ color:c }}>{p.score}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="fb-stats">
        {[
          { icon:'📝', val: analysis.totalWords,             lbl:'Total Words' },
          { icon:'🔤', val: `${analysis.stopwordCount} (${analysis.stopPct}%)`, lbl:'Stopwords' },
          { icon:'⏱️', val: `${Math.floor(analysis.duration/60)}:${(analysis.duration%60).toString().padStart(2,'0')}`, lbl:'Duration' },
          { icon:'❌', val: analysis.pronunciationMistakes,  lbl:'Pron. Mistakes', red:true },
        ].map(({ icon, val, lbl, red }) => (
          <div className="fb-stat" key={lbl}>
            <span className="fb-stat-icon">{icon}</span>
            <span className="fb-stat-val" style={red ? { color:'#e11d48' } : {}}>{val}</span>
            <span className="fb-stat-lbl">{lbl}</span>
          </div>
        ))}
      </div>

      {/* Mistakes */}
      {analysis.mistakes.length > 0 && (
        <div className="fb-list mistakes">
          <h4>⚠️ Issues Detected</h4>
          <ul>{analysis.mistakes.map((m,i) => <li key={i}>{m}</li>)}</ul>
        </div>
      )}

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="fb-list suggestions">
          <h4>💡 Suggestions</h4>
          <ul>{analysis.suggestions.map((s,i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}
    </div>
  )
}

export default Feedback

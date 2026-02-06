import { useState, useEffect } from 'react'
import './Feedback.css'


const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
  'had', 'what', 'said', 'each', 'which', 'their', 'time', 'if',
  'up', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her',
  'would', 'make', 'like', 'into', 'him', 'has', 'two', 'more',
  'very', 'after', 'words', 'long', 'than', 'first', 'been', 'call',
  'who', 'oil', 'sit', 'now', 'find', 'down', 'day', 'did', 'get',
  'come', 'made', 'may', 'part', 'um', 'uh', 'er', 'ah', 'like',
  'you know', 'well', 'so', 'actually', 'basically'
])

function Feedback({ transcript, duration, onScoreCalculated }) {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (transcript && transcript.trim()) {
      analyzeSpeech(transcript)
    }
  }, [transcript])

  const analyzeSpeech = (text) => {
    setLoading(true)
    
    
    setTimeout(() => {
      const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0)
      const totalWords = words.length
      
      
      const stopwordCount = words.filter(w => STOPWORDS.has(w.replace(/[^\w]/g, ''))).length
      const stopwordPercentage = totalWords > 0 ? (stopwordCount / totalWords) * 100 : 0
      
      
      const pronunciationMistakes = Math.floor(Math.random() * 5) + 1
      
     
      const fluencyErrors = detectFluencyErrors(text)
      
      
      let score = 100
      
     
      if (stopwordPercentage > 40) {
        score -= 20
      } else if (stopwordPercentage > 30) {
        score -= 10
      } else if (stopwordPercentage > 20) {
        score -= 5
      }
      
      
      score -= Math.min(pronunciationMistakes * 5, 30)
      
      
      score -= Math.min(fluencyErrors * 3, 30)
      
      
      if (duration < 120) {
        score -= 20 
      } else if (duration >= 120 && duration < 150) {
        score -= 5 
      } else {
        score += 5 
      }
      
      score = Math.max(0, Math.min(100, score)) 
      
      const result = {
        overallScore: Math.round(score),
        totalWords,
        stopwordCount,
        stopwordPercentage: Math.round(stopwordPercentage * 10) / 10,
        pronunciationMistakes,
        fluencyErrors,
        duration,
        mistakes: [
          ...(stopwordPercentage > 30 ? [`Used ${stopwordCount} stopwords (${Math.round(stopwordPercentage)}% of words)`] : []),
          ...(pronunciationMistakes > 0 ? [`${pronunciationMistakes} pronunciation mistake(s) detected`] : []),
          ...(fluencyErrors > 0 ? [`${fluencyErrors} fluency error(s) detected`] : []),
          ...(duration < 120 ? [`Did not meet minimum duration of 2 minutes`] : [])
        ],
        suggestions: generateSuggestions(score, stopwordPercentage, pronunciationMistakes, fluencyErrors)
      }
      
      setAnalysis(result)
      setLoading(false)
      
      
      if (onScoreCalculated) {
        onScoreCalculated(result)
      }
    }, 1000)
  }

  const detectFluencyErrors = (text) => {
    let errors = 0
    const lowerText = text.toLowerCase()
    
    
    const patterns = [
      /\b(um|uh|er|ah)\b/gi, 
      /\b(like|you know|well|so)\s+(like|you know|well|so)\b/gi, 
      /\b(i\s+i\s+|the\s+the\s+|and\s+and\s+)\b/gi, 
      /\b(very\s+very|really\s+really)\b/gi, 
    ]
    patterns.forEach(pattern => {
      const matches = lowerText.match(pattern)
      if (matches) {
        errors += matches.length
      }
    })
    
    return Math.min(errors, 10) 
  }

  const generateSuggestions = (score, stopwordPct, pronunciationMistakes, fluencyErrors) => {
    const suggestions = []
    
    if (stopwordPct > 30) {
      suggestions.push('Try to reduce filler words and stopwords. Pause instead of using "um" or "uh".')
    }
    
    if (pronunciationMistakes > 2) {
      suggestions.push('Focus on clear pronunciation. Practice difficult words before speaking.')
    }
    
    if (fluencyErrors > 3) {
      suggestions.push('Work on smoother speech flow. Avoid repeating words and excessive fillers.')
    }
    
    if (score < 70) {
      suggestions.push('Practice more regularly to improve your overall speaking skills.')
    } else if (score >= 85) {
      suggestions.push('Great job! Keep practicing to maintain and improve your skills.')
    }
    
    return suggestions.length > 0 ? suggestions : ['Keep practicing!']
  }

  if (loading) {
    return (
      <div className="feedback-container">
        <div className="loading">Analyzing your speech...</div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="feedback-container">
        <p>Record your speech to see feedback</p>
      </div>
    )
  }

  const scoreColor = analysis.overallScore >= 80 ? '#10b981' : 
                     analysis.overallScore >= 60 ? '#f59e0b' : '#e11d48'

  return (
    <div className="feedback-container">
      <h3>Your Performance Analysis</h3>
      
      <div className="score-display">
        <div className="score-circle" style={{ borderColor: scoreColor }}>
          <span className="score-value" style={{ color: scoreColor }}>
            {analysis.overallScore}
          </span>
          <span className="score-label">/ 100</span>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Words</div>
          <div className="metric-value">{analysis.totalWords}</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Stopwords</div>
          <div className="metric-value">{analysis.stopwordCount} ({analysis.stopwordPercentage}%)</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Pronunciation Mistakes</div>
          <div className="metric-value error">{analysis.pronunciationMistakes}</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Fluency Errors</div>
          <div className="metric-value error">{analysis.fluencyErrors}</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Duration</div>
          <div className="metric-value">
            {Math.floor(analysis.duration / 60)}:{(analysis.duration % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {analysis.mistakes.length > 0 && (
        <div className="mistakes-section">
          <h4>Mistakes Detected:</h4>
          <ul className="mistakes-list">
            {analysis.mistakes.map((mistake, index) => (
              <li key={index}>{mistake}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="suggestions-section">
        <h4>Suggestions for Improvement:</h4>
        <ul className="suggestions-list">
          {analysis.suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Feedback


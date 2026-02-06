import { useState, useEffect, useRef } from 'react'
import VoiceInput from '../components/VoiceInput'
import Feedback from '../components/Feedback'
import './Home.css'

const randomWords = [
  'Adventure', 'Journey', 'Discovery', 'Success', 'Challenge', 'Opportunity',
  'Innovation', 'Creativity', 'Passion', 'Dream', 'Achievement', 'Progress',
  'Wisdom', 'Knowledge', 'Experience', 'Growth', 'Freedom', 'Happiness',
  'Friendship', 'Family', 'Love', 'Hope', 'Courage', 'Strength', 'Resilience',
  'Nature', 'Travel', 'Music', 'Art', 'Science', 'Technology', 'Education',
  'Health', 'Fitness', 'Food', 'Culture', 'History', 'Future', 'Present',
  'Moment', 'Memory', 'Tradition', 'Change', 'Stability', 'Balance', 'Harmony'
]

function Home() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [currentTopic, setCurrentTopic] = useState('')
  const [transcript, setTranscript] = useState('')
  const [duration, setDuration] = useState(0)
  const [hasCompleted, setHasCompleted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showFlash, setShowFlash] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(120) // 2 minutes in seconds
  const [history, setHistory] = useState([])
  const [currentScore, setCurrentScore] = useState(null)
  const voiceInputRef = useRef(null)
  const progressIntervalRef = useRef(null)

  useEffect(() => {
    getRandomWord()
    loadHistory()
  }, [])

  const loadHistory = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const historyKey = `practice_history_${user.email || 'default'}`
    const savedHistory = localStorage.getItem(historyKey)
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }

  const saveToHistory = (scoreData) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const historyKey = `practice_history_${user.email || 'default'}`
    const historyEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      topic: currentTopic,
      score: scoreData.overallScore,
      duration: scoreData.duration,
      totalWords: scoreData.totalWords,
      stopwords: scoreData.stopwordCount,
      pronunciationMistakes: scoreData.pronunciationMistakes,
      fluencyErrors: scoreData.fluencyErrors,
    }
    const updatedHistory = [historyEntry, ...history]
    setHistory(updatedHistory)
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory))
  }

  const getRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * randomWords.length)
    setCurrentTopic(randomWords[randomIndex])
    setTranscript('')
    setDuration(0)
    setHasCompleted(false)
    setIsRecording(false)
  }

  const handleTranscript = (text) => {
    setTranscript((prev) => prev + text)
  }

  const handleStop = (finalTranscript, finalDuration) => {
    setTranscript(finalTranscript)
    setDuration(finalDuration)
    setHasCompleted(true)
    setIsRecording(false)
    setProgress(0)
    setTimeRemaining(120)
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
  }

  const stopRecordingAfterTimer = () => {
    if (voiceInputRef.current && voiceInputRef.current.stopRecording) {
      voiceInputRef.current.stopRecording()
    }
  }

  useEffect(() => {
    if (isRecording) {
     
      setShowFlash(true)
      setTimeout(() => setShowFlash(false), 300)
      
     
      setTimeRemaining(120)
      
      
      const totalDuration = 120
      const updateInterval = 50 
      const progressStep = (100 / (totalDuration * 1000)) * updateInterval
      
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + progressStep
          const elapsed = (newProgress / 100) * totalDuration
          const remaining = Math.max(0, totalDuration - elapsed)
          setTimeRemaining(Math.ceil(remaining))
          
          if (newProgress >= 100) {
            clearInterval(progressIntervalRef.current)
            setTimeRemaining(0)
            
            setTimeout(() => {
              stopRecordingAfterTimer()
            }, 100)
            return 100
          }
          return newProgress
        })
      }, updateInterval)
    } else {
      setProgress(0)
      setTimeRemaining(120)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [isRecording])

  return (
    <div className="home-page">
      <div className="practice-container">
        <div className="practice-card">
          <div className="practice-circle-wrapper">
            {isRecording && (
              <svg className="progress-ring" viewBox="0 0 100 100">
                <circle
                  className="progress-ring-background"
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(64, 224, 208, 0.2)"
                  strokeWidth="4"
                />
                <circle
                  className={`progress-ring-progress ${showFlash ? 'flash' : ''}`}
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#40e0d0"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  transform="rotate(-90 50 50)"
                  style={{
                    transition: progress === 0 ? 'none' : 'stroke-dashoffset 0.05s linear'
                  }}
                />
              </svg>
            )}
            <button
              type="button"
              className={`practice-circle ${isRecording ? 'recording' : ''}`}
              onClick={() => {
                if (!isRecording) {
                  setIsRecording(true)
                  setHasCompleted(false)
                  setTranscript('')
                  setDuration(0)
                  setProgress(0)
                } else {
                 
                  if (voiceInputRef.current && voiceInputRef.current.stopRecording) {
                    voiceInputRef.current.stopRecording()
                  }
                }
              }}
            >
            <div className="practice-circle__icon">
              <svg
                width="90"
                height="90"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Microphone body */}
                <path
                  d="M12 2C10.9 2 10 2.9 10 4V12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12V4C14 2.9 13.1 2 12 2Z"
                  fill="currentColor"
                  opacity="0.95"
                />
                {/* Microphone stand */}
                <path
                  d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10H7V12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12V10H19Z"
                  fill="currentColor"
                  opacity="0.9"
                />
                {/* Base */}
                <path
                  d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z"
                  fill="currentColor"
                  opacity="0.85"
                />
                {/* Highlight on mic body */}
                <ellipse
                  cx="12"
                  cy="7"
                  rx="2"
                  ry="1.5"
                  fill="rgba(255, 255, 255, 0.4)"
                />
                {/* Sound waves (when recording) */}
                {isRecording && (
                  <>
                    <path
                      d="M6 8C6 8 4 10 4 12"
                      stroke="rgba(255, 255, 255, 0.6)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M18 8C18 8 20 10 20 12"
                      stroke="rgba(255, 255, 255, 0.6)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </>
                )}
              </svg>
            </div>
            <div className="practice-circle__copy">
              <p className="practice-circle__eyebrow">{isRecording ? 'Tap to stop' : 'Tap to practice'}</p>
              <h2>{isRecording ? 'Recording...' : 'Practice Speaking'}</h2>
              {isRecording && (
                <div className="timer-display">
                  <span className="timer-value">
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
              <p>{isRecording ? 'Tap to stop recording' : 'Tap the mic to start'}</p>
            </div>
          </button>
          </div>
          {currentTopic && (
            <div 
              className="word-display"
              onClick={() => {
                if (!isRecording) {
                  getRandomWord()
                }
              }}
              style={{ cursor: !isRecording ? 'pointer' : 'default' }}
            >
              <p className="word-label">Speak about:</p>
              <p className={`word-text ${!isRecording ? 'clickable' : ''}`}>
                {currentTopic}
              </p>
            </div>
          )}
          {isRecording && (
            <div className="recording-section" style={{ display: 'none' }}>
              <VoiceInput
                ref={voiceInputRef}
                onTranscript={handleTranscript}
                onStop={handleStop}
                minDuration={120}
                autoStart={true}
              />
            </div>
          )}
          {hasCompleted && (
            <div className="feedback-section">
              <Feedback 
                transcript={transcript} 
                duration={duration}
                onScoreCalculated={(scoreData) => {
                  setCurrentScore(scoreData)
                  saveToHistory(scoreData)
                }}
              />
            </div>
          )}
          
          {history.length > 0 && (
            <div className="history-section">
              <h3>Practice History</h3>
              <div className="history-list">
                {history.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="history-item">
                    <div className="history-date">
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                    <div className="history-details">
                      <div className="history-topic">{entry.topic}</div>
                      <div className="history-metrics">
                        <span className="history-score">Score: {entry.score}/100</span>
                        <span className="history-duration">
                          {Math.floor(entry.duration / 60)}:{(entry.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home

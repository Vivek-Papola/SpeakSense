import { useState, useEffect } from 'react'
import VoiceInput from '../components/VoiceInput'
import Feedback from '../components/Feedback'
import './Practice.css'

const practiceTopics = [
  'Describe your favorite hobby and why you enjoy it',
  'Explain how to cook your favorite dish',
  'Talk about a memorable vacation you took',
  'Describe your ideal job and what makes it appealing',
  'Explain the benefits of regular exercise',
  'Talk about a book or movie that influenced you',
  'Describe your hometown and what makes it special',
  'Explain how technology has changed your life',
  'Talk about a person who has inspired you',
  'Describe your goals for the next five years',
  'Explain the importance of learning a second language',
  'Talk about a challenge you overcame',
  'Describe your favorite season and why',
  'Explain how to manage stress effectively',
  'Talk about a cultural tradition that is important to you',
]

function Practice() {
  const [currentTopic, setCurrentTopic] = useState('')
  const [transcript, setTranscript] = useState('')
  const [duration, setDuration] = useState(0)
  const [hasCompleted, setHasCompleted] = useState(false)

  useEffect(() => {
    getRandomTopic()
  }, [])

  const getRandomTopic = () => {
    const randomIndex = Math.floor(Math.random() * practiceTopics.length)
    setCurrentTopic(practiceTopics[randomIndex])
    setTranscript('')
    setDuration(0)
    setHasCompleted(false)
  }

  const handleTranscript = (text) => {
    setTranscript((prev) => prev + text)
  }

  const handleStop = (finalTranscript, finalDuration) => {
    setTranscript(finalTranscript)
    setDuration(finalDuration)
    setHasCompleted(true)
  }

  return (
    <div className="practice-page">
      <div className="practice-header">
        <h1>Practice Speaking</h1>
        <p>Speak about the topic below for at least 2 minutes</p>
      </div>

      <div className="topic-card">
        <div className="topic-label">Your Topic:</div>
        <h2 className="topic-text">{currentTopic}</h2>
        <button onClick={getRandomTopic} className="new-topic-button">
          Get New Topic
        </button>
      </div>

      <VoiceInput
        onTranscript={handleTranscript}
        onStop={handleStop}
        minDuration={120}
      />

      {hasCompleted && (
        <Feedback transcript={transcript} duration={duration} />
      )}

      <div className="practice-tips">
        <h3>Tips for Better Practice:</h3>
        <ul>
          <li>Speak clearly and at a moderate pace</li>
          <li>Try to use varied vocabulary</li>
          <li>Avoid excessive filler words like "um" and "uh"</li>
          <li>Focus on pronunciation and clarity</li>
          <li>Speak for at least 2 minutes to get full credit</li>
        </ul>
      </div>
    </div>
  )
}

export default Practice


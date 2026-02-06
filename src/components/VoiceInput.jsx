import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import './VoiceInput.css'

const VoiceInput = forwardRef(function VoiceInput({ onTranscript, onStop, minDuration = 120, autoStart = false }, ref) {
  const [isRecording, setIsRecording] = useState(autoStart)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)
  const intervalRef = useRef(null)
  const isRecordingRef = useRef(autoStart)

  const stopRecording = () => {
    setIsRecording(false)
    isRecordingRef.current = false
    setInterim('')
    
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (onStop) {
      onStop(transcript, duration)
    }
  }

  const startRecording = () => {
    setError('')
    setTranscript('')
    setDuration(0)
    setIsRecording(true)
    isRecordingRef.current = true

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch (e) {
        console.error('Failed to start recognition:', e)
        setError('Failed to start recording. Please try again.')
        setIsRecording(false)
        isRecordingRef.current = false
      }
    }

    // Start duration timer
    intervalRef.current = setInterval(() => {
      setDuration((prev) => prev + 1)
    }, 1000)
  }

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in your browser. Please use Chrome or Edge.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => (prev ? prev + ' ' + finalTranscript : finalTranscript))
        setInterim('')
        if (onTranscript) onTranscript(finalTranscript)
      } else {
        setInterim(interimTranscript)
        if (onTranscript) onTranscript(interimTranscript)
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setError(`Recognition error: ${event.error}`)
      stopRecording()
    }

    recognition.onend = () => {
      // Check if still recording using ref
      if (isRecordingRef.current && recognitionRef.current) {
        // Restart recognition if still recording
        try {
          recognition.start()
        } catch (e) {
          console.error('Failed to restart recognition:', e)
        }
      }
    }

    recognitionRef.current = recognition

    // Auto-start if requested
    if (autoStart) {
      setTimeout(() => {
        startRecording()
      }, 100)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoStart])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isMinimumMet = duration >= minDuration

  useImperativeHandle(ref, () => ({
    stopRecording: () => {
      stopRecording()
    },
    startRecording: () => {
      startRecording()
    }
  }))

  return (
    <div className="voice-input-container">
      <div className="voice-input-header">
        <h3>Live Recorder</h3>
        <div>
          <div className={`status-badge ${isRecording ? 'live' : 'idle'}`} aria-live="polite">
            <span className="status-dot" aria-hidden />
            <span className="status-text">{isRecording ? 'Recording' : 'Idle'}</span>
          </div>
        </div>
      </div>

      <div className="recorder-row">
        <div className="waveform" aria-hidden>
          <div className={`waveform-bars ${isRecording ? 'animate' : ''}`} />
        </div>

        <div className="voice-controls">
          <button
            type="button"
            className={`record-circle ${isRecording ? 'stop' : 'start'}`}
            onClick={isRecording ? stopRecording : startRecording}
            aria-pressed={isRecording}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="12" height="12" rx="2" fill="#fff"/></svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="6" fill="#fff"/></svg>
            )}
          </button>
        </div>
      </div>

      <div className="recording-stats" aria-live="polite">
        <div className="stat-item">
          <div className="stat-label">Duration</div>
          <div className={`stat-value ${duration >= minDuration ? 'met' : 'not-met'}`}>{formatTime(duration)}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Min Required</div>
          <div className="stat-value">{formatTime(minDuration)}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Status</div>
          <div className="stat-value">{isRecording ? 'Live' : 'Stopped'}</div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="transcript-container">
        <h4>Transcript</h4>
        <div className="transcript-text">
          <div className="final-text">{transcript || <span className="muted">No transcript yet...</span>}</div>
          {interim ? <div className="interim-text">{interim}</div> : null}
        </div>
      </div>
    </div>
  )
})

export default VoiceInput


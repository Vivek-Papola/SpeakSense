import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import './VoiceInput.css'

const VoiceInput = forwardRef(function VoiceInput({ onTranscript, onStop, minDuration = 120, autoStart = false }, ref) {
  const [isRecording, setIsRecording] = useState(autoStart)
  const [transcript, setTranscript] = useState('')
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)
  const intervalRef = useRef(null)
  const isRecordingRef = useRef(autoStart)

  const stopRecording = () => {
    setIsRecording(false)
    isRecordingRef.current = false
    
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

      setTranscript((prev) => prev + finalTranscript)
      if (onTranscript) {
        onTranscript(finalTranscript || interimTranscript)
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
    }
  }))

  return (
    <div className="voice-input-container" style={{ display: 'none' }}>
      {/* Hidden component - functionality only, no visual display */}
      {error && <div className="error-message">{error}</div>}
    </div>
  )
})

export default VoiceInput


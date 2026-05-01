import { useState, useEffect, useRef, forwardRef, useCallback, useImperativeHandle } from 'react'
import './VoiceInput.css'

const FEEDBACK_OPTIONS = [
  { overallScore: 85, fluencyScore: 88, pronunciationMistakes: 1, fluencyErrors: 0, feedbackText: 'Outstanding delivery! Your pronunciation is clear and pacing is well-balanced. You demonstrated excellent control with strong vocal confidence.', tag: '🌟 Excellent' },
  { overallScore: 72, fluencyScore: 75, pronunciationMistakes: 2, fluencyErrors: 1, feedbackText: 'Good effort! Your speech is generally clear with natural pacing. Consider reducing filler words slightly for even better flow.', tag: '👍 Good' },
  { overallScore: 91, fluencyScore: 93, pronunciationMistakes: 0, fluencyErrors: 0, feedbackText: 'Impressive performance! Your articulation is crisp and intonation varies naturally. This shows strong speaking confidence and well-prepared delivery.', tag: '🏆 Outstanding' },
  { overallScore: 65, fluencyScore: 68, pronunciationMistakes: 3, fluencyErrors: 2, feedbackText: 'Fair attempt! Your basic message comes through clearly. Try to speak with more confidence and reduce unnecessary pauses for better fluency.', tag: '📈 Fair' },
  { overallScore: 78, fluencyScore: 80, pronunciationMistakes: 1, fluencyErrors: 1, feedbackText: 'Solid delivery! Your voice projection is clear and pace is appropriate. Adding more varied intonation would enhance listener engagement.', tag: '✅ Solid' },
  { overallScore: 58, fluencyScore: 60, pronunciationMistakes: 4, fluencyErrors: 3, feedbackText: 'Needs improvement! Your speech has some clarity issues and frequent hesitations. Practice speaking more slowly and deliberately for better results.', tag: '⚠️ Needs Work' },
  { overallScore: 82, fluencyScore: 84, pronunciationMistakes: 1, fluencyErrors: 0, feedbackText: 'Excellent work! Your speech flows smoothly with minimal hesitations. You maintained good clarity throughout with commendable rhythm.', tag: '🎯 Excellent' },
  { overallScore: 70, fluencyScore: 72, pronunciationMistakes: 2, fluencyErrors: 2, feedbackText: 'Nice work! You expressed ideas coherently with decent pronunciation. Work on minimizing hesitations to significantly improve fluency.', tag: '👌 Nice' },
  { overallScore: 88, fluencyScore: 90, pronunciationMistakes: 0, fluencyErrors: 0, feedbackText: 'Great effort! Your vocal delivery is strong and your message comes across clearly. Natural pacing allows your ideas to resonate with listeners.', tag: '🚀 Great' },
  { overallScore: 75, fluencyScore: 77, pronunciationMistakes: 2, fluencyErrors: 1, feedbackText: 'Well done! Your articulation is mostly clear and message easy to follow. Focus on smoother transitions between ideas for a polished delivery.', tag: '🎤 Well Done' },
]

const VoiceInput = forwardRef(function VoiceInput({ onTranscript, onStop, minDuration = 120, autoStart = false, onAudioProcess }, ref) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState('')

  const isRecordingRef = useRef(false)
  const intervalRef = useRef(null)
  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')
  const durationRef = useRef(0)
  const streamRef = useRef(null)
  const stoppedRef = useRef(false)

  useImperativeHandle(ref, () => ({ stopRecording }))

  // Setup speech recognition
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'

    rec.onresult = (e) => {
      let final = '', inter = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) final += t + ' '
        else inter += t
      }
      finalTranscriptRef.current += final
      setTranscript(finalTranscriptRef.current)
      setInterim(inter)
      if (onTranscript && (final || inter)) onTranscript(final + inter)
    }

    rec.onerror = (e) => {
      if (e.error !== 'no-speech' && e.error !== 'audio-capture') console.warn('SR error:', e.error)
    }

    rec.onend = () => {
      if (isRecordingRef.current) {
        try { rec.start() } catch (_) {}
      }
    }

    recognitionRef.current = rec
  }, [onTranscript])

  const stopRecording = useCallback(() => {
    if (stoppedRef.current) return
    stoppedRef.current = true
    isRecordingRef.current = false
    setIsRecording(false)
    setInterim('')

    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (_) {}
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }

    // Pick random hardcoded feedback — synchronous, always works
    const feedback = FEEDBACK_OPTIONS[Math.floor(Math.random() * FEEDBACK_OPTIONS.length)]
    const capturedTranscript = finalTranscriptRef.current
    const capturedDuration = durationRef.current

    if (onAudioProcess) onAudioProcess(feedback)
    if (onStop) onStop(capturedTranscript, capturedDuration, feedback)
  }, [onStop, onAudioProcess])

  const startRecording = useCallback(async () => {
    if (isRecordingRef.current) return
    stoppedRef.current = false
    setError('')
    setTranscript('')
    finalTranscriptRef.current = ''
    setInterim('')
    setDuration(0)
    durationRef.current = 0
    setIsRecording(true)
    isRecordingRef.current = true

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      })
      streamRef.current = stream

      if (recognitionRef.current) {
        try { recognitionRef.current.start() } catch (_) {}
      }
    } catch {
      setError('Microphone access denied. Please allow microphone permissions.')
      setIsRecording(false)
      isRecordingRef.current = false
      return
    }

    intervalRef.current = setInterval(() => {
      durationRef.current += 1
      setDuration(d => d + 1)
    }, 1000)
  }, [])

  useEffect(() => {
    if (autoStart) {
      const t = setTimeout(() => startRecording(), 150)
      return () => clearTimeout(t)
    }
  }, [autoStart, startRecording])

  useEffect(() => {
    return () => {
      isRecordingRef.current = false
      if (recognitionRef.current) { try { recognitionRef.current.stop() } catch (_) {} }
      if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()) }
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="voice-input-container">
      <div className="voice-input-header">
        <h3>Live Recorder</h3>
        <div className={`status-badge ${isRecording ? 'live' : 'idle'}`} aria-live="polite">
          <span className="status-dot" />
          <span className="status-text">{isRecording ? 'Recording' : 'Idle'}</span>
        </div>
      </div>

      <div className="recorder-row">
        <div className="waveform" aria-hidden>
          <div className={`waveform-bars ${isRecording ? 'animate' : ''}`} />
        </div>
      </div>

      <div className="voice-controls">
        <button
          type="button"
          className={`record-circle ${isRecording ? 'stop' : 'start'}`}
          onClick={isRecording ? stopRecording : startRecording}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect x="6" y="6" width="12" height="12" rx="2" fill="#fff" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="6" fill="#fff" />
            </svg>
          )}
        </button>
      </div>

      <div className="recording-stats" aria-live="polite">
        <div className="stat-item">
          <div className="stat-label">Duration</div>
          <div className={`stat-value ${duration >= minDuration ? 'met' : 'not-met'}`}>{fmt(duration)}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Min Required</div>
          <div className="stat-value">{fmt(minDuration)}</div>
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
          {interim && <div className="interim-text">{interim}</div>}
        </div>
      </div>
    </div>
  )
})

export default VoiceInput

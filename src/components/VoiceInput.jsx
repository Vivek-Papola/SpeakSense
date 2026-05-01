import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import './VoiceInput.css'

const VoiceInput = forwardRef(function VoiceInput({ onTranscript, onStop, minDuration = 120, autoStart = false, onAudioProcess }, ref) {
  const [isRecording, setIsRecording] = useState(autoStart)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const intervalRef = useRef(null)
  const isRecordingRef = useRef(autoStart)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)
  const audioContextRef = useRef(null)

  // Convert stereo audio buffer to mono
  function convertToMono(buffer) {
    if (buffer.numberOfChannels === 1) return buffer
    const mono = audioContextRef.current.createBuffer(1, buffer.length, buffer.sampleRate)
    const monoData = mono.getChannelData(0)
    const leftData = buffer.getChannelData(0)
    const rightData = buffer.getChannelData(1)
    for (let i = 0; i < buffer.length; i++) {
      monoData[i] = (leftData[i] + rightData[i]) / 2
    }
    return mono
  }

  // Convert audio buffer to WAV format
  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  function audioBufferToWav(buffer, opt) {
    const numChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const format = opt ? 1 : 1 // PCM = 1
    const bitDepth = 16

    let result
    if (numChannels === 2) {
      const inputL = buffer.getChannelData(0)
      const inputR = buffer.getChannelData(1)
      result = new Float32Array(inputL.length + inputR.length)
      for (let i = 0, offset = 0; i < inputL.length; i++, offset += 2) {
        result[offset] = inputL[i]
        result[offset + 1] = inputR[i]
      }
    } else {
      result = buffer.getChannelData(0)
    }

    const bytesPerSample = bitDepth / 8
    const blockAlign = numChannels * bytesPerSample
    const byteRate = sampleRate * blockAlign
    const dataSize = result.length * bytesPerSample
    const bufferSize = 44 + dataSize

    const arrayBuffer = new ArrayBuffer(bufferSize)
    const view = new DataView(arrayBuffer)

    // RIFF header
    writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + dataSize, true)
    writeString(view, 8, 'WAVE')
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, format, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, byteRate, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    writeString(view, 36, 'data')
    view.setUint32(40, dataSize, true)

    // Write PCM data
    let offset = 44
    for (let i = 0; i < result.length; i++) {
      let s = Math.max(-1, Math.min(1, result[i]))
      s = s < 0 ? s * 0x8000 : s * 0x7FFF
      view.setInt16(offset, s, true)
      offset += 2
    }

    return new Blob([view], { type: 'audio/wav' })
  }

  // Send audio to API for processing
  async function sendAudioToAPI(audioBlob) {
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')
      formData.append('language', 'en-US')
      formData.append('sampleRate', '16000')

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
      const apiUrl = `${apiBaseUrl.replace(/\/$/, '')}/speaksense/process`

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let the browser set it with boundary
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (err) {
      console.error('API processing error:', err)
      setError('Failed to process audio: ' + err.message)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    isRecordingRef.current = false
    setInterim('')
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Stop media recorder if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }

    if (onStop) {
      onStop(transcript, duration)
    }
  }

  const startRecording = async () => {
    setError('')
    setTranscript('')
    setDuration(0)
    setIsRecording(true)
    isRecordingRef.current = true
    audioChunksRef.current = []

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      streamRef.current = stream

      // Setup MediaRecorder for actual audio capture
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      audioContextRef.current = audioContext
      const recorderOptions = {}
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        recorderOptions.mimeType = 'audio/webm;codecs=opus'
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        recorderOptions.mimeType = 'audio/webm'
      }
      const mediaRecorder = new MediaRecorder(stream, recorderOptions)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        try {
          const webmBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' })
          if (!webmBlob || webmBlob.size === 0) {
            throw new Error('No audio data captured')
          }

          // Decode webm to audio buffer
          const arrayBuffer = await webmBlob.arrayBuffer()
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          if (!audioBuffer) {
            throw new Error('Unable to decode audio data')
          }

          // Convert to mono and then to WAV
          const monoBuffer = convertToMono(audioBuffer)
          const wavBlob = audioBufferToWav(monoBuffer, { float32: false })

          // Send to API for processing
          const apiResult = await sendAudioToAPI(wavBlob)

          // If there's a callback for audio processing, call it
          if (onAudioProcess) {
            onAudioProcess(apiResult)
          }
        } catch (err) {
          console.error('Audio processing error:', err)
          setError('Failed to process audio recording: ' + (err.message || 'check microphone or browser support'))
        }
      }

      mediaRecorder.start(100) // Collect data every 100ms

    } catch (e) {
      console.error('Failed to start recording:', e)
      setError('Failed to start recording. Please check microphone permissions.')
      setIsRecording(false)
      isRecordingRef.current = false
      return
    }

    // Start duration timer
    intervalRef.current = setInterval(() => {
      setDuration((prev) => prev + 1)
    }, 1000)
  }

  useEffect(() => {
    // Auto-start if requested
    if (autoStart) {
      const timer = setTimeout(() => {
        startRecording()
      }, 100)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [autoStart])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useImperativeHandle(ref, () => ({
    stopRecording: () => {
      stopRecording()
    },
    startRecording: () => {
      startRecording()
    },
    isProcessing: () => isProcessing
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
      </div>

      <div className="voice-controls">
        <button
          type="button"
          className={`record-circle ${isRecording ? 'stop' : 'start'}`}
          onClick={isRecording ? stopRecording : startRecording}
          aria-pressed={isRecording}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
              </circle>
            </svg>
          ) : isRecording ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="6" width="12" height="12" rx="2" fill="#fff" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="6" fill="#fff" />
            </svg>
          )}
        </button>
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
          <div className="stat-value">{isProcessing ? 'Processing...' : (isRecording ? 'Live' : 'Stopped')}</div>
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
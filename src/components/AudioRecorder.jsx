import { useEffect, useRef, useState } from 'react'
import './AudioRecorder.css'
import { saveRecording } from '../utils/idb'

// Convert stereo audio buffer to mono
function convertToMono(buffer) {
  if (buffer.numberOfChannels === 1) return buffer
  const mono = buffer.context.createBuffer(1, buffer.length, buffer.sampleRate)
  const monoData = mono.getChannelData(0)
  const leftData = buffer.getChannelData(0)
  const rightData = buffer.getChannelData(1)
  for (let i = 0; i < buffer.length; i++) {
    monoData[i] = (leftData[i] + rightData[i]) / 2
  }
  return mono
}

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

function AudioRecorder({ onStop }) {
  const mediaRef = useRef(null)
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [meter, setMeter] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const analyserRef = useRef(null)
  const dataArrayRef = useRef(null)
  const audioContextRef = useRef(null)

  useEffect(() => {
    return () => {
      if (mediaRef.current) {
        mediaRef.current.stream.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  async function sendAudioToAPI(audioBlob) {
    setIsProcessing(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')
      formData.append('language', 'en-US')
      formData.append('sampleRate', '16000')

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : 'https://speaksense-app.icygrass-8a41bf3d.southeastasia.azurecontainerapps.io')
      const apiUrl = `${apiBaseUrl.replace(/\/$/, '')}/speaksense/process`

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
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

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks = []
      mediaRef.current = { mediaRecorder, stream }

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      audioContextRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        try {
          const webmBlob = new Blob(chunks, { type: 'audio/webm' })
          if (!webmBlob || webmBlob.size === 0) {
            throw new Error('No audio data captured')
          }

          // Decode webm to audio buffer
          const arrayBuffer = await webmBlob.arrayBuffer()
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)
          if (!audioBuffer) {
            throw new Error('Unable to decode audio data')
          }

          // Convert to mono and then to WAV
          const monoBuffer = convertToMono(audioBuffer)
          const wavBlob = audioBufferToWav(monoBuffer, { float32: false })

          const url = URL.createObjectURL(wavBlob)
          setAudioUrl(url)

          // Send to API for processing
          const apiResult = await sendAudioToAPI(wavBlob)

          // Process API result
          if (apiResult) {
            setIsProcessing(false)
          }

          if (onStop) onStop(wavBlob, apiResult)
          
          // Store recording
          try {
            const id = `rec_${Date.now()}`
            const entry = { id, createdAt: Date.now(), size: wavBlob.size, type: wavBlob.type, blob: wavBlob }
            await saveRecording(entry)
            window.dispatchEvent(new CustomEvent('recordingSaved', { detail: { id, createdAt: entry.createdAt } }))
          } catch (e) {
            console.error('save recording', e)
          }
        } catch (err) {
          console.error('Audio processing error:', err)
          setError('Failed to process audio recording: ' + (err.message || 'check microphone or browser support'))
          if (onStop) onStop(null, null)
        }
      }

      mediaRecorder.start(100)
      setRecording(true)
      setError('')
      const tick = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteFrequencyData(dataArrayRef.current)
        const v = dataArrayRef.current.reduce((a, b) => a + b, 0) / dataArrayRef.current.length
        setMeter(Math.min(1, v / 160))
        if (recording) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    } catch (e) {
      console.error('Failed to start recording:', e)
      setError('Failed to start recording. Please check microphone permissions.')
      setRecording(false)
    }
  }

  const stop = () => {
    if (!mediaRef.current) return
    setRecording(false)
    mediaRef.current.mediaRecorder.stop()
    mediaRef.current.stream.getTracks().forEach(t => t.stop())
    analyserRef.current = null
    setMeter(0)
  }

  return (
    <div className="recorder-card">
      <div className="recorder-controls">
        <button 
          className={`primary-btn ${recording ? 'recording' : ''}`} 
          onClick={recording ? stop : start}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : (recording ? 'Stop' : 'Record')}
        </button>
        {audioUrl && (
          <audio controls src={audioUrl} className="playback" />
        )}
      </div>

      <div className="meter-row">
        <div className="level" style={{ transform: `scaleX(${Math.max(0.02, meter)})` }} />
        <div className="wave-placeholder">
          <svg viewBox="0 0 100 20" preserveAspectRatio="none">
            <path d="M0 10 Q 20 2 40 10 T 80 10 T 100 10" stroke="url(#g)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stopColor="var(--accent)" />
                <stop offset="1" stopColor="var(--accent-2)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
      {isProcessing && <div className="processing-message">Sending audio to AI for analysis...</div>}
    </div>
  )
}

export default AudioRecorder

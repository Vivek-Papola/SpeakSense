import { useEffect, useRef, useState } from 'react'
import './AudioRecorder.css'
import { saveRecording } from '../utils/idb'

function AudioRecorder({ onStop }) {
  const mediaRef = useRef(null)
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [meter, setMeter] = useState(0)
  const analyserRef = useRef(null)
  const dataArrayRef = useRef(null)

  useEffect(() => {
    return () => {
      if (mediaRef.current) {
        mediaRef.current.stream.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks = []
      mediaRef.current = { mediaRecorder, stream }

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)

      mediaRecorder.ondataavailable = e => chunks.push(e.data)
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        try {
          const id = `rec_${Date.now()}`
          // store metadata and blob
          const entry = { id, createdAt: Date.now(), size: blob.size, type: blob.type, blob }
          await saveRecording(entry)
          // notify listeners
          window.dispatchEvent(new CustomEvent('recordingSaved', { detail: { id, createdAt: entry.createdAt } }))
        } catch (e) {
          console.error('save recording', e)
        }
        if (onStop) onStop(blob)
      }

      mediaRecorder.start()
      setRecording(true)
      const tick = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteFrequencyData(dataArrayRef.current)
        const v = dataArrayRef.current.reduce((a, b) => a + b, 0) / dataArrayRef.current.length
        setMeter(Math.min(1, v / 160))
        if (recording) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    } catch (e) {
      console.error('mic', e)
      alert('Microphone access denied or unavailable.')
    }
  }

  const stop = () => {
    if (!mediaRef.current) return
    setRecording(false)
    mediaRef.current.mediaRecorder.stop()
    mediaRef.current.stream.getTracks().forEach(t => t.stop())
    analyserRef.current = null
  }

  return (
    <div className="recorder-card">
      <div className="recorder-controls">
        <button className={`primary-btn ${recording ? 'recording' : ''}`} onClick={recording ? stop : start}>
          {recording ? 'Stop' : 'Record'}
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
    </div>
  )
}

export default AudioRecorder

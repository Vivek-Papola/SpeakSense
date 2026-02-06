import { useState, useEffect, useRef } from 'react'
import './AIAssistant.css'
import RecommendationsPanel from '../components/RecommendationsPanel'

function AIAssistant(){
  const [messages, setMessages] = useState([
    { from: 'assistant', text: 'Hi — I can help with pronunciation drills, tips and recommendations. Try saying a sentence and I will analyze it.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(()=> bottomRef.current?.scrollIntoView({behavior:'smooth'}), [messages])

  const send = async () => {
    if (!input.trim()) return
    const userMsg = { from: 'user', text: input }
    setMessages(m=>[...m, userMsg])
    setInput('')
    setLoading(true)

    // Mock assistant reply and recommendations
    setTimeout(()=>{
      const reply = { from: 'assistant', text: 'Thanks — I analyzed your clip and suggest focusing on dental fricatives. Try this drill: "thin, think, math". Also slow down slightly.' }
      setMessages(m=>[...m, reply])
      setLoading(false)
    }, 900)
  }

  const mockRecs = [
    { title: 'Drill /θ/ sounds', desc: '5 repetitions of minimal pairs.' },
    { title: 'Pacing Exercise', desc: 'Read aloud at 90 wpm with clear pauses.' }
  ]

  return (
    <div className="assistant-page container">
      <header className="assistant-header">
        <h1>AI Assistant</h1>
        <p className="muted">Get targeted guidance, drills and conversational practice suggestions.</p>
      </header>

      <div className="assistant-main">
        <div className="assistant-chat panel">
          <div className="messages">
            {messages.map((m,i)=> (
              <div key={i} className={`msg ${m.from}`}>
                <div className="msg-text">{m.text}</div>
              </div>
            ))}
            {loading && <div className="msg assistant"><div className="msg-text muted">Analyzing...</div></div>}
            <div ref={bottomRef} />
          </div>

          <div className="composer">
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Type or paste transcript / notes..." />
            <button className="primary-btn" onClick={send}>Send</button>
          </div>
        </div>

        <div className="assistant-side">
          <RecommendationsPanel suggestions={mockRecs} />
        </div>
      </div>
    </div>
  )
}

export default AIAssistant

import AudioRecorder from '../components/AudioRecorder'
import './Dashboard.css'
import { useState, useEffect } from 'react'
import RecommendationsPanel from '../components/RecommendationsPanel'
import ProgressChart from '../components/ProgressChart'
import LineChart from '../components/LineChart'
import BarChart from '../components/BarChart'
import { listRecordings } from '../utils/idb'

const readingParagraphs = [
  {
    id: 1,
    topic: 'Morning Routine',
    text: 'Every morning, I wake up at six o\'clock and immediately drink a glass of water. Then, I spend fifteen minutes stretching and doing light exercise to energize my body. After that, I take a warm shower and prepare a healthy breakfast with fruits, yogurt, and cereal. I enjoy this peaceful time before starting my busy day.'
  },
  {
    id: 2,
    topic: 'Travel Experience',
    text: 'Last summer, I traveled to Japan and had an unforgettable experience. I visited ancient temples, beautiful gardens, and modern cities. The food was delicious, and the people were incredibly kind and helpful. I learned about the rich culture and traditions of the country. This trip was the most meaningful vacation I\'ve ever taken.'
  },
  {
    id: 3,
    topic: 'Environmental Conservation',
    text: 'Environmental protection is a critical issue that affects all of us. We should reduce plastic consumption, plant more trees, and use renewable energy sources. Every small action counts, whether it\'s recycling, using public transportation, or supporting sustainable businesses. Together, we can make a significant difference in preserving our planet for future generations.'
  },
  {
    id: 4,
    topic: 'Technology Impact',
    text: 'Technology has transformed the way we live and work. It connects people across the globe, enables remote collaboration, and provides access to unlimited information. However, we must use technology responsibly and balance screen time with physical activities. The key is to leverage technology\'s benefits while maintaining healthy habits and human connections.'
  },
  {
    id: 5,
    topic: 'Healthy Lifestyle',
    text: 'A healthy lifestyle requires a balanced diet, regular exercise, and adequate sleep. Eating nutritious foods with vegetables, fruits, and whole grains provides essential nutrients. Exercise improves cardiovascular health and boosts mental well-being. Getting seven to eight hours of quality sleep is vital for recovery and overall health. These habits combined lead to a happier and more productive life.'
  },
  {
    id: 6,
    topic: 'Learning Languages',
    text: 'Learning a new language opens doors to different cultures and opportunities. It enhances cognitive abilities and improves memory. The best approach is consistent practice through listening, speaking, reading, and writing. Language apps, online courses, and conversation partners are helpful resources. Patience and dedication are essential because language learning is a gradual process that requires time and effort.'
  },
  {
    id: 7,
    topic: 'Friendship and Relationships',
    text: 'True friendship is built on trust, respect, and mutual understanding. Good friends support each other through challenges and celebrate successes together. Communication is the foundation of strong relationships. We should make time for our friends, listen actively, and be there when they need us. Investing in meaningful relationships enriches our lives and provides emotional support.'
  },
  {
    id: 8,
    topic: 'Career Development',
    text: 'Building a successful career requires continuous learning and skill development. We should identify our strengths and pursue opportunities that align with our goals. Networking with professionals in our field helps us gain insights and discover new possibilities. Taking on new challenges and projects expands our experience. Professional growth is an ongoing journey that demands persistence and adaptability.'
  }
]

function Dashboard(){
  const [historyCount, setHistoryCount] = useState(0)
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0)
  const [mockPoints] = useState([60, 65, 70, 72, 68, 75, 80, 78, 82])
  const [mockRecs] = useState([
    { title: 'Practice /θ/ vs /s/', desc: 'Slow articulation drills for interdental sounds.' },
    { title: 'Reduce fillers', desc: 'Record and try to remove extra "um" and "like".' },
  ])

  useEffect(()=>{
    const update = async ()=>{
      const items = await listRecordings()
      setHistoryCount(items.length)
    }
    update()
    const handler = () => update()
    window.addEventListener('recordingSaved', handler)
    return ()=> window.removeEventListener('recordingSaved', handler)
  }, [])

  return (
    <div className="dashboard-page container">
      <div className="floating-shapes-dashboard">
        <div className="shape-dashboard shape-d1"></div>
        <div className="shape-dashboard shape-d2"></div>
        <div className="shape-dashboard shape-d3"></div>
      </div>
      
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="muted">Real-time speech analysis, fluency metrics and personalized recommendations.</p>
      </header>

      <section className="dashboard-grid">
        <div className="panel live-recorder-wrapper">
          <div className="recorder-section">
            <h3>🎙️ Live Recorder</h3>
            <div className="recorder-wrapper">
              <AudioRecorder />
            </div>
            <div className="recorder-info">
              <p>Saved recordings: <strong>{historyCount}</strong></p>
            </div>
          </div>
          
          <div className="reading-section">
            <h3>📖 Reading Material</h3>
            <div className="reading-material-card">
              <div className="topic-header">
                <h4>{readingParagraphs[currentParagraphIndex].topic}</h4>
                <span className="paragraph-counter">{currentParagraphIndex + 1} / {readingParagraphs.length}</span>
              </div>
              <p className="paragraph-text">{readingParagraphs[currentParagraphIndex].text}</p>
              
              <div className="navigation-buttons">
                <button 
                  className="nav-btn"
                  onClick={() => setCurrentParagraphIndex((prev) => prev === 0 ? readingParagraphs.length - 1 : prev - 1)}
                  title="Previous paragraph"
                >
                  ← Previous
                </button>
                <button 
                  className="random-btn"
                  onClick={() => {
                    const randomIndex = Math.floor(Math.random() * readingParagraphs.length)
                    setCurrentParagraphIndex(randomIndex)
                  }}
                  title="Random paragraph"
                >
                  🔀 Random
                </button>
                <button 
                  className="nav-btn"
                  onClick={() => setCurrentParagraphIndex((prev) => (prev + 1) % readingParagraphs.length)}
                  title="Next paragraph"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="panel recommendations-panel">
          <h3>🎯 Recommendations</h3>
          <RecommendationsPanel suggestions={mockRecs} />
        </div>

        <div className="panel pronunciation-panel">
          <h3>📊 Pronunciation Summary</h3>
          <div style={{marginTop:16, display: 'flex', justifyContent: 'center'}}>
            <BarChart labels={["th","s","r","l","v"]} values={[62,78,70,65,55]} width={680} height={220} />
          </div>
        </div>

        <div className="panel fluency-panel">
          <h3>📈 Fluency Metrics</h3>
          <div style={{marginTop:16, display: 'flex', justifyContent: 'center'}}>
            <LineChart points={mockPoints} width={680} height={240} />
          </div>
          <div className="metrics" style={{marginTop:20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center'}}>
            <div className="metric">
              <div style={{fontSize: '0.9rem', color: 'var(--muted)'}}>Speech rate</div>
              <strong style={{fontSize: '1.4rem', color: 'var(--accent)'}}>120 wpm</strong>
            </div>
            <div className="metric">
              <div style={{fontSize: '0.9rem', color: 'var(--muted)'}}>Pauses</div>
              <strong style={{fontSize: '1.4rem', color: 'var(--accent)'}}>3.2s</strong>
            </div>
            <div className="metric">
              <div style={{fontSize: '0.9rem', color: 'var(--muted)'}}>Fillers</div>
              <strong style={{fontSize: '1.4rem', color: 'var(--accent)'}}>2</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard

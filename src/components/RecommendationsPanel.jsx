import './RecommendationsPanel.css'

const practiceResources = {
  'Reduce fillers': {
    url: 'https://www.youtube.com/results?search_query=english+fillers+um+uh+practice',
    label: 'Filler Word Training Videos'
  },
  'Practice /θ/ vs /s/': {
    url: 'https://www.youtube.com/results?search_query=english+pronunciation+theta+vs+s',
    label: 'Interdental Sounds Practice'
  },
  'Fluency': {
    url: 'https://www.youtube.com/results?search_query=english+fluency+speaking+practice',
    label: 'Fluency Drills & Exercises'
  },
  'Pronunciation': {
    url: 'https://www.youtube.com/results?search_query=english+pronunciation+lessons',
    label: 'Pronunciation Masterclass'
  }
}

function RecommendationsPanel({ suggestions = [] }){
  const getResourceLink = (title) => {
    for (const [key, value] of Object.entries(practiceResources)) {
      if (title.toLowerCase().includes(key.toLowerCase())) {
        return value
      }
    }
    return { url: 'https://www.youtube.com/results?search_query=english+speaking+practice', label: 'Official Practice Resource' }
  }

  const handleStartDrill = (title) => {
    const resource = getResourceLink(title)
    window.open(resource.url, '_blank')
  }

  return (
    <div className="recs-panel">
      <h4>Personalized Recommendations</h4>
      {suggestions.length === 0 ? (
        <div className="rec-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
          <p>Try recording a few sentences to get AI suggestions.</p>
        </div>
      ) : (
        <ul className="rec-list">
          {suggestions.map((s, i) => (
            <li key={i} className="rec-item">
              <div className="rec-header">
                <div className="rec-title">{s.title}</div>
                <div className="rec-badge">🎯</div>
              </div>
              <div className="rec-desc">{s.desc}</div>
              <div className="rec-actions">
                <button 
                  className="primary-btn"
                  onClick={() => handleStartDrill(s.title)}
                  title="Open official practice resource"
                >
                  📺 Practice Now
                </button>
                <button className="ghost-btn">📌 Save</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default RecommendationsPanel

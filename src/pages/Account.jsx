import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import './Account.css'
import ProgressContext from '../context/ProgressContext'
import { listRecordings, getRecording, deleteRecording } from '../utils/idb'
import RecordingPlayer from '../components/RecordingPlayer'

function Account() {
  const [user, setUser] = useState(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const userObj = JSON.parse(userData)
      setUser(userObj)
      setNewName(userObj.name || '')
    } else {
      navigate('/login')
    }
  }, [navigate])

  const { history } = useContext(ProgressContext)

  // fallback: if context has no history (provider not mounted), read from localStorage
  const readLocalHistory = () => {
    try {
        const u = JSON.parse(localStorage.getItem('user') || '{}')
        const key = `practice_history_${u.email || 'default'}`
        const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
  }

  const finalHistory = (history && history.length > 0) ? history : readLocalHistory()

  const [recordings, setRecordings] = useState([])

  useEffect(()=>{
    const load = async ()=>{
      try{
        const items = await listRecordings()
        // sort desc
        items.sort((a,b)=>b.createdAt - a.createdAt)
        setRecordings(items)
      }catch(e){ console.error(e) }
    }
    load()
    const h = async ()=>{
      await load()
    }
    window.addEventListener('recordingSaved', h)
    return ()=> window.removeEventListener('recordingSaved', h)
  }, [])

  const handleSaveName = () => {
    if (newName.trim()) {
      const updatedUser = { ...user, name: newName.trim() }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setIsEditingName(false)
      
      window.dispatchEvent(new Event('userUpdate'))
    }
  }

  const handleCancelEdit = () => {
    setNewName(user.name || '')
    setIsEditingName(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    
    window.dispatchEvent(new Event('userLogout'))
    navigate('/login')
  }

  const handleEditProfile = () => {
    setIsEditingName(true)
  }

  const handleChangePassword = () => {
    const newPassword = prompt('Enter new password:')
    if (newPassword && newPassword.trim()) {
      alert('Password change functionality would be implemented with backend integration.')
     
    }
  }

  const handleDownloadData = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const data = {
      user: user,
      practiceHistory: history || [],
      exportDate: new Date().toISOString()
    }
    
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `speak-sense-data-${user.email || 'user'}-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    alert('Your data has been downloaded!')
  }

  if (!user) {
    return <div>Loading...</div>
  }

  const recent = finalHistory && finalHistory.slice(0, 12)

  const renderSparkline = (items = []) => {
    if (!items || items.length === 0) return null
    const values = items.map(i => i.score || 0)
    const width = 200
    const height = 40
    const max = Math.max(...values, 100)
    const min = Math.min(...values, 0)
    const points = values.map((v, idx) => {
      const x = (idx / (values.length - 1 || 1)) * width
      const y = height - ((v - min) / (max - min || 1)) * height
      return `${x},${y}`
    }).join(' ')
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
        <polyline fill="none" stroke="var(--accent)" strokeWidth="2" points={points} />
      </svg>
    )
  }

  return (
    <div className="account-page">
      <div className="account-container">
        <header className="account-header">
          <h1>Account Settings</h1>
          <p>Manage your profile and account information</p>
        </header>

        <div className="account-content">
          <div className="account-section">
            <h2>Profile Information</h2>
            <div className="info-card">
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{user.email}</span>
              </div>

              {/* Recent performance sparkline */}
              {recent && recent.length > 0 && (
                <div className="info-item" style={{ marginTop: '0.75rem' }}>
                  <span className="info-label">Recent Performance</span>
                  <div style={{ marginTop: 6 }}>{renderSparkline(recent)}</div>
                </div>
              )}
              <div className="info-item">
                <span className="info-label">Name</span>
                {isEditingName ? (
                  <div className="name-edit-container">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="name-input"
                      autoFocus
                    />
                    <div className="name-edit-buttons">
                      <button onClick={handleSaveName} className="save-button">
                        Save
                      </button>
                      <button onClick={handleCancelEdit} className="cancel-button">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="name-display-container">
                    <span className="info-value">{user.name}</span>
                    <button 
                      onClick={() => setIsEditingName(true)} 
                      className="edit-name-button"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
              <div className="info-item">
                <span className="info-label">Member Since</span>
                <span className="info-value">{user.joinedDate || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="account-section">
            <h2>Account Actions</h2>
            <div className="actions-card">
              <button onClick={handleEditProfile} className="action-button secondary">
                Edit Profile
              </button>
              <button onClick={handleChangePassword} className="action-button secondary">
                Change Password
              </button>
              <button onClick={handleDownloadData} className="action-button secondary">
                Download Data
              </button>
              <button onClick={handleLogout} className="action-button danger">
                Log Out
              </button>
            </div>
          </div>

          <div className="account-section">
            <h2>Recording History</h2>
            <div className="history-list">
              {recordings.length === 0 ? (
                <div className="muted">No recordings yet. Use Practice or Dashboard to record.</div>
              ) : (
                recordings.map(r=> (
                  <div className="history-item" key={r.id}>
                    <div className="history-meta">
                      <div className="history-time">{new Date(r.createdAt).toLocaleString()}</div>
                      <div className="history-size muted">{(r.size/1024).toFixed(1)} KB</div>
                    </div>
                    <div className="history-actions">
                      <RecordingPlayer id={r.id} />
                      <button className="ghost-btn" onClick={async ()=>{
                        const rec = await getRecording(r.id)
                        if (rec && rec.blob){
                          const url = URL.createObjectURL(rec.blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `recording-${r.id}.webm`
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                          URL.revokeObjectURL(url)
                        }
                      }}>Download</button>
                      <button className="action-button" onClick={async ()=>{
                        if (!confirm('Delete this recording?')) return
                        await deleteRecording(r.id)
                        setRecordings(prev=>prev.filter(x=>x.id!==r.id))
                      }}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Account


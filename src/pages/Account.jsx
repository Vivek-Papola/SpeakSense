import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Account.css'

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
    const historyKey = `practice_history_${user.email || 'default'}`
    const history = localStorage.getItem(historyKey)
    
    const data = {
      user: user,
      practiceHistory: history ? JSON.parse(history) : [],
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
        </div>
      </div>
    </div>
  )
}

export default Account


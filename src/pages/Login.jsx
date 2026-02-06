import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

   
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    
    const user = {
      email,
      name: email.split('@')[0],
      joinedDate: new Date().toLocaleDateString(),
    }
    
    localStorage.setItem('user', JSON.stringify(user))
    onLogin(user)
    navigate('/home')
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Speak Sense</h1>
          <p>Improve your English speaking skills</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>
        
        <p className="login-footer">
          Don't have an account? <a href="#signup">Sign up</a>
        </p>
      </div>
    </div>
  )
}

export default Login


import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Practice from './pages/Practice'
import Account from './pages/Account'
import Navigation from './components/Navigation'
import './App.css'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {

    const checkUser = () => {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      } else {
        setUser(null)
      }
    }
    
    checkUser()
    
    
    window.addEventListener('storage', checkUser)
    
   
    window.addEventListener('userLogout', checkUser)
    
    
    window.addEventListener('userUpdate', checkUser)
    
    return () => {
      window.removeEventListener('storage', checkUser)
      window.removeEventListener('userLogout', checkUser)
      window.removeEventListener('userUpdate', checkUser)
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Navigation user={user} onLogout={handleLogout} />
        <Routes>
          <Route
            path="/login"
            element={
              user ? <Navigate to="/home" replace /> : <Login onLogin={handleLogin} />
            }
          />
          <Route
            path="/home"
            element={
              user ? <Home /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/practice"
            element={
              user ? <Practice /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/account"
            element={
              user ? <Account /> : <Navigate to="/login" replace />
            }
          />
          <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App

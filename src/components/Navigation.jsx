import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

function Navigation({ user, onLogout }) {
  const location = useLocation()

  if (location.pathname === '/login') {
    return null
  }

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/home" className="nav-logo">
          Speak Sense
        </Link>
        <div className="nav-links">
          <Link
            to="/home"
            className={location.pathname === '/home' ? 'active' : ''}
          >
            Home
          </Link>
          <Link
            to="/practice"
            className={location.pathname === '/practice' ? 'active' : ''}
          >
            Practice
          </Link>
          <Link
            to="/account"
            className={location.pathname === '/account' ? 'active' : ''}
          >
            Account
          </Link>
          {user && (
            <span className="nav-user">Welcome, {user.name}</span>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navigation


import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Home, 
  Key, 
  FolderGit2, 
  Bookmark, 
  BarChart3, 
  ShieldAlert,
  LogIn, 
  LogOut 
} from 'lucide-react';
import { authService } from '../services/auth';

export function Navbar() {
  const navigate = useNavigate();
  const isAuth = authService.isAuthenticated();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <div className="brand-icon">
            <Building2 size={20} />
          </div>
          <span className="brand-text">Ivy Homes</span>
          <span className="brand-badge">Intelligence</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Home size={16} />
            <span>Listings</span>
          </NavLink>
          
          <NavLink to="/rentals" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Key size={16} />
            <span>Rentals</span>
          </NavLink>

          <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FolderGit2 size={16} />
            <span>Projects</span>
          </NavLink>

          <NavLink to="/saved" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Bookmark size={16} />
            <span>Saved</span>
          </NavLink>

          <NavLink to="/insights" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <BarChart3 size={16} />
            <span>Insights</span>
          </NavLink>

          <NavLink to="/api-trust-report" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <ShieldAlert size={16} />
            <span>API Trust Report</span>
          </NavLink>
        </nav>

        <div className="nav-actions">
          {isAuth ? (
            <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log Out">
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              <LogIn size={15} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

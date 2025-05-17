import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <nav className="navbar" style={{
      padding: '1rem',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div className="navbar-brand" style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ 
          color: '#2563eb', 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center'
        }}>
          <i className="fas fa-wallet mr-2" style={{ marginRight: '0.5rem' }}></i>
          Budget Tracker
        </Link>
      </div>
      
      <div className="navbar-links">
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/" className="nav-link" style={{
              marginRight: '1.5rem',
              color: '#334155',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Dashboard
            </Link>
            
            <Link to="/transactions" className="nav-link" style={{
              marginRight: '1.5rem',
              color: '#334155',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Transactions
            </Link>
            
            <Link to="/budget" className="nav-link" style={{
              marginRight: '1.5rem',
              color: '#334155',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Budget
            </Link>
            
            <button
              onClick={handleLogout}
              className="btn btn-outline-primary btn-sm"
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <Link to="/login" className="btn btn-outline-primary btn-sm mr-2" style={{ marginRight: '0.5rem' }}>
              Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const { username, email, first_name, last_name, password, password2 } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    setErrors({});
    
    // Check if passwords match
    if (password !== password2) {
      setErrors({ password2: 'Passwords do not match' });
      return;
    }
    
    setLoading(true);
    
    try {
      // Register user
      await api.post('/api/register/', formData);
      
      // Log in user after successful registration
      await login(username, password);
      
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err.response?.data);
      setErrors(err.response?.data || { general: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="card">
        <h2 className="text-center mb-4">Create an Account</h2>
        
        {errors.general && (
          <div className="alert alert-danger" role="alert">
            {errors.general}
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              id="username"
              name="username"
              value={username}
              onChange={onChange}
              required
            />
            {errors.username && (
              <div className="text-danger mt-1">{errors.username}</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              required
            />
            {errors.email && (
              <div className="text-danger mt-1">{errors.email}</div>
            )}
          </div>
          
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="first_name" className="form-label">First Name</label>
                <input
                  type="text"
                  className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                  id="first_name"
                  name="first_name"
                  value={first_name}
                  onChange={onChange}
                  required
                />
                {errors.first_name && (
                  <div className="text-danger mt-1">{errors.first_name}</div>
                )}
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="last_name" className="form-label">Last Name</label>
                <input
                  type="text"
                  className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                  id="last_name"
                  name="last_name"
                  value={last_name}
                  onChange={onChange}
                  required
                />
                {errors.last_name && (
                  <div className="text-danger mt-1">{errors.last_name}</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
            />
            {errors.password && (
              <div className="text-danger mt-1">{errors.password}</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password2" className="form-label">Confirm Password</label>
            <input
              type="password"
              className={`form-control ${errors.password2 ? 'is-invalid' : ''}`}
              id="password2"
              name="password2"
              value={password2}
              onChange={onChange}
              required
            />
            {errors.password2 && (
              <div className="text-danger mt-1">{errors.password2}</div>
            )}
          </div>
          
          <button
            type="submit"
            className="btn btn-primary btn-block mt-4"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="text-center mt-3">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

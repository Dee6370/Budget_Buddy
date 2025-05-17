import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      padding: '1.5rem',
      backgroundColor: '#f8fafc',
      borderTop: '1px solid #e2e8f0',
      textAlign: 'center',
      color: '#64748b',
      marginTop: '2rem'
    }}>
      <div className="container">
        <p style={{ margin: 0 }}>
          &copy; {new Date().getFullYear()} Budget Tracker | A simple way to manage your finances
        </p>
      </div>
    </footer>
  );
};

export default Footer;

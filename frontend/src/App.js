import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// App Components
import Dashboard from './components/dashboard/Dashboard';
import BudgetForm from './components/budget/BudgetForm';
import TransactionList from './components/transactions/TransactionList';
import TransactionForm from './components/transactions/TransactionForm';

// Private Route Component
import PrivateRoute from './utils/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/budget" element={
                <PrivateRoute>
                  <BudgetForm />
                </PrivateRoute>
              } />
              <Route path="/transactions" element={
                <PrivateRoute>
                  <TransactionList />
                </PrivateRoute>
              } />
              <Route path="/transactions/add" element={
                <PrivateRoute>
                  <TransactionForm />
                </PrivateRoute>
              } />
              <Route path="/transactions/edit/:id" element={
                <PrivateRoute>
                  <TransactionForm />
                </PrivateRoute>
              } />
              
              {/* Redirect to dashboard if logged in, otherwise to login */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

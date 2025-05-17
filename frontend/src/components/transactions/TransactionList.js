import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, income, expense
  const [currentMonth, setCurrentMonth] = useState('');
  const [monthlyData, setMonthlyData] = useState({
    income: 0,
    expenses: 0
  });
  
  useEffect(() => {
    // Set current month in YYYY-MM format for the month picker
    const now = new Date();
    const month = now.getMonth() + 1; // Add 1 as getMonth() returns 0-11
    const year = now.getFullYear();
    setCurrentMonth(`${year}-${month.toString().padStart(2, '0')}`);
    
    fetchTransactions();
  }, []);

  const fetchTransactions = async (type = null) => {
    setLoading(true);
    setError('');
    
    try {
      // Build query params for filter
      const queryParams = new URLSearchParams();
      if (type) {
        queryParams.append('type', type);
      }
      
      const response = await api.get(`/api/transactions/?${queryParams}`);
      setTransactions(response.data);
      
      // Calculate totals for income and expenses
      const income = response.data
        .filter(t => t.transaction_type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
      const expenses = response.data
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
      setMonthlyData({
        income,
        expenses
      });
      
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMonthlyTransactions = async (yearMonth) => {
    setLoading(true);
    setError('');
    
    try {
      // Parse year and month from YYYY-MM format
      const [year, month] = yearMonth.split('-').map(Number);
      
      // Get all transactions for the selected month
      const response = await api.get(`/api/transactions/monthly/${year}/${month}/`);
      setTransactions(response.data);
      
      // Calculate totals for income and expenses
      const income = response.data
        .filter(t => t.transaction_type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
      const expenses = response.data
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
      setMonthlyData({
        income,
        expenses
      });
      
      // Apply active tab filter to the fetched data
      if (activeTab !== 'all') {
        const filtered = response.data.filter(t => t.transaction_type === activeTab);
        setTransactions(filtered);
      }
      
    } catch (err) {
      console.error("Error fetching monthly transactions:", err);
      setError('Failed to load transactions for the selected month. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    if (tab === 'all') {
      fetchMonthlyTransactions(currentMonth); // Fetch all transactions for current month
    } else {
      // Filter by transaction type
      const type = tab; // 'income' or 'expense'
      const [year, month] = currentMonth.split('-').map(Number);
      
      api.get(`/api/transactions/monthly/${year}/${month}/`)
        .then(response => {
          const filtered = response.data.filter(t => t.transaction_type === type);
          setTransactions(filtered);
        })
        .catch(err => {
          console.error("Error fetching filtered transactions:", err);
          setError('Failed to filter transactions. Please try again.');
        });
    }
  };
  
  const handleMonthChange = (e) => {
    const selectedMonth = e.target.value;
    setCurrentMonth(selectedMonth);
    fetchMonthlyTransactions(selectedMonth);
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    
    try {
      await api.delete(`/api/transactions/${id}/`);
      
      // Update the transaction list
      setTransactions(transactions.filter(transaction => transaction.id !== id));
      
      // Recalculate totals
      const updatedTransactions = transactions.filter(transaction => transaction.id !== id);
      const income = updatedTransactions
        .filter(t => t.transaction_type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
      const expenses = updatedTransactions
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
      setMonthlyData({
        income,
        expenses
      });
      
    } catch (err) {
      console.error("Error deleting transaction:", err);
      setError('Failed to delete transaction. Please try again.');
    }
  };
  
  if (loading && transactions.length === 0) {
    return (
      <div className="text-center mt-5">
        <i className="fas fa-spinner fa-spin fa-2x"></i>
        <p className="mt-3">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card-header">
        <h1>Transactions</h1>
        <Link to="/transactions/add" className="btn btn-primary btn-sm">
          <i className="fas fa-plus mr-1"></i> Add Transaction
        </Link>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <div className="card">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="form-group mb-0">
            <label htmlFor="month-select" className="form-label">Select Month</label>
            <input
              type="month"
              id="month-select"
              className="form-control"
              value={currentMonth}
              onChange={handleMonthChange}
            />
          </div>
          
          <div className="stats-container" style={{ margin: 0 }}>
            <div className="stat-card">
              <div className="stat-card-title">Income</div>
              <div className="stat-card-value text-success">
                ${monthlyData.income.toFixed(2)}
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-title">Expenses</div>
              <div className="stat-card-value text-danger">
                ${monthlyData.expenses.toFixed(2)}
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-title">Net</div>
              <div className={`stat-card-value ${(monthlyData.income - monthlyData.expenses) >= 0 ? 'text-success' : 'text-danger'}`}>
                ${(monthlyData.income - monthlyData.expenses).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      
        <div className="tab-container">
          <div className="tab-buttons">
            <button
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => handleTabChange('all')}
            >
              All Transactions
            </button>
            <button
              className={`tab-button ${activeTab === 'income' ? 'active' : ''}`}
              onClick={() => handleTabChange('income')}
            >
              Income
            </button>
            <button
              className={`tab-button ${activeTab === 'expense' ? 'active' : ''}`}
              onClick={() => handleTabChange('expense')}
            >
              Expenses
            </button>
          </div>
          
          {transactions.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-receipt"></i>
              <p>No transactions found for this time period</p>
              <Link to="/transactions/add" className="btn btn-primary mt-3">
                Add Transaction
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>{transaction.description}</td>
                      <td className={transaction.transaction_type === 'income' ? 'text-success' : 'text-danger'}>
                        ${parseFloat(transaction.amount).toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge ${transaction.transaction_type === 'income' ? 'bg-success' : 'bg-danger'}`} style={{ padding: '0.35em 0.65em', fontSize: '0.75em', fontWeight: 700, color: 'white', borderRadius: '0.25rem' }}>
                          {transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/transactions/edit/${transaction.id}`}
                          className="icon-button edit mr-2"
                          title="Edit Transaction"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button
                          className="icon-button delete"
                          onClick={() => handleDelete(transaction.id)}
                          title="Delete Transaction"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionList;

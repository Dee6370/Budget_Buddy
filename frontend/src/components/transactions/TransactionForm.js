import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';

const TransactionForm = () => {
  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    description: '',
    transaction_type: 'expense'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { id } = useParams(); // Get transaction ID from URL if editing
  
  useEffect(() => {
    // Set default date to today if creating a new transaction
    if (!id) {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        date: today
      }));
    }
    
    // Fetch transaction data if editing
    if (id) {
      const fetchTransaction = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/api/transactions/${id}/`);
          
          // Format the date to YYYY-MM-DD for input field
          const formattedDate = response.data.date.split('T')[0];
          
          setFormData({
            date: formattedDate,
            amount: response.data.amount,
            description: response.data.description,
            transaction_type: response.data.transaction_type
          });
          
          setLoading(false);
        } catch (err) {
          console.error("Error fetching transaction:", err);
          setError('Failed to load transaction data. Please try again.');
          setLoading(false);
        }
      };
      
      fetchTransaction();
    }
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Format amount to ensure it's a valid decimal
      const formattedData = {
        ...formData,
        amount: parseFloat(formData.amount).toFixed(2)
      };
      
      if (id) {
        // Update existing transaction
        await api.put(`/api/transactions/${id}/`, formattedData);
      } else {
        // Create new transaction
        await api.post('/api/transactions/', formattedData);
      }
      
      // Redirect to transaction list
      navigate('/transactions');
      
    } catch (err) {
      console.error("Error saving transaction:", err);
      setError(err.response?.data?.message || 'Failed to save transaction. Please check your inputs and try again.');
      setLoading(false);
    }
  };
  
  if (loading && id) {
    return (
      <div className="text-center mt-5">
        <i className="fas fa-spinner fa-spin fa-2x"></i>
        <p className="mt-3">Loading transaction data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card-header">
        <h1>{id ? 'Edit Transaction' : 'Add Transaction'}</h1>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/transactions')}>
          <i className="fas fa-arrow-left mr-1"></i> Back to Transactions
        </button>
      </div>
      
      <div className="card">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="date" className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="amount" className="form-label">Amount</label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-control"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <input
                  type="text"
                  className="form-control"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What was this transaction for?"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label d-block">Transaction Type</label>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="transaction_type"
                    id="type-expense"
                    value="expense"
                    checked={formData.transaction_type === 'expense'}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="type-expense">
                    Expense
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="transaction_type"
                    id="type-income"
                    value="income"
                    checked={formData.transaction_type === 'income'}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="type-income">
                    Income
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-1"></i>
                  {id ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-1"></i>
                  {id ? 'Update Transaction' : 'Add Transaction'}
                </>
              )}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary ml-2"
              onClick={() => navigate('/transactions')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;

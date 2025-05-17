import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const BudgetForm = () => {
  const [budgets, setBudgets] = useState([]);
  const [formData, setFormData] = useState({
    month_year: '',
    amount: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await api.get('/api/budgets/');
        setBudgets(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching budgets:", err);
        setError('Failed to load budget data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchBudgets();
  }, []);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    
    try {
      // Format amount to ensure it's a valid decimal
      const formattedData = {
        ...formData,
        amount: parseFloat(formData.amount).toFixed(2)
      };
      
      let response;
      
      if (editingId) {
        // Update existing budget
        response = await api.put(`/api/budgets/${editingId}/`, formattedData);
        setSuccess('Budget updated successfully!');
        
        // Update the budget in the state
        setBudgets(budgets.map(budget => 
          budget.id === editingId ? response.data : budget
        ));
      } else {
        // Create new budget
        response = await api.post('/api/budgets/', formattedData);
        setSuccess('Budget created successfully!');
        
        // Add the new budget to the state
        setBudgets([...budgets, response.data]);
      }
      
      // Reset form
      setFormData({
        month_year: '',
        amount: ''
      });
      setEditingId(null);
      
    } catch (err) {
      console.error("Error saving budget:", err);
      setError(err.response?.data?.message || 'Failed to save budget. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleEdit = (budget) => {
    setEditingId(budget.id);
    setFormData({
      month_year: budget.month_year,
      amount: budget.amount
    });
    
    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }
    
    try {
      await api.delete(`/api/budgets/${id}/`);
      setSuccess('Budget deleted successfully!');
      
      // Remove the budget from the state
      setBudgets(budgets.filter(budget => budget.id !== id));
    } catch (err) {
      console.error("Error deleting budget:", err);
      setError('Failed to delete budget. Please try again.');
    }
  };
  
  const handleCancel = () => {
    setFormData({
      month_year: '',
      amount: ''
    });
    setEditingId(null);
    setError('');
    setSuccess('');
  };
  
  if (loading) {
    return (
      <div className="text-center mt-5">
        <i className="fas fa-spinner fa-spin fa-2x"></i>
        <p className="mt-3">Loading budget data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card-header">
        <h1>{editingId ? 'Edit Budget' : 'Set Monthly Budget'}</h1>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left mr-1"></i> Back
        </button>
      </div>
      
      <div className="card">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success" role="alert">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="month_year" className="form-label">Month & Year</label>
                <input
                  type="month"
                  className="form-control"
                  id="month_year"
                  name="month_year"
                  value={formData.month_year}
                  onChange={handleChange}
                  required
                />
                <small className="text-muted">Select the month you want to budget for</small>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="amount" className="form-label">Budget Amount</label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
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
          </div>
          
          <div className="d-flex mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-1"></i>
                  {editingId ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-1"></i>
                  {editingId ? 'Update Budget' : 'Save Budget'}
                </>
              )}
            </button>
            
            {editingId && (
              <button
                type="button"
                className="btn btn-secondary ml-2"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="card mt-4">
        <h3>Your Budgets</h3>
        
        {budgets.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-wallet"></i>
            <p>No budgets yet. Set your first monthly budget above.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Month & Year</th>
                  <th>Budget Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map(budget => (
                  <tr key={budget.id}>
                    <td>{budget.month_year_display}</td>
                    <td>${parseFloat(budget.amount).toFixed(2)}</td>
                    <td>
                      <button
                        className="icon-button edit mr-2"
                        onClick={() => handleEdit(budget)}
                        title="Edit Budget"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="icon-button delete"
                        onClick={() => handleDelete(budget.id)}
                        title="Delete Budget"
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
  );
};

export default BudgetForm;

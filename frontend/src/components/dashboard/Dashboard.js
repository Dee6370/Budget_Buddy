import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Chart from 'chart.js/auto';
import api from '../../utils/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartInstance, setChartInstance] = useState(null);
  
  // Get the current month and year
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // JavaScript months are 0-11
  const currentYear = today.getFullYear();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get(`/api/dashboard/summary/?month=${currentMonth}&year=${currentYear}`);
        setDashboardData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentMonth, currentYear]);

  useEffect(() => {
    // Clean up chart instance on component unmount
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [chartInstance]);

  useEffect(() => {
    if (dashboardData && dashboardData.monthly_summary) {
      // Create chart if we have data
      const ctx = document.getElementById('monthlyChart');
      
      if (ctx) {
        // Destroy previous chart instance if it exists
        if (chartInstance) {
          chartInstance.destroy();
        }
        
        // Extract data for chart
        const labels = dashboardData.monthly_summary.map(item => item.month_name);
        const incomeData = dashboardData.monthly_summary.map(item => parseFloat(item.total_income));
        const expenseData = dashboardData.monthly_summary.map(item => parseFloat(item.total_expenses));
        
        // Create new chart
        const newChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Income',
                data: incomeData,
                backgroundColor: 'rgba(34, 197, 94, 0.6)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 1
              },
              {
                label: 'Expenses',
                data: expenseData,
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Amount'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Month'
                }
              }
            }
          }
        });
        
        setChartInstance(newChartInstance);
      }
    }
  }, [dashboardData]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <i className="fas fa-spinner fa-spin fa-2x"></i>
        <p className="mt-3">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-4" role="alert">
        {error}
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="empty-state">
        <i className="fas fa-chart-pie"></i>
        <h3>No dashboard data available</h3>
        <p>Start by adding your budget and transactions</p>
        <div className="mt-4">
          <Link to="/budget" className="btn btn-primary mr-3">
            Set Budget
          </Link>
          <Link to="/transactions/add" className="btn btn-secondary">
            Add Transaction
          </Link>
        </div>
      </div>
    );
  }

  const { current_month, recent_transactions } = dashboardData;
  
  // Calculate budget progress percentage
  let budgetProgressPercent = 0;
  let budgetStatus = 'success';
  
  if (current_month.budget_amount > 0) {
    budgetProgressPercent = Math.min(
      100, 
      Math.round((current_month.total_expenses / current_month.budget_amount) * 100)
    );
    
    if (budgetProgressPercent >= 90) {
      budgetStatus = 'danger';
    } else if (budgetProgressPercent >= 75) {
      budgetStatus = 'warning';
    }
  }

  return (
    <div>
      <div className="card-header">
        <h1>Dashboard</h1>
        <div>
          <Link to="/budget" className="btn btn-primary btn-sm mr-2">
            <i className="fas fa-plus mr-1"></i> Set Budget
          </Link>
          <Link to="/transactions/add" className="btn btn-secondary btn-sm">
            <i className="fas fa-plus mr-1"></i> Add Transaction
          </Link>
        </div>
      </div>

      <div className="card mb-4">
        <h3 className="mb-3">{current_month.month_name} Summary</h3>
        
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-card-title">Monthly Budget</div>
            <div className="stat-card-value">
              ${parseFloat(current_month.budget_amount).toFixed(2)}
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card-title">Total Income</div>
            <div className="stat-card-value text-success">
              ${parseFloat(current_month.total_income).toFixed(2)}
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card-title">Total Expenses</div>
            <div className="stat-card-value text-danger">
              ${parseFloat(current_month.total_expenses).toFixed(2)}
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card-title">Remaining Budget</div>
            <div className="stat-card-value">
              ${parseFloat(current_month.remaining_budget).toFixed(2)}
            </div>
          </div>
        </div>
        
        {current_month.budget_amount > 0 && (
          <div className="mt-4">
            <div className="d-flex justify-content-between mb-1">
              <span>Budget Usage</span>
              <span>{budgetProgressPercent}%</span>
            </div>
            <div className="budget-progress">
              <div 
                className={`budget-progress-bar ${budgetStatus}`} 
                style={{ width: `${budgetProgressPercent}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <h3 className="mb-3">Monthly Overview</h3>
            <div className="chart-container">
              <canvas id="monthlyChart"></canvas>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title">Recent Transactions</h3>
              <Link to="/transactions" className="btn btn-sm btn-light">
                View All
              </Link>
            </div>
            
            {recent_transactions && recent_transactions.length > 0 ? (
              <div>
                {recent_transactions.map(transaction => (
                  <div className="transaction-item" key={transaction.id}>
                    <div className="transaction-info">
                      <div className="transaction-description">
                        {transaction.description}
                      </div>
                      <div className="transaction-date">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div 
                      className={`transaction-amount ${
                        transaction.transaction_type === 'income' ? 'amount-income' : 'amount-expense'
                      }`}
                    >
                      {transaction.transaction_type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-receipt"></i>
                <p>No recent transactions</p>
                <Link to="/transactions/add" className="btn btn-sm btn-primary mt-2">
                  Add Transaction
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

"""
URL mappings for budget_app.
"""
from django.urls import path
from .views import (
    RegisterView, UserProfileView, BudgetListCreateView, BudgetDetailView,
    TransactionListCreateView, TransactionDetailView, 
    MonthlyTransactionListView, DashboardSummaryView
)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    
    # Budget endpoints
    path('budgets/', BudgetListCreateView.as_view(), name='budget-list-create'),
    path('budgets/<int:pk>/', BudgetDetailView.as_view(), name='budget-detail'),
    
    # Transaction endpoints
    path('transactions/', TransactionListCreateView.as_view(), name='transaction-list-create'),
    path('transactions/<int:pk>/', TransactionDetailView.as_view(), name='transaction-detail'),
    path('transactions/monthly/<int:year>/<int:month>/', MonthlyTransactionListView.as_view(), name='monthly-transactions'),
    
    # Dashboard summary
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
]

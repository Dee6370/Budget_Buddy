"""
Views for budget_app.
"""
from django.contrib.auth.models import User
from django.db.models import Sum, Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import datetime
import calendar
from .models import Budget, Transaction
from .serializers import (
    RegisterSerializer, UserSerializer, BudgetSerializer, 
    TransactionSerializer, MonthlyTransactionSummarySerializer
)

class RegisterView(generics.CreateAPIView):
    """
    API view for user registration.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API view for user profile.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class BudgetListCreateView(generics.ListCreateAPIView):
    """
    API view for listing and creating budgets.
    """
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)


class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view for retrieving, updating, and deleting a budget.
    """
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)


class TransactionListCreateView(generics.ListCreateAPIView):
    """
    API view for listing and creating transactions.
    """
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user)
        
        # Filter by transaction type if specified
        transaction_type = self.request.query_params.get('type')
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
            
        return queryset


class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view for retrieving, updating, and deleting a transaction.
    """
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


class MonthlyTransactionListView(generics.ListAPIView):
    """
    API view for listing transactions for a specific month.
    """
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        year = self.kwargs.get('year')
        month = self.kwargs.get('month')
        
        # Validate month and year
        if not (1 <= month <= 12) or not (1900 <= year <= 2100):
            return Transaction.objects.none()
            
        # Get the last day of the month
        _, last_day = calendar.monthrange(year, month)
        
        start_date = datetime(year, month, 1).date()
        end_date = datetime(year, month, last_day).date()
        
        return Transaction.objects.filter(
            user=self.request.user,
            date__gte=start_date,
            date__lte=end_date
        )


class DashboardSummaryView(APIView):
    """
    API view for dashboard summary data.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Get query parameters
        year = int(request.query_params.get('year', datetime.now().year))
        month = int(request.query_params.get('month', datetime.now().month))
        
        # Validate month and year
        if not (1 <= month <= 12) or not (1900 <= year <= 2100):
            return Response(
                {"error": "Invalid month or year"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the last day of the month
        _, last_day = calendar.monthrange(year, month)
        
        start_date = datetime(year, month, 1).date()
        end_date = datetime(year, month, last_day).date()
        
        # Get the budget for the month
        try:
            budget = Budget.objects.get(
                user=request.user,
                month_year__year=year,
                month_year__month=month
            )
            budget_amount = budget.amount
        except Budget.DoesNotExist:
            budget_amount = 0
        
        # Get transactions for the month
        transactions = Transaction.objects.filter(
            user=request.user,
            date__gte=start_date,
            date__lte=end_date
        )
        
        # Calculate totals
        total_income = transactions.filter(
            transaction_type='income'
        ).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        total_expenses = transactions.filter(
            transaction_type='expense'
        ).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        # Calculate remaining budget
        remaining_budget = float(budget_amount) - float(total_expenses)
        
        # Get recent transactions
        recent_transactions = TransactionSerializer(
            transactions.order_by('-date', '-created_at')[:5],
            many=True
        ).data
        
        # Get monthly summary for the last 6 months
        monthly_summary = []
        for i in range(6):
            # Calculate month and year
            summary_month = month - i
            summary_year = year
            
            while summary_month <= 0:
                summary_month += 12
                summary_year -= 1
                
            # Get date range for the month
            _, month_last_day = calendar.monthrange(summary_year, summary_month)
            month_start_date = datetime(summary_year, summary_month, 1).date()
            month_end_date = datetime(summary_year, summary_month, month_last_day).date()
            
            # Get transactions for the month
            month_transactions = Transaction.objects.filter(
                user=request.user,
                date__gte=month_start_date,
                date__lte=month_end_date
            )
            
            # Calculate totals
            month_income = month_transactions.filter(
                transaction_type='income'
            ).aggregate(
                total=Sum('amount')
            )['total'] or 0
            
            month_expenses = month_transactions.filter(
                transaction_type='expense'
            ).aggregate(
                total=Sum('amount')
            )['total'] or 0
            
            month_net = float(month_income) - float(month_expenses)
            
            monthly_summary.append({
                'month': summary_month,
                'year': summary_year,
                'month_name': month_start_date.strftime('%b'),
                'total_income': month_income,
                'total_expenses': month_expenses,
                'net': month_net
            })
        
        # Return the data
        return Response({
            'current_month': {
                'year': year,
                'month': month,
                'month_name': start_date.strftime('%B %Y'),
                'budget_amount': budget_amount,
                'total_income': total_income,
                'total_expenses': total_expenses,
                'remaining_budget': remaining_budget,
                'net': float(total_income) - float(total_expenses)
            },
            'recent_transactions': recent_transactions,
            'monthly_summary': monthly_summary
        })

"""
Admin site configuration for budget_app.
"""
from django.contrib import admin
from .models import Budget, Transaction

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('user', 'month_year', 'amount')
    search_fields = ('user__username', 'month_year')
    list_filter = ('month_year',)

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'amount', 'description', 'transaction_type')
    search_fields = ('user__username', 'description')
    list_filter = ('transaction_type', 'date')

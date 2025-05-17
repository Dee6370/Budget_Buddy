"""
Models for budget_app.
"""
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Budget(models.Model):
    """
    Represents a monthly budget for a user.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    month_year = models.DateField(help_text="Select any day in the month you want to budget for")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'month_year')
        ordering = ['-month_year']

    def __str__(self):
        return f"{self.user.username}'s budget for {self.month_year.strftime('%B %Y')}"

class Transaction(models.Model):
    """
    Represents a financial transaction (income or expense).
    """
    TRANSACTION_TYPES = (
        ('income', 'Income'),
        ('expense', 'Expense'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    date = models.DateField(default=timezone.now)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255)
    transaction_type = models.CharField(max_length=7, choices=TRANSACTION_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.user.username}'s {self.transaction_type}: {self.amount} for {self.description}"

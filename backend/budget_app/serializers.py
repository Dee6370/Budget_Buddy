"""
Serializers for budget_app models.
"""
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Budget, Transaction
import datetime

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model (read operations).
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for User registration.
    """
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class BudgetSerializer(serializers.ModelSerializer):
    """
    Serializer for Budget model.
    """
    month_year_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Budget
        fields = ('id', 'user', 'month_year', 'month_year_display', 'amount', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')
    
    def get_month_year_display(self, obj):
        return obj.month_year.strftime('%B %Y')

    def create(self, validated_data):
        # Set the day to 1 to standardize month representation
        month_year = validated_data.get('month_year')
        validated_data['month_year'] = datetime.date(month_year.year, month_year.month, 1)
        
        # Set the current user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for Transaction model.
    """
    class Meta:
        model = Transaction
        fields = ('id', 'user', 'date', 'amount', 'description', 'transaction_type', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class MonthlyTransactionSummarySerializer(serializers.Serializer):
    """
    Serializer for monthly transaction summary.
    """
    month = serializers.IntegerField()
    year = serializers.IntegerField()
    total_income = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=10, decimal_places=2)
    net = serializers.DecimalField(max_digits=10, decimal_places=2)

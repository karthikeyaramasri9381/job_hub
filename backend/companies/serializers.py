from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = (
            'id', 'name', 'logo', 'description', 'industry',
            'company_size', 'website', 'location', 'founded_year', 'created_at'
        )
        read_only_fields = ('id', 'created_at')

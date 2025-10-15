"""
API views for lanyuan project.
"""

from django.http import JsonResponse
from .services import payment_service


def dashboard(request):
    """
    获取仪表板数据
    """
    try:
        data = payment_service.get_dashboard_data()
        return JsonResponse({
            'success': True,
            'data': data
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
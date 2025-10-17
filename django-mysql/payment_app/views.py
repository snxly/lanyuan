"""
视图函数 - 提供Dashboard API接口
"""
import json
from datetime import datetime, timedelta
from django.http import JsonResponse
from django.db.models import Count, Sum, Max, Min
from django.utils import timezone
from .models import PaymentInfo, RoomInfo


def dashboard(request):
    """
    Dashboard API接口
    返回前端需要的所有统计数据
    """
    try:
        # 获取当前年份
        current_year = datetime.now().year

        # 目标缴费用户数（固定值）
        target_households = 607

        # 当前缴费总户数（当前年份已缴费的房间数）
        paid_rooms = PaymentInfo.objects.filter(
            payment_year=current_year
        ).values('room').distinct()
        total_households = paid_rooms.count()

        # 当前缴费总金额（万元）
        total_amount_result = PaymentInfo.objects.filter(
            payment_year=current_year
        ).aggregate(total_amount=Sum('payment_amount'))
        total_amount = total_amount_result['total_amount'] or 0
        total_amount_wan = round(total_amount / 10000, 2)  # 转换为万元

        # 当日缴费用户数
        today = timezone.now().date()
        daily_growth = PaymentInfo.objects.filter(
            payment_year=current_year,
            payment_time__date=today
        ).values('room').distinct().count()

        # 当日缴费用户占当前缴费总户数的比例
        daily_growth_percent = round(
            (daily_growth / total_households * 100) if total_households > 0 else 0, 1
        )

        # 当前缴费总户数占目标缴费用户数的比例
        progress_percent = round(
            (total_households / target_households * 100) if target_households > 0 else 0, 1
        )

        # 缴费最多/最少日的统计
        day_stats = _get_day_statistics(current_year)

        # 每日缴费趋势数据
        daily_data = _get_daily_data(current_year)

        # 最近缴费户数信息
        recent_payments = _get_recent_payments()

        # 最后更新时间（使用最新缴费记录的时间）
        last_payment = PaymentInfo.objects.filter(
            payment_year=current_year
        ).order_by('-payment_time').first()
        last_update = last_payment.payment_time if last_payment else timezone.now()

        response_data = {
            'success': True,
            'data': {
                'targetHouseholds': target_households,
                'totalHouseholds': total_households,
                'totalAmount': total_amount_wan,
                'dailyGrowth': daily_growth,
                'dailyGrowthPercent': f"{daily_growth_percent}%",
                'progressPercent': f"{progress_percent}%",
                'maxDay': day_stats['max_day'],
                'minDay': day_stats['min_day'],
                'dailyData': daily_data,
                'recentPayments': recent_payments,
                'lastUpdate': last_update.strftime('%Y-%m-%d %H:%M:%S'),
            }
        }

        return JsonResponse(response_data)

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


def _get_day_statistics(year: int) -> dict:
    """
    获取缴费最多和最少日的统计信息
    """
    # 按日期统计缴费户数
    daily_counts = PaymentInfo.objects.filter(
        payment_year=year
    ).extra({
        'payment_date': "DATE(payment_time)"
    }).values('payment_date').annotate(
        count=Count('room', distinct=True)
    ).order_by('-count')

    if not daily_counts:
        # 如果没有数据，返回默认值
        return {
            'max_day': {
                'date': '10-14',
                'count': 0,
                'formattedDate': '10.14'
            },
            'min_day': {
                'date': '01-03',
                'count': 0,
                'formattedDate': '01.03'
            }
        }

    max_day_data = daily_counts.first()
    min_day_data = daily_counts.last()

    def format_day_data(day_data):
        if not day_data:
            return {
                'date': '01-01',
                'count': 0,
                'formattedDate': '01.01'
            }

        date_obj = day_data['payment_date']
        return {
            'date': date_obj.strftime('%m-%d'),
            'count': day_data['count'],
            'formattedDate': date_obj.strftime('%m.%d')
        }

    return {
        'max_day': format_day_data(max_day_data),
        'min_day': format_day_data(min_day_data)
    }


def _get_daily_data(year: int) -> dict:
    """
    生成每日缴费趋势数据
    """
    # 生成日期范围：10-14 至 01-03
    dates = []
    daily_counts = []
    trend_counts = []

    # 创建日期范围（10月14日到次年1月3日）
    start_date = datetime(year, 10, 14).date()
    end_date = datetime(year + 1, 1, 3).date()

    current_date = start_date
    while current_date <= end_date:
        dates.append(current_date.strftime('%m-%d'))
        current_date += timedelta(days=1)

    # 获取每日缴费数据
    daily_payments = PaymentInfo.objects.filter(
        payment_year=year
    ).extra({
        'payment_date': "DATE(payment_time)"
    }).values('payment_date').annotate(
        daily_count=Count('room', distinct=True)
    ).order_by('payment_date')

    # 创建日期到计数的映射
    payment_map = {}
    for payment in daily_payments:
        date_key = payment['payment_date'].strftime('%m-%d')
        payment_map[date_key] = payment['daily_count']

    # 填充每日计数和累计计数
    cumulative_count = 0
    for date_str in dates:
        daily_count = payment_map.get(date_str, 0)
        cumulative_count += daily_count

        daily_counts.append(daily_count)
        trend_counts.append(cumulative_count)

    return {
        'dates': dates,
        'dailyCounts': [{
            'name': str(year),
            'data': daily_counts
        }],
        'trendCounts': [{
            'name': str(year),
            'data': trend_counts
        }]
    }


def _get_recent_payments() -> list:
    """
    获取最近缴费户数信息
    """
    recent_payments = PaymentInfo.objects.select_related('room').order_by('-payment_time')[:10]

    result = []
    for payment in recent_payments:
        result.append({
            'date': payment.payment_time.strftime('%Y-%m-%d %H:%M:%S'),
            'amount': float(payment.payment_amount) if payment.payment_amount else 0.0
        })

    return result
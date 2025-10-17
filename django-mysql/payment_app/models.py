from django.db import models


class CustomerInfo(models.Model):
    """客户信息表"""
    customer_name = models.CharField(max_length=100, verbose_name='客户名称')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'customer_info'
        verbose_name = '客户信息'
        verbose_name_plural = '客户信息'

    def __str__(self):
        return self.customer_name


class RoomInfo(models.Model):
    """房间信息表"""
    building_number = models.CharField(max_length=10, verbose_name='楼栋号')
    unit_number = models.CharField(max_length=10, verbose_name='单元号')
    room_number = models.CharField(max_length=10, verbose_name='房间号')
    floor_area = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        verbose_name='建筑面积'
    )
    customer = models.ForeignKey(
        CustomerInfo, on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name='客户信息'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'room_info'
        verbose_name = '房间信息'
        verbose_name_plural = '房间信息'
        unique_together = ['building_number', 'unit_number', 'room_number']
        indexes = [
            models.Index(fields=['building_number', 'unit_number', 'room_number']),
        ]

    def __str__(self):
        return f"{self.building_number}-{self.unit_number}-{self.room_number}"

    @property
    def full_room_number(self):
        """完整的房间号"""
        return f"{self.building_number}-{self.unit_number}-{self.room_number}"


class PaymentInfo(models.Model):
    """缴费信息表"""
    room = models.ForeignKey(
        RoomInfo, on_delete=models.CASCADE, verbose_name='房间信息'
    )
    payment_year = models.IntegerField(verbose_name='缴费年份')
    payment_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        verbose_name='缴费金额'
    )
    payment_order_number = models.CharField(
        max_length=50, null=True, blank=True, verbose_name='支付单号'
    )
    payment_time = models.DateTimeField(null=True, blank=True, verbose_name='支付时间')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'payment_info'
        verbose_name = '缴费信息'
        verbose_name_plural = '缴费信息'
        unique_together = ['room', 'payment_year']
        indexes = [
            models.Index(fields=['room']),
            models.Index(fields=['payment_year']),
            models.Index(fields=['payment_time']),
        ]

    def __str__(self):
        return f"{self.room} - {self.payment_year}"
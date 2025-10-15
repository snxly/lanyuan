#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将CSV数据转换为SQL插入语句
读取payment_info_2024.csv文件，生成房间信息和缴费信息的SQL插入语句
"""

import csv
import re
from datetime import datetime

def parse_room_number(room_number):
    """
    解析房间号，分解为楼栋号、单元号、房间号
    格式如："1-1-101" -> ("1", "1", "101")
    """
    parts = room_number.split('-')
    if len(parts) == 3:
        return parts[0], parts[1], parts[2]
    else:
        # 如果格式不标准，返回默认值
        return "1", "1", room_number

def process_csv_to_sql(csv_file_path):
    """
    处理CSV文件，生成SQL插入语句
    """
    room_values = []
    payment_values = []

    # 用于跟踪已处理的房间，避免重复
    processed_rooms = set()

    with open(csv_file_path, 'r') as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            room_number = row['房间号'].strip()
            building, unit, room = parse_room_number(room_number)

            # 处理房间信息
            room_key = "{}-{}-{}".format(building, unit, room)
            if room_key not in processed_rooms:
                floor_area = row['建筑面积'].strip() if row['建筑面积'].strip() else 'NULL'
                customer_name = row['客户名称'].strip() if row['客户名称'].strip() else 'NULL'

                # 构建房间信息值
                room_value = "('{}', '{}', '{}', {}, '{}')".format(building, unit, room, floor_area, customer_name)
                room_values.append(room_value)
                processed_rooms.add(room_key)

            # 处理缴费信息（只处理已缴费的记录）
            payment_status = row['缴费状态'].strip()
            if payment_status == '已缴费':
                payment_amount = row['缴费金额'].strip() if row['缴费金额'].strip() else 'NULL'
                payment_order_number = row['支付单号'].strip() if row['支付单号'].strip() else 'NULL'
                payment_time = row['支付时间'].strip() if row['支付时间'].strip() else 'NULL'

                # 从文件名获取年份
                payment_year = 2024  # 从文件名 payment_info_2024.csv 中提取

                # 构建缴费信息值
                payment_value = "((SELECT id FROM room_info WHERE building_number='{}' AND unit_number='{}' AND room_number='{}'), {}, {}, '{}', '{}')".format(building, unit, room, payment_year, payment_amount, payment_order_number, payment_time)
                payment_values.append(payment_value)

    return room_values, payment_values

def write_sql_to_file(room_values, payment_values, output_file='sql_inserts.sql'):
    """
    将SQL语句写入文件
    """
    with open(output_file, 'w') as f:
        # 批量插入房间信息
        if room_values:
            f.write("-- 房间信息批量插入语句\n")
            f.write("INSERT INTO room_info (building_number, unit_number, room_number, floor_area, customer_name) VALUES\n")
            f.write(",\n".join(room_values))
            f.write(";\n\n")

        # 批量插入缴费信息
        if payment_values:
            f.write("-- 缴费信息批量插入语句\n")
            f.write("INSERT INTO payment_info (room_id, payment_year, payment_amount, payment_order_number, payment_time) VALUES\n")
            f.write(",\n".join(payment_values))
            f.write(";\n")

def main():
    csv_file = 'payment_info_2024.csv'

    print("正在处理CSV文件: {}".format(csv_file))

    try:
        room_values, payment_values = process_csv_to_sql(csv_file)

        print("生成房间信息记录: {} 条".format(len(room_values)))
        print("生成缴费信息记录: {} 条".format(len(payment_values)))

        # 写入文件
        output_file = 'generated_sql_inserts.sql'
        write_sql_to_file(room_values, payment_values, output_file)

        print("SQL语句已写入文件: {}".format(output_file))

        # 显示一些统计信息
        print("\n统计信息:")
        print("- 总房间数: {}".format(len(room_values)))
        print("- 已缴费记录数: {}".format(len(payment_values)))
        print("- SQL语句数: 2 (批量插入)")

    except IOError:
        print("错误: 找不到文件 {}".format(csv_file))
    except Exception as e:
        print("处理过程中发生错误: {}".format(e))

if __name__ == "__main__":
    main()
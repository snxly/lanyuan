#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
找出两个缴费数据文件中缺少的支付单号
"""

import json
import csv

def extract_payment_nos_from_json(json_file_path):
    """从JSON文件中提取所有支付单号"""
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    payment_nos = []
    for item in data['data']['showData']:
        if 'payNo' in item and item['payNo']:
            payment_nos.append(item['payNo'])

    return set(payment_nos)

def extract_payment_nos_from_csv(csv_file_path):
    """从CSV文件中提取所有支付单号"""
    payment_nos = []

    with open(csv_file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['支付单号'] and row['支付单号'].strip():
                payment_nos.append(row['支付单号'].strip())

    return set(payment_nos)

def find_missing_payment(json_file_path, csv_file_path):
    """找出两个文件中缺少的支付单号"""
    print("正在提取JSON文件中的支付单号...")
    json_payment_nos = extract_payment_nos_from_json(json_file_path)
    print(f"JSON文件中找到 {len(json_payment_nos)} 个支付单号")

    print("正在提取CSV文件中的支付单号...")
    csv_payment_nos = extract_payment_nos_from_csv(csv_file_path)
    print(f"CSV文件中找到 {len(csv_payment_nos)} 个支付单号")

    print("\n正在比较两个文件...")

    # 找出JSON中有但CSV中没有的支付单号
    missing_in_csv = json_payment_nos - csv_payment_nos

    # 找出CSV中有但JSON中没有的支付单号
    missing_in_json = csv_payment_nos - json_payment_nos

    print(f"\n结果:")
    print(f"JSON文件中有但CSV文件中没有的支付单号: {len(missing_in_csv)} 个")
    print(f"CSV文件中有但JSON文件中没有的支付单号: {len(missing_in_json)} 个")

    if missing_in_csv:
        print(f"\n缺少的支付单号 (在JSON中但不在CSV中):")
        for pay_no in sorted(missing_in_csv):
            print(f"  {pay_no}")

    if missing_in_json:
        print(f"\n多余的支付单号 (在CSV中但不在JSON中):")
        for pay_no in sorted(missing_in_json):
            print(f"  {pay_no}")

    return missing_in_csv, missing_in_json

def main():
    json_file = "lanyuan-2024.json"
    csv_file = "payment_info_2024.csv"

    print("开始比较缴费数据文件...")
    print(f"JSON文件: {json_file}")
    print(f"CSV文件: {csv_file}")
    print("-" * 50)

    try:
        missing_in_csv, missing_in_json = find_missing_payment(json_file, csv_file)

        if not missing_in_csv and not missing_in_json:
            print("\n✅ 两个文件的支付单号完全匹配！")
        else:
            print(f"\n📊 总结:")
            print(f"   - JSON文件支付单号总数: {len(extract_payment_nos_from_json(json_file))}")
            print(f"   - CSV文件支付单号总数: {len(extract_payment_nos_from_csv(csv_file))}")
            print(f"   - 缺少的支付单号数量: {len(missing_in_csv)}")
            print(f"   - 多余的支付单号数量: {len(missing_in_json)}")

    except FileNotFoundError as e:
        print(f"❌ 文件未找到: {e}")
    except Exception as e:
        print(f"❌ 发生错误: {e}")

if __name__ == "__main__":
    main()
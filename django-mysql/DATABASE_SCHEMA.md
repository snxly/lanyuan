# 数据库表结构

## 📊 表结构总览

项目包含3个核心表，按照PRD需求实现了客户信息分离：

### 1. customer_info (客户信息表)
```sql
CREATE TABLE "customer_info" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customer_name" varchar(100) NOT NULL,
    "created_at" datetime NOT NULL,
    "updated_at" datetime NOT NULL
);
```

**字段说明：**
- `id`: 主键，自增ID
- `customer_name`: 客户名称（敏感信息单独存储）
- `created_at`: 创建时间
- `updated_at`: 更新时间

### 2. room_info (房间信息表)
```sql
CREATE TABLE "room_info" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "building_number" varchar(10) NOT NULL,
    "unit_number" varchar(10) NOT NULL,
    "room_number" varchar(10) NOT NULL,
    "floor_area" decimal NULL,
    "created_at" datetime NOT NULL,
    "updated_at" datetime NOT NULL,
    "customer_id" bigint NULL REFERENCES "customer_info" ("id") DEFERRABLE INITIALLY DEFERRED
);
```

**字段说明：**
- `id`: 主键，自增ID
- `building_number`: 楼栋号
- `unit_number`: 单元号
- `room_number`: 房间号
- `floor_area`: 建筑面积
- `customer_id`: 外键，关联客户信息表
- `created_at`: 创建时间
- `updated_at`: 更新时间

### 3. payment_info (缴费信息表)
```sql
CREATE TABLE "payment_info" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "payment_year" integer NOT NULL,
    "payment_amount" decimal NULL,
    "payment_order_number" varchar(50) NULL,
    "payment_time" datetime NULL,
    "created_at" datetime NOT NULL,
    "updated_at" datetime NOT NULL,
    "room_id" bigint NOT NULL REFERENCES "room_info" ("id") DEFERRABLE INITIALLY DEFERRED
);
```

**字段说明：**
- `id`: 主键，自增ID
- `payment_year`: 缴费年份
- `payment_amount`: 缴费金额
- `payment_order_number`: 支付单号
- `payment_time`: 支付时间
- `room_id`: 外键，关联房间信息表
- `created_at`: 创建时间
- `updated_at`: 更新时间

## 🔑 索引和约束

### 唯一约束
```sql
-- 房间信息唯一约束
CREATE UNIQUE INDEX "room_info_building_number_unit_number_room_number_2599be82_uniq"
ON "room_info" ("building_number", "unit_number", "room_number");

-- 缴费信息唯一约束（同一房间同一年份只能有一条记录）
CREATE UNIQUE INDEX "payment_info_room_id_payment_year_cb238bb8_uniq"
ON "payment_info" ("room_id", "payment_year");
```

### 索引
```sql
-- 房间信息索引
CREATE INDEX "room_info_buildin_8ef70a_idx" ON "room_info" ("building_number", "unit_number", "room_number");
CREATE INDEX "room_info_customer_id_94f5987f" ON "room_info" ("customer_id");

-- 缴费信息索引
CREATE INDEX "payment_inf_room_id_418a6d_idx" ON "payment_info" ("room_id");
CREATE INDEX "payment_inf_payment_52afeb_idx" ON "payment_info" ("payment_year");
CREATE INDEX "payment_inf_payment_43a230_idx" ON "payment_info" ("payment_time");
CREATE INDEX "payment_info_room_id_df71ec77" ON "payment_info" ("room_id");
```

## 🔗 表关系

```
customer_info (1) ←→ (0..N) room_info (1) ←→ (0..N) payment_info
```

- **customer_info** 与 **room_info**：一对多关系
- **room_info** 与 **payment_info**：一对多关系

## 🎯 设计特点

1. **数据安全**：客户名称单独存储在customer_info表中
2. **数据完整性**：通过外键约束确保数据一致性
3. **查询性能**：为常用查询字段创建索引
4. **业务逻辑**：同一房间同一年份只能有一条缴费记录
5. **可扩展性**：客户信息表预留了扩展字段的空间

## 📋 符合PRD需求

- ✅ 客户名称从room_info表分离到customer_info表
- ✅ 提供对应的SQL迁移脚本
- ✅ 支持前端Dashboard API所需的所有数据字段
- ✅ 满足定时任务的数据存储需求
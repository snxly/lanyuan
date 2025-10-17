-- 数据库结构更新脚本
-- 将客户名称从room_info表分离到customer_info表

-- 1. 创建客户信息表
CREATE TABLE IF NOT EXISTS customer_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL COMMENT '客户名称',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_name (customer_name)
) COMMENT='客户信息表';

-- 2. 修改room_info表结构
-- 首先检查表结构，如果customer_name字段存在则迁移数据
SET @has_customer_name = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'room_info'
    AND COLUMN_NAME = 'customer_name'
);

-- 如果存在customer_name字段，进行数据迁移
SET @migration_sql = IF(@has_customer_name > 0,
    '-- 迁移现有客户数据
    INSERT IGNORE INTO customer_info (customer_name)
    SELECT DISTINCT customer_name FROM room_info WHERE customer_name IS NOT NULL AND customer_name != "";

    -- 添加customer_id字段
    ALTER TABLE room_info ADD COLUMN customer_id INT NULL COMMENT "客户ID，关联customer_info表" AFTER customer_name;

    -- 更新customer_id
    UPDATE room_info r
    JOIN customer_info c ON r.customer_name = c.customer_name
    SET r.customer_id = c.id;

    -- 删除customer_name字段
    ALTER TABLE room_info DROP COLUMN customer_name;

    -- 添加外键约束
    ALTER TABLE room_info ADD FOREIGN KEY (customer_id) REFERENCES customer_info(id);

    -- 添加索引
    ALTER TABLE room_info ADD INDEX idx_customer_id (customer_id);',

    '-- customer_name字段不存在，直接添加customer_id字段
    ALTER TABLE room_info ADD COLUMN customer_id INT NULL COMMENT "客户ID，关联customer_info表";
    ALTER TABLE room_info ADD FOREIGN KEY (customer_id) REFERENCES customer_info(id);
    ALTER TABLE room_info ADD INDEX idx_customer_id (customer_id);'
);

-- 执行迁移SQL
PREPARE stmt FROM @migration_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. 确保其他表的外键约束正确
-- 检查payment_info表的外键约束
SET @has_payment_foreign_key = (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'payment_info'
    AND CONSTRAINT_NAME = 'payment_info_ibfk_1'
);

IF @has_payment_foreign_key = 0 THEN
    ALTER TABLE payment_info ADD FOREIGN KEY (room_id) REFERENCES room_info(id);
END IF;

-- 4. 创建必要的索引
CREATE INDEX IF NOT EXISTS idx_room_building_unit_room ON room_info(building_number, unit_number, room_number);
CREATE INDEX IF NOT EXISTS idx_payment_room_year ON payment_info(room_id, payment_year);
CREATE INDEX IF NOT EXISTS idx_payment_time ON payment_info(payment_time);

-- 完成消息
SELECT '数据库结构更新完成' AS message;
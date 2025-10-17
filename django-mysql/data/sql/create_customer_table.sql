-- 创建客户信息表
CREATE TABLE customer_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL COMMENT '客户名称',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_name (customer_name)
) COMMENT='客户信息表';

-- 修改room_info表，移除customer_name字段，添加customer_id外键
ALTER TABLE room_info
DROP COLUMN customer_name,
ADD COLUMN customer_id INT NULL COMMENT '客户ID，关联customer_info表',
ADD FOREIGN KEY (customer_id) REFERENCES customer_info(id),
ADD INDEX idx_customer_id (customer_id);

-- 迁移现有数据（如果有的话）
-- INSERT INTO customer_info (customer_name)
-- SELECT DISTINCT customer_name FROM room_info WHERE customer_name IS NOT NULL;
--
-- UPDATE room_info r
-- JOIN customer_info c ON r.customer_name = c.customer_name
-- SET r.customer_id = c.id;

-- 注意：实际迁移时请先备份数据，然后执行上述迁移步骤
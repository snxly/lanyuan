-- 创建缴费信息表
CREATE TABLE payment_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL COMMENT '房间ID，关联room_info表',
    payment_year INT NOT NULL COMMENT '缴费年份',
    payment_amount DECIMAL(10,2) COMMENT '缴费金额',
    payment_order_number VARCHAR(50) COMMENT '支付单号',
    payment_time DATETIME COMMENT '支付时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES room_info(id),
    INDEX idx_room_id (room_id),
    INDEX idx_payment_year (payment_year),
    INDEX idx_payment_time (payment_time),
    UNIQUE KEY uk_room_year (room_id, payment_year) COMMENT '同一房间同一年份只能有一条缴费记录'
) COMMENT='缴费信息表';
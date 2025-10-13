-- 创建房间信息表
CREATE TABLE room_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    building_number VARCHAR(10) NOT NULL COMMENT '楼栋号',
    unit_number VARCHAR(10) NOT NULL COMMENT '单元号',
    room_number VARCHAR(10) NOT NULL COMMENT '房间号',
    floor_area DECIMAL(10,2) COMMENT '建筑面积',
    customer_name VARCHAR(100) COMMENT '客户名称',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_building_unit_room (building_number, unit_number, room_number),
    INDEX idx_building_unit_room (building_number, unit_number, room_number)
) COMMENT='房间信息表';
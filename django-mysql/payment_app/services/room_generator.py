"""
房间号生成器
根据规则生成所有房间号
"""
import logging

logger = logging.getLogger(__name__)


class RoomNumberGenerator:
    """房间号生成器"""

    def __init__(self):
        self.building_configs = [
            # 情况1: 4层，1/2结尾是1单元，3/4结尾是2单元
            {
                'floors': 4,
                'units': [1, 2],
                'buildings': ['27', '28', '29', '30', '31', '32'],
                'rooms_per_unit': [1, 2, 3, 4]
            },
            # 情况2: 6层，1/2结尾是1单元，3/4结尾是2单元
            {
                'floors': 6,
                'units': [1, 2],
                'buildings': ['26'],
                'rooms_per_unit': [1, 2, 3, 4]
            },
            # 情况3: 7层，1/2结尾是1单元，3/4结尾是2单元
            {
                'floors': 7,
                'units': [1, 2],
                'buildings': ['20', '21', '22', '23', '24', '25'],
                'rooms_per_unit': [1, 2, 3, 4]
            },
            # 情况4: 11层，1/2结尾是1单元，3/4结尾是2单元（特殊处理4号楼）
            {
                'floors': 11,
                'units': [1, 2],
                'buildings': ['3'],
                'rooms_per_unit': [1, 2, 3, 4],
                'exclude_rooms': ['101', '102', '103', '201']
            },
            # 情况5: 18层，1/2结尾是1单元，3/4结尾是2单元
            {
                'floors': 18,
                'units': [1, 2],
                'buildings': ['1', '2', '8', '12', '13', '15', '18'],
                'rooms_per_unit': [1, 2, 3, 4]
            },
            # 情况6: 18层，都是1单元，有1/2/3/4四户
            {
                'floors': 18,
                'units': [1],
                'buildings': ['4', '5', '6', '7', '11', '14'],
                'rooms_per_unit': [1, 2, 3, 4]
            },
            # 情况7: 18层，都是1单元，只有1/2两户
            {
                'floors': 18,
                'units': [1],
                'buildings': ['9', '10', '16', '17'],
                'rooms_per_unit': [1, 2]
            },
            # 情况8: 18层，三个单元，1/2一单元，3/4二单元，5/6三单元
            {
                'floors': 18,
                'units': [1, 2, 3],
                'buildings': ['19'],
                'rooms_per_unit': [1, 2, 3, 4, 5, 6]
            }
        ]

    def generate_all_room_numbers(self):
        """
        生成所有房间号
        返回格式: ["楼栋号-单元号-房间号"]
        """
        all_rooms = []

        for config in self.building_configs:
            floors = config['floors']
            units = config['units']
            buildings = config['buildings']
            rooms_per_unit = config['rooms_per_unit']
            exclude_rooms = config.get('exclude_rooms', [])

            for building in buildings:
                for floor in range(1, floors + 1):
                    for unit in units:
                        for room in rooms_per_unit:
                            room_number = f"{floor:02d}{room:02d}"

                            # 检查是否在排除列表中
                            if room_number in exclude_rooms:
                                continue

                            full_room = f"{building}-{unit}-{room_number}"
                            all_rooms.append(full_room)

        # 按照 楼栋号-楼层号-房间号 排序，且楼层优先级高于单元优先级
        all_rooms.sort(key=lambda x: (
            int(x.split('-')[0]),  # 楼栋号
            int(x.split('-')[2][:2]),  # 楼层号
            int(x.split('-')[1]),  # 单元号
            int(x.split('-')[2][2:])  # 房间号
        ))

        logger.info(f"生成了 {len(all_rooms)} 个房间号")
        return all_rooms

    def get_room_count_by_building(self):
        """
        按楼栋统计房间数
        """
        room_numbers = self.generate_all_room_numbers()
        building_counts = {}

        for room in room_numbers:
            building = room.split('-')[0]
            building_counts[building] = building_counts.get(building, 0) + 1

        return building_counts
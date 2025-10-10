function generateAllRoomNumbers() {
    const configurations = [
      {
        buildings: [27, 28, 29, 30, 31, 32],
        floors: 4,
        unitRule: '1/2结尾是1单元,3/4结尾是2单元'
      },
      {
        buildings: [26],
        floors: 6,
        unitRule: '1/2结尾是1单元,3/4结尾是2单元'
      },
      {
        buildings: [20, 21, 22, 23, 24, 25],
        floors: 7,
        unitRule: '1/2结尾是1单元,3/4结尾是2单元'
      },
      {
        buildings: [3],
        floors: 11,
        unitRule: '1/2结尾是1单元,3/4结尾是2单元'
      },
      {
        buildings: [1, 2, 8, 12, 13, 15, 18],
        floors: 18,
        unitRule: '1/2结尾是1单元,3/4结尾是2单元'
      },
      {
        buildings: [4, 5, 6, 7, 11, 14],
        floors: 18,
        unitRule: '都是1单元,只有4户'
      },
      {
        buildings: [9, 10, 16, 17],
        floors: 18,
        unitRule: '都是1单元,只有 1/2 两户'
      },
      {
        buildings: [19],
        floors: 18,
        unitRule: '三个单元,1/2一单元,3/4二单元,5/6三单元'
      }
    ];
  
    const allRoomNumbers = [];
  
    // 需要排除的4号楼房间
    const excludedRoomsInBuilding4 = ['101', '102', '103', '201'];
  
    configurations.forEach(config => {
      config.buildings.forEach(building => {
        switch(config.unitRule) {
          case '1/2结尾是1单元,3/4结尾是2单元':
            // 每层有4户：101,102(1单元) 103,104(2单元)
            for (let floor = 1; floor <= config.floors; floor++) {
              // 1单元：房间号以1或2结尾
              allRoomNumbers.push(`${building}-1-${floor}01`);
              allRoomNumbers.push(`${building}-1-${floor}02`);
              // 2单元：房间号以3或4结尾
              allRoomNumbers.push(`${building}-2-${floor}03`);
              allRoomNumbers.push(`${building}-2-${floor}04`);
            }
            break;
  
          case '都是1单元,只有4户':
            // 每层只有4户：101,102,103,104(都在1单元)
            for (let floor = 1; floor <= config.floors; floor++) {
              for (let room = 1; room <= 4; room++) {
                const roomStr = room < 10 ? `0${room}` : `${room}`;
                const roomNumber = `${floor}${roomStr}`;
                
                // 如果是4号楼,检查是否需要排除
                if (building === 4 && excludedRoomsInBuilding4.includes(roomNumber)) {
                  continue; // 跳过这个房间
                }
                
                allRoomNumbers.push(`${building}-1-${roomNumber}`);
              }
            }
            break;
  
          case '都是1单元,只有 1/2 两户':
            // 每层只有2户：101,102(都在1单元)
            for (let floor = 1; floor <= config.floors; floor++) {
              allRoomNumbers.push(`${building}-1-${floor}01`);
              allRoomNumbers.push(`${building}-1-${floor}02`);
            }
            break;
  
          case '三个单元,1/2一单元,3/4二单元,5/6三单元':
            // 每层有6户,分三个单元
            for (let floor = 1; floor <= config.floors; floor++) {
              // 1单元：101,102
              allRoomNumbers.push(`${building}-1-${floor}01`);
              allRoomNumbers.push(`${building}-1-${floor}02`);
              // 2单元：103,104
              allRoomNumbers.push(`${building}-2-${floor}03`);
              allRoomNumbers.push(`${building}-2-${floor}04`);
              // 3单元：105,106
              allRoomNumbers.push(`${building}-3-${floor}05`);
              allRoomNumbers.push(`${building}-3-${floor}06`);
            }
            break;
        }
      });
    });
  
    // 按照楼栋号-楼层号-单元号-房间号排序
    return allRoomNumbers.sort((a, b) => {
      const [aBuilding, aUnit, aRoom] = a.split('-').map(part => parseInt(part));
      const [bBuilding, bUnit, bRoom] = b.split('-').map(part => parseInt(part));
      
      // 提取楼层号（房间号的前1-2位数字）
      const aFloor = parseInt(aRoom.toString().substring(0, aRoom.toString().length - 2));
      const bFloor = parseInt(bRoom.toString().substring(0, bRoom.toString().length - 2));
      
      // 先按楼栋号排序
      if (aBuilding !== bBuilding) {
        return aBuilding - bBuilding;
      }
      // 再按楼层号排序（优先级高于单元号）
      if (aFloor !== bFloor) {
        return aFloor - bFloor;
      }
      // 然后按单元号排序
      if (aUnit !== bUnit) {
        return aUnit - bUnit;
      }
      // 最后按房间号排序
      return aRoom - bRoom;
    });
  }
  
  // 生成所有房间号
  const allRoomNumbers = generateAllRoomNumbers();
  
  // 输出结果
//   console.log('总房间号数量:', allRoomNumbers.length);
//   allRoomNumbers.forEach(room => console.log(room));
  
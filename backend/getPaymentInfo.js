const fs = require('fs');
const https = require('https');
const axios = require('axios');
const constants = require('constants')

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

async function getPaymentInfo(roomNumber, retryCount = 3) {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
        try {
            const agent = new https.Agent({
              rejectUnauthorized: false,
              secureOptions: constants.SSL_OP_LEGACY_SERVER_CONNECT
            });
            const response = await axios.post(
              'https://open.lsbankchina.com/jfpt/ent/app/api/app/control/getFixedCosts',
              {
                "merchantNo": "803231049005071",
                "themeId": "bafc86455f0acf87ce34ccde4bee7dbc",
                "fanghao": roomNumber,
                "code": "",
                "uuid": ""
              },
              {
                headers: {
                  'Accept': 'application/json',
                  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-US;q=0.7,ru;q=0.6,de;q=0.5,fr;q=0.4,es;q=0.3',
                  'Authorization': '',
                  'Connection': 'keep-alive',
                  'Origin': 'https://open.lsbankchina.com',
                  'Referer': 'https://open.lsbankchina.com/jfpt/ent/app/',
                  'Sec-Fetch-Dest': 'empty',
                  'Sec-Fetch-Mode': 'cors',
                  'Sec-Fetch-Site': 'same-origin',
                  'User-Agent': 'Mozilla/5.0 (Linux; U; Android 4.1.2; zh-cn; GT-I9300 Build/JZO54K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 MicroMessenger/5.2.380',
                  'b': '1',
                  'content-type': 'application/json;charset=UTF-8',
                  'sec-ch-ua': '""',
                  'sec-ch-ua-mobile': '?1',
                  'sec-ch-ua-platform': '""'
                },
                httpsAgent: agent,
                timeout: 10000
              }
            );
            return response.data;
        } catch (error) {
            if (attempt === retryCount) {
                console.error(`获取房间 ${roomNumber} 缴费信息失败(第${attempt}次重试):`, error.message);
                return null;
            } else {
                console.warn(`获取房间 ${roomNumber} 缴费信息失败(第${attempt}次重试):`, error.message);
                // 重试前等待一段时间
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
}

function extractPaymentData(result, roomNumber) {
    if (!result || result.code !== 200) {
        console.error('请求失败', result)
        return {
            roomNumber: roomNumber,
            type: 'error',
            buildingArea: '',
            customerName: '',
            paymentAmount: '',
            paymentStatus: '请求失败'
        };
    }

    const data = result.data;

    if (data.type === '1') {
        // 已缴费
        const payment = data.showData[0];
        return {
            roomNumber: roomNumber,
            type: data.type,
            buildingArea: '',
            customerName: '',
            paymentAmount: payment.payAmt || '',
            paymentStatus: '已缴费',
            paymentNo: payment.payNo || '',
            paymentTime: payment.patTime || ''
        };
    } else if (data.type === '0') {
        // 未缴费
        let buildingArea = '';
        let customerName = '';

        // 从showData中提取建筑面积和客户名称
        if (data.showData && Array.isArray(data.showData)) {
            data.showData.forEach(item => {
                if (item.key === 'jjmj') {
                    buildingArea = item.jjmj || '';
                } else if (item.key === 'username') {
                    customerName = item.username || '';
                }
            });
        }

        return {
            roomNumber: roomNumber,
            type: data.type,
            buildingArea: buildingArea,
            customerName: customerName,
            paymentAmount: data.qunuanfei || '',
            paymentStatus: '未缴费'
        };
    } else {
        return {
            roomNumber: roomNumber,
            type: data.type || 'unknown',
            buildingArea: '',
            customerName: '',
            paymentAmount: '',
            paymentStatus: '未知状态'
        };
    }
}

async function main() {
    const allRoomNumbers = generateAllRoomNumbers();
    console.log(`总房间号数量: ${allRoomNumbers.length}`);

    const results = [];
    const batchSize = 50;

    // 初始化CSV文件，写入表头
    const csvHeader = '房间号,缴费状态,建筑面积,客户名称,缴费金额,支付单号,支付时间\n';
    fs.writeFileSync('payment_info.csv', csvHeader, 'utf8');

    for (let i = 0; i < allRoomNumbers.length; i++) {
        const roomNumber = allRoomNumbers[i];
        console.log(`正在处理 ${i + 1}/${allRoomNumbers.length}: ${roomNumber}`);

        const result = await getPaymentInfo(roomNumber);
        const paymentData = extractPaymentData(result, roomNumber);
        results.push(paymentData);

        // 每处理batchSize个房间，保存一次数据到CSV文件
        if ((i + 1) % batchSize === 0 || i === allRoomNumbers.length - 1) {
            const batchResults = results.slice(-batchSize);
            const csvContent = batchResults.map(item => {
                return `"${item.roomNumber}","${item.paymentStatus}","${item.buildingArea}","${item.customerName}","${item.paymentAmount}","${item.paymentNo || ''}","${item.paymentTime || ''}"`;
            }).join('\n') + '\n';

            fs.appendFileSync('payment_info.csv', csvContent, 'utf8');
            console.log(`已保存第 ${Math.floor(i / batchSize) + 1} 批数据到CSV文件 (${batchResults.length} 条记录)`);
        }

        // 添加延时，缓解服务器压力
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log('所有缴费信息已保存到 payment_info.csv');

    // 统计信息
    const paidCount = results.filter(item => item.type === '1').length;
    const unpaidCount = results.filter(item => item.type === '0').length;
    const errorCount = results.filter(item => item.type === 'error').length;

    console.log(`\n统计信息:`);
    console.log(`已缴费: ${paidCount}`);
    console.log(`未缴费: ${unpaidCount}`);
    console.log(`请求失败: ${errorCount}`);
}

// 运行主程序
main().catch(console.error);
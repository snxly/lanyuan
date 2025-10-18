const express = require('express');
const cron = require('node-cron');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
// 改成true时，删除todo
const returnBoth = false;

// 中间件
app.use(cors());
app.use(express.json());

// 存储数据
let paymentData = {
  targetHouseholds: 0,
  totalHouseholds: 0,
  totalAmount: 0,
  dailyGrowth: 0,
  maxDay: { date: '', count: 0 },
  minDay: { date: '', count: 0 },
  trendData: [],
  dailyData: [],
  recentPayments: [],
  lastUpdate: null
};

function generateDatesFromOct14(isNewData = false) {
  const dates = [];
  const start = new Date(2024, 9, 14); // 2024年10月14日
  var end = new Date(2025, 0, 3);    // 2025年1月3日
  if (isNewData) {
    // 截止到当天
    end = new Date();
  }
  
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dates.push(`${month}-${day}`);
  }
  
  return dates;
}

// 获取源数据的函数
async function fetchPaymentData() {
  try {
    const https = require('https');
    const agent = new https.Agent({
      rejectUnauthorized: false,
      secureOptions: require('constants').SSL_OP_LEGACY_SERVER_CONNECT
    });

    const response = await axios.post(
      'https://open.lsbankchina.com/jfpt/ent/app/api/app/control/getFixedCosts',
      {
        merchantNo: "803231049005071",
        themeId: "bafc86455f0acf87ce34ccde4bee7dbc",
        code: "",
        uuid: ""
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

    return response.data.data.showData || [];
  } catch (error) {
    console.error('获取数据失败:', error.message);
    console.error('错误详情:', error.response?.data || error.code);
    return [];
  }
}

function formatDateToUTC8(date = new Date()) {
  return date.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-');
}

// 处理数据函数
function processData(rawData, isNewData = false) {
  if (!rawData || rawData.length === 0) {
    return paymentData;
  }

  // todo: 只是测试用，上线需删除
  if (isNewData) {
    // 获取去年的今天
    const today = new Date();
    const lastYearToday = new Date(today);
    lastYearToday.setFullYear(today.getFullYear() - 1);

    rawData = rawData.filter(data => new Date(data.patTime) <= lastYearToday)
  }

  // 按日期分组
  var paymentsByDate = {};
  const paymentAmounts = [];

  // 排序
  sortedRawData = rawData
    .sort((a, b) => new Date(a.patTime) - new Date(b.patTime))
  // console.log(sortedRawData)

  sortedRawData.forEach(payment => {
    const date = payment.patTime.split(' ')[0].slice(5); // 获取日期部分
    if (!paymentsByDate[date]) {
      paymentsByDate[date] = {
        count: 0,
        amount: 0
      };
    }
    paymentsByDate[date].count++;
    paymentsByDate[date].amount += parseFloat(payment.payAmt);

    paymentAmounts.push({
      // 2024-12-02 10:58:34.0 -> 2024-12-02 10:58:34 
      date: payment.patTime.replace(/\.0$/, ''),
      amount: parseFloat(payment.payAmt)
    });
  });

  // 计算统计数据
  const dates = Object.keys(paymentsByDate).sort();
  const totalHouseholds = sortedRawData.length;
  const totalAmount = Math.floor(sortedRawData.reduce((sum, payment) => sum + parseFloat(payment.payAmt), 0) / 10000);

  // 计算当日增长
  let dailyGrowth = 0;
  if (isNewData) {
    const lastDay = dates[dates.length - 1];
    dailyGrowth = paymentsByDate[lastDay].count;
  }

  // 找到缴费最多和最少的一天
  let maxDay = { date: '', count: 0 };
  let minDay = { date: '', count: Infinity };

  Object.entries(paymentsByDate).forEach(([date, data]) => {
    if (data.count >= maxDay.count) {
      maxDay = { date, count: data.count };
    }
    if (data.count <= minDay.count) {
      minDay = { date, count: data.count };
    }
  });

  // 生成每日数据
  const allDates = generateDatesFromOct14(isNewData)
  dailyCounts = []
  trendCounts = []
  const dailyData = {
    dates: [],
    dailyCounts,
    trendCounts,
  };

  var trendCount = 0;
  allDates.forEach(date => {
    dailyCount = paymentsByDate[date]?.count || 0
    trendCount += dailyCount
    dailyData.dates.push(date);
    dailyCounts.push(dailyCount)
    trendCounts.push(trendCount)
  });

  // 最近缴费记录
  const recentPayments = paymentAmounts
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  // 计算进度百分比
  const targetHouseholds = 607
  const progressPercent = Math.min((totalHouseholds / targetHouseholds) * 100, 100).toFixed(1);

  // 计算日增长百分比
  const dailyGrowthPercent = ((dailyGrowth / totalHouseholds) * 100).toFixed(1);

  // 格式化日期
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}.${day}`;
  };

  return {
    targetHouseholds,
    totalHouseholds,
    totalAmount,
    dailyGrowth,
    maxDay: {
      ...maxDay,
      formattedDate: formatDate(maxDay.date)
    },
    minDay: {
      ...minDay,
      formattedDate: formatDate(minDay.date)
    },
    dailyData,
    recentPayments,
    progressPercent,
    dailyGrowthPercent,
    lastUpdate: formatDateToUTC8(),
  };
}

// 定时任务 - 每5分钟获取一次数据
cron.schedule('*/5 * * * *', async () => {
  console.log('开始获取数据...');
  if (returnBoth) {
    // get data_2025 if start
    const rawData = await fetchPaymentData()
    if (!rawData || rawData.length === 0) {
      return paymentData;
    }
    data_2025 = processData(rawData, true);
    paymentData = mergeData(data_2024, data_2025);
  } else {
    // 更新时间即可
    paymentData.lastUpdate = formatDateToUTC8();
  }
  console.log('完成定时任务, 数据更新完成');
});

// API接口 - 获取处理后的数据
app.get('/api/dashboard', (req, res) => {
  res.json({
    success: true,
    data: paymentData,
  });
});

// 从lanyuan-2024.json读取数据的函数
function read2024Data() {
  try {
    const filePath = path.join(__dirname, 'lanyuan-2024.json');
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(rawData);
      console.log('lanyuan-2024.json 读取成功');
      arr = jsonData.data.showData || []
      return arr;
    } else {
      console.error('lanyuan-2024.json 文件不存在');
      return [];
    }
  } catch (error) {
    console.error('读取lanyuan-2024.json文件失败:', error.message);
    return [];
  }
}

function mergeData(oldData, newData){
  return {
    ...newData,
    dailyData: {
      dates: generateDatesFromOct14(false),
      dailyCounts: [{
        name: '2024',
        data: oldData.dailyData.dailyCounts,
      }, {
        name: '2025',
        data: newData.dailyData.dailyCounts.slice(0, 5),
      }],
      trendCounts: [{
        name: '2024',
        data: oldData.dailyData.trendCounts,
      }, {
        name: '2025',
        data: newData.dailyData.trendCounts.slice(0, 5),
      }],
    }
  }
}

// 启动时立即获取一次数据
setTimeout(() => {
  //1. get data_2024
  data_2024 = processData(read2024Data(), false)
  if (returnBoth) {
    // get data_2025 if start
    fetchPaymentData().then(rawData => {
      data_2025 = processData(rawData, true);
      paymentData = mergeData(data_2024, data_2025)
    });
  } else {
    paymentData = {
      ...data_2024,
      dailyData: {
        dates: generateDatesFromOct14(false),
        dailyCounts: [{
          name: '2024',
          data: data_2024.dailyData.dailyCounts,
        }],
        trendCounts: [{
          name: '2024',
          data: data_2024.dailyData.trendCounts,
        }],
      }
    }
  }
  console.log('初始数据加载完成');
}, 1000);

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
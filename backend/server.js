const express = require('express');
const cron = require('node-cron');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

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

// 处理数据函数
function processData(rawData) {
  if (!rawData || rawData.length === 0) {
    return paymentData;
  }

  // 按日期分组
  const paymentsByDate = {};
  const paymentAmounts = [];

  rawData.forEach(payment => {
    const date = payment.patTime.split(' ')[0]; // 获取日期部分
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
  const totalHouseholds = rawData.length;
  const totalAmount = Math.floor(rawData.reduce((sum, payment) => sum + parseFloat(payment.payAmt), 0) / 10000);

  // 计算每日增长（最近一天与前一天的比较）
  let dailyGrowth = 0;
  if (dates.length >= 2) {
    const lastDay = dates[dates.length - 1];
    const prevDay = dates[dates.length - 2];
    dailyGrowth = paymentsByDate[lastDay].count - paymentsByDate[prevDay].count;
  }

  // 找到缴费最多和最少的一天
  let maxDay = { date: '', count: 0 };
  let minDay = { date: '', count: Infinity };

  Object.entries(paymentsByDate).forEach(([date, data]) => {
    if (data.count > maxDay.count) {
      maxDay = { date, count: data.count };
    }
    if (data.count < minDay.count) {
      minDay = { date, count: data.count };
    }
  });

  // 生成趋势数据（按月）
  const trendData = [];
  const monthlyData = {};

  rawData.forEach(payment => {
    const month = payment.patTime.substring(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = 0;
    }
    monthlyData[month]++;
  });

  Object.keys(monthlyData).sort().forEach(month => {
    trendData.push({
      month,
      count: monthlyData[month]
    });
  });

  // 生成每日数据（最近30天）
  const dailyData = [];
  const recentDates = dates.slice(-30);
  recentDates.forEach(date => {
    dailyData.push({
      date,
      count: paymentsByDate[date].count
    });
  });

  // 最近缴费记录
  const recentPayments = paymentAmounts
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  // 计算进度百分比
  const targetHouseholds = 606
  const progressPercent = Math.min((totalHouseholds / targetHouseholds) * 100, 100).toFixed(1);

  // 计算日增长百分比
  const dailyGrowthPercent = ((Math.abs(dailyGrowth) / totalHouseholds) * 100).toFixed(1);

  // 格式化日期
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
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
    trendData,
    dailyData,
    recentPayments,
    progressPercent,
    dailyGrowthPercent,
    lastUpdate: new Date().toISOString()
  };
}

// 定时任务 - 每5分钟获取一次数据
cron.schedule('*/5 * * * *', async () => {
  console.log('开始获取数据...');
  const rawData = await fetchPaymentData();
  paymentData = processData(rawData);
  console.log('数据更新完成，当前缴费户数:', paymentData.totalHouseholds);
});

// API接口 - 获取处理后的数据
app.get('/api/dashboard', (req, res) => {
  res.json({
    success: true,
    data: paymentData
  });
});

// 启动时立即获取一次数据
setTimeout(() => {
  fetchPaymentData().then(rawData => {
    paymentData = processData(rawData);
    console.log('初始数据加载完成');
  });
}, 1000);

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
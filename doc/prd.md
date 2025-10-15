根据原型图(./proto.html)，完成微信小程序的开发

除了实现原型图的前端代码，我们还需要一个后端
后端负责两件事情
1. 每5分钟获取一次源数据，并记录更新时间
1.1 获取源数据的请求是
```
curl 'https://open.lsbankchina.com/jfpt/ent/app/api/app/control/getFixedCosts' \
  -H 'Accept: application/json' \
  -H 'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8,en-US;q=0.7,ru;q=0.6,de;q=0.5,fr;q=0.4,es;q=0.3' \
  -H 'Authorization;' \
  -H 'Connection: keep-alive' \
  -H 'Origin: https://open.lsbankchina.com' \
  -H 'Referer: https://open.lsbankchina.com/jfpt/ent/app/' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'User-Agent: Mozilla/5.0 (Linux; U; Android 4.1.2; zh-cn; GT-I9300 Build/JZO54K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 MicroMessenger/5.2.380' \
  -H 'b: 1' \
  -H 'content-type: application/json;charset=UTF-8' \
  -H 'sec-ch-ua: ""' \
  -H 'sec-ch-ua-mobile: ?1' \
  -H 'sec-ch-ua-platform: ""' \
  --data-raw '{"merchantNo":"803231049005071","themeId":"bafc86455f0acf87ce34ccde4bee7dbc","code":"","uuid":""}'
```
1.2. 上面请求的返回结果是一个list，这是某小区燃气缴费的记录，大概解释如下
```{
  data: {
    showData: [
      {
        payAmt, # 付款金额，单位元
        payNo, # 付款id，我们可以忽略这个字段
        patTime, # 付款时间
      }
    ]
  }
}
```
2. 有一个为前端提供数据的接口。根据定时获取的结果，组合成前端需要的数据，并返回
3. 所有对数据的预处理都放在后端，前端不做数据处理，只负责展示
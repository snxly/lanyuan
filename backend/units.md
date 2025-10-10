# 获取房间号
## 总体情况
| 情况 | 楼层数 | 单元数 | 楼栋号 |
|------|--------|--------|--------|
| 1 | 4 | 1/2结尾是1单元，3/4结尾是2单元 | 27,28,29,30,31,32 |
| 2 | 6 | 1/2结尾是1单元，3/4结尾是2单元 | 26 |
| 3 | 7 | 1/2结尾是1单元，3/4结尾是2单元 | 20,21,22,23,24,25 |
| 4 | 11 | 1/2结尾是1单元，3/4结尾是2单元 | 3 |
| 5 | 18 | 1/2结尾是1单元，3/4结尾是2单元 | 1,2,8,12,13,15,18 |
| 6 | 18 | 都是1单元，有1/2/3/4四户 | 4,5,6,7,11,14 |
| 7 | 18 | 都是1单元，只有 1/2 两户 | 9,10,16,17 |
| 8 | 18 | 三个单元，1/2一单元，3/4二单元，5/6三单元 | 19 |
## 其他需求
1. 最后要生成一个所有房间号的列表，并且按照 楼栋号-楼层号-房间号 排序， 且楼层优先级高于单元优先级
2. 4号楼比较特殊，需要去掉 101,102,103,201 这四间

# 获取房间号对应的缴费信息
1. 使用接口 generateAllRoomNumbers 获取所有房间号信息
2. 针对每个房间号，发送如下请求，获取其缴费信息。
3. 从返回结果里获取 缴费状态（type），房间号，建筑面积，客户名称等信息，保存成csv格式文件
4. 一栋楼请求完了以后，保存一次文件
5. 每个请求中间增加适当延时，缓解服务器压力
## 请求API
```cmd
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
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36' \
  -H 'b: 1' \
  -H 'content-type: application/json;charset=UTF-8' \
  -H 'sec-ch-ua: "Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  --data-raw '{"merchantNo":"803231049005071","themeId":"bafc86455f0acf87ce34ccde4bee7dbc","fanghao":"3-1-302","code":"","uuid":""}'
```
其中 “fanghao” 字段填的就是我们刚生成的 房间号 的信息
返回结果有两种
1. 成功缴费
data.type = "1"
```json
{
    "code": 200,
    "data": {
        "showData": [
            {
                "payAmt": "2921.29",
                "payNo": "LSBKQYZF8030756000019489426680",
                "patTime": "2024-10-14 14:58:23.0"
            }
        ],
        "type": "1"
    },
    "message": "操作成功"
}
```
2. 没有缴费
data.type = "0"
```json
{
    "code": 200,
    "data": {
        "fanghao": "6-1-1403",
        "feeplanid": "bafc86455f0acf87ce34ccde4bee7dbc",
        "orderid": "1845696310053834752",
        "paystate": "0",
        "jjmj": "98.03",
        "chargecomp": "77",
        "billstate": "062a1c43efd078d9e4afbd7d252e269f",
        "qunuanfei": "2921.29",
        "upddate": "2024-10-14 13:21:14",
        "crtdate": "2024-10-14 13:21:14",
        "billid": "fb4c5e380dd443c7ad96f04e6f55c7a9",
        "crtuser": "1123",
        "upduser": "1123",
        "id": "0d35d7a8aace4a0fad5d60121ebc41ac",
        "username": "许宗奎/梁娟",
        "payType": "1",
        "isAmt": [
            {
                "qunuanfei": "2921.29",
                "key": "qunuanfei",
                "name": "取暖费"
            }
        ],
        "showData": [
            {
                "fanghao": "6-1-1403",
                "key": "fanghao",
                "name": "房号"
            },
            {
                "jjmj": "98.03",
                "key": "jjmj",
                "name": "建筑面积"
            },
            {
                "username": "许宗奎/梁娟",
                "key": "username",
                "name": "客户名称"
            }
        ],
        "type": "0"
    },
    "message": "操作成功"
}
```


```
请求失败 {
  success: false,
  code: 500,
  message: '暂未查询到账单信息,请确认查询信息!',
  data: null
}
```


# 查找csv里每栋楼的房间数
cat payment_info.csv | awk -F',' 'NR>1 {split($1, a, "-"); buildings[a[1]]++} END {for (b in buildings) print "楼栋 " b ":      " buildings[b] " 个房间"}' | sort -n -


# 版本
1. 顺序请求，50个更新一次，大概20+分钟完成一遍
2. 并行请求，时间压缩到 5分钟 以内


# 请求失败房间号
3-1-302
4-1-104
7-1-403
8-2-103
16-1-1801
16-1-1802
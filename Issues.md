# backend
1. 数据获取失败  
```
获取数据失败: write EPROTO C09D781B01000000:error:0A000152:SSL routines:final_renegotiate:unsafe legacy renegotiation disabled:../deps/openssl/openssl/ssl/statem/extensions.c:894:
```
2. image未找到  
```
[ app.json 文件内容错误] app.json: ["tabBar"]["list"][0]["iconPath"]: "images/chart-pie.png" 未找到
["tabBar"]["list"][0]["selectedIconPath"]: "images/chart-pie-active.png" 未找到
["tabBar"]["list"][1]["iconPath"]: "images/list.png" 未找到
["tabBar"]["list"][1]["selectedIconPath"]: "images/list-active.png" 未找到
["tabBar"]["list"][2]["iconPath"]: "images/user.png" 未找到
["tabBar"]["list"][2]["selectedIconPath"]: "images/user-active.png" 未找到(env: macOS,mp,1.06.2504030; lib: 3.10.2)
```
3. 
# How to run

```bash
npm install
npm start
```

# 模块说明

## 启动服务：吃鸡数据查询接口
Lifecycle scripts included in mypubgstat:
  start
    node ./bin/www

available via `npm run-script`:

## 去pubg.me抓数据
  pubg
    node ./pubg/pubg_dot_me.js
## 去dak.gg抓数据
  dak
    node ./pubg/dak_dot_gg.js
## 去pubgtracker.com抓数据（当前使用）
  tracker
    node ./bin/scrape_pubgtracker_dot_com.js

# 傳染病決策地圖 開放原始碼

## 系統說明
本系統為衛生福利部因應全國流行性傳染病，所建立的一套決策系統平台，旨在為了追蹤全國各處的疾病疫情、撲滅狀態、以及可能潛在的危險區域等資訊。

系統現有的疾病追蹤類別計有登革熱以及麻疹資訊，可利用的工具計有：

1. 地圖圖層及圖例工具，用以開關地圖上的資訊
2. 查詢功能：可查詢地理位置資訊，個案相關資訊等
3. 豐富的儀表板功能（提供全國疫情統計的摘要報表、追蹤個案、群聚事件、病媒防治以及醫療、風險等）
4. 資訊匯入及匯出：可匯入來自不同平台的開放資料進行圖面比對，提供更豐富的地理輔助決策資訊
5. 外部底圖切換：提供不同的視野，可透過通用版電子圖台/Google Maps/Open Street Map等底圖相互切換
6. 疾病別切換：隨時切換至不同的疾病視野，增加決策資訊的彈性

## Install
This system is built with node.js, there are three projects:
1. master: build for route to the map/map_core project
2. map: main map page are all written here
3. map_core: 3rd package installed here

We use pm2 to manage the system, install with:

    npm install pm2 -g

Enter the three folders, use command below to install package:

    npm install

Now we can enable all the server with command:

    pm2 start bin/www --name=<project_name>





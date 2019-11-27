# 傳染病決策地圖 開放原始碼

This system is built with node.js, there are three projects:
1. master: build for route to the map/map_core project
2. map: main map page are all written here
3. map_core: 3rd package installed here


## Install
we use pm2 to manage the system, install with:

    npm install pm2 -g

enter the three folders, use command below to install package:

    npm install

now we can enable all the server with command:

    pm2 start bin/www --name=<project_name>





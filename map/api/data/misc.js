// 計算布氏指數
function getBiLevel(point) {
    if (point < 1) return 0;
    else if (point < 5) return 1;
    else if (point < 10) return 2;
    else if (point < 20) return 3;
    else if (point < 35) return 4;
    else if (point < 50) return 5;
    else if (point < 75) return 6;
    else if (point < 100) return 7;
    else if (point < 200) return 8;
    else return 9;
}
// 計算住宅級數
function getHouseLevel(point) {
    if (point < 1) return 0;
    else if (point < 4) return 1;
    else if (point < 8) return 2;
    else if (point < 18) return 3;
    else if (point < 29) return 4;
    else if (point < 38) return 5;
    else if (point < 50) return 6;
    else if (point < 60) return 7;
    else if (point < 77) return 8;
    else return 9;
}
// 計算容器級數
function getContainerLevel(point) {
    if (point < 1) return 0;
    else if (point < 3) return 1;
    else if (point < 6) return 2;
    else if (point < 10) return 3;
    else if (point < 15) return 4;
    else if (point < 21) return 5;
    else if (point < 28) return 6;
    else if (point < 32) return 7;
    else if (point < 41) return 8;
    else return 9;
}
// 計算成蟲級數
function getWormLevel(point) {
    if (point < 1) return 0;
    else if (point < 4) return 1;
    else if (point < 11) return 2;
    else if (point < 31) return 3;
    else if (point < 101) return 4;
    else if (point < 301) return 5;
    else if (point < 1001) return 6;
    else if (point < 3001) return 7;
    else if (point < 10001) return 8;
    else return 9;
}

module.exports = { getBiLevel, getContainerLevel, getHouseLevel, getWormLevel };
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "kai-fwor"
})

// 获取数据库集合的引用
const db = cloud.database();
// 获取数据库查询指令的引用
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  // 30分钟过期，不查询该数据
  // 获取当前时间减去30分钟的时间戳
  let currentTime = new Date().getTime() - 30 * 60 * 1000;
  // 根据时间戳来获取日期时间
  let date = new Date(currentTime);

  return await db.collection("bage_datas").where({
    // 时间大于30分钟的时间
    time: _.gte(date),
    // 当前用户查询的
    userInfo: event.userInfo
  }).get();
}
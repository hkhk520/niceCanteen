// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "kai-fwor"
})

// 获取数据库的引用
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  // event保存了调用云函数时传过来的参数，以及用户的一些id信息
  return await db.collection("product_desc").where({
    type: event.type
  }).get();
}
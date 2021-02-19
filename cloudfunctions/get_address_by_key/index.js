// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "kai-fwor"
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  return await db.collection("addresses").where({
    // 根据用户信息
    userInfo: event.userInfo,
    // 根据传过来的key和value
    [event.key]: event.value
  }).get();
}
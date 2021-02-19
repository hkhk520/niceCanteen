// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "kai-fwor"
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  return await db.collection("bage_datas").where({
    userInfo: event.userInfo,
    _id: event._id
  }).remove();
}
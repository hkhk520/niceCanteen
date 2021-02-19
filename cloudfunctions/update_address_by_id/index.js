// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "kai-fwor"
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);
  return await db.collection("addresses").where({
    userInfo: event.userInfo,
    _id: event._id
  }).update({
    data: event.data
  })
}
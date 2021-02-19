// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "kai-fwor"
})

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  // 获取加入购物车的时间
  let time = new Date();

  // 根据数据库中指定的_id来修改这条数据的购买数量ruleBuyNum
  return await db.collection("bage_datas").where({
    userInfo: event.userInfo,
    _id: event._id
  }).update({
    data: {
      ruleBuyNum: event.currentNum,
      time
    }
  })
}
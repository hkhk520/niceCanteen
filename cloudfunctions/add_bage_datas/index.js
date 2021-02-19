// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "kai-fwor"
})

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  // 获取加入购物车的时间
  let date = new Date();
  
  // 给event对象添加属性和属性值
  event.time = date;

  // 添加到数据库bage_datas里面去
  return await db.collection("bage_datas").add({
    data: event
  });
}
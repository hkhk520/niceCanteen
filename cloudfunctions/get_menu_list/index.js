// 云函数入口文件 由于这里已经定于了cloud，所以不需要使用wx来获取了
const cloud = require('wx-server-sdk')

// 由于有2个云环境，所以需要先指定初始化云环境
cloud.init({
  env: "kai-fwor"
}) //这句也很重要！！
// cloud.init()

// 获取数据库集合的引用
// const db = wx.cloud.database();  // 错误的，不需要使用wx
let db = cloud.database();

// 云函数入口函数
exports.main = async(event, context) => {
  
  // db.collection("集合名称")  await 是配合async来使用的
  return await db.collection('menu_list').get();
}
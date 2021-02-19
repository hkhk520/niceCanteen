// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "kai-fwor"
});

// 获取数据集合的引用
const db = cloud.database();

// 获取查询指令的引用
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  return await db.collection("product_desc").where({
    // 查询的数据字段值在给定数组中
    _id: _.in(event.pidsArr)
  }).get();
}
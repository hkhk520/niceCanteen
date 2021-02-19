// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "kai-fwor"
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  if (event.data.sign == "all") {
    return await db.collection("orders").where({
      address: {
        userInfo: event.userInfo
      }
    }).orderBy("date", "desc").skip(event.countOffset).limit(event.count).get();
  } else if (event.data.sign == "doing") {
    // 根据传过来的时间戳，转成标准时间格式
    let time = new Date(event.data.time);

    return await db.collection("orders").where({
      address: {
        userInfo: event.userInfo
      },
      // 查询时间日期大于等于传过来的时间
      date: _.gte(time)
    }).orderBy("date", "desc").skip(event.countOffset).limit(event.count).get();
    // skip(offset) offset表示每次从数据库的哪个位置开始查询，limit(count) count表示查询的条数
    // orderBy("date","desc")  date表示要排序的字段  desc表示降序  asc表示升序
  } else if (event.data.sign == "completed") {
    // 根据传过来的时间戳，转成标准时间格式
    let time = new Date(event.data.time);

    return await db.collection("orders").where({
      address: {
        userInfo: event.userInfo
      },
      // 查询时间日期小于等于传过来的时间
      date: _.lte(time)
    }).orderBy("date", "desc").skip(event.countOffset).limit(event.count).get();
  }

}
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "kai-fwor"
})

const db = cloud.database()
const _ = db.command;

// 获取aggregate联表查询的引用
const $ = db.command.aggregate;

// 云函数入口函数
exports.main = async (event, context) => {
  /*
  // 方式一：不使用aggregate的联表查询方式
  // 联表查询，先根据购物袋的_id来查询集合bage_datas的对应数据
  return await db.collection("bage_datas").where({
    userInfo: event.userInfo,
    _id: _.in(event.idsArr)
    // 可以promise写法then处理成功的
  }).get().then(async result => {
    // 再根据查询到的对应购物袋数据中的pid，并把pid存成数组，来查询集合product_desc，从而获取相应的price价格
    let pidsArr = [];
    result.data.map(item => {
      pidsArr.push(item.pid)
    });
    await db.collection("product_desc").where({
      _id: _.in(pidsArr)
    }).get().then(async res => {
      // 遍历循环查询到的购物袋的数据
      result.data.map(value => {

        // 遍历循环查询到的product_desc数据
        for (let i = 0; i < res.data.length; i++) {
          // 找到product_desc数据中_id 和 购物袋数据中的pid一致的商品
          if (value.pid == res.data[i]._id) {
            // 把product_desc的对应价格添加到对应购物袋数据的price中去
            value.price = res.data[i].price;
            // 结束循环
            break;
          }

        }
      })
    });

    // 返回查询到，并添加price的购物袋数据
    return result.data;
  });
  */

  // 方式二：使用aggregate的查询
  // 主集合product_desc是要查询并添加内容后，返回的集合
  return await db.collection("product_desc").aggregate().lookup({
    // 被动集合bage_datas是要条件关联的集合
    from: "bage_datas",
    // let是用来获取主集合的内容，并重新命名的
    let: {
      product_id: "$_id"
    },
    // 流水线pipeline 是要执行查询的步骤和条件 （流水线是操作被动集合bage_datas的）
    pipeline: $.pipeline().match(_.expr($.and([
      // 条件： 被动集合的bage的pid 和 主动集合product的_id 相等时
      $.eq(['$pid', '$$product_id'])
    ]))).match({
      // 并出现在传过来的数组中的数据 被动集合bage_datas的_id 满足条件时
      _id: _.in(event.idsArr)
    }).done(), // done() 结束流水线操作

    // 保存查询到的数据，并以bageDatas为属性名，添加到product_desc中去
    as: "bageDatas"
    
    // end() 结束数据库查询 
  }).end().then( res => {
    let lists = [];
    // 遍历查询回来的结果，去除掉bageDatas为空的数据
    res.list.map( item => {
      if(item.bageDatas.length > 0){
        lists.push(item);
      }
    });

    // 返回去掉bageDatas为空的lists
    return lists;
  }) 
  
}
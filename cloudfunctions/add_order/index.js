// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "kai-fwor"
});

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  let pm = [];

  // 根据_id和用户openID查询对应的地址
  pm.push(db.collection("addresses").where({
    userInfo: event.userInfo,
    _id: event.address_id
  }).get());

  // 根据_id和用户openID查询对应的地址
  pm.push(db.collection("bage_datas").where({
    userInfo: event.userInfo,
    _id: _.in(event._idsArr)
  }).get());
  
  // Promise.all获得的成功结果的数组里面的数据顺序和Promise.all接收到的数组顺序是一致的，即p1的结果在前，即便p1的结果获取的比p2要晚。这带来了一个绝大的好处：在前端开发请求数据的过程中，偶尔会遇到发送多个请求并根据请求顺序获取和使用数据的场景，使用Promise.all毫无疑问可以解决这个问题
  return await Promise.all(pm).then(async res => {
    // 先把查询到的购物袋数据的pid存到数组中去
    let bageDatas = res[1].data;
    // 购物袋的pid
    let pidsArr = [];
    //购物袋的_id
    let _idsArr = [];
    bageDatas.map( item => {
      pidsArr.push(item.pid);
      _idsArr.push(item._id);
    });

    // 再通过pidsArr来查询商品集合的对应数据
    return await db.collection("product_desc").where({
      _id: _.in(pidsArr)
    }).get().then( async result => {
      // 遍历循环每一个购物袋的数据
      bageDatas.map( item => {
        // 循环判断商品中的_id 和 购物袋的pid是否相同，
        for(let i=0; i<result.data.length; i++){
          // 相同，给购物袋的对应数据 添加一个价格属性
          if(item.pid == result.data[i]._id){
            item.price = result.data[i].price;
            break;
          }
        }
      })

      // 编写订单时间
      let date = new Date();
      // 订单编号
      let orderNo = "NO" + date.getTime();
      // 订单状态 0 => 准备中  1 => 配送中  2 => 完成
      let status = 0;

      // 订单总数据
      let orderData = {
        date,       // 订单时间
        orderNo,    // 订单编号
        status,     // 订单状态
        address: res[0].data[0],  // 订单地址
        product: res[1].data      // 订单商品数据
      }

      // 最后把订单总数据 存到集合 orders 中去
      return await db.collection("orders").add({
        data: orderData
      }).then( async value => {
        // 如果value && value._id为true，则证明添加订单成功
        if(value && value._id){
          // 添加订单成功时，需要通过购物袋的_id来删除对应的购物袋数据
          return await db.collection("bage_datas").where({
            userInfo: event.userInfo,
            _id: _.in(_idsArr)
          }).remove();
        }
      })
    });
  }).catch(err => {
    console.log("err =>",err);
  })

}
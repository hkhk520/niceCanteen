// components/orderInfoBox/orderInfoBox.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    orderDatas: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击再来一单
    addOneMore(e) {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
      let order = e.currentTarget.dataset.order;
      let pm = [];
      order.product.map(item => {
        let pid = item.pid;
        let currentRulesStr = item.currentRulesStr;
        let ruleBuyNum = item.ruleBuyNum;
        let img = item.img;
        let title = item.title;

        pm.push(
          // 调用添加购物车数量的云函数
          wx.cloud.callFunction({
            config: {
              env: "kai-fwor"
            },
            name: "add_bage_datas",
            data: {
              pid,
              currentRulesStr,
              ruleBuyNum,
              img,
              title
            }
          })
        );
      })
      Promise.all(pm).then( res => {
        wx.hideLoading();
        wx.navigateTo({
          url: '../../pages/pay/pay',
        })
      })

    }
  }
})
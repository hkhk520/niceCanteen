import {
  utils
} from "../../utils/index"

let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 记录tab栏的激活下标
    active: 0,
    // 控制骨架瓶的显示
    loading: true,
    // 数据偏移量
    countOffset: 0,
    // 每次拿的数据的条数
    count: 5,
    // 判断是否还可以下拉触底获取数据库的数据，即判断数据库的数据是否足够
    isHas: true,
    // 保存每次获取5条的订单数据
    orderDatas: null,
    // 记录当前的时间
    nowTime: null,
    // 判断用户是否授权了
    isAuth: false,
    tabs: [{
        title: "全部"
      },
      {
        title: "配送中",
      },
      {
        title: "已完成"
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 获取用户的当前设置的api
    wx.getSetting({
      success: res => {
        // 在全局变量对象中添加用户是否授权的布尔值
        app.globalData.isAuth = res.authSetting["scope.userInfo"]
        // 一创建页面，就把全局对象中的isAuth赋值给当前页面的isAuth
        this.setData({
          isAuth: app.globalData.isAuth
        });

        // 如果授权了
        if (this.data.isAuth) {
          // 先把之前的数据置空
          this.setData({
            orderDatas: [],
            isHas: true,
            countOffset: 0
          })
          let data = {
            time: null,
            sign: "all"
          }
          // 调用获取所有订单的方法
          this.getOrders(data);
        }
      }
    });

  },

  // 获取用户授权信息
  getuserinfo(res) {
    // 获取用户授权信息，当有用户信息了，证明用户授权了
    if (res.detail.userInfo) {
      // 授权成功
      app.globalData.isAuth = true;
      this.setData({
        isAuth: true
      });

      // 先把之前的数据置空
      this.setData({
        orderDatas: [],
        isHas: true,
        countOffset: 0
      })
      let data = {
        time: null,
        sign: "all"
      }
      // 调用获取所有订单的方法
      this.getOrders(data);
    }
  },

  // 获取数据库的订单数据的方法
  getOrders(data) {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    // 调用get_orders云函数
    wx.cloud.callFunction({
      name: "get_orders",
      data: {
        countOffset: this.data.countOffset,
        count: this.data.count,
        data
      },
      success: res => {
        wx.hideLoading();

        // 如果订单没有数据
        if (!res.result.data.length) {
          return;
        }

        // 处理地址信息 和 总数 和 总价
        res.result.data.map(item => {
          item.address.uaddress = item.address.area.replace(/\//gi, "") + item.address.detailArea;
          item.time = utils.formatDate(item.date);
          item.totalNumAndPrice = utils.totalNumAndPrice(item.product);
        });

        // 把拿到的5条数据，推到之前的orderDatas数组后面去
        this.data.orderDatas.push(...res.result.data);
        // 保存到data里面去
        this.setData({
          loading: false,
          orderDatas: this.data.orderDatas
        });

        // 成功获取数据后，数据偏移量需要加上每次获取的条数
        this.setData({
          countOffset: this.data.countOffset + this.data.count
        });
        // 判断获取的数据是否小于每次获取的条数，不够，则把isHas改为false
        if (res.result.data.length < this.data.count || res.result.data.length == this.data.count) {
          this.setData({
            isHas: false
          })
        }
      },
      fail: err => {
        console.log(err);
        wx.hideLoading();
      }
    })
  },

  // 当前激活的标签改变时触发
  changeOrderDatas(e) {
    if (e.detail.title == "配送中") {
      let time = new Date().getTime() - 30 * 60 * 1000;
      // 先把之前的数据置空
      this.setData({
        orderDatas: [],
        isHas: true,
        countOffset: 0
      });
      let data = {
        time,
        sign: "doing"
      }
      // 调用获取所有订单的方法
      this.getOrders(data);
    } else if (e.detail.title == "已完成") {
      let time = new Date().getTime() - 30 * 60 * 1000;
      // 先把之前的数据置空
      this.setData({
        orderDatas: [],
        isHas: true,
        countOffset: 0
      });
      let data = {
        time,
        sign: "completed"
      }
      // 调用获取所有订单的方法
      this.getOrders(data);
    } else {
      // 先把之前的数据置空
      this.setData({
        orderDatas: [],
        isHas: true,
        countOffset: 0
      });
      let data = {
        time: null,
        sign: "all"
      }
      // 调用获取所有订单的方法
      this.getOrders(data);
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 先判断数据是否足够
    if (!this.data.isHas) {
      return;
    }
    let data = null;
    if (this.data.active == 0) {
      data = {
        time: null,
        sign: "all"
      }
    } else if (this.data.active == 1) {
      let time = new Date().getTime() - 20 * 60 * 1000;
      data = {
        time,
        sign: "doing"
      }
    } else if (this.data.active == 2) {
      let time = new Date().getTime() - 40 * 60 * 1000;
      data = {
        time,
        sign: "completed"
      }
    }
    // 触底加载更多，再拿5条数据
    this.getOrders(data);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
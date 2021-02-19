// 获取APP实例
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 保存菜单列表的数据
    menuListDatas: null,
    // asider-nav的激活下标
    activeIndex: 0,
    // 控制是否显示骨架瓶
    loading: true,
    // 保存商品详情数据
    productDatas: null,
    // 保存当前的选择的规则字符串
    changeRulesStr: null,
    // 当前商品的下标
    currentProductIndex: null,
    // 记录购物袋数据
    bageDatas: null,
    // 保存bage盒子的抖动动画效果类名
    bounceClass: "",
    // 保存所有ids字符串
    ids: null,
    // 判断用户是否授权了
    isAuth: false
  },

  // 当已经进来这页面一次了，再次进来是不会触发onLoad和onReady生命周期函数的

  /**
   * 生命周期函数--监听页面加载 初始化页面数据时触发，
  */
  onLoad: function (options) {
    // 调用获取get_menu_list云函数的方法
    this.getMenuListData();

    // 调获取get_product_desc云函数的方法
    this.getProductDesc("porridge");
  },

  /**
   * 生命周期函数--监听页面显示，一般切换还是得在onShow生命周期函数内触发
   */
  onShow: function () {
    // 调用get_bage_datas云函数
    this.getBageDatas();

    // 获取用户的当前设置的api
    wx.getSetting({
      success: res => {
        // 在全局变量对象中添加用户是否授权的布尔值
        app.globalData.isAuth = res.authSetting["scope.userInfo"]
        // 一创建页面，就把全局对象中的isAuth赋值给当前页面的isAuth
        this.setData({
          isAuth: app.globalData.isAuth
        });
      }
    });
  },

  // 获取get_menu_list云函数
  getMenuListData() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    // 调用云函数[get_menu_list]
    wx.cloud.callFunction({
      // 原因：小程序可能存在多个云环境，如果在调用云函数（wx.cloud.callFunction）的时候未指定云环境则会导致小程序找不到云函数入口
      // 解决如下：在调用时声明云环境，即加上config
      config: {
        env: 'kai-fwor'
      },
      // 云函数名称
      name: "get_menu_list",
      success: response => {
        this.setData({
          menuListDatas: response.result.data
        });

        wx.hideLoading();
      },
      fail(err) {
        console.log(err);
        wx.hideLoading();
      }
    })
  },

  // 切换激活下标的方法
  toggleActiveIndex(e) {
    let currentIndex = e.currentTarget.dataset.index;
    // 如果点击的是当前的，就直接结束函数
    if (this.data.activeIndex == currentIndex) {
      return;
    }

    // 改变data里面的数据，需要使用this.setData({修改的属性名: 属性值})
    this.setData({
      activeIndex: currentIndex
    });

    // 调获取get_product_desc云函数的方法
    this.getProductDesc(e.currentTarget.dataset.type);
  },

  // 获取get_product_desc云函数
  getProductDesc(type) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    // 调用云函数[get_product_desc]
    wx.cloud.callFunction({
      // 指定云环境名称
      config: {
        env: "kai-fwor"
      },
      // 指定云函数名称
      name: "get_product_desc",
      // 传给云函数的参数
      data: {
        type
      },
      success: response => {
        // 隐藏骨架瓶
        this.setData({
          loading: false,
          productDatas: response.result.data
        })
        // 隐藏加载框
        wx.hideLoading();

        // 如果请求没有数据，就显示默认的数据
        if (this.data.productDatas.length == 0) {
          this.setData({
            productDatas: [{
              evaluate: "100%",
              img: "../../images/default.jpg",
              material: "鸡腿",
              monSell: 1000,
              price: "14.00",
              title: "香辣鸡腿",
              allrules: [{
                  "title": "配菜",
                  "rules": [
                    "生菜",
                    "白菜",
                    "紫菜",
                    "枸杞叶"
                  ]
                },
                {
                  "title": "辣度",
                  "rules": [
                    "不辣",
                    "微辣",
                    "中辣",
                    "特辣"
                  ]
                }
              ]
            }]
          })
        }
      },
      fail(err) {
        console.log(err);

        wx.hideLoading();
      }
    })
  },

  // 接收子传父的事件
  receiveSelectedRule(e) {
    // 当前商品的下标
    this.setData({
      currentProductIndex: e.currentTarget.dataset.index
    })
    // 当前规则项的下标
    let currentRulesItemIndex = e.detail.currentRulesItemIndex;
    // 当前规则的下标
    let currentRuleIndex = e.detail.currentRuleIndex;

    // 更新选择规则后的商品信息
    this.data.productDatas[this.data.currentProductIndex].allrules[currentRulesItemIndex].currentRuleIndex = currentRuleIndex;

    // 更新规则弹窗盒子的头部的已选规则信息
    let allrules = this.data.productDatas[this.data.currentProductIndex].allrules;
    let arr = [];
    allrules.forEach(item => {
      arr.push(item.rules[item.currentRuleIndex])
    });
    this.setData({
      changeRulesStr: arr.join("/")
    });

  },

  // 获取get_bage_datas云函数
  getBageDatas() {
    wx.cloud.callFunction({
      config: {
        env: "kai-fwor"
      },
      name: "get_bage_datas",
      success: (response) => {
        // 获取购物袋中所有商品的pid，并拼接成字符串
        let arr = [];
        response.result.data.map(item => {
          arr.push(item._id);
        });
        this.data.ids = arr.join("-");


        this.setData({
          bageDatas: response.result.data
        })
        wx.hideLoading();
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
      }
    })
  },

  // 获取bage盒子的抖动效果的类名
  bounce(e) {
    this.setData({
      bounceClass: e.detail
    })
  },

  // 点击bage盒子跳到结算页面的方法
  goPay() {
    if (this.data.bageDatas.length == 0) {
      wx.showToast({
        title: '亲，你的购物袋空空如也！赶紧去添加商品吧',
        icon: "none",
        mask: true
      });

      return;
    }
    wx.navigateTo({
      url: '../pay/pay?ids=' + this.data.ids,
    })
  },

  // 获取用户授权信息
  getUserInfo(res) {
    // 获取用户授权信息，当有用户信息了，证明用户授权了
    if (res.detail.userInfo) {
      // 授权成功
      app.globalData.isAuth = true;
      this.setData({
        isAuth: app.globalData.isAuth
      })
    }
  },

  // product子组件修改父组件的方法
  changeIsAuth() {
    // 授权成功
    app.globalData.isAuth = true;
    this.setData({
      isAuth: true
    });
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 判断用户是否授权了
    isAuth: false,
    // 保存用户的登录头像和昵称
    userInfo: {},
    // 保存地址的数量
    addressNum: 0,
    // 保存结算数量
    payNum: 0,
    // 控制是否先联系我的弹窗
    showConcat: false
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
    // 获取用户的设置信息
    wx.getSetting({
      success: res => {
        app.globalData.isAuth = res.authSetting["scope.userInfo"];
        this.setData({
          isAuth: app.globalData.isAuth
        });

        // 当用户授权了，获取用户的信息
        if (app.globalData.isAuth) {
          wx.showLoading({
            title: '加载中',
            mask: true
          });

          // 获取用户信息
          wx.getUserInfo({
            success: res => {
              this.setData({
                userInfo: res.userInfo,
              });
            }
          });

          // 保存promise的数组
          let pm = [];

          // 当登录了，获取结算数据
          pm.push(wx.cloud.callFunction({
            name: "get_bage_datas"
          }));

          // 当登录了，获取地址数据
          pm.push(wx.cloud.callFunction({
            name: "get_all_address"
          }));

          Promise.all(pm).then(res => {
            this.setData({
              payNum: res[0].result.data.length,
              addressNum: res[1].result.data.length
            });

            wx.hideLoading();
          })
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
        userInfo: res.detail.userInfo,
        isAuth: true
      });

      wx.showLoading({
        title: '加载中',
        mask: true
      });

      // 保存promise的数组
      let pm = [];

      // 当登录了，获取结算数据
      pm.push(wx.cloud.callFunction({
        name: "get_bage_datas"
      }));

      // 当登录了，获取地址数据
      pm.push(wx.cloud.callFunction({
        name: "get_all_address"
      }));

      Promise.all(pm).then(res => {
        this.setData({
          payNum: res[0].result.data.length,
          addressNum: res[1].result.data.length
        });

        wx.hideLoading();
      })
    }
  },

  // 点击我的结算跳到结算页面的方法
  goPay() {
    // 用户未授权
    if (!this.data.isAuth) {
      wx.showToast({
        title: '亲，你还未登录呐，点击头像登录吧',
        icon: "none",
        mask: true
      });
      return;
    }

    // 当购物袋为空时
    if (this.data.payNum == 0) {
      wx.showModal({
        title: "温馨提醒",
        content: "亲，你的购物袋空空汝也，去逛一逛吧",
        cancelText: "待会去",
        confirmText: "现在去",
        cancelColor: "#ccc",
        confirmColor: "#19c6ff",
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '../home/home',
            })
          }
        },
        fail: err => {
          console.log(err);
        }
      })

      return;
    }
    wx.navigateTo({
      url: '../pay/pay?ids=' + this.data.ids,
    })
  },

  // 点击我的地址跳转到地址管理页面
  goAddress() {
    // 用户未授权
    if (!this.data.isAuth) {
      wx.showToast({
        title: '亲，你还未登录呐，点击头像登录吧',
        icon: "none",
        mask: true
      });
      return;
    }

    wx.navigateTo({
      url: '../address/address',
    })
  },

  // 点击个人中心跳转到self页面
  goSelf() {
    // 用户未授权
    if (!this.data.isAuth) {
      wx.showToast({
        title: '亲，你还未登录呐，点击头像登录吧',
        icon: "none",
        mask: true
      });
      return;
    }

    wx.navigateTo({
      url: '../self/self',
      success: res => {
        res.eventChannel.emit("acceptDatas",this.data.userInfo)
      }
    })
  },

  // 显示联系我的弹窗
  showPopup(){
    this.setData({
      showConcat: true
    })
  },
  // 关闭联系我的弹窗
  onClose(){
    this.setData({
      showConcat: false
    })
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
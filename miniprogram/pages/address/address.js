// miniprogram/pages/address/address.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 控制是否显示骨架瓶
    loading: true,
    // 获取数据库中所有地址数据
    allAddresses: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    setTimeout(() => {
      this.setData({
        loading: false
      })
    }, 800)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 调用获取所有地址数据
    this.getAllAddresses();
  },

  // 点击新增地址，跳转到编辑地址页面的方法
  goEditAddress() {
    wx.navigateTo({
      url: '../edit_address/edit_address',
    })
  },

  // 获取所有地址数据
  getAllAddresses() {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.cloud.callFunction({
      name: "get_all_address",
      success: (res) => {
        // 先把每一个地址的area和detailArea字符串处理，并添加到每一条地址对象里面去
        res.result.data.map( item => {
          item.uaddress = item.area.replace(/\//gi,"") + item.detailArea
        });
        
        this.setData({
          allAddresses: res.result.data
        })
        wx.hideLoading();
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
      }
    })
  },

  // 点击右侧的毛笔，跳转到编辑地址页面
  goEditAddress(e) {
    wx.navigateTo({
      // 跳转非tab栏的链接
      url: '../edit_address/edit_address',
      // 跳转成功的回调
      success: (res) => {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit("sendAddress", e.currentTarget.dataset.address)
      }
    })
  },

  // 点击地址，选择地址并跳转到结算页面
  goPay(e) {
    wx.navigateTo({
      url: '../pay/pay',
      success: (res) => {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit("selectedAddress", {
          address: e.currentTarget.dataset.address,
          isAddressIn: true
        });
      }
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
    // 当pay页面被卸载时，返回指定页面，即点击头部导航栏的返回按钮
    // wx.reLaunch({
    //   url: '../pay/pay',
    // })
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
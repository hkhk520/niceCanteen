// miniprogram/pages/edit_address/edit_address.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 保存地址信息对象
    addressInfo: {
      uname: "",
      phone: "",
      area: "选择省 / 市 / 区",
      detailArea: "",
      default: false
    },
    // 记录地区字符串
    areaStr: "选择省 / 市 / 区",
    // 控制显示骨架瓶的
    loading: true,
    // 记录当从点击右侧修改地址进来页面时的地址id
    currentId: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    const eventChannel = this.getOpenerEventChannel();
    // 监听sendAddress事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('sendAddress', (data) => {
      if (data) {
        // 当是编辑进来的，需要将导航栏的title改为编辑地址
        wx.setNavigationBarTitle({
          title: '编辑地址',
        })

        this.data.addressInfo.uname = data.uname;
        this.data.addressInfo.phone = data.phone;
        this.data.addressInfo.area = data.area;
        this.data.addressInfo.detailArea = data.detailArea;
        this.data.addressInfo.default = data.default;
        this.setData({
          addressInfo: this.data.addressInfo,
          areaStr: data.area,
          currentId: data._id
        });
      }
    })

    setTimeout(() => {
      this.setData({
        loading: false
      })
    }, 800);
  },

  // 当input失去焦点时，修改地址信息
  editAddressInfo(e) {
    // 获取当前修改的input框
    let key = e.currentTarget.dataset.key;

    // // 第一种修改data里面的对象中某个属性的方法
    // // 修改对象里面的某个属性
    // // 先把要修改的属性拼接成字符串
    // let title = 'addressInfo.'+key;
    // this.setData({
    //   // 用[字符串]来修改
    //   [title]: e.detail.value
    // });

    // 第二种修改data里面的对象中某个属性的方法
    this.data.addressInfo[key] = e.detail.value;
    this.setData({
      addressInfo: this.data.addressInfo
    });
  },

  // 当选择地址，点击确定时触发
  editArea(e) {
    this.setData({
      // 先把拿到的地区数组拼接成字符串
      areaStr: e.detail.value.join("/")
    })
    // 修改addressInfo的某个属性
    let title = 'addressInfo.area';
    this.setData({
      [title]: this.data.areaStr
    })
  },

  // 保存地址
  saveAddress() {
    // 先验证地址信息是否都有填写了
    let addressInfo = this.data.addressInfo;
    for (let key in addressInfo) {
      // false == "" 是true 所以得用全等 即 false === "" 是false
      if (addressInfo[key] === "" || addressInfo[key] == "选择省 / 市 / 区") {
        wx.showToast({
          title: '请填写完整的地址信息',
          icon: "none",
          mask: true
        });
        return;
      }
    }

    // 手机格式验证
    if (!/^1[3-9]\d{9}$/.test(addressInfo.phone)) {
      wx.showToast({
        title: '手机号不正确',
        icon: "none",
        mask: true
      });
      return;
    }

    // 先获取所有地址，判断新增的地址是否已经存在
    this.getAllAddresses();

  },

  // 查询默认为true的地址
  findDefaultAddress() {
    // 先获取数据库地址里面的有默认地址default为true的数据
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    // 调用云函数get_address_by_key
    wx.cloud.callFunction({
      name: "get_address_by_key",
      data: {
        key: "default",
        value: true
      },
      success: (res) => {
        // 当数据库中有默认地址时，
        if (res.result.data.length > 0) {
          // 获取default为true的地址数据的_id
          let _id = res.result.data[0]._id;
          // 调用修改地址default的方法
          this.editDefaultAddress(_id);
        } else {
          // 当从点击修改地址进来时
          if (this.data.currentId) {
            // 修改当前地址信息
            this.editCurrentAddress();
          } else {
            // 新增地址
            this.addAddress();
          }
        }
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
      }
    })
  },

  // 修改地址数据库里面的default为true的地址，因为只能有一个默认地址
  // 根据_id来修改default为true的地址，把default修改成false
  editDefaultAddress(_id) {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    // 调用云函数update_address_by_id
    wx.cloud.callFunction({
      name: "update_address_by_id",
      data: {
        _id,
        data: {
          default: false
        }
      },
      success: (res) => {
        // 当修改成功时
        if (res.result.stats.updated == 1) {
          // 当从点击修改地址进来时
          if (this.data.currentId) {
            // 修改当前地址信息
            this.editCurrentAddress();
          } else {
            // 新增地址
            this.addAddress();
          }

        } else {
          wx.showToast({
            title: '没成功修改默认地址',
            icon: "none",
            mask: true
          });
        }
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
      }
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
        let allAddresses = res.result.data;
        let currentAddress = this.data.addressInfo;

        for (let i = 0; i < allAddresses.length; i++) {
          if (allAddresses[i].uname == currentAddress.uname && allAddresses[i].phone == currentAddress.phone && allAddresses[i].area == currentAddress.area && allAddresses[i].detailArea == currentAddress.detailArea && allAddresses[i].default == currentAddress.default) {
            wx.showToast({
              title: '该地址信息已经存在啦！',
              icon: "none",
              mask: true
            });
            return;
          }
        }

        // 如果保存的地址有设为默认地址
        if (this.data.addressInfo.default) {
          // 先找到地址数据库里面的default为true的地址数据，并修改成false
          this.findDefaultAddress();
        } else {
          // 当没有选择默认地址时
          // 当从点击修改地址进来时
          if (this.data.currentId) {
            // 修改当前地址信息
            this.editCurrentAddress();
          } else {
            // 新增地址
            this.addAddress();
          }
        }

      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
      }
    })
  },

  // 新增地址的方法
  addAddress() {
    // 调用add_address的云函数
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.cloud.callFunction({
      name: "add_address",
      data: {
        ...this.data.addressInfo
      },
      success: (res) => {
        if (res.result._id) {
          wx.showToast({
            title: '保存地址成功啦~~',
            mask: true
          });
          // 返回上一级路由
          wx.navigateBack();
        } else {
          wx.showToast({
            title: '没能保存地址成功！',
            icon: "none",
            mask: true
          });
        }
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
      }
    })
  },

  // 当从点击右侧毛笔进来的修改地址的方法
  editCurrentAddress() {
    wx.showLoading({
      title: '保存地址中',
      mask: true
    });
    // 调用云函数update_address_by_id
    wx.cloud.callFunction({
      name: "update_address_by_id",
      data: {
        _id: this.data.currentId,
        data: this.data.addressInfo
      },
      success: (res) => {
        // 当修改成功时
        if (res.result.stats.updated == 1) {
          wx.navigateBack();
          wx.showToast({
            title: '成功修改地址',
            mask: true
          });
        } else {
          wx.showToast({
            title: '没成功修改默认地址',
            icon: "none",
            mask: true
          });
        }
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
      }
    })
  },

  // 删除地址
  delAddress() {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.cloud.callFunction({
      name: "del_address_by_id",
      data: {
        _id: this.data.currentId
      },
      success: res => {
        if (res.result.stats.removed == 1) {
          wx.navigateTo({
            url: '../address/address',
          })
          wx.showToast({
            title: '删除成功啦~',
            mask: true
          })
        } else {
          wx.showToast({
            title: '删除失败',
            icon: "none",
            mask: true
          })
        }
      },
      fail: err => {
        console.log(err);
        wx.hideLoading();
      }
    })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
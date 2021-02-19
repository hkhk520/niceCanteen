// miniprogram/pages/pay/pay.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 控制是否显示骨架瓶
    loading: true,
    // 保存地址信息对象
    addressInfo: {},
    // 控制是否从地址管理页面进来的
    isAddressIn: false,
    // 保存所有bage的数据
    allBageDatas: [],
    // 保存所有pid数组
    pidsArr: [],
    // 保存所有商品的_id数组
    _idsArr: [],
    // 保存价格的数组
    priceArr: [],
    // 记录所有数量
    totalNum: 0,
    // 保存合计总价
    totalPrice: 0,

    idsArr: null,
  },

  /**
   * 生命周期函数--监听页面加载 在生命周期中，先触发onLoad，再触发onShow
   */
  onLoad: function (options) {
    setTimeout(() => {
      this.setData({
        loading: false
      })
    }, 800);

    /*
    if (options.ids) {
      // 截取路由的参数，并转成pids数组
      this.data.idsArr = options.ids.split("-");
    }
    wx.cloud.callFunction({
      name: "get_bage_by_id",
      data: {
        idsArr: this.data.idsArr
      },
      success: res => {
        console.log(res);
      },
      fail: err => {
        console.log(err);
      }
    })
    */


  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 调用获取bage所有数据的方法
    this.getAllBageDatas();

    // 一进页面就设置isAddressIn: false
    this.setData({
      isAddressIn: false
    });

    // 获取从地址管理页面进来的路由传递参数
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel.on) {
      eventChannel.on("selectedAddress", (data) => {
        if (data) {
          this.data.addressInfo.uname = data.address.uname;
          this.data.addressInfo.phone = data.address.phone;
          this.data.addressInfo.area = data.address.area;
          this.data.addressInfo.detailArea = data.address.detailArea;
          this.data.addressInfo.uaddress = data.address.area.replace(/\//gi, "") + data.address.detailArea;
          this.data.addressInfo.default = data.address.default;
          this.data.addressInfo._id = data.address._id;
          this.setData({
            addressInfo: this.data.addressInfo,
            isAddressIn: data.isAddressIn
          });
        }
      });
    }

    // 如果是从首页进来的，获取默认地址
    if (!this.data.isAddressIn) {
      // 一进页面先找到默认地址
      this.findDefaultAddress();
    }
  },

  // 点击选择地址跳转到地址管理页面
  goAddress() {
    wx.navigateTo({
      url: '../address/address',
    })
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
          // 先把每一个地址的area和detailArea字符串处理，并添加到每一条地址对象里面去
          res.result.data.map(item => {
            item.uaddress = item.area.replace(/\//gi, "") + item.detailArea
          });
          this.setData({
            addressInfo: res.result.data[0]
          })
        } else {
          this.setData({
            addressInfo: {}
          })
        }
      },
      fail: (err) => {
        console.log(err);
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

  // 获取购物袋bage的所有数据
  getAllBageDatas() {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.cloud.callFunction({
      name: "get_bage_datas",
      success: res => {
        let result = res.result.data;
        // 先获取数据中每一项的pid，并添加到数组里面去
        result.map(item => {
          this.data.pidsArr.push(item.pid);
          this.data._idsArr.push(item._id);
        });

        // 先把查询到的结果保存到data中的allBageDatas里面去
        this.setData({
          allBageDatas: result
        })

        // 先根据_id来获取对应的商品数据，再获取对应价格
        this.getProductById(this.data.pidsArr);
      },
      fail: err => {
        console.log(err);
        wx.hideLoading();
      }
    })
  },

  // 根据pid来获取数据库product_desc对应商品的价格的方法
  getProductById(pidsArr) {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.cloud.callFunction({
      name: "get_product_by_id",
      data: {
        pidsArr
      },
      success: res => {
        // 查询到的对应购物袋每一条数据添加一个价格
        this.data.allBageDatas.map(item => {
          // 先循环遍历查询回来的product数据
          for (let i = 0; i < res.result.data.length; i++) {
            // 判断购物袋的pid 和 商品的 _id 一致时
            if (item.pid == res.result.data[i]._id) {
              // 给对应的购物袋数据添加一个price价格
              item.price = res.result.data[i].price;
              // 结束循环
              break;
            }
          }
        })

        // 保存购物袋的所有数据
        this.setData({
          allBageDatas: this.data.allBageDatas
        });

        // 调用计算总数量和总价的方法
        this.totalNumAndPrice();

        wx.hideLoading();
      },
      fail: err => {
        console.log(err);
        wx.hideLoading();
      }
    })
  },

  // 计算所有数量 和 计算合计价格 的方法
  totalNumAndPrice() {
    this.setData({
      totalPrice: 0,
      totalNum: 0
    })

    // 计算所有数量 和 计算合计价格
    this.data.allBageDatas.forEach(item => {
      this.data.totalNum += item.ruleBuyNum;
      this.data.totalPrice += item.ruleBuyNum * item.price;
    });

    // 保存到data里面去
    this.setData({
      totalNum: this.data.totalNum,
      // 总价保留2位小数
      totalPrice: this.data.totalPrice.toFixed(2)
    });
  },

  // 点击减号，删除对应订单的数量的方法
  delNum(e) {
    let item = e.currentTarget.dataset.item;
    let currentNum = item.ruleBuyNum - 1;

    // 当订单的商品数量为0时，需要删除该商品订单
    if (currentNum == 0) {
      wx.showModal({
        title: "温馨提醒",
        content: "你忍心删除人家麽~~",
        cancelText: "不忍心",
        confirmText: "心意已决",
        cancelColor: "#ccc",
        confirmColor: "#19c6ff",
        success: (res) => {
          if (res.confirm) {
            wx.showLoading({
              title: '删除中',
              mask: true
            });
            // 调用del_bage_data的云函数
            wx.cloud.callFunction({
              name: "del_bage_data",
              data: {
                _id: item._id
              },
              success: res => {
                if (res.result.stats.removed == 1) {
                  // 调用获取bage所有数据的方法
                  this.getAllBageDatas();
                } else {
                  wx.showToast({
                    title: '删除失败，请重新操作',
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
          } else if (res.cancel) {
            wx.showToast({
              title: '就知道你舍不得人家！',
              icon: "none",
              mask: true
            })
          }
        },
        fail: err => {
          console.log(err);
        }
      })
    } else {
      wx.showLoading({
        title: '删除中',
        mask: true
      });
      // 调用更新购物袋数量的方法
      this.updateBageNum(item,currentNum);
    }
  },

  // 点击加号，增加对应订单的数量的方法
  addNum(e) {
    let item = e.currentTarget.dataset.item;
    let currentNum = item.ruleBuyNum + 1;

    wx.showLoading({
      title: '添加中',
      mask: true
    });

    // 调用更新购物袋数量的方法
    this.updateBageNum(item,currentNum);
  },

  // 更新修改订单商品的数量的方法
  updateBageNum(item,currentNum) {
    // 调用update_bage_num的云函数
    wx.cloud.callFunction({
      name: "update_bage_num",
      data: {
        _id: item._id,
        currentNum
      },
      success: res => {
        if (res.result.stats.updated == 1) {
          // 调用获取bage所有数据的方法
          this.getAllBageDatas();
        } else {
          wx.showToast({
            title: '更新失败，请重新操作',
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

  // 点击立即结算按钮
  payOrder() {
    // 当没有订单时
    if(this.data.allBageDatas.length == 0){
      wx.showModal({
        title: "温馨提醒",
        content: "亲，你还没有订单商品，去添加商品吧",
        showCancel: false,
        confirmColor: "#19c6ff",
        success: () => {
          wx.switchTab({
            url: '../home/home',
          });
        }
      })

      return;
    }

    // 当没有选择地址时
    if(JSON.stringify(this.data.addressInfo) == '{}'){
      wx.showToast({
        title: '请先选择收货地址！',
        icon: "none",
        mask: true
      })
      return;
    }

    // 有订单和地址时
    let address_id = this.data.addressInfo._id;
    wx.showLoading({
      title: '结算中',
      mask: true
    });
    // 调用add_order云函数
    wx.cloud.callFunction({
      name: "add_order",
      data: {
        address_id,
        _idsArr: this.data._idsArr
      },
      success: res => {
        wx.hideLoading();
        if(res.result.stats.removed > 0){
          // 结算成功时，跳转到订单页面，由于订单是tab栏的，所以要使用switchTab
          wx.switchTab({
            url: '../order/order',
          })
        }else{
          wx.showToast({
            title: '结算失败，请重新结算！',
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
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // 当pay页面被卸载时，返回指定页面，即点击头部导航栏的返回按钮
    // wx.reLaunch({
    //   url: '../home/home',
    // })
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
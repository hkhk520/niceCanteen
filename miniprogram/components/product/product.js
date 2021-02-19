let app = getApp();

Component({
  /**
   * 组件的属性列表，记录父组件传下来的props
   */
  properties: {
    productData: {
      // 类型验证
      type: Object,
      // 默认值
      value: {}
    },
    changeRulesStr: {
      type: String
    },
    // 点击规则的当前商品的下标
    currentProductIndex: {
      type: Number
    },
    // 每一个商品的下标
    productIndex: {
      type: Number
    },
    // 判断用户是否授权了
    isAuth: Boolean,
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 控制是否显示规则弹窗盒子
    isShowRulesBox: false,
    // 保存商品栏的购买数量
    buyNum: 0,
    // 保存规则里面的购买数量
    ruleBuyNum: 1,
    // 控制规则弹窗盒子的bottom
    bottom: "-100%",
    // 保存当前的选择的规则字符串
    currentRulesStr: null,
    // 保存从数据库中获取的当前的商品
    currentBageData: null,
  },

  lifetimes: {
    // 在组件完全初始化完毕、进入页面节点树后， attached 生命周期被触发。此时， this.data 已被初始化为组件的当前值。这个生命周期很有用，绝大多数初始化工作可以在这个时机进行
    // attached() {
    //   wx.getSetting({
    //     success: res => {
    //       // 在全局变量对象中添加用户是否授权的布尔值
    //       app.globalData.isAuth = res.authSetting["scope.userInfo"]
    //       // 一创建页面，就把全局对象中的isAuth赋值给当前页面的isAuth
    //       this.setData({
    //         isAuth: app.globalData.isAuth
    //       });
    //     }
    //   })
    // },
  },

  // 监听器，相当于Vue的watch
  observers: {
    // 监听已选规则的变化
    changeRulesStr(newValue) {
      if (this.data.currentProductIndex == this.data.productIndex) {
        this.setData({
          currentRulesStr: newValue
        })
      }
    },
    // 当切换左边的导航栏时，监听商品信息的变化
    productData() {
      let allrules = this.data.productData.allrules;
      let arr = [];
      allrules.forEach(item => {
        arr.push(item.rules[item.currentRuleIndex])
      });
      this.setData({
        currentRulesStr: arr.join("/")
      });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 规则弹窗盒子的显示隐藏切换
    changeShowRulesBox(e) {
      if (this.data.isShowRulesBox) {
        // 如果是要隐藏，先让bottom的过渡效果执行完，再隐藏
        setTimeout(() => {
          this.setData({
            isShowRulesBox: !this.data.isShowRulesBox,
          })
        }, 400)
      } else {
        // 如果是要显示，先显示盒子，再让bottom的过渡效果执行完
        this.setData({
          isShowRulesBox: !this.data.isShowRulesBox,
        })
      }

      this.setData({
        bottom: e.currentTarget.dataset.bottom
      })
    },
    // 显示规则弹窗盒子
    showRulesBox() {
      this.setData({
        isShowRulesBox: true
      })
    },

    // 商品栏的购买数量的点击+号的递增的方法
    increase() {
      this.setData({
        buyNum: this.data.buyNum + 1
      });

      let pid = this.data.productData._id;
      let currentRulesStr = "";
      let ruleBuyNum = this.data.buyNum;
      let img = this.data.productData.img;
      let title = this.data.productData.title;

      if (this.data.buyNum == 1) {
        wx.showLoading({
          title: '加载中',
          mask: true
        })

        // 调用add_bage_datas云函数
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
          },
          success: () => {
            this.triggerEvent("bage-datas");
            wx.showToast({
              title: '加入购物车成功啦~~',
              mask: true
            });

            // 成功添加商品，给bage盒子加个动画效果
            this.triggerEvent("bounce", "animation-bounce");

            // 动画执行完，要把类名置空，即不执行动画
            setTimeout(() => {
              this.triggerEvent("bounce", "");
            }, 700)

            // 调用get_bage_data云函数
            wx.cloud.callFunction({
              config: {
                env: "kai-fwor"
              },
              name: "get_bage_datas",
              success: (res) => {
                let bageDatas = res.result.data;
                for (let i = 0; i < bageDatas.length; i++) {
                  if (bageDatas[i].pid == pid) {
                    this.setData({
                      currentBageData: bageDatas[i]
                    });
                    return;
                  }
                }
              },
              fail: (err) => {
                console.log(err);
              }
            })
          },
          fail: (err) => {
            console.log(err);
            wx.hideLoading();
          }
        })
      } else {
        wx.cloud.callFunction({
          config: {
            env: "kai-fwor"
          },
          name: "update_bage_num",
          data: {
            _id: this.data.currentBageData._id,
            currentNum: ruleBuyNum
          },
          success: (res) => {
            wx.showToast({
              title: '成功修改商品数量啦~~',
              mask: true,
              icon: "none"
            });
            // 成功添加商品，给bage盒子加个动画效果
            this.triggerEvent("bounce", "animation-bounce");

            // 动画执行完，要把类名置空，即不执行动画
            setTimeout(() => {
              this.triggerEvent("bounce", "");
            }, 700)
          },
          fail: (err) => {
            console.log(err);
          }
        })
      }
    },

    // 商品栏的购买数量的点击-号的递减的方法
    decrease() {
      this.setData({
        buyNum: this.data.buyNum - 1
      });

      // 获取当前操作的商品项
      let pid = this.data.productData._id;
      let ruleBuyNum = this.data.buyNum;
      wx.cloud.callFunction({
        config: {
          env: "kai-fwor"
        },
        name: "get_bage_datas",
        success: (res) => {
          let bageDatas = res.result.data;
          for (let i = 0; i < bageDatas.length; i++) {
            if (bageDatas[i].pid == pid) {
              this.setData({
                currentBageData: bageDatas[i]
              });
              return;
            }
          }
        },
        fail: (err) => {
          console.log(err);
        }
      })

      if (this.data.buyNum == 0) {
        wx.showLoading({
          title: '删除中',
          mask: true
        })
        // 调用删除数据的云函数del_bage_data
        wx.cloud.callFunction({
          config: {
            env: "kai-fwor"
          },
          name: "del_bage_data",
          data: {
            _id: this.data.currentBageData._id,
          },
          success: () => {
            this.triggerEvent("bage-datas");
            wx.showToast({
              title: '删除成功啦~~',
              mask: true
            });

            // 成功添加商品，给bage盒子加个动画效果
            this.triggerEvent("bounce", "animation-bounce");

            // 动画执行完，要把类名置空，即不执行动画
            setTimeout(() => {
              this.triggerEvent("bounce", "");
            }, 700)
          },
          fail: (err) => {
            console.log(err);
            wx.hideLoading();
          }
        })
      } else {
        // 更新数据bage的数量
        wx.cloud.callFunction({
          config: {
            env: "kai-fwor"
          },
          name: "update_bage_num",
          data: {
            _id: this.data.currentBageData._id,
            currentNum: ruleBuyNum
          },
          success: (res) => {
            // 成功添加商品，给bage盒子加个动画效果
            this.triggerEvent("bounce", "animation-bounce");

            // 动画执行完，要把类名置空，即不执行动画
            setTimeout(() => {
              this.triggerEvent("bounce", "");
            }, 700)

            wx.showToast({
              title: '成功修改商品数量啦~~',
              mask: true,
              icon: "none"
            });
          },
          fail: (err) => {
            console.log(err);
          }
        })
      }
    },

    // 规则里面的购买数量的点击+号的递增的方法
    ruleIncrease() {
      this.setData({
        ruleBuyNum: this.data.ruleBuyNum + 1
      })
    },
    // 规则里面的购买数量的点击-号的递减的方法
    ruleDecrease() {
      if (this.data.ruleBuyNum == 1) {
        wx.showToast({
          title: '亲，至少购买一份哦~~',
          icon: 'none',
          duration: 2000,
          mask: true
        })
        return;
      }
      this.setData({
        ruleBuyNum: this.data.ruleBuyNum - 1
      })
    },

    sendSelectedRule(e) {
      // 子传父的自定义事件 sendSelectedRule
      this.triggerEvent("sendSelectedRule", e.detail);
    },

    // 点击加入购物车的方法
    addBageDatas() {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });

      let pid = this.data.productData._id;
      let currentRulesStr = this.data.currentRulesStr;
      let ruleBuyNum = this.data.ruleBuyNum;
      let img = this.data.productData.img;
      let title = this.data.productData.title;

      // 获取get_bage_datas云函数
      wx.cloud.callFunction({
        config: {
          env: "kai-fwor"
        },
        name: "get_bage_datas",
        success: (response) => {
          let bageDatas = response.result.data;

          // 判断数据库中是否存在pid和规则一样的数据，是就更新数量就行
          for (let i = 0; i < bageDatas.length; i++) {
            if (pid == bageDatas[i].pid) {
              if (currentRulesStr == bageDatas[i].currentRulesStr) {
                // 调用修改bage_datas数据库的云函数
                wx.cloud.callFunction({
                  config: {
                    env: "kai-fwor"
                  },
                  name: "update_bage_num",
                  data: {
                    _id: bageDatas[i]._id,
                    currentNum: ruleBuyNum
                  },
                  success: (res) => {
                    // console.log(res);
                  },
                  fail: (err) => {
                    console.log(err);
                  }
                })

                wx.showToast({
                  title: '成功修改商品数量~~',
                  mask: true,
                  icon: "none"
                });

                // 关闭规则弹窗
                this.setData({
                  isShowRulesBox: false
                })

                // 成功添加商品，给bage盒子加个动画效果
                this.triggerEvent("bounce", "animation-bounce");

                // 动画执行完，要把类名置空，即不执行动画
                setTimeout(() => {
                  this.triggerEvent("bounce", "");
                }, 700)

                return;
              }
            }
          }

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
            },
            success: () => {
              this.triggerEvent("bage-datas");
              wx.showToast({
                title: '加入购物车成功啦~~',
                mask: true
              });

              // 关闭规则弹窗
              this.setData({
                isShowRulesBox: false
              })

              // 成功添加商品，给bage盒子加个动画效果
              this.triggerEvent("bounce", "animation-bounce");

              // 动画执行完，要把类名置空，即不执行动画
              setTimeout(() => {
                this.triggerEvent("bounce", "");
              }, 700)
            },
            fail: (err) => {
              console.log(err);
              wx.hideLoading();
            }
          })
        },
        fail: (err) => {
          console.log(err);
          wx.hideLoading();
        }
      })
    },

    // 获取用户授权信息
    getuserinfo(res) {
      if (res.detail.userInfo) {
        // 授权成功，向父组件修改isAuth为true
        this.triggerEvent("change-is-auth");
      }
    },
  }
})
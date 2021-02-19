// components/rulesItem/rulesItem.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    itemRules: {
      // 类型验证
      type: Object,
      // 默认值
      value: {},
      // 把properties里面的itemRules作为data里面的selectedRule的初始值的写法
      observer(value){
        this.setData({
          selectedRule: value.rules[0]
        })
      }
    },
    itemIndex: {
      type: Number
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 记录当前选中的规则下标
    currentRuleIndex: 0,
    // 记录当前选中的规则项
    selectedRule: null,
  },

  // 组件生命周期
  lifetimes: {
    // 在组件在视图层布局完成后执行
    ready(){
      // console.log(this.data.itemRules);
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeRule(e){
      this.setData({
        currentRuleIndex: e.currentTarget.dataset.ruleIndex,
        selectedRule: e.currentTarget.dataset.ruleItem
      })

      // 子传父的自定义事件 sendSelectedRule
      this.triggerEvent("sendSelectedRule",{currentRulesItemIndex:this.data.itemIndex,currentRuleIndex: this.data.currentRuleIndex})
    }
  }
})

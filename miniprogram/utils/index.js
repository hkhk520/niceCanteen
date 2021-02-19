class Utils {
  // 小于10补零的方法
  fullZero(num) {
    return num < 10 ? "0" + num : num;
  }

  // 格式化时间的方法
  formatDate(time) {
    let date = new Date(time);
    let year = date.getFullYear();
    let month = this.fullZero(date.getMonth() + 1);
    let day = this.fullZero(date.getDate());
    let hours = this.fullZero(date.getHours());
    let minutes = this.fullZero(date.getMinutes());
    let seconds = this.fullZero(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // 计算所有数量 和 计算合计价格 的方法
  totalNumAndPrice(product) {
    // 记录所有数量
    let totalNum = 0;
    // 保存合计总价
    let totalPrice = 0;

    // 计算所有数量 和 计算合计价格
    product.forEach(item => {
      totalNum += item.ruleBuyNum;
      totalPrice += item.ruleBuyNum * item.price;
    });

    return {
      totalNum,
      totalPrice
    }
  }
}

export const utils = new Utils();
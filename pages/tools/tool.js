
var Config = {
  text: "watermark",
  rotate: 15,
  xSpace: 20,
  ySpace: 20,
  size: 20,
  xStart: -50,
  yStart: 20,
  opacity: .2,
  color: "#000",
  width: 500,
  height: 500,
  imgUrl: "",
  id: "",
  parent: null
},
  Context = null;
function extend(origin, target) {   //自定义拷贝模板
  for (var key in target) {
    target.hasOwnProperty(key) && (origin[key] = target[key]);
  }
  return origin;
}
function getCanvas() {    //获取画布的dome
  Context = wx.createCanvasContext(Config.id);
}
function drawImg() {     //编写画布的信息
  return new Promise(function (resolve, reject) {
    Context.setGlobalAlpha(1);   //设置全局画笔透明度。 1完全不透明滚
    Context.scale(1, 1);   //缩放的倍数
    Context.drawImage(Config.imgUrl, 0, 0, Config.width, Config.height);//图片到画布上面，横纵坐标起点，画布中图片的宽高度
    Context.setFillStyle(Config.color);  //填充的颜色
    Context.setFontSize(Config.size);   //字体的字号
    Context.rotate(Math.PI / 180 * Config.rotate);   // 旋转度数
    Context.setGlobalAlpha(Config.opacity);    //透明度     （重复了把）
    if (Config.scale < 1) {
      Context.scale(Config.scale, Config.scale);   //放大所有的倍数
    }
    insertMarks();     //触发画布里面的内容样式
    Context.draw();   //运行画布所有设定的代码
    resolve();
  });
}
function insertMarks() {   //第50行触发   为画布内容的样式    文字到画布内
  var xSpace = Config.xSpace,   //60
    ySpace = Config.ySpace,     //60 
    len = Config.text.length,   //输入框数字的长度   18
    textHeight = Config.size + ySpace,    //30+60= 90
    textWidth = Config.size * len + xSpace,  //30*18+60=600
    squareWidth = 0.72 * (Config.width + Config.height);//（屏幕宽度+画布高度）*0.72=501.877
  if (Config.scale < 1) {
    squareWidth /= Config.scale;   //501.877/0.71713=699.84
  }
  for (var y = Config.yStart; y < squareWidth + textHeight; y += textHeight) {
    for (var x = Config.xStart; x < squareWidth + textWidth; x += textWidth) {
      Context.fillText(Config.text, x, y);   //循环画布的内容
    }
  }
}



function mark(userConfig){
  userConfig = userConfig || {};
  Config = extend(Config, userConfig);
  return (getCanvas(), drawImg()); 
}
function removeMarks() {   //第78行触发
  Context.clearRect(0, 0, Config.width, Config.height);  //内容重新生成一个长度为屏幕宽度，高度为画布高度的画布
}

function markBtns(userConfig) {   //index。js  颜色按钮转接过来触发
  removeMarks();     //重新生成画布         
  userConfig = userConfig || {};
  Config = extend(Config, userConfig);    //也重新拷贝下user里面的config  是把通过点击颜色按钮的时候，点击那个按钮，就把哪个按钮的颜色穿过来  或者 通过内容输入改变的时候触发了
  return drawImg();   //触发画布里面多有的信息
}
module.exports = function () {
  return {
    mark: mark,
    markBtns: markBtns
  };
}
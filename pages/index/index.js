const WaterMarker = require('../tools/tool.js');

const WM = new WaterMarker();
function extend(origin, target) {   //自定义拷贝模板
  for (var key in target) {
    target.hasOwnProperty(key) && (origin[key] = target[key]);
  }
  return origin;
}
var Config = {
  colorMap: [
    ['0', '#ffffff'],
    ['1', '#979797'],
    ['2', '#000000']
  ],
  waterMarkConfig: {
    color: '#ffffff',
    opacity: 0.5
  },
  text: '请填写内容',
  debounce_Delay: 200
};
Page({
  data: {
    canvasW: 100,    //画布的宽度
    canvasH: 300,    //画布的高度
    focus: false,
    inputValue: '', 
    currentColorIndex: 0
  },
  onReady: function (event) {
    this.getDefaultConfig();
  },
  getDefaultConfig:function(){
    var colorType = Config.colorMap,
      waterMarkConfig = Config.waterMarkConfig,
      defaultColor = colorType.filter(function (color) {
        return color[1] == waterMarkConfig.color;
      });   //暂时保留着看下他的作用
    this.setData({
      ColorType: colorType,
      defaultColorIndex: defaultColor.length ? defaultColor[0][0] : -1, //暂时保留着看下他的作用
      inputWord: Config.text,
      text: Config.text, 
    });
  },
  touchImgstart: function (event) {  //点击照相机图标的时候触发
    this.setData({
      touch: event.changedTouches[0],   //获取点击的坐标位置  {"identifier":0,"pageX":280,"pageY":60.79999923706055,"clientX":280,"clientY":60.79999923706055}  pageX/clientX 设置或获取鼠标指针位置相对于当前窗口的 x 坐标
      touchStartTime: new Date()              //获取当前日期
    });
  },
  touchImgend: function (event) {   //点击照相机图标的时候触发
    var start = this.data.touch,
      end = event.changedTouches[0];
    var startTime = this.data.touchStartTime, endTime = new Date();
    if (endTime - startTime >= 350) {   //这一步干嘛用的没理解
      return;
    }
    if (Math.abs(start.clientX - end.clientX) < 10 && Math.abs(start.clientY - end.clientY) < 10) {
      this.chooseImg();  //触发选择图片  48行触发
    }
  },
  onLongTrap: function (res) {  //点击图片的时候有预览的功能
    var that = this;
    wx.showActionSheet({      //交互反馈  到时再注意下这个的作用
      itemList: ['预览', '保存'],
      success: function (res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0) {
          that.previewImg();
        }
        if (res.tapIndex == 1) {
          that.saveImg();
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    });
  },
  previewImg: function () {    //预览按钮直接触发
    if (!this.data.bg_BTNS) return false;
    wx.showLoading({
      title:'加载中'
    })
    // wx.showLoading({
    //   title: '加载中',
    // })
    wx.canvasToTempFilePath({   //把当前画布指定区域的内容导出生成指定大小的图片，并返回文件路径
      canvasId: 'myCanvas',
      destWidth: this.data.imgW,    //源图片宽度
      destHeight: this.data.imgH,     //源图片高度
      success: function (res) {
        wx.hideLoading();
        wx.previewImage({
          urls: [res.tempFilePath]  //需要预览的图片http链接列表
        })
      }
    });
  },
  chooseImg: function (event) {   //  选择图片的文件
    var that = this;
    wx.chooseImage({
      count: 1,
      success: function (res1) {
        wx.getImageInfo({
          src: res1.tempFilePaths[0],     //图片的链接 
          success: function (res) {
            var imgW = res.width,  // 源图片的宽度 502
                imgH = res.height;    // 源图片的高度   470
            var windowWidth = wx.getSystemInfoSync().windowWidth;   //屏幕的宽度 360

            var scale = windowWidth / imgW;  //屏幕宽度360/502图片的宽度=比值0.7171314741035857
            var canvasHeight = windowWidth * imgH / imgW;   //屏幕宽度360*470图片高度/502图片宽度=未知的的高度  ==scale*imgH=337
            that.setData({
              canvasW: windowWidth,   //画布宽度
              canvasH: canvasHeight,   //画布高度
              imgW: imgW,            //未知宽度
              imgH: imgH             //未知高度
            });

            var config = {
              text: that.data.text,    //画布上面的文字 
              id: "myCanvas",   //画布的id
              color: '#ffffff',   //字体颜色
              xStart: 0,
              yStart: -(res.width * 0.71),
              xSpace: 60,
              ySpace: 60,
              rotate: 45,   //旋转度数
              opacity: 0.5,   //透明度
              width: windowWidth,   //屏幕宽度
              height: canvasHeight,   //画布高度
              scale: scale,     //缩放倍数
              size: 30,     //字体大小
              imgUrl: res1.tempFilePaths[0]
            };
            config = Object.assign(config, Config.waterMarkConfig);  //进行拷贝  把第二个参数考到第一个参数里面，但是属于浅度拷贝，如果里面还有对象，那么当父对象中的子对象改变，那么这个被拷贝过来的里面子对象也会发生改变
            WM.mark(config).then(function () {
              // that.log(1);
              that.setData({
                bg_BTNS: true     //设置隐藏照相机图标
              });
              // if (that.data.currentColorIndex === -1 && that.data.defaultColorIndex !== -1) {
              //   that.setData({
              //     currentColorIndex: that.data.defaultColorIndex
              //   })
              // }
            });
          }
        })
      }
    });
  }, 
  bindKeyInput: debounce(function (e) {    
    this.setData({
      inputValue: e.detail.value
    })
    if (this.data.bg_BTNS) WM.markBtns({   //当有内容有输入的时候，就会触发画布的变化
      text: e.detail.value
    });
  }, Config.debounce_Delay), 

  onColor_type:function(e){
    var IdCo = e.target.id
    if (!IdCo) return;
    this.setData({
      currentColorIndex: IdCo
    })
    Config.waterMarkConfig.color = this.data.ColorType[IdCo][1];
    if (this.data.bg_BTNS) WM.markBtns({   //当有内容有输入的时候，就会触发画布的变化
      color: Config.waterMarkConfig.color
    });
  }, 
  onSize: debounce(function (e) {
    this.setData({
      size: e.detail.value
    }) 
    Config.waterMarkConfig.size = this.data.size;
    console.log(e.detail.value)
    if (this.data.bg_BTNS) WM.markBtns({   //当有内容有输入的时候，就会触发画布的变化
      size: e.detail.value
    }); 
  }, Config.debounce_Delay), 

  saveImg: function (event) {
    if (!this.data.bg_BTNS) return false;
    wx.showLoading({
      title: '保存中',
    });
    wx.canvasToTempFilePath({  //把当前画布指定区域的内容导出生成指定大小的图片
      canvasId: 'myCanvas',
      destWidth: this.data.imgW,
      destHeight: this.data.imgH,
      success: function (res) {
        wx.saveImageToPhotosAlbum({  //保存图片到系统相册
          filePath: res.tempFilePath,   //把生成的画布地址取出来放到保存链接里面去
          success: function (res) {
            wx.hideLoading();
            wx.showToast({
              title: '已保存到相册',
              icon: 'success',
              duration: 2000
            });
          }
        });
      }, fail: function (res) {
        wx.hideLoading();
        wx.showToast({
          title: '相册',
          icon: 'success',
          duration: 2000
        });
        console.log(res)
      }
    });
     
  },
})
function debounce(func, wait) {
  var timeout, args, context, timestamp, result; 
  var later = function () {
    var last = new Date().getTime() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    }
  }; 
  return function () {
    context = this;
    args = arguments;
    timestamp = new Date().getTime();
    if (!timeout) timeout = setTimeout(later, wait);
    return result;
  };
};
require('normalize.css/normalize.css');
require('styles/App.styl');

import React from 'react';
import ReactDOM from 'react-dom';

//引入图书数据文件
let imageDatas=require('../data/imageDatas.json');
/**
 * 将图片信息转换成URL路径信息
 */
imageDatas=(function genImage(imageDataArr){
  for(let i=0,j=imageDataArr.length;i<j;i++){
    var singleImageData=imageDataArr[i];
    singleImageData.imageURL=require('../images/'+singleImageData.fileName);
    imageDataArr[i]=singleImageData;
  }
  return imageDataArr;
})(imageDatas);
/**
 * 获取区间内的一个随机值
 * @param low
 * @param high
 * @returns {number}
 */
function grtRangeRandom (low,high) {
  return Math.ceil(Math.random()*(high-low)+low);
}
/**
 * 获取一个随机的旋转值正负30之间。
 * @returns {string}
 */
function getRandomRotate(){
  return (Math.random()>0.5?'':'-')+Math.ceil(Math.random()*30);
}
//图片舞台组件
class ImgFigure extends React.Component{
  /**
   * 点击图片翻转和移动到中心
   * @param e
   */
  handleClick(e){
   if(this.props.arrange.isCenter){
     this.props.inverse();
   }else{
     this.props.center();
   }

    e.stopPropagation();
    e.preventDefault();
}

  render(){
    var styleObj={};
    //如果props属性中指定了这张图片的位置，则使用
    if(this.props.arrange.pos){

      styleObj= this.props.arrange.pos;
    }
    //如果图片的旋转角度有值且不为0，添加旋转角度
    if (this.props.arrange.rotate) {
      (['MozTransform', 'msTransform', 'WebkitTransform', 'transform']).forEach(function (value) {
        styleObj[value] = 'rotate(' + this.props.arrange.rotate + 'deg)';
      }.bind(this));
    }

    if(this.props.arrange.isCenter){
      styleObj.zIndex=11;
    }

      var imgFigureClassName='img-figure';
      imgFigureClassName+=this.props.arrange.isInverse ? ' is-inverse':'';
    return(
      <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick.bind(this)}>
          <img src={this.props.data.imageURL} alt={this.props.data.title}/>
          <figcaption>
              <h2 className="img-title">{this.props.data.title}</h2>
            <div className="img-back" onClick={this.handleClick.bind(this)}>
              <p>
                {this.props.data.desc}
              </p>
            </div>
          </figcaption>
      </figure>
    )
}
}
/**
 * 控制组件
 */
class ControllerUnit extends React.Component{
 handleClick(e){
   //如果点击的是当前正在选中状态的按钮 则翻转图片，否则将对应的图片居中
   if(this.props.arrange.isCenter){
     this.props.inverse();
   }else{
     this.props.center();
   }
   e.preventDefault();
   e.stopPropagation();
 }

  render(){
   var controlelrUnitClassName = 'controller-unit';
   //如果对应的是居中的图片，显示控制按钮的居中态
   if(this.props.arrange.isCenter){
     controlelrUnitClassName+=' is-center';
     //如果同时对应的是翻转图片，显示控制按钮的翻转态
     if(this.props.arrange.isInverse){
       controlelrUnitClassName+=' is-inverse';
      }
   }

    return(
      <span className={controlelrUnitClassName} onClick={this.handleClick.bind(this)}></span>
    );
  }
}

class AppComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state ={

        imgsArrangeArr:[]
        /*
         {
         pos: {
         left: 0,
         right: 0
         },
         rotate: 0,
         isInverse: false //图片正反面
         },
         isCenter:false
         */


    }
    this.Constant={//给图片初始化位置数据
      centerPos:{//中心图片位置点
        left:0,
        right:0
      },
      hPosRange:{//水平方向的取值范围
        leftSecX:[0,0],
        rightSecX:[0,0],
        y:[0,0]
      },
      vPosRange:{//垂直方向的取值范围
        x:[0,0],
        topY:[0,0]
      }
    }
  }



  /**
   * 翻转图片
   * @param index index输入当前被执行iniverse操作的图片对应的图片信息数组的index值
   * @returns {function(this:AppComponent)}这是一个闭包函数，其内return一个真正等待被执行的函数
   */
  inverse(index){
  return function () {
    var imgsArrangeArr=this.state.imgsArrangeArr;
    imgsArrangeArr[index].isInverse=!imgsArrangeArr[index].isInverse;
    this.setState({
      imgsArrangeArr:imgsArrangeArr
    });
  }.bind(this);
}

  /**
   * 利用rearange函数， 居中对应的index图片
   * @param index 需要被居中图片对应的图片信息数组的index值
   * @returns {function(this:AppComponent)}
   */
  center(index){
    return function () {
      this.rearrange(index);
    }.bind(this)
}
  /**
   *重新布局所有图片
   * @param centerIndex 指定居中排布那个图片
   */
  rearrange(centerIndex){
    var imgsArrangeArr=this.state.imgsArrangeArr;
    var Constant=this.Constant;
    var centerPos=Constant.centerPos,
          hPosRange=Constant.hPosRange,
          vPosRange=Constant.vPosRange,
          hPosRangeLeftSecX=hPosRange.leftSecX,
          hPosRangeRightSecX=hPosRange.rightSecX,
          hPosRangeY=hPosRange.y,
          vPosRangeTopy=vPosRange.topY,
          vPosRangeX=vPosRange.x,

          imgsArrangeTopArr=[],
          topImgNum=Math.floor(Math.random()*2),//取一个或者不取
          topImgSpliceIndex=0,

          imgsArrangeCenterArr=imgsArrangeArr.splice(centerIndex,1);
          //首先居中centerIndex的图片
          imgsArrangeCenterArr[0]={
            pos:centerPos,
            rotate:0,
            isCenter:true
          }
          //中间图片不需要旋转

          //取出布局上侧图片的状态信息
          topImgSpliceIndex=Math.ceil(Math.random()*(imgsArrangeArr.length-topImgNum));
          imgsArrangeTopArr=imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);
          //布局位于上侧的图片
          imgsArrangeTopArr.forEach(function (value,index) {
            imgsArrangeTopArr[index]={
              pos:{
                top:grtRangeRandom(vPosRangeTopy[0],vPosRangeTopy[1]),
                left:grtRangeRandom(vPosRangeX[0],vPosRangeX[1])
              },
              rotate:getRandomRotate(),
              isCenter:false
            }

          })
          //布局左右两侧的图片
          for(let i=0,j=imgsArrangeArr.length,k=j/2;i<j;i++){
            var hPosRangeLORX = null;
            //前半部分布局左边  后半部分布局右边
            if(i<k){
              hPosRangeLORX=hPosRangeLeftSecX;
            }else{
              hPosRangeLORX=hPosRangeRightSecX;
            }
            imgsArrangeArr[i]={
              pos:{
                top:grtRangeRandom(hPosRangeY[0],hPosRangeY[1]),
                left:grtRangeRandom(hPosRangeLORX[0],hPosRangeLORX[1])
              },
              rotate:getRandomRotate(),
              isCenter:false
            }
          }

            //把上侧和中心的图片添加回图片数组里
            if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
              imgsArrangeArr.splice(topImgSpliceIndex,0,imgsArrangeTopArr[0]);
            }
            imgsArrangeArr.splice(centerIndex,0,imgsArrangeCenterArr[0]);
            this.setState({
              imgsArrangeArr:imgsArrangeArr
            })
}

  //组件加载以后为每张图片初始其位置，这个函数是在DOM渲染完成之后调用的
  componentDidMount() {
    //首先拿到舞台的大小
    var stageDOM = this.refs.stage;
    var stageW = stageDOM.scrollWidth;
    var stageH = stageDOM.scrollHeight;
    var halfStageW = Math.ceil(stageW / 2);
    var halfStageH = Math.ceil(stageH / 2);

    //拿到一个imgfigure的大小
    var imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0);
    var imgW = imgFigureDOM.scrollWidth;
    var imgH = imgFigureDOM.scrollHeight;
    var halfImgW = Math.ceil(imgW / 2);
    var halfImgH = Math.ceil(imgH / 2);

    //计算中心图片的位置点
    this.Constant.centerPos = {
      left: halfStageW - halfImgW,
      top: halfStageH - halfImgH
    }
    //计算左侧右侧图片排布位置的取值范围
    this.Constant.hPosRange.leftSecX[0] = -halfImgW;
    this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
    this.Constant.hPosRange.rightSecX[0]= halfStageW+halfImgW;
    this.Constant.hPosRange.rightSecX[1]=stageW-halfImgW;
    this.Constant.hPosRange.y[0]=-halfImgH;
    this.Constant.hPosRange.y[1]=stageH-halfImgH;
    //计算上册图片排布位置的取值范围
    this.Constant.vPosRange.topY[0]=-halfImgH;
    this.Constant.vPosRange.topY[1]=halfStageH-halfImgH*3;
    this.Constant.vPosRange.x[0]=halfStageW-imgW;
    this.Constant.vPosRange.x[1]=halfStageW;
    this.rearrange(0);
  }
  render() {
    var controllerUnits=[];
    var imageFigures=[];
    //循坏图片数据并添加到图片组件中
    imageDatas.forEach(function(value,index){
      if(!this.state.imgsArrangeArr[index]){
        this.state.imgsArrangeArr[index]={
          pos:{
            left:0,
            top:0
          },
          rotate:0,
          isInverse:false,
          isCenter:false
        }
      }

      imageFigures.push(<ImgFigure key={index}
                                   ref={'imgFigure' + index}
                                   data={value}
                                   arrange={this.state.imgsArrangeArr[index]}
                                   inverse = {this.inverse(index)}  //多次修改this绑定！！
                                   center ={this.center(index)}/>)//!!!!重点！！！循环多个子元素需添加key,用来更新Dom// 静态组件不必添加，动态组件必须添加而且不要用index
      controllerUnits.push(<ControllerUnit key={index} arrange={this.state.imgsArrangeArr[index]} inverse = {this.inverse(index)} center ={this.center(index)}/>)
    }.bind(this));
    return (
        <section className="stage" ref="stage">
            <section className="img-sec" >
              {imageFigures}
            </section>
            <nav className="controller-nav">
              {controllerUnits}
            </nav>
        </section>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;

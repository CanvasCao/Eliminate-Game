/**
 * Created by Danny on 2015年9月13日10:12:42
 */
(function () {
    //中介者模式
    window.Game = Class.extend({
        // 初始化
        init: function (params) {
            //游戏状态。
            //A表示静默，等待用户操作
            //B表示进行消除判断
            //C表示能消除，进行消除动画，元素下落，补新的元素

            this.state = "B";

            //画布、上下文，都是game的属性
            this.canvas = document.getElementById(params.canvasid);
            this.ctx = this.canvas.getContext("2d");
            //帧率
            this.fps = params.fps;
            //自己的帧管理器
            this.frameUtil = new FrameUtil();
            //静态资源管理
            var sr = new StaticResoucesUtil();
            //这个对象里面，存放着所有图片
            this.images = null;
            var self = this;
            sr.loadImages("r.json", function (alreayNum, allNum, images) {
                //这个函数，将执行3次（因为一共有3张图片）
                self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
                self.ctx.font = "20px 微软雅黑";
                self.ctx.fillText("正在加载图片资源，当前" + alreayNum + " / " + allNum, 20, 40);
                //当全部图片已经加载完毕，那么开始游戏
                if (alreayNum == allNum) {
                    self.run();
                    self.images = images;
                }
            });
        },
        //开始
        run: function () {
            //测试地图
            this.map = new Map();

            //设置主循环
            var self = this;
            this.timer = setInterval(function () {
                self.mainloop();
            }, 1000 / this.fps);
        },
        // 每帧执行
        mainloop: function () {
            //清除屏幕
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            //让自己的帧管理器更新
            this.frameUtil.update();
            //打印帧编号
            this.ctx.fillText(this.frameUtil.currentFrame, 10, 20);
            //打印游戏状态
            this.ctx.fillText(this.state, 10, 40);
            //实时打印鸟瞰矩阵
            //for (var row = 0; row < 5; row++) {
            //    for (var col = 0; col < 6; col++) {
            //        this.ctx.fillText(this.map.aerialMap[row][col],60 * col,60+ 20 * row);
            //    }
            //}

            //渲染小钻石（这个方法，里面会先让所有的小钻石update）
            this.map.renderAllDiamonds();

            //每帧都要看一看当前游戏是什么状态
            if (this.state == "B") {
                //游戏状态是B，判断是否能消除
                var canBeBomb = this.map.check();   //消除判断
                if (canBeBomb.length > 0) {
                    this.state = "C";
                    //如果存在可以被消除的元素
                    //显示爆炸动画。需要12帧。
                    this.map.makeBomb(canBeBomb);
                    //新元素补充，12帧爆炸动画，10帧是下落动画
                    this.map.supply();
                } else {
                    //不存在可以被先出的元素
                    this.state = "A";
                }
            }
        },
        stop: function () {
            clearInterval(this.timer);
        }
    });
})();
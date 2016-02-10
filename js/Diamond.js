/**
 * Created by Danny on 2015/9/15 14:57.
 */
(function () {
    //钻石类
    window.Diamond = Class.extend({
        //row 行， 合法值0~4
        //col 列， 合法值0~5
        //color 颜色，合法值0~3
        init: function (row, col, color) {
            //行、列、颜色
            this.row = row;
            this.col = col;
            this.color = color;
            //当前的坐标
            this.x = 38 + this.col * 49;
            this.y =  170 + 49 * this.row;
            //坐标增量
            this.dX = 0;
            this.dY = 0;
            //是否处于爆炸状态
            this.bombing = false;
            //爆破逐帧动画 1~6
            this.bombAnimate = 1;
        },
        // update函数，每帧执行。
        update : function(){
            //反映增量
            this.x += this.dX;
            this.y += this.dY;

            //爆破序号
            if(this.bombing && this.bombAnimate < 6 && game.frameUtil.currentFrame % 2  == 0){
                this.bombAnimate++;
            }
        },
        // 画布每帧都是clearRect，所以这个render函数每帧执行。
        render: function () {
            if(!this.bombing){
                //渲染在画布上。没有爆炸。
                game.ctx.drawImage(game.images["zuanshi" + this.color],this.x ,this.y);
            }else{
                //如果在爆炸，那么显示逐帧动画
                game.ctx.drawImage(game.images["an" + this.bombAnimate],this.x - 65,this.y - 65);
            }
        },
        //移动到目标行、列上。用10帧运动完毕。
        //不管移动多远，都用10帧，移动完毕。
        moveTo: function (row,col) {
            //目标坐标
            this.targetX =  38 + col * 49;
            this.targetY =  170 + row * 49;
            //我们规定是10帧，执行完毕动画，所以每一步的长度，就是总路程差除以10
            this.dX = (this.targetX - this.x) / 10;
            this.dY = (this.targetY - this.y) / 10;

            var self = this;
            //预约10帧之后，自己停掉。
            game.frameUtil.orderDoSomethingFrameLater(10,function(){
                self.stop();
            });
        },
        //停止动画：
        stop : function(){
            this.dX = 0;
            this.dY = 0;
        },
        //爆炸
        bomb : function(){
            this.bombing = true;
        }
    });
})();
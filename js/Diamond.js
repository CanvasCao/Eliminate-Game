/**
 * Created by Danny on 2015/9/15 14:57.
 */
(function () {
    //��ʯ��
    window.Diamond = Class.extend({
        //row �У� �Ϸ�ֵ0~4
        //col �У� �Ϸ�ֵ0~5
        //color ��ɫ���Ϸ�ֵ0~3
        init: function (row, col, color) {
            //�С��С���ɫ
            this.row = row;
            this.col = col;
            this.color = color;
            //��ǰ������
            this.x = 38 + this.col * 49;
            this.y =  170 + 49 * this.row;
            //��������
            this.dX = 0;
            this.dY = 0;
            //�Ƿ��ڱ�ը״̬
            this.bombing = false;
            //������֡���� 1~6
            this.bombAnimate = 1;
        },
        // update������ÿִ֡�С�
        update : function(){
            //��ӳ����
            this.x += this.dX;
            this.y += this.dY;

            //�������
            if(this.bombing && this.bombAnimate < 6 && game.frameUtil.currentFrame % 2  == 0){
                this.bombAnimate++;
            }
        },
        // ����ÿ֡����clearRect���������render����ÿִ֡�С�
        render: function () {
            if(!this.bombing){
                //��Ⱦ�ڻ����ϡ�û�б�ը��
                game.ctx.drawImage(game.images["zuanshi" + this.color],this.x ,this.y);
            }else{
                //����ڱ�ը����ô��ʾ��֡����
                game.ctx.drawImage(game.images["an" + this.bombAnimate],this.x - 65,this.y - 65);
            }
        },
        //�ƶ���Ŀ���С����ϡ���10֡�˶���ϡ�
        //�����ƶ���Զ������10֡���ƶ���ϡ�
        moveTo: function (row,col) {
            //Ŀ������
            this.targetX =  38 + col * 49;
            this.targetY =  170 + row * 49;
            //���ǹ涨��10֡��ִ����϶���������ÿһ���ĳ��ȣ�������·�̲����10
            this.dX = (this.targetX - this.x) / 10;
            this.dY = (this.targetY - this.y) / 10;

            var self = this;
            //ԤԼ10֮֡���Լ�ͣ����
            game.frameUtil.orderDoSomethingFrameLater(10,function(){
                self.stop();
            });
        },
        //ֹͣ������
        stop : function(){
            this.dX = 0;
            this.dY = 0;
        },
        //��ը
        bomb : function(){
            this.bombing = true;
        }
    });
})();
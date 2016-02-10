/**
 * Created by Danny on 2015/9/15 14:57.
 */
(function () {
    //地图类
    window.Map = Class.extend({
        //row 行， 合法值0~4
        //col 列， 合法值0~5
        //color 颜色，合法值1~4
        init: function () {
            //地图。鸟瞰地图。是一个抽象的矩阵。
            //应该保证这个矩阵和下面的真实钻石矩阵，一一对应。
            this.aerialMap = [
                [1, 2, 3, 0, 1, 2],
                [2, 2, 2, 2, 1, 1],
                [1, 2, 3, 3, 1, 2],
                [3, 1, 1, 1, 0, 1],
                [1, 3, 1, 3, 3, 3]
            ];
            //存放真实钻石的数组
            this.diamondArray = [
                [null, null, null, null, null, null],
                [null, null, null, null, null, null],
                [null, null, null, null, null, null],
                [null, null, null, null, null, null],
                [null, null, null, null, null, null]
            ];

            //让地图中的真实钻石矩阵，和鸟瞰矩阵相同。
            this.updateDiamondArrayByAerialMap();
            //绑定监听
            this.bindListener();
        },
        //根据地图来更改真实钻石数组的内容
        updateDiamondArrayByAerialMap: function () {
            //遍历鸟瞰矩阵，然后把钻石矩阵生成
            for (var row = 0; row < 5; row++) {
                for (var col = 0; col < 6; col++) {
                    var color = this.aerialMap[row][col];
                    this.diamondArray[row][col] = isNaN(color) ? null : new Diamond(row, col, color);
                }
            }
        },
        //渲染所有的钻石（渲染之前，会刷新所有的钻石）
        renderAllDiamonds: function () {
            for (var row = 0; row < 5; row++) {
                for (var col = 0; col < 6; col++) {
                    this.diamondArray[row][col] && this.diamondArray[row][col].update();
                    this.diamondArray[row][col] && this.diamondArray[row][col].render();
                }
            }
        },
        //函数的功能就是让canBeBomb数组中的钻石都爆炸，有12帧的爆炸动画。
        //爆炸动画结束后，会把两个矩阵中爆炸的元素设为NaN和null。
        //老元素都下落
        makeBomb: function (canBeBomb) {
            var self = this;
            for (var i = 0; i < canBeBomb.length; i++) {
                var d = canBeBomb[i];
                d.bomb();   //爆炸
            }

            //从blockArray数组中删除已经爆炸的元素(把那一项设置为null)
            //从aerialMap中也要删除已经爆炸的元素
            game.frameUtil.orderDoSomethingFrameLater(12, function () {
                //console.log(canBeBomb.length);
                for (var i = 0; i < canBeBomb.length; i++) {
                    var d = canBeBomb[i];
                    //从数组中删除它
                    self.diamondArray[d.row][d.col] = null;
                    self.aerialMap[d.row][d.col] = NaN;
                }

                //设置一个新的鸟瞰矩阵
                var tttt = [
                    [NaN, NaN, NaN, NaN, NaN, NaN],
                    [NaN, NaN, NaN, NaN, NaN, NaN],
                    [NaN, NaN, NaN, NaN, NaN, NaN],
                    [NaN, NaN, NaN, NaN, NaN, NaN],
                    [NaN, NaN, NaN, NaN, NaN, NaN]
                ];
                //老元素下落
                for (var row = 0; row < 5; row++) {
                    for (var col = 0; col < 6; col++) {
                        var d = self.diamondArray[row][col];
                        var downRowNumber = 0; //统计下落几行
                        //就是统计这个小钻石，下面有多少NaN
                        for (var j = row + 1; j < 5; j++) {
                            if (isNaN(game.map.aerialMap[j][col])) {
                                downRowNumber++;
                            }
                        }
                        //移动
                        d && d.moveTo(d.row + downRowNumber, col);
                        //鸟瞰矩阵的一个归并
                        d && (tttt[row + downRowNumber][col] = d.color);
                    }
                }
                //重新设置鸟瞰矩阵
                self.aerialMap = tttt;
            });
        },
        //补充新元素
        supply: function () {
            game.frameUtil.orderDoSomethingFrameLater(22, function () {
                //命令钻石矩阵更新
                game.map.updateDiamondArrayByAerialMap();
                //遍历每个列，分别检测每个列有多少NaN
                for (var col = 0; col < 6; col++) {
                    for (var row = 0; row < 5; row++) {
                        if (isNaN(game.map.aerialMap[row][col])) {
                            //在鸟瞰矩阵如果是NaN的位置，对应的钻石矩阵new出来一个新的
                            var c = _.random(0, 3);
                            //现在-3行的位置就位
                            game.map.diamondArray[row][col] = new Diamond(-3, col, c);
                            game.map.aerialMap[row][col] = c;
                            //向下落到自己的位置
                            game.map.diamondArray[row][col].moveTo(row, col);

                            //下落动画结束之后，将游戏的状态改为B
                            game.frameUtil.orderDoSomethingFrameLater(10, function () {
                                game.map.updateDiamondArrayByAerialMap();
                                game.state = "B";
                            });
                        }
                    }
                }
            });
        },
        //判断当前的鸟瞰矩阵是否能够消除钻石。
        //也就是说，判断这个arr中，是不是有连续的3个或者3个以上的元素相同。
        //返回能够被消除的钻石的数组。数组里面存放的是对象。
        //[d,d,d,d,d]
        check: function () {
            //设置一个数组，存放结果，就是能够被消除的钻石
            var canBeBomb = [];
            //按行来遍历，看看每行有没有钻石相同
            for (var row = 0; row < 5; row++) {
                //每行初始化，小游标的值，就是第一个钻石的颜色值
                var s = this.aerialMap[row][0];
                var a = 0;
                var b = 0;
                //这一行的每一个元素
                for (var col = 1; col < 6; col++) {
                    //判断遍历的这个元素，和游标是否相同
                    if (this.aerialMap[row][col] == s) {
                        //和游标相同
                        //b标记变为当前列号
                        b = col;
                    } else {
                        //比较的这个元素，和小游标不相同
                        s = this.aerialMap[row][col];
                        a = col;
                    }
                    //判断a、b游标的位置
                    if (b - a >= 2) {
                        //console.log("第" + row + "行" + "从" + a + "列到" + b + "列相同");
                        //将所有的a、b卡主的元素，放入结果数组
                        for (var i = a; i <= b; i++) {
                            canBeBomb.push(this.diamondArray[row][i]);
                        }
                    }
                }
            }

            //按列来遍历，看看每行有没有钻石相同
            for (var col = 0; col < 6; col++) {
                //每行初始化，小游标的值，就是第一个钻石的颜色值
                var s = this.aerialMap[0][col];
                var a = 0;
                var b = 0;
                //这一行的每一个元素
                for (var row = 1; row < 5; row++) {
                    //判断遍历的这个元素，和游标是否相同
                    if (this.aerialMap[row][col] == s) {
                        //和游标相同
                        //b标记变为当前列号
                        b = row;
                    } else {
                        //比较的这个元素，和小游标不相同
                        s = this.aerialMap[row][col];
                        a = row;
                    }
                    //判断a、b游标的位置
                    if (b - a >= 2) {
                        //console.log("第" + col + "行" + "从" + a + "行到" + b + "行相同");
                        //将所有的a、b卡主的元素，放入结果数组
                        for (var i = a; i <= b; i++) {
                            canBeBomb.push(this.diamondArray[i][col]);
                        }
                    }
                }
            }

            //console.log(_.uniq(canBeBomb));
            //返回数组中所有不相同的项目：
            return _.uniq(canBeBomb);
        },
        //交换两个钻石的位置，如果交换之后，能够消除，那么继续消除
        //如果不能够消除，那么就显示返回的动画
        swap: function (arow, acol, brow, bcol) {
            if (arow >= 0 && arow <= 4 && brow >= 0 && brow <= 4) {
                if (acol >= 0 && acol <= 5 && bcol >= 0 && bcol <= 5) {
                    game.map.updateDiamondArrayByAerialMap();
                    this.diamondArray[arow][acol].moveTo(brow, bcol);
                    this.diamondArray[brow][bcol].moveTo(arow, acol);

                    var temp = this.aerialMap[brow][bcol];
                    this.aerialMap[brow][bcol] = this.aerialMap[arow][acol];
                    this.aerialMap[arow][acol] = temp;

                    game.frameUtil.orderDoSomethingFrameLater(10, function () {
                        if (game.map.check().length > 0) {
                            game.map.updateDiamondArrayByAerialMap();
                            game.state = "B";
                        } else {
                            game.map.updateDiamondArrayByAerialMap();
                            game.map.diamondArray[arow][acol].moveTo(brow, bcol);
                            game.map.diamondArray[brow][bcol].moveTo(arow, acol);
                            //不能消除
                            var temp = game.map.aerialMap[brow][bcol];
                            game.map.aerialMap[brow][bcol] = game.map.aerialMap[arow][acol];
                            game.map.aerialMap[arow][acol] = temp;
                        }
                    });

                }
            }
        },
        bindListener: function () {
            var self = this;
            var startX, startY;
            var arow, acol;
            var brow, bcol;
            var lock;

            game.canvas.addEventListener("mousedown", function (e) {
                arow = parseInt((e.offsetY - 170) / 49);
                acol = parseInt((e.offsetX - 38) / 49);

                startX = e.offsetX;
                startY = e.offsetY;

                //按下鼠标键，移动鼠标
                game.canvas.addEventListener("mousemove", mousemoveHandler);
            });

            function mousemoveHandler(e) {
                if (!lock) {
                    return;
                }

                if (e.offsetX - startX > 20) {
                    //往右滑动了
                    brow = arow;
                    bcol = acol + 1;
                    game.map.swap(arow, acol, brow, bcol);
                    lock = false;
                } else if (e.offsetX - startX < -20) {
                    //往左滑动了
                    brow = arow;
                    bcol = acol - 1;
                    game.map.swap(arow, acol, brow, bcol);
                    lock = false;
                } else if (e.offsetY - startY > 20) {
                    //往下滑动了
                    brow = arow + 1;
                    bcol = acol;
                    game.map.swap(arow, acol, brow, bcol);
                    lock = false;
                } else if (e.offsetY - startY < -20) {
                    //往上滑动了
                    brow = arow - 1;
                    bcol = acol;
                    game.map.swap(arow, acol, brow, bcol);
                    lock = false;
                }

            }

            //鼠标键抬起，去掉监听
            game.canvas.addEventListener("mouseup", function (e) {
                lock = true;
                game.canvas.removeEventListener("mousemove", mousemoveHandler);
            });
        }
    });
})();
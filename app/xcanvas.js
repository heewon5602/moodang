(function(){
// Andrea Giammarchi - Mit Style License

// 캔버스 2D 렌더링 컨텍스트에 추가할 메서드들을 정의
var extend = {
    // 원에 관한 메서드
    circle:function(aX, aY, aDiameter){
        this.ellipse(aX, aY, aDiameter, aDiameter);
    },
    fillCircle:function(aX, aY, aDiameter){
        this.beginPath();
        this.circle(aX, aY, aDiameter);
        this.fill();
    },
    strokeCircle:function(aX, aY, aDiameter){
        this.beginPath();
        this.circle(aX, aY, aDiameter);
        this.stroke();
    },
    // 타원에 관한 메서드
    ellipse:function(aX, aY, aWidth, aHeight){
        var hB = (aWidth / 2) * .5522848,
            vB = (aHeight / 2) * .5522848,
            eX = aX + aWidth,
            eY = aY + aHeight,
            mX = aX + aWidth / 2,
            mY = aY + aHeight / 2;
        this.moveTo(aX, mY);
        this.bezierCurveTo(aX, mY - vB, mX - hB, aY, mX, aY);
        this.bezierCurveTo(mX + hB, aY, eX, mY - vB, eX, mY);
        this.bezierCurveTo(eX, mY + vB, mX + hB, eY, mX, eY);
        this.bezierCurveTo(mX - hB, eY, aX, mY + vB, aX, mY);
        this.closePath();
    },
    fillEllipse:function(aX, aY, aWidth, aHeight){
        this.beginPath();
        this.ellipse(aX, aY, aWidth, aHeight);
        this.fill();
    },
    strokeEllipse:function(aX, aY, aWidth, aHeight){
        this.beginPath();
        this.ellipse(aX, aY, aWidth, aHeight);
        this.stroke();
    },
    // 다각형 메서드
    polygon:function(pts) {
        var npts = pts.length;
        if (npts & 1) npts--;
        npts /= 2;
        if (npts <= 1)
          return;

        this.moveTo (pts[0], pts[1]);
        for (var n = 1; n < npts; n++)
          this.lineTo (pts[n*2+0], pts[n*2+1]);
    },
    fillPolygon:function(pts) {
        this.beginPath ();
        this.polygon (pts);
        this.fill ();
    },
    strokePolygon:function(pts) {
        this.beginPath ();
        this.polygon (pts);
        this.stroke ();
    },
    // 상자 형태의 호
    boxedArc: function(x, y, w, h, startAngle, sweepAngle, counterClockWise) {
        this.save ();
        this.scale (w / h, h / w);
        this.arc (x+w/2, y+h/2, w/2, startAngle, startAngle + sweepAngle, counterClockWise);
        this.restore ();
    },
    fillBoxedArc: function(x, y, w, h, startAngle, sweepAngle) {
        this.beginPath ();
        this.boxedArc (x, y, w, h, startAngle, sweepAngle, counterClockWise);
        this.fill ();
    },
    strokeBoxedArc: function(x, y, w, h, startAngle, sweepAngle, counterClockWise) {
        this.beginPath ();
        this.boxedArc (x, y, w, h, startAngle, sweepAngle, counterClockWise);
        this.stroke ();
    }
};

// CanvasRenderingContext2D에 위에서 정의한 메서드들을 추가
for(var key in extend)
    CanvasRenderingContext2D.prototype[key] = extend[key];

// quirks 객체는 CanvasRenderingContext2D에 기본적으로 없는 메서드를 보충하기 위한 객체입니다.
var quirks = {
    // 텍스트의 너비를 측정합니다.
    measureText: function(str) {
        return this.mozMeasureText(str);
    },
    // 주어진 좌표에 텍스트를 채워넣습니다.
    fillText: function(str, x, y) {
        this.beginPath ();
        this.drawText (str, x, y);
        this.fill ();
    },
    // 주어진 좌표에 텍스트의 윤곽선을 그립니다.
    strokeText: function (str, x, y) {
        this.beginPath ();
        this.drawText (str, x, y);
        this.stroke ();
    },
    // 텍스트를 그리는 메서드입니다.
    drawText: function (str, x, y) {
        // 폰트 스타일이 설정되어 있으면, 그 스타일을 적용합니다.
        if (this.font)
            this.mozTextStyle = this.font;

        // 텍스트 정렬이 'center'인 경우 텍스트의 너비의 절반만큼 x 좌표를 감소시켜 중앙 정렬합니다.
        if (this.textAlignment == 'center')
            x -= this.measureText (str) / 2;
        // 텍스트 정렬이 'right'인 경우 텍스트의 너비만큼 x 좌표를 감소시켜 오른쪽 정렬합니다.
        else if (this.textAlignment == 'right')
            x = this.width - this.measureText(str);

        // 현재 캔버스의 상태를 저장합니다.
        this.save ();
        // 주어진 x, y 좌표로 캔버스를 이동시킵니다.
        this.translate (x, y);
        // 텍스트를 그립니다.
        this.mozPathText (str);
        // 캔버스의 상태를 복원합니다.
        this.restore ();
    }
};

// quirks 객체에 정의된 메서드를 CanvasRenderingContext2D의 프로토타입에 추가합니다.
// 이미 동일한 이름의 메서드가 존재하지 않는 경우에만 추가합니다.
for(var key in quirks) {
    if (!CanvasRenderingContext2D.prototype[key]) {
        CanvasRenderingContext2D.prototype[key] = quirks[key];
    }
}

// G_vmlCanvasManager가 정의되어 있지 않다면, 초기화 메서드를 가진 빈 객체로 정의합니다.
if(!this.G_vmlCanvasManager)
    G_vmlCanvasManager = {init:function(){}, initElement:function(el){return el}};
})();
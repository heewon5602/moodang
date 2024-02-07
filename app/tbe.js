// TBE JS 라이브러리 - 일반적인 유틸리티 메소드들
var TBE = {
  
  // 캔버스 요소를 생성하는 함수
  CreateCanvasElement: function ()
  {
    var canvas = document.createElement('canvas');  // 캔버스 요소를 만든다.
    canvas.style.position = 'absolute';  // 캔버스의 위치를 'absolute'로 설정한다.
    return canvas;  // 캔버스 요소를 반환한다.
  },

  // 주어진 크기의 정사각형 캔버스 요소를 생성하는 함수
  CreateSquareCanvasElement: function (size)
  {
    var canvas = TBE.CreateCanvasElement ();  // 캔버스 요소를 생성한다.

    canvas.setAttribute ('width', size);  // 캔버스의 너비를 설정한다.
    canvas.setAttribute ('height', size);  // 캔버스의 높이를 설정한다.

    return canvas;  // 캔버스 요소를 반환한다.
  },

  // 주어진 요소의 2D 컨텍스트를 얻는 함수
  // 요소의 ID나 DOM 객체를 받아온다.
  GetElement2DContext: function (element)
  {
    if (typeof (element) != 'object')
      element = document.getElementById (element);  // 문자열이면 요소의 ID로 DOM 요소를 가져온다.

    if (element && element.getContext)
      return element.getContext('2d');  // 요소의 2D 컨텍스트를 반환한다.

    return null;  // 해당 요소가 없거나 2D 컨텍스트를 가져올 수 없는 경우 null을 반환한다.
  },

  // 캔버스를 지우는 함수, w3c 스펙을 따른다.
  // 요소의 ID나 DOM 객체를 받아온다.
  ClearCanvas: function (element)
  {
    if (typeof (element) != 'object')
      element = document.getElementById(element);  // 문자열이면 요소의 ID로 DOM 요소를 가져온다.

    if (element)
      element.setAttribute ('width', element.getAttribute ('width'));  // 캔버스의 너비를 다시 설정하여 내용을 지운다.
  },

  defaultView: null,  // defaultView를 캐시한다 (jQuery와 같은 방식)

  // 주어진 요소의 계산된 스타일을 가져오는 함수
  GetElementComputedStyle: function (element)
  {
    if (!this.defaultView) this.defaultView = document.defaultView;  // defaultView가 없으면 document의 defaultView를 가져온다.
    if (this.defaultView && this.defaultView.getComputedStyle)
      return this.defaultView.getComputedStyle (element, null);  // 요소의 계산된 스타일을 반환한다.

    return null;  // 계산된 스타일을 가져올 수 없는 경우 null을 반환한다.
  },

  // 각도를 라디안으로 변환하는 함수
  Deg2Rad: function (theta)
  {
    return theta * Math.PI / 180.0;  // 라디안으로 변환한 값을 반환한다.
  }
};
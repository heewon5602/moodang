// Sim.js - WebGL을 위한 간단한 시뮬레이터 (Three.js 기반)

Sim = {};

// Sim.Publisher - 이벤트 발행자를 위한 기본 클래스
Sim.Publisher = function() {
    this.messageTypes = {}; // 메시지 유형을 저장하는 객체
}

// 구독자를 추가하는 함수
Sim.Publisher.prototype.subscribe = function(message, subscriber, callback) {
    var subscribers = this.messageTypes[message]; 
    if (subscribers) {
        if (this.findSubscriber(subscribers, subscriber) != -1) {
            return;
        }
    } else {
        subscribers = [];
        this.messageTypes[message] = subscribers;
    }

    subscribers.push({ subscriber : subscriber, callback : callback });
}

// 구독자를 삭제하는 함수
Sim.Publisher.prototype.unsubscribe =  function(message, subscriber, callback) {
    if (subscriber) {
        var subscribers = this.messageTypes[message];
        if (subscribers) {
            var i = this.findSubscriber(subscribers, subscriber, callback);
            if (i != -1) {
                this.messageTypes[message].splice(i, 1);
            }
        }
    } else {
        delete this.messageTypes[message];
    }
}

// 메시지를 발행하는 함수
Sim.Publisher.prototype.publish = function(message) {
    var subscribers = this.messageTypes[message];
    if (subscribers) {
        for (var i = 0; i < subscribers.length; i++) {
            var args = [];
            for (var j = 0; j < arguments.length - 1; j++) {
                args.push(arguments[j + 1]);
            }
            subscribers[i].callback.apply(subscribers[i].subscriber, args);
        }
    }
}

// 구독자를 찾는 함수
Sim.Publisher.prototype.findSubscriber = function (subscribers, subscriber) {
    for (var i = 0; i < subscribers.length; i++) {
        if (subscribers[i] == subscriber) {
            return i;
        }
    }
    return -1;
}

// Sim.App - 애플리케이션 클래스 (싱글톤)
Sim.App = function() 
{
	Sim.Publisher.call(this); // Publisher 상속
	this.renderer = null; // 렌더러
	this.scene = null; // 씬
	this.camera = null; // 카메라
	this.objects = []; // 객체 배열
}

Sim.App.prototype = new Sim.Publisher;

// 초기화 함수
Sim.App.prototype.init = function(param) {
	param = param || {};
	var container = param.container;
	var canvas = param.canvas;

    // Three.js 렌더러 생성, div에 추가
    var renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    // 새로운 Three.js 씬 생성
    var scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0x505050));
    scene.data = this;

    // 기본 위치에 카메라 생성
    camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 1, 10000);
    camera.position.set(0, 0, 3.3333);
    scene.add(camera);

    // 모든 다른 씬 객체를 포함하는 루트 객체 생성
    var root = new THREE.Object3D();
    scene.add(root);

    // 피킹을 처리하기 위한 프로젝터 생성
    var projector = new THREE.Projector();

    // 몇 가지 중요한 항목 저장
    this.container = container;
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.projector = projector;
    this.root = root;

    // 이벤트 핸들러 설정
    this.initMouse();
    this.initKeyboard();
    this.addDomHandlers();
}

// 핵심 실행 루프
Sim.App.prototype.run = function() {
	this.update();
	this.renderer.render(this.scene, this.camera);
	var that = this;
	requestAnimationFrame(function() { that.run(); });
}

// 틱 당 한 번 호출되는 업데이트 메서드
Sim.App.prototype.update = function() {
	var i, len;
	len = this.objects.length;
	for (i = 0; i < len; i++) {
		this.objects[i].update();
	}
}

// 객체 추가/제거
Sim.App.prototype.addObject = function(obj) {
	this.objects.push(obj);
	if (obj.object3D) {
		this.root.add(obj.object3D);
	}
}

Sim.App.prototype.removeObject = function(obj) {
	var index = this.objects.indexOf(obj);
	if (index != -1) {
		this.objects.splice(index, 1);
		if (obj.object3D) {
			this.root.remove(obj.object3D);
		}
	}
}


// Event handling
Sim.App.prototype.initMouse = function()
{
	var dom = this.renderer.domElement;
	
	var that = this;
	dom.addEventListener( 'mousemove', 
			function(e) { that.onDocumentMouseMove(e); }, false );
	dom.addEventListener( 'mousedown', 
			function(e) { that.onDocumentMouseDown(e); }, false );
	dom.addEventListener( 'mouseup', 
			function(e) { that.onDocumentMouseUp(e); }, false );
	
	$(dom).mousewheel(
	        function(e, delta) {
	            that.onDocumentMouseScroll(e, delta);
	        }
	    );
	
	this.overObject = null;
	this.clickedObject = null;
}

Sim.App.prototype.initKeyboard = function()
{
	var dom = this.renderer.domElement;
	
	var that = this;
	dom.addEventListener( 'keydown', 
			function(e) { that.onKeyDown(e); }, false );
	dom.addEventListener( 'keyup', 
			function(e) { that.onKeyUp(e); }, false );
	dom.addEventListener( 'keypress', 
			function(e) { that.onKeyPress(e); }, false );

	// so it can take focus
	dom.setAttribute("tabindex", 1);
    dom.style.outline='none';
}

Sim.App.prototype.addDomHandlers = function()
{
	var that = this;
	window.addEventListener( 'resize', function(event) { that.onWindowResize(event); }, false );
}

Sim.App.prototype.onDocumentMouseMove = function(event)
{
    event.preventDefault();
    
    if (this.clickedObject && this.clickedObject.handleMouseMove)
    {
	    var hitpoint = null, hitnormal = null;
	    var intersected = this.objectFromMouse(event.pageX, event.pageY);
	    if (intersected.object == this.clickedObject)
	    {
	    	hitpoint = intersected.point;
	    	hitnormal = intersected.normal;
	    }
		this.clickedObject.handleMouseMove(event.pageX, event.pageY, hitpoint, hitnormal);
    }
    else
    {
	    var handled = false;
	    
	    var oldObj = this.overObject;
	    var intersected = this.objectFromMouse(event.pageX, event.pageY);
	    this.overObject = intersected.object;
	
	    if (this.overObject != oldObj)
	    {
	        if (oldObj)
	        {
        		this.container.style.cursor = 'auto';
        		
        		if (oldObj.handleMouseOut)
        		{
        			oldObj.handleMouseOut(event.pageX, event.pageY);
        		}
	        }
	
	        if (this.overObject)
	        {
	        	if (this.overObject.overCursor)
	        	{
	        		this.container.style.cursor = this.overObject.overCursor;
	        	}
	        	
	        	if (this.overObject.handleMouseOver)
	        	{
	        		this.overObject.handleMouseOver(event.pageX, event.pageY);
	        	}
	        }
	        
	        handled = true;
	    }
	
	    if (!handled && this.handleMouseMove)
	    {
	    	this.handleMouseMove(event.pageX, event.pageY);
	    }
    }
}

Sim.App.prototype.onDocumentMouseDown = function(event)
{
    event.preventDefault();
        
    var handled = false;

    var intersected = this.objectFromMouse(event.pageX, event.pageY);
    if (intersected.object)
    {
    	if (intersected.object.handleMouseDown)
    	{
    		intersected.object.handleMouseDown(event.pageX, event.pageY, intersected.point, intersected.normal);
    		this.clickedObject = intersected.object;
    		handled = true;
    	}
    }
    
    if (!handled && this.handleMouseDown)
    {
    	this.handleMouseDown(event.pageX, event.pageY);
    }
}

Sim.App.prototype.onDocumentMouseUp = function(event)
{
    event.preventDefault();
    
    var handled = false;
    
    var intersected = this.objectFromMouse(event.pageX, event.pageY);
    if (intersected.object)
    {
    	if (intersected.object.handleMouseUp)
    	{
    		intersected.object.handleMouseUp(event.pageX, event.pageY, intersected.point, intersected.normal);
    		handled = true;
    	}
    }
    
    if (!handled && this.handleMouseUp)
    {
    	this.handleMouseUp(event.pageX, event.pageY);
    }
    
    this.clickedObject = null;
}

Sim.App.prototype.onDocumentMouseScroll = function(event, delta)
{
    event.preventDefault();

    if (this.handleMouseScroll)
    {
    	this.handleMouseScroll(delta);
    }
}

Sim.App.prototype.objectFromMouse = function(pagex, pagey)
{
	// Translate page coords to element coords
	var offset = $(this.renderer.domElement).offset();	
	var eltx = pagex - offset.left;
	var elty = pagey - offset.top;
	
	// Translate client coords into viewport x,y
    var vpx = ( eltx / this.container.offsetWidth ) * 2 - 1;
    var vpy = - ( elty / this.container.offsetHeight ) * 2 + 1;
    
    var vector = new THREE.Vector3( vpx, vpy, 0.5 );

    this.projector.unprojectVector( vector, this.camera );
	
    var ray = new THREE.Ray( this.camera.position, vector.subSelf( this.camera.position ).normalize() );

    var intersects = ray.intersectScene( this.scene );
	
    if ( intersects.length > 0 ) {    	
    	
    	var i = 0;
    	while(!intersects[i].object.visible)
    	{
    		i++;
    	}
    	
    	var intersected = intersects[i];
		var mat = new THREE.Matrix4().getInverse(intersected.object.matrixWorld);
    	var point = mat.multiplyVector3(intersected.point);
    	
		return (this.findObjectFromIntersected(intersected.object, intersected.point, intersected.face.normal));        	    	                             
    }
    else
    {
    	return { object : null, point : null, normal : null };
    }
}

Sim.App.prototype.findObjectFromIntersected = function(object, point, normal)
{
	if (object.data)
	{
		return { object: object.data, point: point, normal: normal };
	}
	else if (object.parent)
	{
		return this.findObjectFromIntersected(object.parent, point, normal);
	}
	else
	{
		return { object : null, point : null, normal : null };
	}
}


Sim.App.prototype.onKeyDown = function(event)
{
	// N.B.: Chrome doesn't deliver keyPress if we don't bubble... keep an eye on this
	event.preventDefault();

    if (this.handleKeyDown)
    {
    	this.handleKeyDown(event.keyCode, event.charCode);
    }
}

Sim.App.prototype.onKeyUp = function(event)
{
	// N.B.: Chrome doesn't deliver keyPress if we don't bubble... keep an eye on this
	event.preventDefault();

	if (this.handleKeyUp)
	{
		this.handleKeyUp(event.keyCode, event.charCode);
	}
}
	        
Sim.App.prototype.onKeyPress = function(event)
{
	// N.B.: Chrome doesn't deliver keyPress if we don't bubble... keep an eye on this
	event.preventDefault();

	if (this.handleKeyPress)
	{
		this.handleKeyPress(event.keyCode, event.charCode);
	}
}

Sim.App.prototype.onWindowResize = function(event) {

	this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);

	this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
	this.camera.updateProjectionMatrix();

}

Sim.App.prototype.focus = function()
{
	if (this.renderer && this.renderer.domElement)
	{
		this.renderer.domElement.focus();
	}
}


// Sim.Object - base class for all objects in our simulation
Sim.Object = function()
{
	Sim.Publisher.call(this);
	
	this.object3D = null;
	this.children = [];
}

Sim.Object.prototype = new Sim.Publisher;

Sim.Object.prototype.init = function()
{
}

Sim.Object.prototype.update = function()
{
	this.updateChildren();
}

// setPosition - move the object to a new position
Sim.Object.prototype.setPosition = function(x, y, z)
{
	if (this.object3D)
	{
		this.object3D.position.set(x, y, z);
	}
}

//setScale - scale the object
Sim.Object.prototype.setScale = function(x, y, z)
{
	if (this.object3D)
	{
		this.object3D.scale.set(x, y, z);
	}
}

//setScale - scale the object
Sim.Object.prototype.setVisible = function(visible)
{
	function setVisible(obj, visible)
	{
		obj.visible = visible;
		var i, len = obj.children.length;
		for (i = 0; i < len; i++)
		{
			setVisible(obj.children[i], visible);
		}
	}
	
	if (this.object3D)
	{
		setVisible(this.object3D, visible);
	}
}

// updateChildren - update all child objects
Sim.Object.prototype.update = function()
{
	var i, len;
	len = this.children.length;
	for (i = 0; i < len; i++)
	{
		this.children[i].update();
	}
}

Sim.Object.prototype.setObject3D = function(object3D)
{
	object3D.data = this;
	this.object3D = object3D;
}

//Add/remove children
Sim.Object.prototype.addChild = function(child)
{
	this.children.push(child);
	
	// If this is a renderable object, add its object3D as a child of mine
	if (child.object3D)
	{
		this.object3D.add(child.object3D);
	}
}

Sim.Object.prototype.removeChild = function(child)
{
	var index = this.children.indexOf(child);
	if (index != -1)
	{
		this.children.splice(index, 1);
		// If this is a renderable object, remove its object3D as a child of mine
		if (child.object3D)
		{
			this.object3D.remove(child.object3D);
		}
	}
}

// Some utility methods
Sim.Object.prototype.getScene = function()
{
	var scene = null;
	if (this.object3D)
	{
		var obj = this.object3D;
		while (obj.parent)
		{
			obj = obj.parent;
		}
		
		scene = obj;
	}
	
	return scene;
}

Sim.Object.prototype.getApp = function()
{
	var scene = this.getScene();
	return scene ? scene.data : null;
}

// Some constants

/* key codes
37: left
38: up
39: right
40: down
*/
Sim.KeyCodes = {};
Sim.KeyCodes.KEY_LEFT  = 37;
Sim.KeyCodes.KEY_UP  = 38;
Sim.KeyCodes.KEY_RIGHT  = 39;
Sim.KeyCodes.KEY_DOWN  = 40;

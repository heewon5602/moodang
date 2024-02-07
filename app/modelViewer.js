// 생성자 정의
ModelViewer = function()
{
	Sim.App.call(this);  // 상위 클래스(Sim.App)의 생성자를 호출
}

// Sim.App의 하위 클래스로 설정
ModelViewer.prototype = new Sim.App();

// 사용자 정의 초기화 함수
ModelViewer.prototype.init = function(param)
{
	// 상위 클래스의 init 함수를 호출하여 씬, 렌더러, 기본 카메라 설정
	Sim.App.prototype.init.call(this, param);
	
    // 모델을 잘 보여주기 위한 헤드라이트 생성
	this.headlight = new THREE.DirectionalLight( 0xffffff, 1);
	this.headlight.position.set(0, 0, 1);
	this.scene.add(this.headlight);	// 헤드라이트를 씬에 추가
	
	var amb = new THREE.AmbientLight( 0xffffff );  // 환경 빛 생성
	this.scene.add(amb);  // 환경 빛을 씬에 추가
	
	this.createCameraControls();  // 카메라 컨트롤 생성
}

// 모델 추가 함수
ModelViewer.prototype.addModel = function(model)
{
    this.addObject(model);    
}

// 모델 제거 함수
ModelViewer.prototype.removeModel = function(model)
{	
    this.removeObject(model);    
}

// 카메라 컨트롤 생성 함수
ModelViewer.prototype.createCameraControls = function()
{
	var controls = new THREE.TrackballControls( this.camera, this.renderer.domElement );
	var radius = ModelViewer.CAMERA_RADIUS;
	
	controls.rotateSpeed = ModelViewer.ROTATE_SPEED;  // 회전 속도 설정
	controls.zoomSpeed = ModelViewer.ZOOM_SPEED;  // 줌 속도 설정
	controls.panSpeed = ModelViewer.PAN_SPEED;  // 팬 속도 설정
	controls.dynamicDampingFactor = ModelViewer.DAMPING_FACTOR;  // 댐핑 요소 설정
	controls.noZoom = false;  // 줌 금지 설정 (false로 설정하므로 줌 가능)
	controls.noPan = false;  // 팬 금지 설정 (false로 설정하므로 팬 가능)
	controls.staticMoving = false;  // 정적 이동 설정
	
	controls.minDistance = radius * ModelViewer.MIN_DISTANCE_FACTOR;  // 최소 거리 설정
	controls.maxDistance = radius * ModelViewer.MAX_DISTANCE_FACTOR;  // 최대 거리 설정

	this.controls = controls;  // controls를 현재 객체에 저장
}

// 업데이트 함수
ModelViewer.prototype.update = function()
{
	// 카메라 컨트롤 업데이트
	if (this.controls)
	{
		this.controls.update();
	}
	
	// 헤드라이트가 모델을 향하도록 업데이트
	var normcamerapos = this.camera.position.clone().normalize();
	this.headlight.position.copy(normcamerapos);

	Sim.App.prototype.update.call(this);  // 상위 클래스의 update 함수 호출
}

// 카메라와 관련된 상수 설정
ModelViewer.CAMERA_RADIUS = 5;
ModelViewer.MIN_DISTANCE_FACTOR = 1.1;
ModelViewer.MAX_DISTANCE_FACTOR = 10;
ModelViewer.ROTATE_SPEED = 1.0;
ModelViewer.ZOOM_SPEED = 3;
ModelViewer.PAN_SPEED = 0.2;
ModelViewer.DAMPING_FACTOR = 0.3;
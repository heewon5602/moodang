// 사용자 정의 JSON 모델 클래스
JSONModel = function()
{
	Sim.Object.call(this); // 상위 Sim.Object의 생성자를 호출
}

// JSONModel의 프로토타입을 Sim.Object로 설정
JSONModel.prototype = new Sim.Object();

// JSONModel 초기화 함수
JSONModel.prototype.init = function(param)
{
	var group = new THREE.Object3D; // 새로운 3D 객체 그룹 생성

	var that = this; // 현재 객체 참조

	var url = param.url || ""; // URL을 param에서 받아오거나 빈 문자열로 설정
	if (!url) // URL이 없으면 함수 종료
		return;
	
	this.loadCallback = param.callback; // 콜백 함수 설정

	var scale = param.scale || 1; // 스케일을 param에서 받아오거나 기본값 1로 설정
	
	this.scale = new THREE.Vector3(scale, scale, scale); // 3D 벡터로 스케일 설정
	var loader = new THREE.JSONLoader(); // JSON 로더 생성
	loader.load( url, function( data ) { 
		that.handleLoaded(data) } ); // URL에서 JSON 로드 후 콜백 함수 호출

    // 프레임워크에 우리 객체를 알림
    this.setObject3D(group);
}

// JSON이 로드되었을 때의 처리 함수
JSONModel.prototype.handleLoaded = function(data)
{
	if (data instanceof THREE.Geometry) // 로드된 데이터가 THREE.Geometry 인스턴스인 경우
	{
		var geometry = data; // 데이터를 geometry로 참조
		
		// 모델에 정점의 노멀값이 없는 경우를 대비
		geometry.computeVertexNormals();
		
		var material = new THREE.MeshFaceMaterial(); // 새로운 메시 페이스 재질 생성
		var mesh = new THREE.Mesh( geometry, material  ); // geometry와 재질로 새로운 메시 생성

		mesh.scale.copy(this.scale); // 스케일 복사
		mesh.doubleSided = true; // 양면 렌더링 활성화

		this.object3D.add( mesh ); // 메시를 3D 객체에 추가

		this.mesh = mesh; // 메시 참조 저장

		if (this.loadCallback) // 로드 콜백 함수가 있는 경우
		{
			this.loadCallback(this); // 콜백 함수 호출
		}
	}
}
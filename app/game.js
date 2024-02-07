// mooDang 생성자 함수
mooDang = function() {
    Sim.App.call(this); // Sim.App 클래스의 생성자 호출
	
}

// Sim.App를 상속받음
mooDang.prototype = new Sim.App();

// 사용자 정의 초기화 함수
mooDang.prototype.init = function(param) 
{
    // 슈퍼클래스의 init 함수 호출하여 장면, 렌더러, 기본 카메라 설정
    Sim.App.prototype.init.call(this, param);
    
    param = param || {}; // param이 제공되지 않으면 빈 객체로 초기화
    this.param = param;
    
    this.hud = param.hud; // HUD(Head-Up Display) 설정
    this.sounds = param.sounds; // 사운드 설정

	this.car = new Car();


    // 환경 및 차량 로드
	this.environment = new Environment();
    this.createEnvironment();
    this.loadCars();
    this.loadRacer();
    
    this.curTime = Date.now(); // 현재 시간 설정
    this.deltat = 0; // 시간 차이값 초기화
    
    this.running = false; // 게임 실행 여부
    this.state = mooDang.STATE_LOADING; // 게임 상태 설정

    // 게임에 키보드 포커스 주기
    this.focus();

    // 컨텍스트 리스너 추가
    this.addContextListener();
}

// 환경 생성 함수
mooDang.prototype.createEnvironment = function() {
    this.environment = new Environment();
    this.environment.init({
        app:this,
        textureSky:true,
        textureGround:true,
        textureFinishLine:true,
        displaySigns:true
    });
    this.addObject(this.environment);
}

// 차량 로드 함수
mooDang.prototype.loadCars = function() {
    this.carModels = []; // 차 모델 배열 초기화
    this.nMakesLoaded = 0;// 로드된 차의 수
    this.nMakesTotal = 3; // 총 차량 수

    var that = this; // 현재 객체 참조 저장
    var model = new JSONModel;
	//자동차 모델 종류
    model.init({
        url : "models/Car1/NovaCar.js",
        callback: function(model) { 
            that.onCarLoaded(model, "nova", {
                scale:0.7,
                position:{x:0, y:.1, z:Car.CAR_LENGTH},
                rotation:{x:-Math.PI / 2, y:0, z:0},
            }); 
        }
    });

    model = new JSONModel;
    model.init({
        url : "models/Camaro-1/Camaro.js",
        callback: function(model) { 
            that.onCarLoaded(model, "camaro", {
                scale:0.17,
                position:{x:1, y:-.5, z:Car.CAR_LENGTH},
                rotation:{x:-Math.PI / 2, y:0, z:0},
            }); 
        }
    });

    model = new JSONModel;
    model.init({
        url : "models/Camaro-1/Camaro.js",
        callback: function(model) { 
            that.onCarLoaded(model, "camaro_silver", {
                scale:0.17,
                position:{x:1, y:-.5, z:Car.CAR_LENGTH},
                rotation:{x:-Math.PI / 2, y:0, z:0},
                map:"models/Camaro-1/camaro_4.jpg",
                mapIndex:0
            }); 
        }
    });
}

// 차량 로드 완료 후 호출되는 콜백 함수
mooDang.prototype.onCarLoaded = function(model, make, options) {
    this.carModels[this.nMakesLoaded++] = { make: make, model : model, options : options };

    // 모든 차량이 로드되면 차량 생성
    if (this.nMakesLoaded >= this.nMakesTotal) {
        this.createCars();
    }
}



// 레이서 로드 함수
mooDang.prototype.loadRacer = function() {
    var that = this;
   var model = new JSONModel;
  
    model.init({ 
        url : "models/MOODANG/Objects/toymd.js", 
        scale:0.9254,
        callback: function(model) { that.onRacerLoaded(model); }
    });
}

mooDang.prototype.onRacerLoaded = function(model)
{
	// 카메라에서 멀어지게 모델을 회전
	model.mesh.rotation.y = Math.PI;

	this.player = new Player;
	// 플레이어 초기화
	this.player.init({ mesh : model.object3D, camera : camera, exhaust:true,
		sounds : this.sounds});
	this.addObject(this.player);
	// 플레이어의 위치 설정
	this.player.setPosition(0, mooDang.CAR_Y + Environment.GROUND_Y, 
			Environment.ROAD_LENGTH / 2 - mooDang.PLAYER_START_Z);
	this.player.start();
	
	// 만약 자동차들이 로드되었다면 게임 시작
	if (this.cars)
	{
		this.startGame();
	}
}

mooDang.prototype.startGame = function()
{
	// 게임을 시작 상태로 설정
	this.running = true;
	this.state = mooDang.STATE_RUNNING;
	this.startTime = Date.now();
	
	// 소리가 있으면 운전 소리 재생
	if (this.sounds)
	{
		var driving = this.sounds["driving"];
		driving.loop = true;
		driving.play();
	}
}

mooDang.prototype.finishGame = function()
{
	// 게임 실행 중지 및 플레이어 정지
	this.running = false;
	this.player.stop();
	
	// 모든 자동차 정지
	var i, len = this.cars.length;
	for (i = 0; i < len; i++)
	{
		this.cars[i].stop();
	}
	
	// 게임 상태를 완료로 변경 후 결과 표시
	this.state = mooDang.STATE_COMPLETE;
	this.showResults();
}

mooDang.prototype.crash = function(car)
{
	// 플레이어와 자동차 충돌 처리
	this.player.crash();
	car.crash();
	this.running = false;
	this.state = mooDang.STATE_CRASHED;
	this.showResults();
}

mooDang.prototype.createCars = function()
{
	this.cars = [];
	
	var i = 0, nCars = 10;
	// 10대의 장애물 생성
	for (i = 0; i < nCars; i++)
	{
		var object = this.createCar(i % this.nMakesLoaded);
		
		var car = new Car;
		car.init({ mesh : object });
		this.addObject(car);
		// 자동차의 랜덤 위치 설정
		var randx = (Math.random() -.5 ) * (Environment.ROAD_WIDTH - Car.CAR_WIDTH);		
		var randz = (Math.random()) * Environment.ROAD_LENGTH/2 - mooDang.CAR_START_Z;
		car.setPosition(randx, mooDang.CAR_Y + Environment.GROUND_Y, randz);	
		
		this.cars.push(car);
		car.start();
	}

	// 플레이어가 있다면 게임 시작
	if (this.player )
	{
		this.startGame();
	}
}



mooDang.prototype.createCar = function(makeIndex)
{
	// 특정 모델의 자동차 생성
	var model = this.carModels[makeIndex].model;
	var options = this.carModels[makeIndex].options;

	var group = new THREE.Object3D;
	group.rotation.y = Math.PI;
	
	var mesh = new THREE.Mesh(model.mesh.geometry, model.mesh.material);
	mesh.rotation.set(options.rotation.x, options.rotation.y, options.rotation.z)
	mesh.scale.set(options.scale, options.scale, options.scale);
	mesh.position.set(options.position.x, options.position.y, options.position.z);

	// 만약 텍스처 맵이 있다면 적용
	if (options.map)
	{
		var material = mesh.geometry.materials[options.mapIndex];
		material.map = THREE.ImageUtils.loadTexture(options.map);
	}
	
	group.add(mesh);
	
	return group;
}

// 미니게임 상태를 추적하는 객체를 추가합니다.
const miniGameStates = {
  mini1: false,
  mini2: false,
  mini3: false
};

mooDang.prototype.update = function()
{
	// 게임이 진행 중일 경우
	if (this.running)
	{
		// 경과 시간 계산
		this.elapsedTime = (Date.now() - this.startTime) / 1000;
		// HUD 갱신
		this.updateHUD();
		this.testCollision();
		
		const epsilon = 0.1; //정류장을 지나가는지 체크할 때, 무당이의 속도가 빨라 위치를 인식 못하는 경우 보완
		
		//미니게임 1 진입 체크
		if (Math.abs(this.player.object3D.position.z - (Environment.ROAD_LENGTH / 3)) < epsilon) 
		{
			if (!miniGameStates.mini1) 
			{
				this.player.speed = 0;
				console.log("교육대학원 미니게임");
					
				// 미니게임 로드 후에 자동으로 달리는 버그 방지 키눌림 무시
				for (let key in this.player.keysDown) 
				{
					this.player.keysDown[key] = false;
				}
					
				miniGameStates.mini1 = true; // 미니게임 상태를 true로 설정합니다.
				var minigame1 = window.open('file:///C:/Users/SIHUN/Desktop/%EC%BB%B4%ED%93%A8%ED%84%B0%EA%B7%B8%EB%9E%98%ED%94%BD%EC%8A%A4/%ED%85%80%ED%94%84/MOODANG%20ODYSSEY_%EC%88%98%EC%A0%95/Minigames/mini1/index.html','_blank');
				
				/* if(minigame1)
				{
					// 장애물 차 정지
					for (var i = 0; i < this.cars.length; i++) 
					{
						this.cars[i].stop(); // Car.stop 함수 호출
					}
				} */
			}
				
		}
	
		
		// 미니게임 2 진입 체크
		if (Math.abs(this.player.object3D.position.z) < epsilon) 
		{
			if (!miniGameStates.mini2) 
			{
				
				this.player.speed = 0;
				console.log("학생회관 미니게임");
					
				// 미니게임 로드 후에 자동으로 달리는 버그 방지 키눌림 무시
				for (let key in this.player.keysDown) 
				{
					this.player.keysDown[key] = false;
				}
					
				miniGameStates.mini2 = true; // 미니게임 상태를 true로 설정합니다.
				var minigame2 = window.open('file:///C:/Users/SIHUN/Desktop/%EC%BB%B4%ED%93%A8%ED%84%B0%EA%B7%B8%EB%9E%98%ED%94%BD%EC%8A%A4/%ED%85%80%ED%94%84/MOODANG%20ODYSSEY_%EC%88%98%EC%A0%95/Minigames/mini2/minigame2.html','_blank');
			}
		
		}

		
		// 미니게임 3 진입 체크
		if (Math.abs(this.player.object3D.position.z + (Environment.ROAD_LENGTH / 3)) < epsilon) 
		{
			if (!miniGameStates.mini3) 
			{
				
				this.player.speed = 0;
				console.log("AI공학관 미니게임");
					
				// 미니게임 로드 후에 자동으로 달리는 버그 방지 키눌림 무시
				for (let key in this.player.keysDown) 
				{
					this.player.keysDown[key] = false;
				}
					
				miniGameStates.mini3 = true; // 미니게임 상태를 true로 설정합니다.
				var minigame3 = window.open('file:///C:/Users/SIHUN/Desktop/%EC%BB%B4%ED%93%A8%ED%84%B0%EA%B7%B8%EB%9E%98%ED%94%BD%EC%8A%A4/%ED%85%80%ED%94%84/MOODANG%20ODYSSEY_%EC%88%98%EC%A0%95/Minigames/mini3/index.html','_blank');
			}
			
		}	
		
	
			// 플레이어의 위치가 도로의 끝을 넘어섰다면 게임 종료
			if (this.player.object3D.position.z < (-Environment.ROAD_LENGTH / 2 - Car.CAR_LENGTH))
			{
				this.finishGame();
			}	
		}
	// 상위 클래스의 update 호출
	Sim.App.prototype.update.call(this);
}

mooDang.prototype.updateHUD = function()
{
	// HUD가 있다면
	if (this.hud)
	{
		// 속도 계산 및 표시
		var kmh = this.player.speed * 3.6;  // m/s -> km/hr 변환
		this.hud.speedometer.update(kmh);
		
		// RPM 표시
		this.hud.tachometer.update(this.player.rpm);
		
		// 경과 시간 표시
		this.hud.timer.innerHTML = "TIME<br>" + this.elapsedTime.toFixed(2);

		// 남은 거리 계산 및 표시
		var roadRelative = (this.player.object3D.position.z - (Environment.ROAD_LENGTH / 2) + 4);
		var distanceKm = -roadRelative / Environment.ROAD_LENGTH;
		this.hud.odometer.innerHTML = "TRIP<br>" + distanceKm.toFixed(2);
	}	
}

mooDang.prototype.testCollision = function()
{
	var playerpos = this.player.object3D.position;
	
	// 도로의 오른쪽 끝과의 충돌 검사
	if (playerpos.x > (Environment.ROAD_WIDTH / 2 - (Car.CAR_WIDTH/2)))
	{
		this.player.bounce();
		this.player.object3D.position.x -= 1;
	}
	// 도로의 왼쪽 끝과의 충돌 검사
	if (playerpos.x < -(Environment.ROAD_WIDTH / 2 - (Car.CAR_WIDTH/2)))
	{
		this.player.bounce();
		this.player.object3D.position.x += 1;
	}
	
	// 다른 자동차와의 충돌 검사
	var i, len = this.cars.length;
	for (i = 0; i < len; i++)
	{
		var carpos = this.cars[i].object3D.position;
		var dist = playerpos.distanceTo(carpos);
		if (dist < mooDang.COLLIDE_RADIUS)
		{
			this.crash(this.cars[i]);
			break;
		}
	}
}

mooDang.prototype.showResults = function()
{
	// 결과 화면 표시
	var overlay = document.getElementById("overlay");
	var headerHtml = "?";
	var contentsHtml = "?";
	var elapsedTime = this.elapsedTime.toFixed(2);
	
	if (this.state == mooDang.STATE_COMPLETE)
	{
		headerHtml = "등교완료!";
		contentsHtml = "!! 이제 기말 공부하러가자 !!";
	}
	else if (this.state == mooDang.STATE_CRASHED)
	{
		headerHtml = "등교실패!";
		contentsHtml = "!!! 다시 도전해보세요 !!!";
	}
	
	var header = document.getElementById("header");
	var contents = document.getElementById("contents");
	header.innerHTML = headerHtml;
	contents.innerHTML = contentsHtml;

	overlay.style.display = "block";    
}

mooDang.prototype.handleKeyDown = function(keyCode, charCode)
{
	// 키 눌림 이벤트 처리
	if (this.player)
	{
		this.player.handleKeyDown(keyCode, charCode);
	}
}

mooDang.prototype.handleKeyUp = function(keyCode, charCode)
{
	// 키 뗌 이벤트 처리
	if (this.player)
	{
		this.player.handleKeyUp(keyCode, charCode);
	}
}

mooDang.prototype.restart = function(e)
{
	// 사운드 다시 시작
	if (this.sounds)
	{
		var driving = this.sounds["driving"];
		driving.pause();
		driving.currentTime = 0;
	}
	// 결과 화면 숨기기
	var overlay = document.getElementById("overlay");
	overlay.style.display = 'none';
	// 게임 다시 초기화
	this.container.removeChild(this.renderer.domElement);
	this.init( this.param );
}

mooDang.prototype.handleContextLost = function(e)
{
	// WebGL 컨텍스트가 손실된 경우 게임 재시작
	this.restart();
}


// WebGL 컨텍스트가 손실되었을 때의 이벤트 리스너를 추가하는 함수
mooDang.prototype.addContextListener = function()
{
	var that = this;
	
	// renderer의 DOM 요소에 'webglcontextlost' 이벤트 리스너를 추가합니다.
	this.renderer.domElement.addEventListener("webglcontextlost", 
			function(e) { 
				// 컨텍스트가 손실될 때 handleContextLost 함수를 호출합니다.
				that.handleContextLost(e);
				}, 
			false);
}

// 충돌을 검사하는 데 사용되는 반지름 (두 차의 너비를 기준으로 계산됨)
mooDang.COLLIDE_RADIUS = Math.sqrt(2 * Car.CAR_WIDTH);

// 게임의 다양한 상태를 나타내는 상수들
mooDang.STATE_LOADING = 0;    // 게임 로딩 중
mooDang.STATE_RUNNING = 1;    // 게임 진행 중
mooDang.STATE_COMPLETE = 2;   // 게임 완료
mooDang.STATE_CRASHED = 3;    // 충돌 발생

// 차의 Y축 위치
mooDang.CAR_Y = .4666;

// 차의 시작 Z 위치
mooDang.CAR_START_Z = 10;

// 플레이어의 시작 Z 위치
mooDang.PLAYER_START_Z = 4;

// 게임 시작 시의 최고 시간 (최댓값으로 초기화)
mooDang.best_time = Number.MAX_VALUE;
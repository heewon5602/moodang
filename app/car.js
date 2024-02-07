// 사용자 정의 Car 클래스
Car = function() {
    Sim.Object.call(this); // Sim.Object의 생성자를 호출
}

// Car의 프로토타입을 Sim.Object로 설정
Car.prototype = new Sim.Object();

// Car 초기화 함수
Car.prototype.init = function(param) {
    param = param || {}; // 매개변수가 없다면 빈 객체로 초기화

    var mesh = param.mesh; // mesh 정보를 가져옴
    if (!mesh) return; // mesh가 없다면 종료

    // 차를 담을 그룹 생성
    var group = new THREE.Object3D;
    this.setObject3D(group);

    // 그룹에 mesh 추가
    this.object3D.add(mesh);
    this.mesh = mesh;

    this.running = false;
    this.curTime = Date.now();

    this.speed = Car.DEFAULT_SPEED;
    this.speedFactor = Car.DEFAULT_SPEED_FACTOR;

    this.createCrashAnimation(); // 충돌 애니메이션 생성
    this.createBounceAnimation(); // 반동 애니메이션 생성

    if (param.exhaust) {
        this.createExhaust(); // 배기 생성
    }

    // 사운드 라이브러리 저장
    this.sounds = param.sounds;
}

// 배기 생성 함수
Car.prototype.createExhaust = function() {
    var exhaust1 = new Exhaust;
    exhaust1.init();
    exhaust1.object3D.position.set(-.333, .2, 2);
    this.exhaust1 = exhaust1;

    var exhaust2 = new Exhaust;
    exhaust2.init();
    exhaust2.object3D.position.set(.444, .2, 2);
    this.exhaust2 = exhaust2;
}

// 업데이트 함수
Car.prototype.update = function() {
    if (this.running) {
        if (this.crashed) {
            this.speed -= (1000 / 3600);
            if (this.speed < 0) {
                this.speed = 0;
                this.running = false;
            }
        }

        var now = Date.now();
        var deltat = now - this.curTime;
        this.curTime = now;

        var dist = deltat / 1000 * this.speed / this.speedFactor;
        this.object3D.position.z -= dist;
    }

    Sim.Object.prototype.update.call(this); // 부모 클래스의 update 메서드 호출
}

// 차량 시작 함수
Car.prototype.start = function() {
    if (this.exhaust1) {
        this.addChild(this.exhaust1);
    }

    if (this.exhaust2) {
        this.addChild(this.exhaust2);
    }

    this.running = true;
}

// 차량 정지 함수
Car.prototype.stop = function() {
    if (this.exhaust1) {
        this.removeChild(this.exhaust1);
    }

    if (this.exhaust2) {
        this.removeChild(this.exhaust2);
    }

    if (this.sounds) {
        var rev_short = this.sounds["rev_short"];
        rev_short.pause();

        var rev_long = this.sounds["rev_long"];
        rev_long.pause();

        var bounce = this.sounds["bounce"];
        bounce.pause();
    }

    this.running = false;
}


// 차량이 충돌했을 때의 기능
Car.prototype.crash = function()
{
	// 배기구 1이 있는 경우
	if (this.exhaust1)
	{
		this.removeChild(this.exhaust1); // 배기구 1 제거
	}

	// 배기구 2가 있는 경우
	if (this.exhaust2)
	{
		this.removeChild(this.exhaust2); // 배기구 2 제거
	}
	
	this.crashed = true; // 충돌 상태로 변경
	this.animateCrash(true); // 충돌 애니메이션 시작

	// 사운드가 있는 경우
	if (this.sounds)
	{
		var rev_short = this.sounds["rev_short"];
		rev_short.pause(); // 짧은 레브 사운드 정지
		
		var rev_long = this.sounds["rev_long"];
		rev_long.pause(); // 긴 레브 사운드 정지
		
		var bounce = this.sounds["bounce"];
		bounce.pause(); // 바운스 사운드 정지
		
		var crash = this.sounds["crash"];
		crash.play(); // 충돌 사운드 재생
	}
}

// 차량이 반발할 때의 기능
Car.prototype.bounce = function()
{
	this.animateBounce(true); // 반발 애니메이션 시작

	// 사운드가 있는 경우
	if (this.sounds)
	{
		var bounce = this.sounds["bounce"];
		bounce.play(); // 바운스 사운드 재생
	}
}

// 충돌 애니메이션 생성
Car.prototype.createCrashAnimation = function()
{
    this.crashAnimator = new Sim.KeyFrameAnimator;
    this.crashAnimator.init({ 
    	interps:
    		[ 
    	    { keys:Car.crashPositionKeys, values:Car.crashPositionValues, target:this.mesh.position },
    	    { keys:Car.crashRotationKeys, values:Car.crashRotationValues, target:this.mesh.rotation } 
    		],
    	loop: false, // 반복하지 않음
    	duration:Car.crash_animation_time // 애니메이션 지속 시간 설정
    });

    this.addChild(this.crashAnimator);    
    this.crashAnimator.subscribe("complete", this, this.onCrashAnimationComplete); // 애니메이션이 완료됐을 때의 콜백 설정	
}

// 충돌 애니메이션 실행/정지
Car.prototype.animateCrash = function(on)
{
	if (on)
	{
	    this.crashAnimator.start(); // 애니메이션 시작
	}
	else
	{
		this.crashAnimator.stop(); // 애니메이션 정지
	}
}

// 충돌 애니메이션이 완료됐을 때
Car.prototype.onCrashAnimationComplete = function()
{
	this.running = false; // 주행 상태 해제
	this.speed = 0; // 속도를 0으로 설정
}

// 반발 애니메이션 생성
Car.prototype.createBounceAnimation = function()
{
    this.bounceAnimator = new Sim.KeyFrameAnimator;
    this.bounceAnimator.init({ 
    	interps:
    		[ 
    	    { keys:Car.bounceRotationKeys, values:Car.bounceRotationValues, target:this.mesh.rotation } 
    		],
    	loop: false, // 반복하지 않음
    	duration:Car.bounce_animation_time // 애니메이션 지속 시간 설정
    });

    this.addChild(this.bounceAnimator);    
    this.bounceAnimator.subscribe("complete", this, this.onBounceAnimationComplete); // 애니메이션이 완료됐을 때의 콜백 설정
}

// 반발 애니메이션 실행/정지
Car.prototype.animateBounce = function(on)
{
	if (on)
	{
	    this.bounceAnimator.start(); // 애니메이션 시작
	}
	else
	{
		this.bounceAnimator.stop(); // 애니메이션 정지
	}
}

// 반발 애니메이션이 완료됐을 때
Car.prototype.onBounceAnimationComplete = function()
{
	this.running = true; // 주행 상태 활성화
}

// 차량의 충돌 시 위치 변경 키 값
Car.crashPositionKeys = [0, .25, .75, 1];
// 차량의 충돌 시 위치 변경 값
Car.crashPositionValues = [ 
    { x : -1, y: 0, z : 0}, 
    { x: 0, y: 1, z: -1},
    { x: 1, y: 0, z: -5},
    { x : -1, y: 0, z : -2}
];
// 차량의 충돌 시 회전 변경 키 값
Car.crashRotationKeys = [0, .25, .5, .75, 1];
// 차량의 충돌 시 회전 변경 값
Car.crashRotationValues = [ 
    { z: 0, y: 0 }, 
    { z: Math.PI, y: 0},
    { z: Math.PI * 2, y: 0},
    { z: Math.PI * 2, y: Math.PI},
    { z: Math.PI * 2, y: Math.PI * 2}
];

// 차량의 충돌 애니메이션 시간 (1초)
Car.crash_animation_time = 1000;

// 차량의 반발력 회전 변경 키 값
Car.bounceRotationKeys = [0, .25, .5, .75, 1];
// 차량의 반발력 회전 변경 값
Car.bounceRotationValues = [ 
    { z: 0, y: 0 }, 
    { z: Math.PI / 12, y: 0},
    { z: 0, y: 0},
    { z: -Math.PI / 12, y: 0},
    { z: 0, y: 0}
];

// 차량의 반발력 애니메이션 시간 (0.2초)
Car.bounce_animation_time = 200;

// 차량의 기본 속도 40km/h를 m/s로 변환)
Car.DEFAULT_SPEED = 40 * 1000 / 3600;
// 차량의 속도 계수
Car.DEFAULT_SPEED_FACTOR = 2;
// 평균 차량 길이 (가정값)
Car.CAR_LENGTH = 4.2; 
// 차량의 폭
Car.CAR_WIDTH = 1.8;
// 차량의 높이
Car.CAR_HEIGHT = 1.2;
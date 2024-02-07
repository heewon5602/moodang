// 사용자 정의 자동차 클래스
Player = function()
{
    Car.call(this);  // Car 클래스의 생성자 호출
}

Player.prototype = new Car();  // Player의 프로토타입을 Car 객체로 설정

// 초기화 함수
Player.prototype.init = function(param)
{
    Car.prototype.init.call(this, param);  // Car 클래스의 init 함수 호출

    this.camera = param.camera;  // 카메라 객체 설정
    this.speed = 0;  // 초기 속도
    this.acceleration = 0;  // 초기 가속도
    this.rpm = 0;  // 엔진의 rpm 초기화
    this.playingRevSound = false;  // Rev 사운드 재생 여부
    this.revStartTime = 0;  // Rev 사운드 시작 시간

    // 소리 객체가 존재할 경우
    if (this.sounds)
    {
        this.revSound = this.sounds["rev_short"];  // 짧은 Rev 사운드 설정
        this.revSoundLong = this.sounds["rev_long"];  // 긴 Rev 사운드 설정
    }
    else
    {
        this.revSound = null;
        this.revSoundLong = null;
    }
    
    // 키 입력 상태 초기화
    this.keysDown = [];
    this.keysDown[Sim.KeyCodes.KEY_LEFT] = false;
    this.keysDown[Sim.KeyCodes.KEY_RIGHT] = false;
    this.keysDown[Sim.KeyCodes.KEY_UP] = false;
    this.keysDown[Sim.KeyCodes.KEY_DOWN] = false;	
}

// 카메라 업데이트 함수
Player.prototype.updateCamera = function()
{
    var camerapos = new THREE.Vector3(Player.CAMERA_OFFSET_X, 
            Player.CAMERA_OFFSET_Y, Player.CAMERA_OFFSET_Z);
    camerapos.addSelf(this.object3D.position);  // 카메라 위치 계산
    this.camera.position.copy(camerapos);  // 카메라 위치 설정
    this.camera.lookAt(this.object3D.position);  // 카메라가 차량을 바라보게 설정

    // 입자 시스템 회전으로 알파 정렬 문제 해결
    if (this.exhaust1)
    {
        this.exhaust1.object3D.rotation.x = this.camera.rotation.x;
    }
    
    if (this.exhaust2)
    {
        this.exhaust2.object3D.rotation.x = this.camera.rotation.x;
    }

}

// 업데이트 함수
Player.prototype.update = function()
{
    // 차량이 움직이는 경우
    if (this.running)
    {
        // 차량이 충돌한 경우
        if (this.crashed)
        {
            this.speed -= (1000 / 3600);  // 속도 감소
            if (this.speed < 0)
            {
                this.speed = 0;
                this.running = false;  // 움직임 중지
            }

            // 사운드 정지
            if (this.revSound)
            {
                this.revSound.pause();
            }
            
            if (this.revSoundLong)
            {
                this.revSoundLong.pause();
            }
        }        

        var now = Date.now();
        var deltat = now - this.curTime;  // 시간 차이 계산
        this.curTime = now;
        
        var turning = false;
        if (this.keysDown[Sim.KeyCodes.KEY_LEFT])
        {
            this.turn(-0.1);  // 왼쪽 회전
            turning = true;
        }
        
        if (this.keysDown[Sim.KeyCodes.KEY_RIGHT])
        {
            this.turn(0.1);  // 오른쪽 회전
            turning = true;
        }

        if (!turning)
        {
            this.turn(0);  // 회전하지 않음
        }
        
        // 가속도 처리
        if (this.keysDown[Sim.KeyCodes.KEY_UP])
        {
            this.accelerate(0.02);
        }		
        else if (this.keysDown[Sim.KeyCodes.KEY_DOWN])
        {
            this.accelerate(-0.02);
        }	
        else
        {
            this.accelerate(-0.01);
        }

        var dist = deltat / 1500 * this.speed / this.speedFactor;
        this.object3D.position.z -= dist;  // 차량 위치 업데이트
        
        this.updateCamera();  // 카메라 업데이트
        
        if (this.speed < 0)
        {
            this.speed = 0;
        }
    }	

    Sim.Object.prototype.update.call(this);  // Sim.Object의 update 함수 호출

}


// 차량의 회전 함수
Player.prototype.turn = function(delta)
{
    this.object3D.position.x += delta;  // x 위치를 delta만큼 이동
    if (delta < 0)
    {
        this.object3D.rotation.y = Math.PI / 8;  // 왼쪽으로 회전
    }
    else if (delta > 0)
    {
        this.object3D.rotation.y = -Math.PI / 8;  // 오른쪽으로 회전
    }
    else
    {
        this.object3D.rotation.y = 0;  // 중앙으로 다시 회전 초기화
    }
}

// 차량의 가속 함수
Player.prototype.accelerate = function(delta)
{
    // 가속도 값 업데이트
    if (this.acceleration > 0 && delta < 0)
    {
        this.acceleration = delta;
    }
    else if (this.acceleration < 0 && delta > 0)
    {
        this.acceleration = delta;
    }
    else
    {
        this.acceleration += delta;		
        this.rpm += delta * Player.MAX_RPM;  // RPM 값 증가
    }
    
    // RPM 최대값을 초과하지 않게 조절
    if (this.rpm > Player.MAX_RPM)
    {
        this.rpm = Player.MAX_RPM;
    }

    // 가속도 최대값을 초과하지 않게 조절
    if (this.acceleration > Player.MAX_ACCELERATION)
    {
        this.acceleration = Player.MAX_ACCELERATION;
    }

    if (this.acceleration < -Player.MAX_ACCELERATION)
    {
        this.acceleration = -Player.MAX_ACCELERATION;
    }
    
    // 속도에 가속도 적용
    this.speed += (this.acceleration * 1000 / 3600);

    // 속도가 0 미만이면 0으로 조절
    if (this.speed < 0)
    {
        this.speed = 0;
    }

    // 최대 속도를 초과하지 않게 조절
    if (this.speed > Player.MAX_SPEED)
    {
        this.speed = Player.MAX_SPEED;
    }

    // 소리 재생 로직
    if (this.sounds)
    {
        if (delta > 0)
        {
            if (!this.playingRevSound || (this.playingRevSound && this.revSound.ended))
            {
                this.revSound.play();
                this.playingRevSound = true;
            }
            
            if (!this.revStartTime)
            {
                this.revStartTime = Date.now();
            }
            else
            {
                var revTime = Date.now() - this.revStartTime;
                if (revTime > Player.REV_LONG_THRESHOLD)
                {
                    this.revSoundLong.play();
                }
            }
        }
        else
        {
            this.revStartTIme = 0;
        }
    }
}

// 키 누름 이벤트 처리 함수
Player.prototype.handleKeyDown = function(keyCode, charCode)
{
    this.keysDown[keyCode] = true;
}

// 키 뗌 이벤트 처리 함수
Player.prototype.handleKeyUp = function(keyCode, charCode)
{
    this.keysDown[keyCode] = false;
}

// 플레이어 차량의 여러 상수값들
Player.MAX_SPEED = 250 * 500 / 1600;         // 최대 속도
Player.MAX_ACCELERATION = 1;                  // 최대 가속도
Player.MAX_RPM = 5000;                        // 최대 RPM

Player.CAMERA_OFFSET_X = 0;		            // 카메라 x 오프셋 (미터)
Player.CAMERA_OFFSET_Y = 1.45;               // 카메라 y 오프셋
Player.CAMERA_OFFSET_Z = 5;                   // 카메라 z 오프셋

Player.REV_LONG_THRESHOLD = 500;              // 긴 rev 사운드 임계치 (밀리초)
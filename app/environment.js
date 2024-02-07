// 생성자 함수
// 생성자: 환경 객체 생성
	

Environment = function() {
    Sim.Object.call(this);
	
}

// Sim.App의 서브클래스로 설정
Environment.prototype = new Sim.Object();

// 사용자 정의 초기화 함수
Environment.prototype.init = function(param) {
    // 슈퍼클래스의 init 함수 호출하여 장면, 렌더러, 기본 카메라 설정
    Sim.Object.prototype.init.call(this, param);
    
    param = param || {};
    
    var app = param.app;
    if (!app) return;
    
    // 주어진 매개변수로부터 속성들 설정
    this.textureSky = param.textureSky;
    this.textureGround = param.textureGround;
    this.textureFinishLine = param.textureFinishLine;
    this.displaySigns = param.displaySigns;
    
    // 조명 생성 및 장면에 추가
    this.headlight = new THREE.DirectionalLight(0xffffff, 1);
    this.headlight.position.set(0, 0, 1);
    app.scene.add(this.headlight);    

    this.toplight = new THREE.DirectionalLight(0xffffff, 1);
    this.toplight.position.set(0, 1, 0);
    app.scene.add(this.toplight);    
    
    this.ambient = new THREE.AmbientLight(0xffffff, 1);
    app.scene.add(this.ambient);

    this.app = app;
    
    // 여러 구성 요소 생성
    this.createSky();
    this.createGround();
    this.createRoad();
    this.createGuardRails();
    this.createFinishLine();
    if (this.displaySigns) {
        this.createSigns();
    }
	this.createBuildingL();
	this.createBuildingR();
	this.createBackgroundBuilding();
	this.createTree();
	
	this.createLibrary();
	this.createSoccer();
	this.createOffice();

    this.curTime = Date.now();
}

// 하늘 생성 함수
Environment.prototype.createSky = function() {
    var texture = null;
            
    if (this.textureSky) {
        texture = THREE.ImageUtils.loadTexture('images/skynew.jpg');
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
        texture.repeat.set(1, 1);
    } else {
        texture = null;
    }
        
    // 하늘 메쉬 생성 및 장면에 추가
    var sky = new THREE.Mesh(
        new THREE.PlaneGeometry(Environment.SKY_WIDTH, Environment.SKY_HEIGHT), 
        new THREE.MeshBasicMaterial({ color: this.textureSky ? 0xffffff : 0x3fafdd, map: texture })
    );
    sky.position.y = 100 + Environment.GROUND_Y;
    sky.position.z = -Environment.GROUND_LENGTH / 2;
    this.app.scene.add(sky);
    this.sky = sky;
}

// 지면 생성 함수
Environment.prototype.createGround = function() {
    var texture = null;

    if (this.textureGround) {
        texture = THREE.ImageUtils.loadTexture('images/sand.jpg');
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 10);
    } else {
        texture = null;
    }
    
    // 지면 메쉬 생성 및 장면에 추가
    var ground = new THREE.Mesh(
        new THREE.PlaneGeometry(Environment.GROUND_WIDTH, Environment.GROUND_LENGTH),
        new THREE.MeshBasicMaterial({ color: this.textureGround ? 0xffffff : 0xaaaaaa, ambient: 0x333333, map: texture })
    );
    ground.rotation.x = -Math.PI/2;
    ground.position.y = -.02 + Environment.GROUND_Y;
    this.app.scene.add(ground);
    this.ground = ground;
}

// 도로 생성 함수
Environment.prototype.createRoad = function() {
    var texture = THREE.ImageUtils.loadTexture('images/road-rotated.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 40);

    // 도로 메쉬 생성 및 장면에 추가
    var road = new THREE.Mesh(
        new THREE.PlaneGeometry(Environment.ROAD_WIDTH, Environment.ROAD_LENGTH * 2),
        new THREE.MeshBasicMaterial({ color: 0xaaaaaa, shininess: 100, ambient: 0x333333, map: texture })
    );
    road.rotation.x = -Math.PI/2;
    road.position.y = 0 + Environment.GROUND_Y;
    this.app.scene.add(road);
    this.road = road;
}
//가드레일을 생성하는 함수
Environment.prototype.createGuardRails = function()
{    
	var texture = null;	

	var texture = THREE.ImageUtils.loadTexture('images/Guard_Rail-rotated.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 40);
	
	var leftrail = new THREE.Mesh( new THREE.PlaneGeometry( Environment.RAIL_WIDTH, 
			Environment.RAIL_LENGTH * 2), 
			new THREE.MeshBasicMaterial( 
			{ color: 0xaaaaaa, shininess:100, ambient: 0x333333, map:texture } 
			)
	);
	leftrail.rotation.x = -Math.PI/2;
	leftrail.rotation.y = Math.PI/2;
	leftrail.position.x = -Environment.ROAD_WIDTH / 2;
	leftrail.position.y = .5 + Environment.GROUND_Y;
	
	this.app.scene.add( leftrail );
	this.leftrail = leftrail;
	
	var rightrail = new THREE.Mesh( new THREE.PlaneGeometry( Environment.RAIL_WIDTH, 
			Environment.RAIL_LENGTH * 2), 
			new THREE.MeshBasicMaterial( 
			{ color: 0xaaaaaa, shininess:100, ambient: 0x333333, map:texture } 
			)
	);
	rightrail.rotation.x = -Math.PI/2;
	rightrail.rotation.y = -Math.PI/2;
	rightrail.position.x = Environment.ROAD_WIDTH / 2;
	rightrail.position.y = .5 + Environment.GROUND_Y;
	
	this.app.scene.add( rightrail );
	this.rightrail = rightrail;

}

// 피니쉬 라인을 생성하는 함수
Environment.prototype.createFinishLine = function()
{    
	var texture = null;	

	// 텍스쳐가 있다면 피니쉬 라인의 텍스쳐를 로드
	if (this.textureFinishLine)
	{
		texture = THREE.ImageUtils.loadTexture('images/finalexam.jpg');
	}
	else
	{
		texture = null;
	}
		
	var finishsign = new THREE.Mesh( new THREE.PlaneGeometry( Environment.FINISH_SIGN_WIDTH, 
			Environment.FINISH_SIGN_HEIGHT ), 
			new THREE.MeshBasicMaterial( 
			{ color: this.textureFinishLine ? 0xFFFFFF : 0xaaaaaa, 
					shininess:100, ambient: 0x333333, map:texture } 
			)
	);
	finishsign.position.z = -Environment.ROAD_LENGTH / 2 - Car.CAR_LENGTH * 2;
	finishsign.position.y = Environment.FINISH_SIGN_Y + Environment.GROUND_Y;
	
	this.app.scene.add( finishsign );
	this.finishsign = finishsign;
}




//오른쪽 건물을 생성하는 함수
Environment.prototype.createBuildingR = function()
{
	var that = this;	
	var model = new JSONModel;
	model.init({ url : "models/Building/villa_21.js", scale:1,
		callback: function(model) { that.onBuildingLoadedR(model); }
	});
}

// 오른쪽 건물 모델이 로드되었을 때 호출되는 콜백 함수
Environment.prototype.onBuildingLoadedR = function(model)
{
	
	for (var i = 0; i < 10; i++)
	{
	
	if(i==1||i==4||i==5||i==8)
	{
		continue;//도서관,운동장을 위해 자리를 비워둠
	}
		
		//오른쪽
		var group = new THREE.Object3D;
		group.position.set(-130.0, Environment.GROUND_Y, (-Environment.ROAD_LENGTH / 2) + (i * Environment.ROAD_LENGTH / 10)+40);
		var mesh = new THREE.Mesh(model.mesh.geometry, model.mesh.material);
		mesh.frustumCulled = false;  // 화면에서 사라지지 않도록
		group.scale.set(Environment.BUILD_SCALE, Environment.BUILD_SCALE, Environment.BUILD_SCALE);
		group.add(mesh);
		this.app.scene.add(group);
		
	
	}

}	

// 도서관 
Environment.prototype.createLibrary = function()
{
	var that = this;
	var model = new JSONModel;
	model.init({ url : "models/Building/library.js", scale:1,
		callback: function(model) { that.onLibraryLoaded(model); }
	});
}

// 도서관 모델이 로드되었을 때 호출되는 콜백 함수
Environment.prototype.onLibraryLoaded = function(model)
{
	
		var group = new THREE.Object3D;
		group.position.set(30.0, Environment.GROUND_Y, (-Environment.ROAD_LENGTH / 2) + (4 * Environment.ROAD_LENGTH / 10)+40);
		var mesh = new THREE.Mesh(model.mesh.geometry, model.mesh.material);
		mesh.rotation.y = 1.5* Math.PI;
		mesh.frustumCulled = false;  
		group.scale.set(Environment.BUILD_SCALE, Environment.BUILD_SCALE, Environment.BUILD_SCALE);
		group.add(mesh);
		this.app.scene.add(group);

}

// 운동장
Environment.prototype.createSoccer = function()
{
	var that = this;
	var model = new JSONModel;
	model.init({ url : "models/Building/Saha.js", scale:1,
		callback: function(model) { that.onSoccerLoaded(model); }
	});
}

// 운동장 모델이 로드되었을 때 호출되는 콜백 함수
Environment.prototype.onSoccerLoaded = function(model)
{
	
		var group = new THREE.Object3D;
		group.position.set(33.0, Environment.GROUND_Y-7, (-Environment.ROAD_LENGTH / 2) + (1 * Environment.ROAD_LENGTH / 10)+10);
		var mesh = new THREE.Mesh(model.mesh.geometry, model.mesh.material);
		mesh.rotation.y = Math.PI/2;
		mesh.frustumCulled = false;  
		group.scale.set(Environment.BUILD_SCALE, Environment.BUILD_SCALE, Environment.BUILD_SCALE);
		group.add(mesh);
		this.app.scene.add(group);
}



//학생회관
Environment.prototype.createOffice = function()
{
	var that = this;
	var model = new JSONModel;
	model.init({ url : "models/Building/office.js", scale:1,
		callback: function(model) { that.onOfficeLoaded(model); }
	});
}

// 학생회관 모델이 로드되었을 때 호출되는 콜백 함수
Environment.prototype.onOfficeLoaded = function(model)
{
	
		var group = new THREE.Object3D;
		group.position.set(30.0, Environment.GROUND_Y, (-Environment.ROAD_LENGTH / 2) + (8 * Environment.ROAD_LENGTH / 10) + 10);
		var mesh = new THREE.Mesh(model.mesh.geometry, model.mesh.material);
		mesh.rotation.y = Math.PI;
		mesh.frustumCulled = false;  
		group.scale.set(Environment.BUILD_SCALE, Environment.BUILD_SCALE, Environment.BUILD_SCALE);
		group.add(mesh);
		this.app.scene.add(group);
}



//동물, 캐릭터


//왼쪽 건물을 생성하는 함수
Environment.prototype.createBuildingL = function()
{
	var that = this;
	var model = new JSONModel;
	model.init({ url : "models/Building/apartment_8.js", scale:1,
		callback: function(model) { that.onBuildingLoadedL(model); }
	});
}

// 왼쪽 건물 모델이 로드되었을 때 호출되는 콜백 함수
Environment.prototype.onBuildingLoadedL = function(model)
{
	for (var i = 0; i < 10; i++)
	{
		
		//왼쪽
		var group = new THREE.Object3D;
		group.position.set(-60.0, Environment.GROUND_Y, (-Environment.ROAD_LENGTH / 2) + (i * Environment.ROAD_LENGTH / 10)+30);
		var mesh = new THREE.Mesh(model.mesh.geometry, model.mesh.material);
		 mesh.frustumCulled = false;  // 화면에서 사라지지 않도록
		group.scale.set(Environment.BUILD_SCALE, Environment.BUILD_SCALE, Environment.BUILD_SCALE);
		group.add(mesh);
		this.app.scene.add(group);
	}

}

//배경 건물을 생성하는 함수(AI관)
Environment.prototype.createBackgroundBuilding = function() 
{
    var that = this;
    var model = new JSONModel;
    model.init({
        url: "models/Building/AI.js", // 가정한 건물 모델 경로
        scale: 1,
        callback: function(model) { that.onBackgroundBuildingLoaded(model); }
    });
}

// 배경 건물 모델이 로드되었을 때 호출되는 콜백 함수
Environment.prototype.onBackgroundBuildingLoaded = function(model) 
{
		var group = new THREE.Object3D;
		//model.mesh.rotation.y = Math.PI;
		//model.mesh.rotation.x = Math.PI/2;
		group.position.set(0, Environment.GROUND_Y, -Environment.ROAD_LENGTH / 2 - Car.CAR_LENGTH * 10);
		var mesh = new THREE.Mesh(model.mesh.geometry, model.mesh.material);
		mesh.rotation.x = 1.5*Math.PI;
		 mesh.frustumCulled = false;  // 화면에서 사라지지 않도록
		group.scale.set(Environment.BUILD_SCALE, Environment.BUILD_SCALE, Environment.BUILD_SCALE);
		group.add(mesh);
		this.app.scene.add(group);
}
 

//나무를 생성하는 함수
Environment.prototype.createTree = function()
{
	var that = this;
	var model = new JSONModel;
	model.init({ url : "models/Tree/Objects/new_tree.js", scale:1,
		callback: function(model) { that.onTreeLoaded(model); }
	});
}

// 나무 모델이 로드되었을 때 호출되는 콜백 함수
Environment.prototype.onTreeLoaded = function(model)
{
	for (var i = 0; i < 20; i++)
	{
		//왼쪽
		var group = new THREE.Object3D;
		group.position.set(-10.0, Environment.GROUND_Y, (-Environment.ROAD_LENGTH / 2) + (i * Environment.ROAD_LENGTH / 20));
		var mesh = new THREE.Mesh(model.mesh.geometry, model.mesh.material);
		 mesh.frustumCulled = false;  // 이 부분을 추가합니다.
		group.scale.set(Environment.TREE_SCALE, Environment.TREE_SCALE, Environment.TREE_SCALE);
		group.add(mesh);
		this.app.scene.add(group);
		
		//오른쪽
		var group = new THREE.Object3D;
		group.position.set(10.0, Environment.GROUND_Y, (-Environment.ROAD_LENGTH / 2) + (i * Environment.ROAD_LENGTH / 20));
		var mesh = new THREE.Mesh(model.mesh.geometry, model.mesh.material);
		group.scale.set(Environment.TREE_SCALE, Environment.TREE_SCALE, Environment.TREE_SCALE);
		group.add(mesh);
		this.app.scene.add(group);
	}
}


/* 
//터널을 생성하는 함수
Environment.prototype.createSigns = function()
{
	var that = this;
	var model = new JSONModel;
	model.init({ url : "models/Route66obj/RT66sign.js", scale:1,
		callback: function(model) { that.onSignLoaded(model); }
	});
}

// 터널 모델이 로드되었을 때 호출되는 콜백 함수
Environment.prototype.onSignLoaded = function(model)
{
    // 터널을 배치할 3개의 위치: 시작, 중간, 끝
    var signPositions = [-Environment.ROAD_LENGTH / 4, 0, Environment.ROAD_LENGTH / 4];

    for (var i = 0; i < 3; i++)
    {
        var group = new THREE.Object3D;
        
        // 터널 위치 배열에서 해당 위치를 가져옵니다.
        group.position.set(5.1, Environment.GROUND_Y, signPositions[i]);
        
        var mesh = new THREE.Mesh(model.mesh.geometry, model.mesh.material);
        group.scale.set(Environment.SIGN_SCALE, Environment.SIGN_SCALE, Environment.SIGN_SCALE);
        group.add(mesh);
        this.app.scene.add(group);
    }
}
 */




// 표지판을 생성하는 함수
Environment.prototype.createSigns = function()
{
	var that = this;
	var model = new JSONModel;
	model.init({ url : "models/Route66obj/RT66sign.js", scale:1,
		callback: function(model) { that.onSignLoaded(model); }
	});
}




// 표지판 모델이 로드되었을 때 호출되는 콜백 함수
Environment.prototype.onSignLoaded = function(model)
{
    // 표지판을 배치할 3개의 위치: 시작, 중간, 끝
  
	var signPositions = [-Environment.ROAD_LENGTH / 3, 0, Environment.ROAD_LENGTH / 3];
    
	for (var i = 0; i < 3; i++)
    {
        var group = new THREE.Object3D;
        
        // 표지판 위치 배열에서 해당 위치를 가져옵니다.
        group.position.set(5.1, Environment.GROUND_Y, signPositions[i]);
        
        var mesh = new THREE.Mesh(model.mesh.geometry, model.mesh.material);
        group.scale.set(Environment.SIGN_SCALE, Environment.SIGN_SCALE, Environment.SIGN_SCALE);
        group.add(mesh);
        this.app.scene.add(group);
    }
	
}

// 환경을 업데이트하는 함수
Environment.prototype.update = function()
{
	if (this.textureSky)
	{
		this.sky.material.map.offset.x += 0.00005;
	}
	
	if (this.app.running)
	{
		var now = Date.now();
		var deltat = now - this.curTime;
		this.curTime = now;

		dist = -deltat / 3000 * this.app.player.speed;
		this.road.material.map.offset.y += (dist * Environment.ANIMATE_ROAD_FACTOR);
	}
		
	Sim.Object.prototype.update.call(this);
}

// 환경에 관련된 상수 값들
Environment.SKY_WIDTH = 3000;
Environment.SKY_HEIGHT = 200;
Environment.GROUND_Y = -10;
Environment.GROUND_WIDTH = 2000;
Environment.GROUND_LENGTH = 800;
Environment.ROAD_WIDTH = 8;
Environment.ROAD_LENGTH = 700;
Environment.RAIL_WIDTH = .2;
Environment.RAIL_LENGTH = Environment.ROAD_LENGTH;
Environment.ANIMATE_ROAD_FACTOR = 0.00000005;
Environment.FINISH_SIGN_WIDTH = 4.333;
Environment.FINISH_SIGN_HEIGHT = 1;
Environment.FINISH_SIGN_Y = 2.22;
Environment.NUM_SIGNS = 8;
Environment.SIGN_SCALE = .5;
Environment.BUILD_SCALE = 2;
Environment.TREE_SCALE = 1;
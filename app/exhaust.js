// 사용자 정의 배기가스 클래스
Exhaust = function() {
    Sim.Object.call(this);  // Sim.Object의 생성자 호출
}

// Exhaust 프로토타입을 Sim.Object의 인스턴스로 설정
Exhaust.prototype = new Sim.Object();

// Exhaust 객체 초기화
Exhaust.prototype.init = function(param) {
    this.setObject3D(new THREE.Object3D);  // 3D 객체 설정
    
    this.initParticles();  // 파티클 초기화
}

// 파티클 초기화 함수
Exhaust.prototype.initParticles = function() {
    var sphereRadius = 1;  // 구의 반지름
    
    var particleCount = 100;  // 파티클 개수
    var particles = new THREE.Geometry();  // 파티클 기하학 객체 생성

    // 파티클의 재질 설정
    var pMaterial = new THREE.ParticleBasicMaterial({
        color: 0xffffff,  // 색상
        size: 1,  // 크기
        opacity: .05,  // 투명도
        transparent: true,  // 투명 여부
        map: new THREE.ImageUtils.loadTexture('images/smoke-2.png')  // 텍스처 이미지 경로
    });

    // 파티클 생성
    for(var p = 0; p < particleCount; p++) {
        var radius = sphereRadius*0.05;
        var angle = Math.random() * (Math.PI * 2);  // 무작위 각도
        var pX = Math.sin(angle) * radius,
            pY = Math.random() * 1,
            pZ = 0,
            particle = new THREE.Vertex(
                new THREE.Vector3(pX-2, pY-2, pZ-2)  // 파티클의 위치
            );

        // 파티클의 초기 속도 설정
        particle.velocity = new THREE.Vector3(
            Math.random()-0.5,       // x
            Math.random()*0.25,      // y
            0                        // z
        );

        particles.vertices.push(particle);  // 파티클을 기하학 객체에 추가
    }

    // 파티클 시스템 생성
    var particleSystem = new THREE.ParticleSystem(
        particles,
        pMaterial);

    particleSystem.position.y = sphereRadius*-0.2;

    particleSystem.sortParticles = false;

    // 파티클 시스템을 씬에 추가
    this.object3D.add(particleSystem);
    
    // 내부 변수 설정
    this.particleCount = particleCount;
    this.particles = particles;
    this.particleSystem = particleSystem;
    this.sphereRadius = sphereRadius;
}

// 파티클 업데이트 함수
Exhaust.prototype.update = function() {
    // 파티클 업데이트
    var pCount = this.particleCount;
    while(pCount--) {
        var particle = this.particles.vertices[pCount];

        // 파티클의 위치 조절
        if(particle.position.y > .25 || particle.position.y < 0) {
            particle.position.y = 0;
            var radius = this.sphereRadius*0.05;
            var angle = Math.random() * (Math.PI * 2);
            particle.position.x = Math.cos(angle) * radius;
        }

        // 시간에 따른 파티클의 움직임
        var t = Date.now() / 1000 % 3;
        particle.position.x += Math.cos(t*particle.velocity.x) * .007;
        particle.position.y += Math.sin(t*particle.velocity.y) * .05;
    }
    this.particleSystem.geometry.__dirtyVertices = true;  // 파티클 시스템 업데이트 필요 표시
}
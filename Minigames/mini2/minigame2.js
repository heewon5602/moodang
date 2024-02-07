"use strict";

var canvas;
var canvas_width;
var gl;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0; 
var theta = [ 0, 0, 0 ];

var flag = false;

var interval;
var timerInterval;

var timerElement;
var timer = 30;

var thetaLoc;

var gameActive = false;
var isDownPressed = false;

var points = [];
var colors = [];

var imgArray = new Array();


window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");
    canvas_width = canvas.width;

    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var background = document.getElementById("background");
    background.style.position = "absolute";
    background.style.width = "1024px";
    background.style.height = "512px";
    background.style.left = "275px";
    background.style.top = "290px";
    background.style.opacity = "0.3"; 

    timerElement = document.getElementById("timer");
    timerElement.textContent = "Time: " + timer + "s";

    var moodang_front = document.getElementById("moodang_front");;

    imgArray[0] = document.getElementById("gc_side");
    imgArray[1] = document.getElementById("gc_side2");
    imgArray[2] = document.getElementById("gc_side3");

    moodang(); //무당이 함수 불러오기
    obstacle(); //장애물 함수 불러오기
    box(); //무당이 몸을 가릴 박스 불러오기

    render();

};

/*keydown : 키가 눌렸을 때 발생*/
function handleKeyDown(e) {
    switch(e.key){
        case "ArrowRight":
            var moodang_front = document.getElementById("moodang_front");
            var box = document.getElementById("box");
            var currentBox = parseFloat(box.style.left) || 0;
            var currentMoodang = parseInt(moodang_front.style.left) || 0;
            
            if (currentMoodang + 10 <= canvas_width+100) {
                moodang_front.style.left = (currentMoodang + 10) + "px";
                box.style.left = (currentBox + 10) + "px"; 
                console.log(currentMoodang)
            }
            break;
        case "ArrowDown":
            console.log("Down")
            isDownPressed = true;
            var box = document.getElementById("box");
            var currentTop = parseFloat(box.style.top) || 0;
            box.style.top = 600 + "px"; 
            break;
    }
}

function handleKeyUp(e) {
    switch(e.key){
        case "ArrowRight":
            flag = false; //무당이가 이동을 멈춤
            break;
        case "ArrowDown":
            var box = document.getElementById("box");
            box.style.top = "550px"; //박스를 초기 위치로 다시 변경
            break;
    }
}

// 이벤트 리스너 등록
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

/*타이머*/
function updateTimer() {
    if (timerInterval) {
        clearInterval(timerInterval); // 이전 timer 초기화
    }

    timerInterval = setInterval(function() {
        if (timer > 0) {
            timer--;
            timerElement.textContent = "Time: " + timer + "s";
        } else {
            timeOut();
        }
    }, 1000);
}

/*무당이 캐릭터*/
function moodang(){
    var moodang_front = document.getElementById("moodang_front");
    
    moodang_front.style.position = "absolute";
    moodang_front.style.left = "150px";
    moodang_front.style.top = "400px";
   
}

/*박스*/
function box(){
    var box = document.getElementById("box");
    
    box.style.position = "absolute";
    box.style.left = "250px";
    box.style.top = "550px";
    box.style.width = "200px";
    box.style.height="150px";
}

/*무한이(장애물)*/
function obstacle(){
    var gc_front = document.getElementById("gc_front");

    gc_front.style.position = "absolute";
    gc_front.style.left = "700px";
    gc_front.style.top = "300px";
}


/*게임 실행*/
function runGame() {
    if (gameActive) {
        Success();
        boxFail();
        timeOut();
        requestAnimationFrame(runGame); // 계속해서 반복 실행
    }
}

function game(){
    clearInterval(timerInterval); //타이머 초기화 
    clearInterval(interval); //무한이 이미지 초기화

    gameActive = true;

    timer = 30; // 30s 가 주어짐
    timerElement.textContent = "Time: " + timer + "s";

    // 이미지 위치 초기화
    moodang();
    box();
    obstacle();

    updateTimer();

    setTimeout(function() {
        interval = setInterval(function() {
            var imgNum = Math.round(Math.random() * 2); // 무작위 이미지 번호 선택
            gc_front.src = imgArray[imgNum].src; // gc_front 이미지 변경
            console.log(imgArray[imgNum])
        }, 500);
    }, 2000); // 2초 후에 setInterval을 시작합니다.

    setTimeout(function(){
        runGame();
    }, 1000);
}

/* 성공 -> 게임 종료*/
function Success(){
var currentMoodang = parseInt(moodang_front.style.left) || 0;

if (currentMoodang + 10 == canvas_width+46) {
    console.log(Success)
    stopGame(); // 타이머 멈춤, 키보드 입력 받지 않음
    gameActive = false; // 게임 비활성화
    clearInterval(interval);   
    alert("Success !!"); 
    window.close(); 
}
}

/*무한이에게 들켜서 실패*/
function boxFail(){
    var box = document.getElementById("box");
    var gc_front = document.getElementById("gc_front");
    
    if (!isDownPressed && gc_front.src == imgArray[0].src) {
        console.log(boxFail)
        clearInterval(interval);
        alert("Fail : You Are Caught ! Play again.");
        gameOver();
    } 
}

/*타임아웃으로 게임 실패*/
function timeOut(){
    if(timer==0){
        console.log(timeOut)
        clearInterval(interval);
        alert("Fail : Time out ! Play again."); 
        gameOver();
    }

}

function stopGame() {
    clearInterval(interval); //이미지 변환 정지
    timerElement.textContent = "Time: " + timer + "s";
    // 키보드 입력 리스너 제거
    document.removeEventListener('keydown', handleKeyDown); 
    document.removeEventListener('keyup', handleKeyUp);

    isDownPressed = false; // Reset isDownPressed to false
}

function gameOver() { 
    console.log(gameOver)
    gameActive = false; // 게임 비활성화
    stopGame(); // 타이머 멈춤, 키보드 입력 받지 않음

    clearInterval(timerInterval);
    clearInterval(interval);
    obstacle();

    moodang();
    box();

    setTimeout(function() {
        setupGame(); 
    }, 2000); // 2초 후에 game() 함수 호출 (시간은 필요에 따라 조절 가능)
}

function setupGame(){
    game();
}

/*Maingame으로 돌아가는 function*/
function backToMain(){
    alert("Do you want to go back to the main game?");

        window.close(); // 현재 창을 닫음
}

var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform3fv(thetaLoc, theta);
    gl.drawArrays( gl.TRIANGLES, 0, points.length);

    requestAnimationFrame( render );
}
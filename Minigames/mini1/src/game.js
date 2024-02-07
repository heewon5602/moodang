var Game = function Game(board, $container, level, levelCars) {
    this.$container = $container;
    this.board = board;
    this.level = level;
    this.currentMapIndex = 0; // 여러 게임 맵을 참조할 수 있도록 추가
	this.levelCars = levelCars;
    var game = this;
    this.clearsRequired = { easy: 3, medium: 2, hard: 1 };
    this.clears = 0;
    this.refresh();
    $(document).keydown(function (e) {
        e.preventDefault();
        game.eventHandler(e);
    });

    // 추가: 레벨 선택으로 돌아가는 버튼 이벤트 핸들러
    $("#change-level").click(function() {
        location.reload();
    });
}

Game.prototype.refresh = function() {
    this.board.cars = this.levelCars[this.level][this.currentMapIndex]; // 현재 맵 데이터로 설정
    this.$container.empty();
    $(".win-phrase").removeClass("show");
    this.setUpBoard();
    this.board.setUpCars();
    if (this.board.selectedCar) {
        $('.' + this.board.selectedCar.color).addClass("selected");
    }
}


Game.prototype.setUpBoard = function(){
    for (var i = 0; i < this.board.grid.length; i++) {
        var $row = $("<ul>");
        for (var j = 0; j < this.board.grid.length; j++) {
            var $square = $("<li>");
            $square.data("pos", [i, j]);
            $row.append($square);
        }
        $row.data("row", i);
        this.$container.append($row);
    }
}

Game.prototype.showWin = function(){
    this.clears++;
    if(this.clears === this.clearsRequired[this.level]) {
        // 모든 맵을 클리어한 경우
        $(document).off("keydown"); // 키 입력 이벤트 제거하여 게임 조작 방지
        $('.' + this.board.selectedCar.color).removeClass("selected");
        $(".win-phrase").addClass("show");
		$('#change-level').hide()
		
        // 나가기 버튼 추가
        var $exitButton = $("<button>").text("back to map").addClass("exit-button");

        // 나가기 버튼 클릭 시 게임 종료 로직
        $exitButton.on("click", function() {
            window.close(); // 현재 창을 종료 (게임을 종료) -> 해당 부분을 기존 맵으로 돌아가게 변경하면 됩니다.
						
        });

        $(".win-phrase").after($exitButton); // win-phrase 다음에 나가기 버튼 추가

    } else {
        this.currentMapIndex++; // 다음 맵 로드
        this.board.cars = this.levelCars[this.level][this.currentMapIndex]; // 해당 난이도의 다음 맵 데이터 로드
        this.refresh();
    }
}



Game.prototype.eventHandler = function(event){
    if (this.board.selectedCar) {
        switch (event.keyCode){
            case 38:
                this.board.selectedCar.move("up");
                this.refresh();
                break;
            case 40:
                this.board.selectedCar.move("down");
                this.refresh();
                break;
            case 37:
                this.board.selectedCar.move("left");
                this.refresh();
                break;
            case 39:
                this.board.selectedCar.move("right");
                this.refresh();
                if (this.board.selectedCar.color === "red" && this.board.isWon()) {
                    this.showWin();
                }
                break;
        }
    }
}

function setUpRushHourGame(level, container, gameIndex = 0){
    var levelCars = {
        easy: easyCars,
        medium: mediumCars,
        hard: hardCars
    };
    
    // gameIndex를 사용하여 해당 인덱스의 맵 데이터로 보드 설정
    var board = new Board(levelCars[level][gameIndex]); 
    return new Game(board, container, level, levelCars);
}



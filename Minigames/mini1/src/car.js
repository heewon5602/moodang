
var Car = function (length, color, startPos, orientation) {
    this.length = length;
    this.color = color;
    this.startPos = startPos;
    this.orientation = orientation;
    this.segments = [startPos];
    this.setUpCarBody();
}

Car.prototype = {
    setUpCarBody: function () {
        var oppositeOrientation = [this.directionMapping()[0] * -1, this.directionMapping()[1] * -1];
        for (var i = 0; i < this.length - 1; i++) {
            var bodyPart = [this.segments[i][0] + oppositeOrientation[0], this.segments[i][1] + oppositeOrientation[1]];
            this.segments.push(bodyPart);
        }
    },

    directionMapping: function (dir) {
        var code, pos;
        if (dir) {
            code = dir;
        } else {
            code = this.orientation;
        }

        switch (code) {
            case "down":
                pos = [1, 0];
                break;
            case "right":
                pos = [0, 1];
                break;
            case "up":
                pos = [-1, 0];
                break;
            case "left":
                pos = [0, -1];
                break;
        }
        return pos;
    },

    move: function (direction) {
        var dir = this.directionMapping(direction);
        var oldHead, newHead;
        if (direction === this.orientation) {
            oldHead = this.segments[0];
            newHead = [oldHead[0] + dir[0], oldHead[1] + dir[1]];
            if (this.color !== "red" && (newHead[0] > 5 || newHead[1] > 5)) {
                return;
            }

            if (!$('li').eq(newHead[0] * 6 + newHead[1]).hasClass("car")) {
                this.segments.unshift(newHead);
                this.segments.pop();
            }
        } else if (dir[0] === this.directionMapping()[0] * -1 && dir[1] === this.directionMapping()[1] * -1) {
            oldHead = this.segments[this.length - 1];
            newHead = [oldHead[0] + dir[0], oldHead[1] + dir[1]];
            if (newHead[0] < 0 || newHead[1] < 0) {
                return;
            }
            if (!$('li').eq(newHead[0] * 6 + newHead[1]).hasClass("car")) {
                this.segments.push(newHead);
                this.segments.shift();
            }
        }

        if (this.color === "red" && this.checkWin() ) {
			alert("Great job! Moving to next map.");
            this.moveToNextLevel();
        }
    },

    checkWin: function () {
        var head = this.segments[0];
        return head[1] === 5;
    },

	moveToNextLevel: function () {
		var currentLevel = $("#game-container").data("level");
		var currentGameCount = $("#game-container").data("count");

		switch (currentLevel) {
			case 'easy':
				if (currentGameCount < easyCars.length - 1) {
					
					setUpRushHourGame(currentLevel, $("#game-container"), currentGameCount + 1);
				} else {
					alert("You've completed all easy levels! Going back to level selection.");
					location.reload();
				}
				break;
			case 'medium':
				if (currentGameCount < mediumCars.length - 1) {
					alert("Great job! Moving to next map.");
					setUpRushHourGame(currentLevel, $("#game-container"), currentGameCount + 1);
				} else {
					alert("You've completed all medium levels! Going back to level selection.");
					location.reload();
				}
				break;
			case 'hard':
				if (currentGameCount < hardCars.length - 1) {
					alert("Great job! Moving to next map.");
					setUpRushHourGame(currentLevel, $("#game-container"), currentGameCount + 1);
				} else {
					alert("You've completed the hard level! Going back to level selection.");
					location.reload();
				}
				break;
		}
	}	


}



var easyCars = [
	[new Car(2, "red", [2, 3], "right"),
    new Car(3, "yellow", [1, 5], "right"),
    new Car(2, "green", [1, 2], "down"),
    new Car(2, "purple", [3, 4], "down"),
    new Car(2, "blue", [5, 4], "down")],
	
    [new Car(2, "red", [2, 1], "right"),
    new Car(3, "yellow", [2, 3], "down"),
    new Car(2, "green", [5, 1], "down"),
    new Car(2, "orange", [5, 3], "right"),
    new Car(2, "blue", [5, 5], "right")],
	
	[new Car(2, "red", [2, 1], "right"),
    new Car(3, "yellow", [2, 2], "down"),
    new Car(3, "purple", [3, 2], "right"),
    new Car(2, "green", [0, 5], "right"),
    new Car(3, "blue", [5, 5], "down")]
	

];

var mediumCars = [	
    [new Car(2, "red", [2, 2], "right"),
    new Car(3, "yellow", [2, 3], "down"),
    new Car(2, "green", [0, 1], "right"),
    new Car(2, "orange", [1, 2], "down"),
    new Car(3, "purple", [3, 0], "down"),
    new Car(3, "dgreen", [4, 2], "right"),
	new Car(2, "navy", [5, 1], "right"),
	new Car(3, "blue", [3, 5], "right"),
	new Car(2, "sblue", [5, 4], "down"),
	new Car(2, "pink", [5, 5], "down")],
	
    [new Car(2, "red", [2, 2], "right"),
    new Car(2, "sblue", [2, 0], "down"),
    new Car(2, "green", [0, 1], "right"),
    new Car(2, "orange", [1, 2], "down"),
    new Car(3, "yellow", [2, 3], "down"),
    new Car(3, "purple", [2, 4], "down"),
	new Car(3, "navy", [4, 5], "down"),
	new Car(2, "pink", [5, 1], "down"),
	new Car(2, "blue", [4, 3], "right"),
	new Car(3, "dgreen", [5, 5], "right")]
		
];

var hardCars = [
    [new Car(2, "red", [2, 2], "right"),
    new Car(3, "yellow", [4, 0], "down"),
    new Car(2, "green", [1, 0], "down"),
    new Car(2, "orange", [1, 1], "down"),
    new Car(2, "white", [3, 2], "right"),
    new Car(2, "brown", [5, 1], "right"),
	new Car(2, "yellow2", [5, 2], "down"),
	new Car(2, "sblue", [0, 3], "right"),
	new Car(2, "dgreen", [3, 3], "down"),
	new Car(2, "pink", [1, 4], "down"),
	new Car(2, "navy", [1, 5], "down"),
	new Car(2, "pink2", [3, 5], "down"),
	new Car(3, "purple", [4, 5], "right"),
	new Car(3, "blue", [5, 5], "right")]
];

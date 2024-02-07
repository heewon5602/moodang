/**
 * board.js
 */
/*
* This file corresponds to the board of the game
* The board object maintains the car i.e. drawing the cars, checking if the red car has reached the target */
function Board(cars) {
    this.grid = Array.from({ length: 6 }, () => new Array(6).fill(null));
    this.cars = cars;
    this.selectedCar;
    var board = this;
    this.setUpCars = function() {
        this.cars.forEach(function (car) {
            car.segments.forEach(function (sqaure){
                var $square = $("li").eq(sqaure[0] * this.grid.length + sqaure[1]);
                $square.addClass(car.color);
                $square.addClass("car");
                $square.click(function () {
                    $('.selected').removeClass("selected");
                    $('.'+car.color).addClass("selected");
                    board.selectedCar = car;
                });
            }, this);
        }, this);

    }



    this.isWon = function(){
        // The red car is always the first element of cars array.
        if (this.cars[0].segments[0][1] === 5) {
            return true;
        }
        return false;
    }


}





'use strict';
const number_div = document.getElementById("number");
const plus_button = document.getElementById("plus-button");
const minus_button = document.getElementById("minus-button");
const connect_button = document.getElementById("connect-button");
var number = 0;


class localMoveManager {

    receiveMove(move)
    {
        number = move;
        number_div.innerText = "" + number;
    }
}

var move_server = new moveServer(new localMoveManager);

plus_button.addEventListener("click", () => move_server.move(number + 1));
minus_button.addEventListener("click", () => move_server.move(number - 1));
connect_button.addEventListener("click", () => move_server.web_connect());
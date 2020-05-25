'use strict';
const number_div = document.getElementById("number");
const plus_button = document.getElementById("plus-button");
const minus_button = document.getElementById("minus-button");
const connect_button = document.getElementById("connect-button");
const connect_locally_button = document.getElementById("connect-locally-button");
var number = 0;


class gameManager {

    receiveMove(move)
    {
        number = move;
        number_div.innerText = "" + number;
    }

    receiveState(state)
    {
        // For this dumb 'game' a move is that same as a state.
        this.receiveMove(state);
    }
}

var move_server = new gameServer(new gameManager);
move_server.web_connect();

plus_button.addEventListener("click", () => move_server.state(number + 1));
minus_button.addEventListener("click", () => move_server.state(number - 1));
connect_button.addEventListener("click", () => move_server.web_connect());
connect_locally_button.addEventListener("click", () => move_server.local_connect());
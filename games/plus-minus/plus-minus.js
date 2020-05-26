'use strict';
const number_div = document.getElementById("number");
const plus_button = document.getElementById("plus-button");
const minus_button = document.getElementById("minus-button");
const connect_button = document.getElementById("connect-button");
const connect_locally_button = document.getElementById("connect-locally-button");
const send_button = document.getElementById("send-button");
const chat_text = document.getElementById("chat-text");
const chat_display = document.getElementById("chat-display");

var number = 0;

class gameManager {

    receiveMove(move)
    {
        number = move;
        number_div.innerText = "" + number;
    }

    receiveChat(sender, message)
    {
        let name = (sender === false) ? "You" : "Not you";
        chat_display.innerText += name + ": " + message + "\n";
    }
    
    receiveState(state)
    {
        // For this dumb 'game' a move is that same as a state.
        this.receiveMove(state);
    }
}

var game_server = new gameServer(new gameManager);

game_server.web_connect();

plus_button.addEventListener("click", () => game_server.state(number + 1));
minus_button.addEventListener("click", () => game_server.state(number - 1));

send_button.addEventListener("click", () => {
    let message = chat_text.value.trim();
    if(message != "")
    {
        game_server.chat_message(message);
    }
    chat_text.value = "";
});

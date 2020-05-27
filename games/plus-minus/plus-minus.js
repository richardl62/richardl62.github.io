'use strict';
function getElementById_Checked(id)
{
    let elem = document.getElementById(id);
    assert(elem, 'Element "' + id + '" not found');
    return elem;
}

const chat_text = getElementById_Checked("chat-text");
const chat_send = getElementById_Checked("chat-send");
const connect = getElementById_Checked("connect");
const number_div = getElementById_Checked("number");
const plus_button = getElementById_Checked("plus-button");
const minus_button = getElementById_Checked("minus-button");
const message_display = getElementById_Checked("message-display");
const test_mode= getElementById_Checked("test-mode");

var number = 0;

class gameManager {

    receiveMove(move)
    {
        number = move;
        number_div.innerText = "" + number;
    }

    show_message(message)
    {
        message_display.innerText += message;  
    }

    receiveChat(sender, message)
    {
        let name = (sender === false) ? "You" : "Not you";
        this.show_message(name + ": " + message + "\n");
    }
    
    receiveState(state)
    {
        // For this dumb 'game' a move is that same as a state.
        this.receiveMove(state);
    }
}

var game_manager = new gameManager;
var game_server = new gameServer(game_manager);


async function connect_to_server(local)
{
    const server = local ? gameServer_localserver : gameServer_webserver;

    game_manager.show_message("Connecting to " + server);

    const timeout = 10000; // milliseconds
    let p = game_server.connect(server, timeout);

    try {
        await p;
        game_manager.show_message(": SUCCESS\n")
    } catch(err) {
        game_manager.show_message(`: FAILED\n${err}\n`)
    }
}

plus_button.addEventListener("click", () => game_server.state(number + 1));
minus_button.addEventListener("click", () => game_server.state(number - 1));

chat_send.addEventListener("click", () => {
    let message = chat_text.value.trim();
    if(message != "")
    {
        game_server.chat_message(message);
    }
    chat_text.value = "";
});


connect.addEventListener("click", function(event){
    event.preventDefault();

    // Use local connect in test mode
    const local_connect = test_mode.checked; 
    connect_to_server(local_connect);
  });

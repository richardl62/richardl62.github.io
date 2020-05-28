'use strict';
function getElementById_Checked(id)
{
    let elem = document.getElementById(id);
    assert(elem, 'Element "' + id + '" not found');
    return elem;
}

function getElementsByClassName_checked(class_name)
{
    let elems = document.getElementsByClassName(class_name);
    assert(elems.length > 0, 'No elements of class "' + class_name + '" found');
    return elems;
}

const elems = {
    chat_text: getElementById_Checked("chat-text"),
    chat_send: getElementById_Checked("chat-send"),
    connect: getElementById_Checked("connect"),
    existing_group: getElementById_Checked("existing-group"),
    group_id: getElementById_Checked("group-id"),
    message_display: getElementById_Checked("message-display"),
    minus_button: getElementById_Checked("minus-button"),
    new_group: getElementById_Checked("new-group"),
    number_div: getElementById_Checked("number"),
    plus_button: getElementById_Checked("plus-button"),
    test_mode: getElementById_Checked("test-mode"),
}

const classes = {
    join_group_only: getElementsByClassName_checked("join-group-only"), 
}

var number = 0;

class gameManager {

    receiveMove(move)
    {
        number = move;
        number_div.innerText = "" + number;
    }

    show_message(message)
    {
        elems.message_display.innerText += message;  
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


async function connect_to_server(group_id, local)
{
    const server = local ? gameServer_localserver : gameServer_webserver;

    game_manager.show_message("Connecting to " + server);

    const options = {
        server: server,
        timeout: 10000,  // milliseconds
        state: number,
        group_id: group_id,
    }

    let p = game_server.connect(options);

    try {
        await p;
        game_manager.show_message(": SUCCESS\n")
    } catch(err) {
        game_manager.show_message(`: FAILED\n${err}\n`)
    }
}

elems.plus_button.addEventListener("click", () => game_server.state(number + 1));
elems.minus_button.addEventListener("click", () => game_server.state(number - 1));

elems.chat_send.addEventListener("click", () => {
    let message = elems.chat_text.value.trim();
    if(message != "")
    {
        game_server.chat_message(message);
    }
    elems.chat_text.value = "";
});


elems.existing_group.addEventListener("click", function(event){
    for(let elem of classes.join_group_only)
    {
        elem.style.display = "initial";
    }
});

elems.new_group.addEventListener("click", function(event){
    for(let elem of classes.join_group_only)
    {
        elem.style.display = "none";
    }
});

elems.connect.addEventListener("click", function(event){
    event.preventDefault();

    let group_id;
    console.log(elems.existing_group.checked)
    if(elems.existing_group.checked)
    {
        group_id = elems.group_id.value.trim();
        if(group_id == "") {
            game_manager.show_message("Connect failed: Group ID is missing");
            return;
        }
    }

    // Use local connect in test mode
    const local_connect = elems.test_mode.checked; 
    connect_to_server(group_id, local_connect);
  });
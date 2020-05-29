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
        elems.number_div.innerText = "" + number;
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

    const options = {
        server: server,
        timeout: 10000,  // milliseconds
        state: number,
        group_id: group_id,
    }

    let id = null;
    try {
        let p = game_server.connect(options);
        await p;
        game_manager.show_message("Connected\n");

        p.then(id => {
            elems.group_id.value = id;
            show_join_only_elems(true); // KLUDGE
        })
    } catch(err) {
        game_manager.show_message(err + "\n")
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

function show_join_only_elems(show)
{
    for(let elem of classes.join_group_only)
    {
        elem.style.display = show ? "initial" : "none";
    }
}
elems.existing_group.addEventListener("click", function(event){
    show_join_only_elems(true);
});

elems.new_group.addEventListener("click", function(event){
    show_join_only_elems(false);
});

elems.connect.addEventListener("click", function(event){
    event.preventDefault();

  
    const local_connect = elems.test_mode.checked; 

    let group_id;
    if(elems.existing_group.checked)
    {
        group_id = elems.group_id.value.trim();
        if(group_id == "") {
            game_manager.show_message("Connect failed: Group ID is missing");
            return;
        }
    }

    connect_to_server(group_id, local_connect);

  });
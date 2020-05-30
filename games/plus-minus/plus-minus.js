'use strict';


const elems = {
    chat_text: getElementById_Checked("chat-text"),
    chat_send: getElementById_Checked("chat-send"),
    connect: getElementById_Checked("connect"),
    connection_setup: getElementById_Checked("connection-setup"),
    connection_established: getElementById_Checked("connection-established"),
    disconnect: getElementById_Checked("disconnect"),
    group_id: getElementById_Checked("group-id"),
    group_id_span: getElementById_Checked("group-id-span"),
    message_display: getElementById_Checked("message-display"),
    minus_button: getElementById_Checked("minus-button"),
    number_div: getElementById_Checked("number"),
    participant_link: getElementById_Checked("participant-link"),
    plus_button: getElementById_Checked("plus-button"),
    test_mode: getElementById_Checked("test-mode"),
}

function startup() {
    const url = new URL(window.location.href); 
    let group_id = url.searchParams.get("group_id");
    let test_mode = url.searchParams.has("test_mode");

    elems.test_mode.checked = test_mode;
  
    if(group_id)
    {
        connect_to_server(group_id, test_mode);
    }
}

function set_group_id(id)
{
    group_id = id;
    elems.group_id_span.innerText = id;
}

function new_player_link()
{
    let url = new URL(window.location.href);
    assert(group_id);
    url.search = "";
    url.searchParams.set("group_id",group_id);
    if(url.searchParams.has("test_mode"))
        url.searchParams.set("test_mode",1);

    return url.href;
}

function test_mode()
{
    return elems.test_mode.checked; 
}


class gameManager {

    receiveMove(move)
    {
        number = move;
        elems.number_div.innerText = "" + number;
    }

    message(message)
    {
        elems.message_display.innerText += message; 
        elems.message_display.scrollTop = elems.message_display.scrollHeight; 
    }

    receiveChat(sender, message)
    {
        let name = (sender === false) ? "You" : "Not you";
        this.message(name + ": " + message + "\n");
    }
    
    receiveState(state)
    {
        // For this dumb 'game' a move is that same as a state.
        this.receiveMove(state);
    }
}

var group_id;
var number = 0;
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
        if(local) {
            game_manager.message("Using local server\n");
        }
        game_manager.message("Connecting to server");

        let p = game_server.connect(options);
        await p;
        game_manager.message(": Success\n");

        p.then(data => {
            console.log("connect_to_server SUCCESS: data=" + data);
            set_group_id(data);
            elems.connection_setup.style.display = "none";
            elems.connection_established.style.display = "initial";
        })
    } catch(err) {
        console.log("connect_to_server FAILED");
        game_manager.message(": FAILED\n" + err + "\n")
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

elems.connect.addEventListener("click", function(event){
    event.preventDefault();
    connect_to_server(elems.group_id.value.trim(), test_mode());
  });

elems.participant_link.addEventListener("click", function (event) {

    navigator.clipboard.writeText(new_player_link()).then(function () {
        game_manager.message('Link copied to clipboard');
    }, function (err) {
        game_manager.message(err);
    });
});

elems.disconnect.addEventListener("click", function (event) {
    game_server.disconnect();
    game_manager.message("Disconnected\n");
    set_group_id(null);
    elems.connection_setup.style.display = "initial";
    elems.connection_established.style.display = "none";
});

startup();

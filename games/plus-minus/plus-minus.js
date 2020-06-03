'use strict';

const server_connection_timeout = 4000; // milliseconds

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
    let group_id = parseInt(url.searchParams.get("group_id"));
    let test_mode = url.searchParams.has("test_mode");

    elems.test_mode.checked = test_mode;
  
    if(group_id)
    {
        set_group_id(group_id);
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
    if(test_mode())
        url.searchParams.set("test_mode",1);

    return url.href;
}

function test_mode()
{
    return elems.test_mode.checked; 
}


class gameManager {
    constructor()
    {
        this.state = make_state(0);
        this.receiveState(make_state(0))
    }

    number()
    {
        return this.state.number;
    }

    receiveMove(move)
    {
        assert(Object.keys(move).length, move.chat, "'move' should be chat");
        this.showChat(true /*kludge*/, move.chat);
    }

    message(message)
    {
        elems.message_display.innerText += message; 
        elems.message_display.scrollTop = elems.message_display.scrollHeight; 
    }
    
    receiveState(state)
    {
        Object.assign(this.state, state);

        elems.number_div.innerText = "" + this.number();
    }

    showChat(sender, message)
    {
        let name = (sender === false) ? "You" : "Not you";
        this.message(name + ": " + message + "\n");
    }
}

var group_id;
var game_manager = new gameManager;
var game_server = new gameServer(game_manager);

function make_state(num)
{
    assert(typeof num == "number")
    return {number: num};
}

async function connect_to_server(group_id, local)
{
    const server = local ? gameServer_localserver : gameServer_webserver;
    const make_new_group = !group_id;

    assert(!make_new_group || typeof group_id == "number", "Group ID must be a number");
    const options = {
        server: server,
        timeout: server_connection_timeout,
        state: make_state(game_manager.number()),
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

        p.then((socket_id, data) => {
            console.log("socket id: " + socket_id);
            console.log("connected to server: data=" + data);
            if(make_new_group)
                set_group_id(data);
            else
                game_manager.receiveState(data);
                
            elems.connection_setup.style.display = "none";
            elems.connection_established.style.display = "initial";
        })
    } catch(err) {
        console.log("connect_to_server failed:", err);

        if (err instanceof PromiseTimeout) {
            game_manager.message(": Timed out\n");
        } else {
            game_manager.message(`: ${err.name}\n${err.message}\n`)
        }
    }
}

elems.plus_button.addEventListener("click", () => 
    game_server.stateChange(make_state(game_manager.number() + 1)));

elems.minus_button.addEventListener("click", () => 
    game_server.stateChange(make_state(game_manager.number() - 1)));

elems.chat_send.addEventListener("click", () => {
    let message = elems.chat_text.value.trim();
    if(message != "")
    {
        game_server.move({chat: message});
    }
    elems.chat_text.value = "";
});

elems.connect.addEventListener("click", function(event){
    event.preventDefault();
    connect_to_server(parseInt(elems.group_id.value), test_mode());
  });

elems.participant_link.addEventListener("click", function (event) {

    navigator.clipboard.writeText(new_player_link()).then(function () {
        game_manager.message('Link copied to clipboard\n');
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

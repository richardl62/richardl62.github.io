'use strict';

const server_connection_timeout = 4000; // milliseconds

const elems = {
    chat_text: getElementById_Checked("chat-text"),
    chat_send: getElementById_Checked("chat-send"),

    connect: getElementById_Checked("connect"),
    connection_setup: getElementById_Checked("connection-setup"),
    connection_established: getElementById_Checked("connection-established"),
    disconnect: getElementById_Checked("disconnect"),
    group_id_input: getElementById_Checked("group-id-input"),
    group_id_display: getElementById_Checked("group-id-display"),
    minus_button: getElementById_Checked("minus-button"),
    participant_link: getElementById_Checked("participant-link"),
    plus_button: getElementById_Checked("plus-button"),
    test_mode: getElementById_Checked("test-mode"),
}

function startup() {
    const url = new URL(window.location.href); 
    let gid = parseInt(url.searchParams.get("group_id"));
    let test_mode = url.searchParams.has("test_mode");

    elems.test_mode.checked = test_mode;
  
    if(gid)
    {
        connect_to_server(gid, test_mode);
    }
}

function new_player_link()
{
    let url = new URL(window.location.href);
    assert(group_id());
    url.search = "";
    url.searchParams.set("group_id",group_id());
    if(test_mode())
        url.searchParams.set("test_mode",1);

    return url.href;
}

function test_mode()
{
    return elems.test_mode.checked; 
}

function group_id() {
    return parseInt(elems.group_id_input.value);
}

function set_group_id(gid) {
    if(gid) {
        assert(typeof gid == "number");
        elems.group_id_display.innerText = gid.toString();
        elems.group_id_input.value = gid.toString();
    } else {
        elems.group_id_display.innerText = "";
        elems.group_id_input.value = "";
    }
}

var game_manager = new gameManager;
var game_socket = new gameSocket(game_manager);

function make_state(num)
{
    assert(typeof num == "number")
    return {number: num};
}

async function connect_to_server(in_group_id /*can be null*/, local)
{
    const server = local ? gameServer_localserver : gameServer_webserver;

    const options = {
        server: server,
        timeout: server_connection_timeout,
    }

    if(in_group_id) {
        //Don't send state when connecting to an existing group.
        options.group_id = in_group_id;
    } else {
        options.state = make_state(game_manager.number());
    }

    let id = null;
    try {
        if(local) {
            game_manager.showMessage("Using local server\n");
        }
        game_manager.showMessage("Connecting to server");

        let p = game_socket.connect(options);
        await p;
        game_manager.showMessage(": Success\n");

        p.then(server_response => {            
            assert(server_response.player_id);
            assert(server_response.group_id);
            assert(server_response.group_state);
            console.log("Connected: ", server_response)
            set_group_id(server_response.group_id);

            game_manager.receiveState(server_response.group_state);
            
            elems.connection_setup.style.display = "none";
            elems.connection_established.style.display = "initial";
        })
    } catch(err) {
        console.log("connect_to_server failed:", err);

        if (err instanceof PromiseTimeout) {
            game_manager.showMessage(": Timed out\n");
        } else {
            game_manager.showMessage(`: ${err.name}\n${err.message}\n`)
        }
    }
}

elems.plus_button.addEventListener("click", () => 
    game_socket.action(null, make_state(game_manager.number() + 1)));

elems.minus_button.addEventListener("click", () => 
    game_socket.action(null, make_state(game_manager.number() - 1)));

elems.chat_send.addEventListener("click", () => {
    let message = elems.chat_text.value.trim();
    if(message != "")
    {
        game_socket.action({chat: message}, null);
    }
    elems.chat_text.value = "";
});

elems.connect.addEventListener("click", function(event){
    event.preventDefault();
    connect_to_server(group_id(), test_mode());
  });

elems.participant_link.addEventListener("click", function (event) {

    navigator.clipboard.writeText(new_player_link()).then(function () {
        game_manager.showMessage('Link copied to clipboard\n');
    }, function (err) {
        game_manager.showMessage(err);
    });
});

elems.disconnect.addEventListener("click", function (event) {
    game_socket.disconnect();
    game_manager.showMessage("Disconnected\n");
    set_group_id(null);
    elems.connection_setup.style.display = "initial";
    elems.connection_established.style.display = "none";
});

startup();

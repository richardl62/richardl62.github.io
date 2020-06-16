const gm_elems = {
    number: getElementById_Checked("number"),
    message_display: getElementById_Checked("message-display"),
}

class gameManager {
    constructor() {}
    /*
     * Function required by gameSocket
     */
    playerJoined(player_id) {
        this.showMessage(`Player ${player_id} joined the group\n`);
    }
    playerLeft(player_id) {
        this.showMessage(`Player ${player_id} left the group\n`);
    }
    
    receiveData(player_id, state, info) {
        if (info) {
            assert(Object.keys(data).length == 1 && data.chat, "chat expected");
            let name = "You";
            if (player_id) {
                name = game_socket.getPlayerName(player_id);
            }
            this.showMessage(`${name}: ${data.chat}\n`);
        }

        if(state) {
            if(state.number) {
                gm_elems.number.innerText = state.number.toString();
            }
        }
    /*
     * Support function
     */
    // number() {
    //     return this.m_state.number;
    // }

    showMessage(message) {
        gm_elems.message_display.innerText += message;
        gm_elems.message_display.scrollTop = gm_elems.message_display.scrollHeight;
    }
}

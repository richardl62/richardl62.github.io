const gm_elems = {
    number: getElementById_Checked("number"),
    message_display: getElementById_Checked("message-display"),
}

class gameManager {
    constructor() {
        this.state = make_state(0);
        this.receiveState(null, this.state);
    }
    /*
     * Function required by gameSocket
     */
    playerJoined(player_id) {
        this.showMessage(`Player ${player_id} joined the group\n`);
    }
    playerLeft(player_id) {
        this.showMessage(`Player ${player_id} left the group\n`);
    }
    
    receiveTranscient(player_id, data) {
        assert(Object.keys(data).length == 1 && data.chat, "chat expected");
        let name = player_id ? player_id : "You";
        this.showMessage(`${name}: ${data.chat}\n`);
    }

    receiveState(player_id, state) {
        Object.assign(this.state, state);
        gm_elems.number.innerText = state.number.toString();
    }
    /*
     * Support function
     */
    number() {
        return this.state.number;
    }

    showMessage(message) {
        gm_elems.message_display.innerText += message;
        gm_elems.message_display.scrollTop = gm_elems.message_display.scrollHeight;
    }
}

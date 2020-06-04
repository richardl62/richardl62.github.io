const gm_elems = {
    number: getElementById_Checked("number"),
    message_display: getElementById_Checked("message-display"),
}

class gameManager {
    constructor() {
        this.state = make_state(0);
        this.receiveState(this.state);
    }
    /*
     * Function required by gameSocket
     */
    action(player_id, transcient, state) {
        if(transcient) {
            this.receiveTransient(player_id, transcient);
        }

        if(state) {
            this.receiveState(state);
        }
    }

    joinedGroup(player_id) {
        this.message(`Player ${player_id} joined the group\n`);
    }
    leftGroup(player_id) {
        this.message(`Player ${player_id} left the group\n`);
    }
    
    /*
     * Support function
     */
    number() {
        return this.state.number;
    }

    receiveTransient(player_id, transcient) {
        assert(Object.keys(transcient).length == 1 && transcient.chat, "chat expected");
        let name = player_id ? player_id : "You";
        this.showMessage(`${name}: ${transcient.chat}\n`);
    }

    receiveState(state) {
        Object.assign(this.state, state);
        gm_elems.number.innerText = this.number().toString();
    }

    showMessage(message) {
        gm_elems.message_display.innerText += message;
        gm_elems.message_display.scrollTop = gm_elems.message_display.scrollHeight;
    }
}

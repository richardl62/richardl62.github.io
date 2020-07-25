"use strict";

function new_CantStopOnlineControl() {

    let control = new_CantStopControl();


    function onGameAction(action) {

        assert(typeof action == "object");

        // Every trancient action - i.e. every name/value pair action.transcient -
        //  maps directly to a function call in control.
        if(action.function_call) {
            const name = action.function_call[0];
            const args = action.function_call[1];
            //console.log("Function call: ", name, ...args);
            control[name](...args);
        }

        if(action.game_state) {
            control.game_state(action.game_state);
        }
    }

    let online_game = new OnlineGameSupport();
    online_game.onAction = onGameAction;

    function send_game_state() {
        online_game.action({game_state: control.game_state()});
    }

    function send_function_call(name, ...args) {
        online_game.action({function_call: [name, args]})
    }

    class OnlineControl {

        constructor() {
            Object.freeze(this);
        }

        joinGame(url_params) {
            return online_game.joinGame(url_params);
        }

        /*
         * Functions that don't send state
         */
        roll() {
            const dice_values = control.roll();

            send_function_call('roll', dice_values);
        } 

        select_move_option(index) {
            send_function_call('select_move_option', index);
        }

        undo() {
            send_function_call('undo');
        }

        commit() {
            send_function_call('commit');
        }

        /*
         * Functions don't send state
         */
        start_game(num_players) {
            control.start_game(num_players);
            send_game_state();
        }

        manual_filling_set(on) {
            control.manual_filling_set(on);
            send_game_state();
        }

        remove_player(player) {
            control.remove_player(player);
            send_game_state();
        }

        set_current_player(player, name) {
            control.set_current_player(player);
            send_game_state();
        }

        /*
         * Local functions, i.e. no online support.
         */

        get current_player() {
            return control.current_player;
        }

        get next_player() {
            return control.next_player;
        }
    };


    return new OnlineControl();
}

// function rl(...args) {
//     console.log(args);
// }

// rl([1]);
// rl(1,2,3);
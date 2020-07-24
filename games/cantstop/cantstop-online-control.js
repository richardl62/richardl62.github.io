"use strict";

function new_CantStopOnlineControl() {

    let control = new_CantStopControl();


    function onGameAction(player, action, state) {

        for(const name in action) {
            control[name](action[name]);
        }

        if(state) {
            control.state(state);
        }
    }

    let online_game = new OnlineGameSupport();
    online_game.onAction(onGameAction);

    function send_state() {
        online_game.state(control.state())
    }

    class OnlineControl {

        /*
         * Functions that don't send state
         */
        roll(dice_values) {
            online_game.action({roll: dice_values});
        } 

        select_move_option(index) {
            online_game.action({select_move_option: index});
        }

        undo() {
            online_game.action('undo');
        }

        commit() {
            online_game.action('commit');
        }

        /*
         * Functions don't send state
         */
        start_game(num_players) {
            control.start_game(num_players);
            send_state(); // Kludge?: The entire state is send
        }

        manual_filling_set(on) {
            control.manual_filling_set(on);
            send_state(); // Kludge?: The entire state is send
        }

        remove_player(player) {
            control.remove_player(player);
            send_state(); // Kludge?: The entire state is send
        }

        set_current_player(player, name) {
            control.set_current_player(player);
            send_state(); // Kludge?: The entire state is send
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
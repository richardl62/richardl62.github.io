// "use strict";

// function new_CantStopOnlineControl() {

//     let control = new_CantStopControl();


//     function processOnlineActions(
//         action,
//         joining_game = false // If true, only perform the actions are are relevent when first
//         // joining a game. Typically (always?) this will be setting state.
//     ) {
//         assert(typeof action == "object");

//         for (let name in action) {
//             let value = action[name];

//             if (name == "game_state") {
//                 control.game_state(value);
//             }
//             else if (name == "manual_filling") {
//                 control.set_manual_filling(value);
//             }
//             else if (name == "automatic_filling") {
//                 control.set_automatic_filling(value);
//             }
//             else if (!joining_game) {
//                 if (name == "function_call") {
//                     const function_name = value[0];
//                     const args = value[1];
//                     //console.log("Function call: ", name, ...args);
//                     control[name](...args);
//                 } else if(name == "player_id") {
//                    // Do nothing
//                 }
//                 else {
//                     console.log("Unrecognised online action", name, value)
//                 }
//             }
//         }
//     }

//     function send_options() {
//         online_game.action({
//              manual_filling: control.manual_filling,
//              automatic_filling: control.automatic_filling,
//         });
//     }

//     let online_game = new OnlineGameSupport();
//     online_game.onAction = processOnlineActions;

//     function send_game_state() {
//         online_game.action({ game_state: control.game_state() });
//     }

//     function send_function_call(name, ...args) {
//         online_game.action({ function_call: [name, args] })
//     }

//     class OnlineControl {

//         constructor() {
//             Object.freeze(this);
//         }

//         joinGame(url_params) {
//             return online_game.joinGame(url_params);
//         }

//         /*
//          * Functions with online support
//          */
//         roll() {
//             const dice_values = control.roll();
//             send_function_call('roll', dice_values);
//         }

//         select_move_option(index) {
//             send_function_call('select_move_option', index);
//         }

//         undo() {
//             send_function_call('undo');
//             send_game_state();
//         }

//         commit() {
//             send_function_call('commit');
//             send_game_state();
//         }

//         restart() {
//             control.reset();
//             send_game_state();
//         }

//         set_num_players(num_players) {
//             control.set_num_players(num_players);
//             send_game_state();
//         }

//         set_current_player(player, name) {
//             control.set_current_player(player);
//             send_game_state();
//         }

//         set_automatic_filling(on) {
//             control.set_automatic_filling(on);
//             send_options();
//         }

//         set_manual_filling(on) {
//             control.set_manual_filling(on);
//             send_options();
//         }

//         remove_player(player) {
//             control.remove_player(player);
//             send_player_info();
//         }

//         /*
//          * Local functions, i.e. no online actions.
//          */

//         get current_player() {
//             return control.current_player;
//         }

//         get next_player() {
//             return control.next_player;
//         }

//         get automatic_filling() {
//             return control.automatic_filling;
//         }

//         get manual_filling() {
//             return control.manual_filling;
//         }
//     };


//     return new OnlineControl();
// }

// // function rl(...args) {
// //     console.log(args);
// // }

// // rl([1]);
// // rl(1,2,3);
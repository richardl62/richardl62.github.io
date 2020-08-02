"use strict";

function CantStopControl(game_board, dice_array, game_display) {

   let current_player = null; // set by start_game()
   let num_players = null; 
   let online_support = null;

   const last_column = 12;
   
   var move_options = [];
   var selected_precommits = null;
   var player_left = null;

   var automatic_filling = null;
   var manual_filling = null;
   
   const max_players = 8;
   var player_names = new Array(max_players).fill("");

   
   // Setup to the board
   let n_squares = 3;
   for (let cn = 2; cn <= last_column; ++cn) // cn -> column number
   {
       game_board.add_column(cn, n_squares);
       n_squares += (cn <= (last_column/2)) ? 2 : -2;
   }


   let game_state_for_undo = {};
   let game_stage = null;
   let selected_move_index = null;

   /*
    * helper functions
    */
   function dice_state(state) {
        if(state === undefined) {
            return dice_array.map(d => d.state());
        } else {
            assert(state.length == dice_array.length);
            for(let i = 0; i < dice_array.length; ++i) {
                dice_array[i].state(state[i]);
            }
        }
   }

    function set_automatic_filling(on) {
        automatic_filling = on;
        game_display.automatic_filling(on);
    }

    function set_manual_filling(on) {
        manual_filling = on;
        game_display.manual_filling(on);

        game_board.allow_manual_control(on);
    }

    function set_player_name(player_number, name) {
        assert(typeof player_number == "number");
        assert(name === null || typeof name == "string");
        player_names[player_number] = name;

        //console.log(player_number, name);
        game_display.player_name_changed(player_number);
    }
    
    function remove_player(player) {
        player_left[player] = true;
        game_board.commit(player);
    
        for(let c of game_board.columns())
        {
            if(!c.is_owned())
                c.reset_player(player);
        }
    }

    function set_game_stage(stage, permitted_while_recieving_state = false) {
        assert(permitted_while_recieving_state || !receiving_state);
        game_stage = stage;
        game_display.stage(stage);
    }

   function do_roll(spin)
   {
       assert(spin != undefined, "spin option not set");
   
       game_board.promot_all_provisional_precommits(current_player);
       
       if(selected_precommits)
       {
           for(let p of selected_precommits)
           {
               game_board.column(p).in_play(true);
           }
           selected_precommits = null;
       }
   
       dice_array.forEach((d)=>d.roll(spin));
       
       let dice_numbers = [];
       dice_array.forEach((d)=> dice_numbers.push(d.number()));
   
       move_options = game_board.options(current_player, dice_numbers);
       if (move_options.length == 0 && automatic_filling) {
           set_game_stage('bust');
       } else {
           game_display.move_options(move_options);
           
           if (move_options.length == 1 && automatic_filling) {
               select_move_option(0);
           }
       }

    }

    function roll() {
        set_game_stage('roll');
        do_roll(true /*spin*/);
    }

    function set_num_players(num_players_)
    {
        assert(typeof num_players_ == "number");
        num_players = num_players_;
        game_display.num_players(num_players);
        restart();
    }

    function restart() {
       game_board.num_players(num_players);
       game_state_for_undo = game_board.state();

       player_left = new Array(num_players).fill(false);
       set_current_player(0);
   
       set_game_stage('required_roll', true /*allowed while receiving state*/);
    }
   
   function next_player() {
       // Find the next unfinished player
       let np = current_player; // np -> next player
       do {
           np = (np + 1) % num_players;
       } while(player_left[np] && np != current_player);
   
       if(player_left[np]) {
           // All players have left.
           set_game_stage('game_over'); 
       } else {
           set_game_stage('required_roll');
           set_current_player(np);
       }
   }
   
    // For use when recieving state.  Set the current player without any of the knock-on
    // actions on the game state.
    function do_set_current_player(new_current_player) {
        assert(typeof new_current_player == "number" &&
            new_current_player < num_players);

        current_player = new_current_player;
        game_display.current_player(current_player, player_names[current_player]);
    }

    function set_current_player(new_current_player) {

        do_set_current_player(new_current_player);
        game_board.remove_all_provisional_precommits(current_player);

        game_board.remove_all_precommits(current_player);
        selected_precommits = null;

        clear_in_play_columns();
    }

    function clear_in_play_columns() {
        for (let cn = 0; cn <= last_column; ++cn) {
            game_board.column(cn).in_play(false);
        }
    }

    function do_select_move_index(index) {
        selected_move_index = index;
        game_display.selected_move(index);
    }

    function select_move_option(index) {
        set_game_stage('move_options');
        do_select_move_index(index);

        game_board.remove_all_provisional_precommits(current_player);

        selected_precommits = move_options[index];
        game_display.selected_move(index);

        game_board.remove_all_provisional_precommits(current_player);

        if(selected_precommits) { // Can be null in manual mode
            game_board.add_provisional_precommit(current_player, selected_precommits);
        }
    }

    function undo() {
        game_board.state(game_state_for_undo);
    }

    function commit() {
        game_board.commit(current_player);
        game_state_for_undo = game_board.state();
        send_state_for_undo(game_state_for_undo);
    }

    const state_control = {
        stage: {
            record: obj => {
                obj.current_player = current_player;
                obj.stage = game_stage;

            },
            receive: obj => {
                // WARNING/KLUDGE: The current player should be set before the game stage.
                // This ensures that the correct player colour is used when bust. 
                do_set_current_player(obj.current_player);
                set_game_stage(obj.stage, true /* Permitted called while recieving state*/);
            },
        },

        game_options: {
            record: obj => {
                obj.manual_filling = manual_filling;
                obj.automatic_filling = automatic_filling;
            },
            receive: obj => {
                set_manual_filling(obj.manual_filling);
                set_automatic_filling(obj.automatic_filling);
            },
        },

        game_board: {
            record: obj => {
                obj.num_players = num_players;
                obj.game_board = game_board.state();
     
            },
            receive: obj => {
                if(obj.num_players != num_players) { // Not strictly necessary, but ...
                    set_num_players(obj.num_players);
                }
                game_board.state(obj.game_board);

            },
        },

        move_options: {
            record: obj => {
                obj.dice = dice_state();
                obj.move_options = move_options;
                obj.selected_move_index = selected_move_index;
            },
            receive: obj => {
                dice_state(obj.dice);

                move_options = [... obj.move_options]; // Make an independant copy
                game_display.move_options(move_options);
                do_select_move_index(obj.selected_move_index);
            },
        },

        player_names: {
            record: obj => {
                obj.player_names = player_names;
            },
            receive: obj => {
                assert(obj.player_names instanceof Array);

                const n_player_names = obj.player_names.length; // Can be more that the current number of players
                for(let index = 0; index < n_player_names; ++index) {
                    set_player_name(index, obj.player_names[index]);
                }
            },
        },
    }

    function game_state() {
        let state = {};
        for (let sc in state_control) {
            state_control[sc].record(state);
        }

        return state;
    }

    let sending_state = false;
    let receiving_state = false;
    let send_state_count = 0;
    let receive_state_count = 0;

    function send_state() {
        assert(!sending_state, "Attempt to send of state while already sending");
        assert(!receiving_state, "Attempt to send of state while receieving");
        if (online_support) {
            if (!online_support.joined) {
                // It looks like the connection has been lost. I think continuing
                // is OK, but any moves will be lost if reconnecting.
                console.log("Attempt to send state when not connectected to a game");
            } else {
                send_state_count++;
                //console.log(`Send state (${send_state_count}): started`);

                try {
                    sending_state = true;
                    online_support.sendState({ state: game_state() });
                } finally {
                    sending_state = false;
                }
            }
            //console.log(`Send state (${send_state_count}): finished`);
        }
    }

    function send_state_for_undo(state) {
        if(online_support && online_support.joined) {
            online_support.sendState({
                state: null,
                state_for_undo: state,
            });
        }
    }

    function receive_state(data) {
        assert(!sending_state, "Attempt receive of state while sending");
        assert(data.state || data.state_for_undo);
    
        if (data.state) {
            receive_state_count++;
            //console.log(`Receive state (${receive_state_count}): started`);
            try {
                for (let sc in state_control) {
                    receiving_state = true;
                    state_control[sc].receive(data.state);
                }
            } finally {
                receiving_state = false;
            }

            if (data.use_for_undo) {
                console.log('Using received state for undo');
                game_state_for_undo = game_board.state();
            }
        }

        if (data.state_for_undo) {
            game_state_for_undo = data.state_for_undo;
        }
    }
 
    // Public interface for functionality defined above.
    // Also sends state changes to the server when apppopriate.
    class PublicControl {

        constructor() {
            Object.freeze(this);
        }

        async join_game(online_support_) {
            game_display.status_message('Connecting ...');
            online_support_.onDisconnect = ()=>{
                game_display.status_message("Offline: Connection lost");
                alert("Connection to server lost");
            };

            try {
                let server_data = await online_support_.joinGame(game_state());

                online_support = online_support_;
                assert(online_support.joined);
                online_support.onReceiveState = receive_state;

                // server_data.state is the game state recorded in the server at 
                // the time of th join request. If this is the first request, it
                // will be null. 
                assert(server_data.hasOwnProperty('state'));
                if (server_data.state) {
                    receive_state({
                        state: server_data.state,
                    });
                    game_state_for_undo = game_board.state();
                }

                game_display.status_message(
                    `Online: Game ID ${online_support.game_id}`
                );
            } catch(err) {
                console.log("join_game failed:", err);
                game_display.status_message('Offline: Connection failed');
                throw err;
            }
        }

        roll() {
            roll();

            send_state();
        } 

        select_move_option(index) {
            select_move_option(index);

            send_state();
        }

        undo() {
            undo();

            send_state();
        }

        commit() {
            commit();

            send_state();
        }

        finished_rolling() { // used when turn is over without going bust
            commit();
            next_player();

            send_state();
        }

        next_player() {
            next_player();

            send_state();
        }

        pass() {
            undo();

            next_player();
            send_state();
        }

        restart() {
            restart();

            send_state();
        }

        set_num_players(num) {
            set_num_players(num);

            send_state();
        }

        set automatic_filling(on) {
            set_automatic_filling(on);

            send_state();
        }

        set manual_filling(on) {
            set_manual_filling(on);

            send_state();
        }

        set_player_name(player_number, name) {
            set_player_name(player_number, name);

            send_state();
        }

        remove_player(player) {
            remove_player(player);
            if(player == current_player) {
                next_player();
            }

            send_state();
        }

        process_player_square_click(info) {
            assert(info.player_number !== undefined);
            assert(info.square_empty !== undefined);
            assert(info.column !== undefined);
    
            let col = info.column;
            if (manual_filling && !col.is_owned()) {
                if (info.square_empty) {
                    col.commit_noncommited_square(info.player_number);
                } else {
                    col.clear_nonempty_square(info.player_number);
                }
    
                send_state();
            }
        }

        onPlayerSquareClick(callback) {
            game_board.onPlayerSquareClick(callback);
        }

        in_play_column_clicked(column) {
            if(manual_filling) {
                column.in_play(!column.in_play());

                send_state();
            }
        }

        onInPlayColumnClick(callback) {
            game_board.onInPlayColumnClick(callback);
        }

        get_player_name(player_number) {
            assert(typeof player_number == "number");
            return player_names[player_number];
        }

        get current_player() {
            return current_player;
        }

        get automatic_filling() {
            return automatic_filling;
        }

        get manual_filling() {
            return manual_filling;
        }
    }

    return new PublicControl();
}

"use strict";

function CantStopControl(game_board, dice_array, game_display) {

   let current_player = null; // set by start_game()
   let num_players = null; // Starts at 0. Set by start_game()
   let online_support = null;

   const last_column = 12;
   
   var move_options = null;
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
   
   
   /*
    * helper functions
    */
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
           game_display.stage('bust');
       }
       else {
           game_display.move_options(move_options);
       }
    }

    function roll() {
        game_display.stage('move_options');
        do_roll(true /*spin*/);
    }

    function start_game(num_players_)
    {
       assert(typeof num_players_ == "number");
       num_players = num_players_;
       
       game_board.num_players(num_players);
       game_state_for_undo = game_board.state();

       player_left = new Array(num_players).fill(false);
       set_current_player(0);
   
       game_display.stage('required_roll');
    }
   
   function next_player() {
       // Find the next unfinished player
       let np = current_player; // np -> next player
       do {
           np = (np + 1) % num_players;
       } while(player_left[np] && np != current_player);
   
       if(player_left[np]) {
           // All players have left.

           game_display.stage('game_over'); 
       } else {
           set_current_player(np);
       }
   }
   
   function set_current_player(new_current_player) {
       assert(typeof new_current_player == "number" &&
           new_current_player < num_players);
   
       current_player = new_current_player;
   
       game_board.remove_all_provisional_precommits(current_player);
   
       game_board.remove_all_precommits(current_player);
       selected_precommits = null;
   
       game_display.stage('required_roll');
   
       clear_in_play_columns();
       
       game_display.current_player(current_player, player_names[current_player]);
    }
   
   function clear_in_play_columns() {
       for (let cn = 0; cn <= last_column; ++cn) {
           game_board.column(cn).in_play(false);
       }
   }
   
    function select_move_option(index) {
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
    }

    const state_control = {
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
                obj.current_player = current_player;
            },
            receive: obj => {
                //set_num_players(state.num_players);
                game_board.state(obj.game_board);
                set_current_player(obj.current_player);
            },
        },

        move_options: {
            record: obj => {
                //obj.dice_values = XXX;
                //obj.move_options = XXX;
            },
            receive: obj => {

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

    function send_state() {
        if (online_support) {
            online_support.sendState(game_state());
        }
    }
    
    function receive_state(state) {
        for(let sc in state_control) {
            //console.log("receiveing", sc);
            state_control[sc].receive(state);
        }
    }
 
    // Public interface for functionality defined above.
    // Also sends state changes to the server when apppopriate.
    class PublicControl {

        constructor() {
            Object.freeze(this);
        }

        async join_game(online_support_) {
            let server_data = await online_support_.joinGame(game_state());
            
            online_support = online_support_;
            assert(online_support.joined);
            online_support.onReceiveState = receive_state;

            // server_data.state is the game state recorded in the server at 
            // the time of th join request. If this is the first request, it
            // will be null. 
            assert(server_data.hasOwnProperty('state'));
            if(server_data.state) {
                receive_state(server_data.state);
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
        
        next_player() {
            next_player();

            send_state();
        }

        start_game(num_players) {
            start_game(num_players);

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

            send_state();
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

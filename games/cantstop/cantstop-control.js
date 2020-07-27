"use strict";

function new_CantStopControl(game_board) {

   let current_player = null; // set by start_game()
   let num_players = null; // Starts at 0. Set by start_game()
   

   const last_column = 12;
   let dice_array = make_dice_array();
   
   var move_options = null;
   var selected_precommits = null;
   var player_left = null;
   
   const max_players = 8;
   var player_names = new Array(max_players);
   for(let i = 0; i < max_players; ++i) {
       player_names[i] = "Player " + (i+1);
   }

   
   // Setup to the board
   let n_squares = 3;
   for (let cn = 2; cn <= last_column; ++cn) // cn -> column number
   {
       game_board.add_column(cn, n_squares);
       n_squares += (cn <= (last_column/2)) ? 2 : -2;
   }


   let game_state;
   
   
   /*
    * helper functions
    */
   
   
   function make_dice_array() {
       let arr = new Array(n_dice);
   
       for (let i = 0; i < n_dice; i++) {
           arr[i] = new dice(jq.dice.get(i));
           arr[i].roll(false /* don't spin */);
       }
   
       return arr;
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
       if (move_options.length == 0 && automatic_filling()) {
           gameDisplay.stage('bust');
       }
       else {
           gameDisplay.move_options(move_options);
       }
    }

   
    function start_game(num_players_)
    {
       assert(typeof num_players_ == "number");
       num_players = num_players_;
       
       game_board.num_players(num_players);
       game_state = game_board.state();

       player_left = new Array(num_players).fill(false);
       set_current_player(0);
   
       gameDisplay.stage('required_roll');
    }
   
   function set_css_player_color(color) {
       jq.game.get(0).style.setProperty("--player-color", color);
   }
   
   function change_current_player() {
       // Find the next unfinished player
       let np = current_player; // np -> next player
       do {
           np = (np + 1) % num_players;
       } while(player_left[np] && np != current_player);
   
       if(player_left[np]) {
           // All players have left.
           set_css_player_color("var(--games-board-non-player-color)");
           gameDisplay.stage('game_over'); 
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
   
       gameDisplay.stage('required_roll');
   
       set_css_player_color(get_cantstop_player_color(current_player));
   
       clear_in_play_columns();
       
       gameDisplay.current_player_name(player_names[current_player]);
    }
   
   function clear_in_play_columns() {
       for (let cn = 0; cn <= last_column; ++cn) {
           game_board.column(cn).in_play(false);
       }
   }

   
    function select_move_option(index) {
        game_board.remove_all_provisional_precommits(current_player);

        selected_precommits = move_options[index];
        gameDisplay.selected_move(index);

        game_board.remove_all_provisional_precommits(current_player);
        game_board.add_provisional_precommit(current_player, selected_precommits);
    }
   
    class Control {

        roll() {
            gameDisplay.stage('move_options');
            do_roll(true /*spin*/);
        } 

        select_move_option(index) {
            select_move_option(index);
        }

        undo() {
            game_board.state(game_state);
        }

        commit() {
            game_board.commit(current_player);
            game_state = game_board.state();
        }
        
        next_player() {
            change_current_player();
        }

        start_game(num_players) {
            start_game(num_players);
        }

        remove_player(player) {
            player_left[player] = true;
            game_board.commit(player);
        
            for(let c of game_board.columns())
            {
                if(!c.is_owned())
                    c.reset_player(player);
            }
        }

        manual_filling_set(on) {
            game_board.allow_manual_control(on);
        }

        get current_player() {
            return current_player;
        }
    };


    return new Control();
}

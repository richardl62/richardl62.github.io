"use strict";

function new_CantStopControl(...args) {

   const disable_at_end_of_game = [jq.pass, jq.leave];
   
   
   let current_player = null; // set by start_game()
   let num_players = null; // Starts at 0. Set by start_game()
   
   const n_dice = 4;
   const last_column = 12;
   
   
   jq.automatic_filling.prop("checked", true);
   
   
   assert(jq.dice.length == n_dice);
   
   const max_move_options = 6;
   assert(jq.dice_options.length == max_move_options);
   
   let dice_array = make_dice_array();
   
   let game_over_visibility = new CssVisibility(jq.game_over);
   let move_options_visibility = new CssVisibility(jq.move_options);
   let bust_visibility = new CssVisibility(jq.bust);
   let required_roll_visibility = new CssVisibility(jq.required_roll)
   
   var move_options = null;
   var selected_precommits = null;
   var player_left = null;
   
   const max_players = 8;
   var player_names = new Array(max_players);
   for(let i = 0; i < max_players; ++i) {
       player_names[i] = "Player " + (i+1);
   }
   
   const selected_move = "selected-move";
   
   // Setup to the board
   let game_board = make_game_board();;
   let game_state;
   
   
   /*
    * helper functions
    */
   
   
    // Must call set_num_players() after make_game_board();
   function make_game_board() {
   
       let board = new CantStopBoard(jq.board);
       
       let n_squares = 3;
       for (let cn = 2; cn <= last_column; ++cn) // cn -> column number
       {
           board.add_column(cn, n_squares);
           n_squares += (cn <= (last_column/2)) ? 2 : -2;
       }
   
       return board;
   }
   
   function make_dice_array() {
       let arr = new Array(n_dice);
   
       for (let i = 0; i < n_dice; i++) {
           arr[i] = new dice(jq.dice.get(i));
           arr[i].roll(false /* don't spin */);
       }
   
       return arr;
   }
   
   function show_one(to_show)
   {
       game_over_visibility.hidden(true);
       bust_visibility.hidden(true);
       move_options_visibility.hidden(true);
       required_roll_visibility.hidden(true);
   
       to_show.hidden(false);
   }
   
   function disable_roll_and_dont_buttons(disable)
   {
       jq.roll.prop("disabled", disable);
       jq.dont.prop("disabled", disable);
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
       if (move_options.length == 0) {
           show_one(bust_visibility);
       }
       else {
           display_move_options();
       }
   
       if (automatic_filling()) { // On by default
           if(!manual_filling()) {
               disable_roll_and_dont_buttons(true);
   
               if (move_options.length == 1) {
                   select_move_option(0);
               }
           }
       }
    }
   
    function display_move_options()
    {
       clear_selected_move();
   
       function option_string(opt)
        {
           assert(opt.length == 1 || opt.length == 2);
           let str = "" + opt[0]; 
           if(opt.length == 2)
               str += " & " + opt[1];
   
           return str;
        }
   
        for(let n = 0; n < max_move_options; ++n)
        {
           let str = "";
           if(n < move_options.length)
              str = option_string(move_options[n]);
   
          $(jq.dice_options[n]).text(str);
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
   
       show_one(required_roll_visibility);
   
       disable_at_end_of_game.forEach(e => e.prop("disabled", false));
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
           show_one(game_over_visibility); 
           disable_at_end_of_game.forEach(e => e.prop("disabled", true));
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
   
       show_one(required_roll_visibility);
   
       set_css_player_color(get_cantstop_player_color(current_player));
   
       clear_in_play_columns();
   
       set_current_player_name();
   }
   
   function clear_in_play_columns() {
       for (let cn = 0; cn <= last_column; ++cn) {
           game_board.column(cn).in_play(false);
       }
   }
   
   function clear_selected_move() {
       jq.dice_options.removeClass(selected_move);
   }
   
   function select_move_option(index) {
       const auto_move = move_options[index] && automatic_filling();
       if (auto_move || manual_filling()) {
           clear_selected_move();
           game_board.remove_all_provisional_precommits(current_player);
       }
   
       if(auto_move) {
           selected_precommits = move_options[index];
           $(jq.dice_options[index]).addClass(selected_move);
   
           game_board.remove_all_provisional_precommits(current_player);
           game_board.add_provisional_precommit(current_player, selected_precommits);
   
           disable_roll_and_dont_buttons(false);
       }
   }
   
   
   function set_current_player_name() {
       let elem = jq.player_name[0];
       elem.value = player_names[current_player];
   }
   
    class Control {

        roll() {
            show_one(move_options_visibility);
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


    return new Control(...args);
}
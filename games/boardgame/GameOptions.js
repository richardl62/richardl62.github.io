"use strict";

const  game_types = [GamePlayDropdown, GamePlayOthello, GamePlayUnrestricted];

class GameOptions {
    constructor()
    {
        this.game_index = 0;
        this.initial_status_index = 0;
    }

    // return the names of the available game (array of strings)
    game_names() {
        var names = [];
        
        game_types.forEach(game => names.push(game.mode()));
        
        return names;
    }

    // Get or set the current game index (indexes into game_names())
    // Defaults to 0
    game(index)
    {
        if(index === undefined)
        {
            return this.game_index;
        }
        this.game_index = index;
        this.initial_status_index = 0;
    }

    intial_statuses()
    {
        return game_types[this.game_index].intial_statuses_json()
    }

    // return the names of initial statuss of the selected game (array of strings)
    initial_status_names() {
        var names = [];
        
        this.intial_statuses().forEach(elem => names.push(elem[0]));
        
        return names;
    }

    // Get or set the current initial status (indexes into initial_status_names())
    // Defaults to 0
    initial_status(index)
    {        
        if(index === undefined)
        {
            return this.initial_status_index;
        }
        this.initial_status_index = index;
    }

    // Return a new game play object for the currently selected game
    new_game_play()
    {
        game_play = new game_types[this.game_index];
    }

    // Return the currently selected intial status
    intial_status()
    {
        const isj = this.intial_statuses()[this.initial_status_index]; 
        return JSON.parse(isj);
    }
}






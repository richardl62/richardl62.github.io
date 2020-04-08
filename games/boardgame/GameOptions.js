"use strict";

const  game_types = [GamePlayOthello, GamePlayDropdown, GamePlayUnrestricted];

class GameOptions {
    constructor()
    {
        this.m_game_index = 0;
        this.m_initial_status_index = 0;
    }

    // return the names of the available game (array of strings)
    game_names() {
        var names = [];
        
        game_types.forEach(game => names.push(game.mode()));
        
        return names;
    }

    // Get or set the current game index (indexes into game_names())
    // Defaults to 0
    game_index(index)
    {
        if(index === undefined)
        {
            return this.m_game_index;
        }
        this.m_game_index = index;
        this.m_initial_status_index = 0;
    }

    // return the names of initial statuss of the selected game (array of strings)
    initial_status_names() {
        var names = [];
        
        this.initial_statuses().forEach(elem => names.push(elem[0]));
        
        return names;
    }

    // Get or set the current initial status (indexes into initial_status_names())
    // Defaults to 0
    initial_status_index(index)
    {        
        if(index === undefined)
        {
            return this.m_initial_status_index;
        }
        this.m_initial_status_index = index;
    }

    // Return a new game play object for the currently selected game
    new_game_play()
    {
        return new game_types[this.game_index()];
    }

    // Return the currently selected initial status
    initial_status()
    {
        const isj = this.initial_statuses()[this.initial_status_index()]; 
        return JSON.parse(isj[1]);
    }

    // For internal use
    initial_statuses()
    {
        return game_types[this.game_index()].initial_statuses_json()
    }
}






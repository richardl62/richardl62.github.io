"use strict";

class GameType{
    constructor(game_control, intial_states)
    {
        this.game_control = game_control;
        this.initial_states = intial_states;
    }

    new_controller(board)
    {
        return new this.game_control(board);
    }

    state(name)
    {
        return this.initial_states[name];
    }

    state_names()
    {
        return Object.keys(this.initial_states);
    }
}

const game_types =
    {
        "dropdown":  new GameType(GamePlayDropdown, {
            "8x8": [8,8,[[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,]]],
            "8x8 floats": [8,8,[[,,,,,,,,],[,,,,,,,,],[,,1,,,2,,,],[,,,,,,,,],[,,,,,,,,],[,,2,,,1,,,],[,,,,,,,,],[,,,,,,,,]]], 
            "7x6 floats": [6,7,[[,,,,,,,],[,,2,,1,,,],[,,,,,,,],[,,1,,2,,,],[,,,,,,,],[,,,,,,,]]],
        }),
        
        "othello": new GameType(GamePlayOthello, {
            "8x8": [8,8,[[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,1,2,,,,],[,,,2,1,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,]]],
            "7x7": [7,7,[[,,,,,,,],[,,,,,,,],[,,2,1,2,,,],[,,1,2,1,,,],[,,2,1,2,,,],[,,,,,,,],[,,,,,,,]]],
            "6x6": [6,6,[[,,,,,,],[,,,,,,],[,,1,2,,,],[,,2,1,,,],[,,,,,,],[,,,,,,]]],
            "5x5": [5,5,[[,,,,,],[,2,1,2,,],[,1,2,1,,],[,2,1,2,,],[,,,,,]]],
            "Cornerless": [8,8,[[0,0,,,,,0,0],[0,0,,,,,0,0],[,,,,,,,,],[,,,1,2,,,,],[,,,2,1,,,,],[,,,,,,,,],[0,0,,,,,0,0],[0,0,,,,,0,0]]],
        }),

        "unrestricted": new GameType(GamePlayUnrestricted, {
            "8x8": [8,8,[[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,]]],
            "7x7 blocks": [7,7,[[,,,,,,,],[,0,,,,0,,],[,,,,,,,],[,,,,,,,],[,,,,,,,],[,0,,,,0,,],[,,,,,,,]]],
            "1x1 (test)": [1,1,[[,]]],
        }),
    }

function game_names()
{
    return Object.keys(game_types);
}



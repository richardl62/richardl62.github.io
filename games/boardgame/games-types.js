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
        // KLUDGE: convert to and from JSON just to change 'unknown' to 'null'
        const json = JSON.stringify(this.initial_states[name]);
        return JSON.parse(json);
    }

    state_names()
    {
        return Object.keys(this.initial_states);
    }
}

const game_types_INTERNAL =
    {
        "dropdown":  new GameType(GamePlayDropdown, {
            "8x8": [[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,]],
            "8x8 floats": [[,,,,,,,,],[,,,,,,,,],[,,1,,,2,,,],[,,,,,,,,],[,,,,,,,,],[,,2,,,1,,,],[,,,,,,,,],[,,,,,,,,]], 
            "7x6 floats": [[,,,,,,,],[,,2,,1,,,],[,,,,,,,],[,,1,,2,,,],[,,,,,,,],[,,,,,,,]],
        }),
        
        "othello": new GameType(GamePlayOthello, {
            "8x8": [[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,1,2,,,,],[,,,2,1,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,]],
            "7x7": [[,,,,,,,],[,,,,,,,],[,,2,1,2,,,],[,,1,2,1,,,],[,,2,1,2,,,],[,,,,,,,],[,,,,,,,]],
            "6x6": [[,,,,,,],[,,,,,,],[,,1,2,,,],[,,2,1,,,],[,,,,,,],[,,,,,,]],
            "5x5": [[,,,,,],[,2,1,2,,],[,1,2,1,,],[,2,1,2,,],[,,,,,]],
            "Cornerless": [[0,0,,,,,0,0],[0,0,,,,,0,0],[,,,,,,,,],[,,,1,2,,,,],[,,,2,1,,,,],[,,,,,,,,],[0,0,,,,,0,0],[0,0,,,,,0,0]],
        }),

        "unrestricted": new GameType(GamePlayUnrestricted, {
            "8x8": [[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,],[,,,,,,,,]],
            "7x7 blocks": [[,,,,,,,],[,0,,,,0,,],[,,,,,,,],[,,,,,,,],[,,,,,,,],[,0,,,,0,,],[,,,,,,,]],
        }),
        "experimental": new GameType(GamePlayExperimental, {
            "1x2": [[,,]],
            "8x8 blocks": [[,,,,,,,],[,0,,,,,0,],[,,,,,,,],[,,,,,,,],[,,,,,,,],[,,,,,,,],[,0,,,,,0,],[,,,,,,,]],
            "7x7 blocks": [[,,,,,,,],[,0,,,,0,,],[,,,,,,,],[,,,,,,,],[,,,,,,,],[,0,,,,0,,],[,,,,,,,]],
            "1x1 (test)": [[,]],
        }),

    }


function game_names()
{
    return Object.keys(game_types_INTERNAL);
}

function get_game_type(name)
{
    return game_types_INTERNAL[name];
}



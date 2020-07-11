'use strict';

// Rotate element through 360 degrees
function rotate_360(elem,
    duration, // duration of the rotation in millisecconds
    end_func
) {

    const angle_increment = 6;
    const n_steps = 360 / angle_increment;

    var angle = 0;
    var id = setInterval(increment_rotation, duration / n_steps);
    function increment_rotation() {
        if (angle >= 360) {
            clearInterval(id);
            elem.style.transform = "none";
            if(end_func)
            {
                end_func();
            }
        } else {
            angle += angle_increment;
            elem.style.transform = "rotate(" + angle + "deg)";
        }
    }
}

const dot_patterns = [
    , //0
    [3], // 1
    [0, 6], // 2;
    [0, 3, 6], // 3
    [0, 2, 4, 6], // 4
    [0, 2, 3, 4, 6], // 5
    [0, 1, 2, 4, 5, 6] // 6
];
const n_dice_dots = 7;
class dice {
    constructor(input_elem)
    {
        this.dice_input_elem = input_elem;

        $(input_elem).addClass("dice");
        this.dots = new Array(n_dice_dots);
        for (var i = 0; i < n_dice_dots; ++i)
        {
            var node = $("<div></div>");
            $(input_elem).append(node);
            node.addClass("dice-spot");
            node.addClass("spot" + i);

            this.dots[i] = node;  
        }
    }

    number(num) {
        // Kludge? Hid all the dots, then make selected dots visible
        if(num === undefined)
        {
            return this.num;
        }

        this.num = num;

        const dots_to_show = dot_patterns[num];
        for(var dn = 0; dn < n_dice_dots; ++dn)
        {
            var vis = dots_to_show.includes(dn) ? "visible" : "hidden";
            this.dots[dn].css("visibility", vis);
        }
    }
    
    show_all_dots()
    {
        this.dots.forEach(dot => dot.css("visibility", "visible"));
    }

    roll(spin /*default to true*/)
    {
        if(spin === undefined)
        {
            spin = true;
        }

        let num = Math.floor((Math.random() * 6) + 1);
            
        //KLUDGE?: This function returns before the end of the spin.  
        // Set the number before the spin incase calling code gets it during the spin.
        this.number(num);

        if(spin)
        {
            this.show_all_dots();
            rotate_360(this.dice_input_elem, 750 /*millisecs*/, ()=>this.number(num));
        }

    }
}

// dice with a 'hold' option. The option is just cosmetic in that it does not
// affect roll function.  This class is intended for use as part of a diceSet.
class holdableDice extends dice 
{
    constructor(elem)
    {
        var raw_dice_elem = document.createElement("div");
        super(raw_dice_elem);

        this.holdable_input_elem = elem;

        this.top_elem = $(elem);
        this.dice_elem = $(raw_dice_elem);
        this.hold_elem = $(document.createElement("div"));

        this.hold_elem.addClass("hold-text");
        this.hold_elem.text("Held");
  
        $(elem).append(this.dice_elem, this.hold_elem);

        this.hold(false); // the default
    }

    hold(on_off)
    {
        if(on_off === undefined)
        {
            return this.held;
        }
        else
        {
            this.held = on_off;
            this.dice_elem.toggleClass("dice-held", on_off);


            this.hold_elem.css("visibility", 
                on_off ? "visible" : "hidden"
            );
        }
    }

    // Set a click callback.
    click(callback)
    {
        this.top_elem.click(() => callback(this));
    }
}

class diceSet {
    constructor( 
        elem /* div or similar to hold the dice. Can be html or jQuery */
        ) {

        this.user_elem = $(elem);
        this.dice_set = [];

        this.user_elem.addClass("dice-set");
    }

    n_dice(num_dice) {
        if (num_dice === undefined) {
            return this.dice_set.length;
        }

        // Remove all the current dice. (Inefficient as some dice will then be added.)
        this.dice_set.forEach(die => die.holdable_input_elem.remove());

        this.dice_set = new Array(num_dice);
        for (var i = 0; i < num_dice; ++i) {
            var node = document.createElement("div");
            this.user_elem.append(node);

            this.dice_set[i] = new holdableDice(node);
            this.dice_set[i].click(die => die.hold(!die.hold()));
        }

        this.initialise_all();
    }

    roll_all(spin /* default is true*/)
    {
        this.dice_set.forEach(die => {die.roll(spin); die.hold(false);});
    }

    initialise_all()
    {
        this.dice_set.forEach(die => die.number(1));
    }

    roll_unheld() 
    {
        var held = [];

        for (var pos = 0; pos < this.dice_set.length; ++pos) 
        {
            var die = this.dice_set[pos];

            if (die.hold()) {
                held.push(die.number());
            }
        }

        held.sort();

        for (var pos = 0; pos < this.dice_set.length; ++pos) 
        {
            var die = this.dice_set[pos];
            
            if (pos < held.length) {
                die.number(held[pos]);
                die.hold(true);
            }
            else {
                die.roll();
                die.hold(false);
            }

        }
    }
 
    die(num) {return this.dice_set[num];}
}

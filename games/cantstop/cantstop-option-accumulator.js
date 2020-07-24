'use strict';

class CantStopOptionAccumulator {
    constructor(in_play, is_full) {
        this.in_play = in_play;
        this.is_full = is_full;
        this.n_addable = Math.max(in_play_column_limit - in_play.size, 0);
        this.options = new Array;

        Object.seal(this);
    }

    candidate_pair(a, b) {
        // Add the pair as an option if possible.  If not, try the
        // two numbers as singles.

        let n_not_in_play = 0;
        if (!this.in_play.has(a))
            ++n_not_in_play;
        if (a != b && !this.in_play.has(b))
            ++n_not_in_play;

        if (!this.is_full.has(a) && !this.is_full.has(b) &&
            n_not_in_play <= this.n_addable) {
            this.options.push([a, b].sort());
        } else {
            this.candidate_single(a);
            this.candidate_single(b);
        }
    }
 
    candidate_single(a) {
        if (this.is_full.has(a)) {
            // do nothing
        }
        else if (this.in_play.has(a) || this.n_addable > 0) {
            this.options.push([a]);
        }
    }
    // Unsorted, and could contain duplicates.
    // Individual pairs are sorted.
    get_options() {
        return this.options;
    }
}

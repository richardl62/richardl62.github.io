'use strict';

class CantStopOptionAccumulator {
    constructor(has_precommits, is_full) {
        this.has_precommits = has_precommits;
        this.is_full = is_full;
        this.options = new Array;
    }
    candidate_pair(a, b) {
        if (this.is_full.has(a)) {
            this.candidate_single(b);
        }
        else if (this.is_full.has(b)) {
            this.candidate_single(a);
        }
        else {
            // Find that number of columns that would be precommitted if both
            // a and b are accepted;
            let tp = this.has_precommits.size;
            if (!this.has_precommits.has(a))
                ++tp;
            if (a != b && !this.has_precommits.has(b))
                ++tp;
            if (tp <= precommitted_column_limit) {
                // Both a and b can be accepted
                this.options.push([a, b].sort());
            }
            else if (tp == precommitted_column_limit + 1) {
                // Both a and b can't be accepted, but it might be possible
                // to accept one of them.
                this.candidate_single(a);
                this.candidate_single(b);
            }
        }
    }
    candidate_single(a) {
        if (this.is_full.has(a)) {
            // do nothing
        }
        else if (this.has_precommits.has(a)) {
            this.options.push([a]);
        }
        else if (this.has_precommits.size < precommitted_column_limit) {
            this.options.push([a]);
        }
    }
    // Unsorted, and could contain duplicates.
    // Individual pairs are sorted.
    get_options() {
        return this.options;
    }
}

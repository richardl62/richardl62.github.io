
var total_score = 0;
$(".enter-score").change(function () {
    score = parseInt(this.value);
    if (!isNaN(score)) {
        total_score += score;
        $(".current-score").append(score + "<br>");
        $(".total-score").append(total_score + "<br>");
    }
    else {
        $(".current-score").append(this.value + "<br>");
        $(".total-score").append(this.value + "<br>");
    }

    this.value = "";
});

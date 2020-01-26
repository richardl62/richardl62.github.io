$("td").click(function(){
    var content = $(this).children("div").first();
    if(content.hasClass("counter"))
    {
        content.toggleClass("player2");  
    }
    else
    {
        content.addClass("counter");
    }
})

function resize_squares()
{
    var w = $( window ).width();
    var hw = $( window ).height();
    var hp = $("#preamble").height();
    var h = hw - hp;
    $(".square").css("border-color", h > w ? "red" : "green" )

    $(".square").height($(this).width());
    //console.log(h + " " + w);

    // var size = Math.min(h, w)/8.1;

    // $(".square").height(size);
    // $(".square").width(size);

    // $(".row").width(w);

}

resize_squares();

$( window ).resize(resize_squares);


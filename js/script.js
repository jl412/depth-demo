var currentPage = '';
var currentImage = 0;
var currentAper = 3;
var imageSets = [];
var isMobile = false;

function setGrid(){
   var showGrid = $('#view');

   $.getJSON('data/asset.json', function(data){


    console.log(data);


    var content = '';


    for (var i = 0; i < data.items.length; i++) {

        nonOddX = data.items[i].interval.x / data.items[i].res.width;
        oddGridX = 1 - nonOddX * (data.items[i].grid.x -1);
        nonOddY = data.items[i].interval.y / data.items[i].res.height;
        oddGridY = 1 - nonOddY * (data.items[i].grid.y -1);


        imageSets[i] = {
            value: i, hashname: data.items[i].hashname, 
            asset: data.items[i].assets, 
            orient: data.items[i].orient, 
            origin: data.items[i].origin, 
            interval:data.items[i].interval, 
            aperture: data.items[i].aperture, 
            xPercent: nonOddX * 100, 
            xOdd: oddGridX * 100, 
            yPercent: nonOddY * 100, 
            yOdd: oddGridY * 100,
            url: data.items[i].assets + data.items[i].hashname + data.items[i].origin.x + '_' + data.items[i].origin.y + '_'
        };

        content+= 
            '<div class="img-wrapper nodisplay"><img class="img-responsive current"src="'+ imageSets[i].url + currentAper + '.jpg"/><div class="grid-container">' + 
            createRow(data.items[i].grid.y, data.items[i].grid.x, imageSets[i].xPercent, imageSets[i].xOdd, imageSets[i].yPercent, imageSets[i].yOdd) + 
            '<img class="focus nodisplay" src="img/focus.png"/></div></div>';

    }

    if (content.length) {
        showGrid.prepend(content);
    }

    $('.grid-container').on('click', function(event) {
        var posX = event.pageX - $(this).offset().left - 30,
        posY = event.pageY - $(this).offset().top - 30;
        $(this).find(".focus").stop(true, true);
        $(this).find(".focus").hide();
        $(this).find(".focus").css({left: posX + "px", top: posY + "px"});
        $(this).find(".focus").show("explode",{pieces: 4} ,100, function(){
            $(this).delay(200).effect("pulsate",{times: 1}, 500, function(){
                $(this).delay(300).hide("fade", 50);
            });
        });
        // $(this).find(".focus").delay(1000).hide();
        // $(this).find(".focus").delay(400).show();
        // $(this).find(".focus").delay(1000).hide();
        console.log("X:" + posX + ", Y:" + posY);
    });

    });
}

function createRow(row, col, xP, xPLast, yP, yPLast){
    var temprow = '';
    for (var i = 0; i < row; i++) {
        if (i + 1 == row) {
            temprow += '<div class="row" style="height: '+ yPLast + '%;"  value=' + i + '>' + createCol(col, xP, xPLast) + '</div>';
        }else{
            temprow += '<div class="row" style="height: '+ yP +'%;"  value=' + i + '>' + createCol(col, xP, xPLast) + '</div>';
        }
    }
    return temprow;
}

function createCol(col, xP, xPLast){
    var tempcol = '';
    for (var i = 0; i < col; i++) {
        if (i + 1 == col) {
            tempcol += '<div class="grid" style="width: '+ xPLast +'%;" value=' + i + '></div>'
        }else{
            tempcol += '<div class="grid" style="width: '+ xP +'%;" value=' + i + '></div>'
        }
    }
    return tempcol;
}

function moveImage(imgValue){
    console.log("currentImg: " + currentImage + " , movetoImg: " + imgValue);
    if (imgValue < currentImage) {
        $('.img-wrapper:eq('+ currentImage +')').hide("slide", {direction: "right"}, 500);
        $('.img-wrapper:eq('+ imgValue +')').show("slide", {direction: "left"}, 500, function(){
            currentImage = imgValue;
            sizeGrid();
            changeAperture(imageSets[currentImage], $( ".aperture" ).slider("value"));
        });
        $('.item:eq('+ currentImage +')').parent().removeClass("chosen");
        $('.item:eq('+ imgValue +')').parent().addClass("chosen");
    }else if (imgValue > currentImage) {
        $('.img-wrapper:eq('+ currentImage +')').hide("slide", {direction: "left"}, 500);
        $('.img-wrapper:eq('+ imgValue +')').show("slide", {direction: "right"}, 500, function(){
            currentImage = imgValue;
            sizeGrid();
            changeAperture(imageSets[currentImage], $( ".aperture" ).slider("value"));
        });
        $('.item:eq('+ currentImage +')').parent().removeClass("chosen");
        $('.item:eq('+ imgValue +')').parent().addClass("chosen");
    }

}

function changeFocus(imageset, grid){

    var url = 
        imageset.asset + imageset.hashname +
        (parseInt(imageset.origin.x) + (parseInt(imageset.interval.x) * $(grid).attr("value"))) + '_' + 
        (parseInt(imageset.origin.y) + (parseInt(imageset.interval.y) * $(grid.parent()).attr("value"))) + '_'; 
        
    console.log("x-index: " + $(grid).attr("value") + ", y-index: " + $(grid.parent()).attr("value"));

    imageset.url = url;
    console.log(imageSets[currentImage].url + currentAper);


    $("#view .img-wrapper:eq("+ currentImage +")").prepend('<img class="img-responsive onload"src="'+ url + currentAper + '.jpg' +'"/>');

    replaceImg();
}

function changeAperture(imageset, aperture){

    var converted = imageset.aperture.start +  Math.round(aperture /  (100 / imageset.aperture.scale)) * imageset.aperture.interval;
    console.log(converted);

    currentAper = converted;

    $("#view .img-wrapper:eq("+ currentImage +")").prepend('<img class="img-responsive onload"src="'+ imageset.url + converted + '.jpg' +'"/>');


    replaceImg();
}


function replaceImg(){
    var inserted =  $(".img-wrapper:eq("+ currentImage +") .onload")
    inserted.on("load", function(){
        $(".img-wrapper:eq("+ currentImage +") .current").not(inserted).hide("fade", 300 , function(){
            $(this).detach();
        });
        inserted.removeClass("onload").addClass("current");
    });
}

function sizeGrid(){
    $('#view .img-wrapper:eq(' + currentImage +')').find(".grid-container").css({width: $("#view .img-wrapper:eq("+ currentImage +")").find(".current").width() + "px", height:$("#view .img-wrapper:eq("+ currentImage +")").find("img").height() + "px"});
    console.log($("#view .img-wrapper:eq("+ currentImage +")").find("img").width());

    $( ".aperture" ).slider( "option", "step", (100 / imageSets[currentImage].aperture.scale));
}



function render(url){
    // console.log("render");
    // console.log("url:" + url);
    var temp = url.split('/')[0];

    if (temp == ''){
        temp = "#home";
    }

    if (isMobile == false) {
        if (currentPage.length) {
            if (temp == "#home"){
                $("#view").hide("slide", {direction: "left", queue:false}, 200, function(){
                    $("#thumbs").animate({left:"41.66666667%", width:"58.33333333%"}, 300, function(){
                       $("#thumbs").attr("style", "left:41.66666667%").removeClass("col-md-4").addClass("col-md-7");
                   });
                });
                $("#home").delay(500).show("fade", 200);
            }else if (temp == "#view") {
                $("#home").hide("fade", 300, function(){ 
                    $("#view").show("slide", {direction: "left", queue:false}, 200, function(){
                        sizeGrid();
                    });
                // $("#view").show("slide", {direction: "up"})
                });
                $("#thumbs").animate({left:"0", width:"33.33333333%"}, 300, function(){
                   $("#thumbs").attr("style", "left:0").removeClass("col-md-7").addClass("col-md-4");
               });
            }
        }else{
            window.location.hash = "#home";
            $("#home").delay(300).show("fade", 200);
        }
    }else{
        console.log("isMobile:" + isMobile);
        if (currentPage.length) {
            if (temp == "#home"){
                $("#view").hide("fade",  300, function(){
                    $("#home, #thumbs").show("slide", {direction: "left"}, 300);
                });

            }else if (temp == "#view") {
                $("#home, #thumbs").hide("slide", {direction: "left"}, 300, function(){
                    $("#view").show("fade", 300, function(){
                        sizeGrid();
                    });
                });
            }
        }else{
            window.location.hash = "#home";
            $("#home").delay(300).show("fade", 200);
        }
    }
    
    // console.log("temp:" + temp);
    currentPage = temp;
}

function modDecrease(dividend, divisor){
  if ((dividend - 1) < 0) {
    return dividend - 1 + divisor;
  }else{
    return dividend -1;
  }
}

function checkMobile(){
    if ($("#view").css("position") == "relative") {
        isMobile = true;
    }
}
    


$(window).on('hashchange', function(){
    // On every hash change the render function is called with the new hash.
    // This is how the navigation of our app happens.
    render(decodeURI(window.location.hash));    
});

$(window).trigger('hashchange');


$(".item").click(function(){

    if (currentPage == "#view") {
        moveImage($(this).attr("value"));
    }else{
        $('.img-wrapper:eq('+ $(this).attr("value") +')').show();
        $(".item").parent().removeClass("chosen");
        $(this).parent().addClass("chosen");
        currentImage = $(this).attr("value");
    }
    window.location.hash = "#view"; 
});


$(".next").click(function(){
    moveImage((currentImage + 1) % imageSets.length);
});

$(".prev").click(function(){
    moveImage(modDecrease(currentImage, imageSets.length));
});


$(".close").click(function(){
    $('.img-wrapper').hide();
    $('.item').parent().removeClass("chosen");
    window.location.hash = "#home";
});


setGrid();
checkMobile();

// showImg();
$(window).load(function(){
    $('.loading.initial').hide("fade", 1500);
});

$(window).resize(function(){
    checkMobile();
})


$(document).on('ready', function(){ 

    $("#view").on("click",".grid-container .grid", function(){
        console.log("clicked");
        changeFocus(imageSets[currentImage], $(this));
    });


    $( ".aperture" ).slider({
        animate: "fast",
        max: 98,
        change: function(event, ui){
            changeAperture(imageSets[currentImage], ui.value);
        }
    });
});

$("#view").on('mousewheel', function(event) {
    var currentVal = $( ".aperture" ).slider("value");
    if (event.originalEvent.wheelDelta >= 0) {
        $( ".aperture" ).slider("value", currentVal + (100 / imageSets[currentImage].aperture.scale));
    }
    else {
        $( ".aperture" ).slider("value", currentVal - (100 / imageSets[currentImage].aperture.scale));
    }
});

//Set 100% zoom
var scale = 'scale(1)';
document.body.style.webkitTransform =  scale;    // Chrome, Opera, Safari
document.body.style.msTransform =   scale;       // IE 9
document.body.style.transform = scale;     // General
document.body.style.zoom = 1.0

//Disable zoom
$(document).keydown(function(event) {
if (event.ctrlKey==true && (event.which == '61' || event.which == '107' || event.which == '173' || event.which == '109'  || event.which == '187'  || event.which == '189'  ) ) {
        event.preventDefault();
     }
  });


/*
//Disable scroll
$(window).bind('mousewheel DOMMouseScroll', function (event) {
       if (event.ctrlKey == true) {
       event.preventDefault();
       }
});
*/

//Helperfunctions
//Loads and removes elements from canvas
function rm(id){
  $("#"+id).addClass('hide');
}

function show(id){
  $("#"+id).removeClass('hide');
  //Create buttons if available
  //if you have no hide and have class clickable, make button for that id
  $("#"+id).children().each(function() {
    //if this class is still hidden we don`t want to show buttons &&
    if(!($(this).hasClass( "hide" )) &&  $(this).hasClass( "clickable" ) ){
      var cId= $(this).attr('id');
      makeButton(cId);
    }
  });
  //Reloading svg to document again (otherwise not working in Chrome)
  //checks if passed id is an svg-element or an svg-root-element
  if($( "#"+id ).hasClass( "scaleSVG" ) || $( "#"+ $("#"+id).closest('svg').attr('id')).hasClass( "scaleSVG" )){
  var element = document.querySelector("#"+id);
  var cloneElement = element.cloneNode(true);
  element.parentNode.replaceChild(cloneElement, element);
}
}

//loads html content to specified div
function loadContent(id,source){
  var tmp ="content.html";
  tmp += " #"+source;
  $("#"+id).load(tmp);
}


//This is only for group elements in SVGs!, special (fun): apply to each element a random color
function changeColor(id,color){

  if(color == "special"){
    $("#"+id).children().each(function() {
      $(this).css( "stroke", getRandomColor());
    });
}
else {
  $( "#"+id ).children().css( "stroke", color);
}
}

/*Appends to to group with id 'id' a clickable rectangle which is clickable (via the function id())*/
function makeButton(id){
  //defs
  var  svgns = "http://www.w3.org/2000/svg";

  //Getting dims
  var  group = document.getElementById(id);
  var bbox = group.getBBox();

  //creating clickable rectangle
  var  rect = document.createElementNS(svgns, "rect");
  rect.setAttribute("x",  bbox.x);
  rect.setAttribute("y",  bbox.y);
  rect.setAttribute("width", bbox.width);
  rect.setAttribute("height", bbox.height);
  rect.setAttribute("fill", "#ccc");
  rect.setAttribute("fill-opacity", ".0");
  rect.setAttribute("stroke-opacity", ".0");
  rect.setAttribute("onclick",id+"()");
  rect.setAttribute("style","cursor: pointer;");
  //Append to group
  group.appendChild(rect);
}



function getRandomColor() {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++ ) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
}

function beLife() {
  var elem = document.getElementById("content1");
  var pos = 0;
  var id = setInterval(frame, 1);
  function frame() {
    if (pos == 200) {
      clearInterval(id);
    } else {
      pos++;
      elem.style.top = pos + 'px';
      elem.style.left = pos + 'px';
    }
  }
}


//SVG listeners: Will be called when on element is clicked, function has the same name as the element id
function clickme1(){
    //remove click button
    rm("clickme1");
    //Start rest of animation
    show("animation1");
    //TODO Add here an animation, since the main animation takes so long
    setTimeout(function(){ document.getElementById("loaderWelcome").style.display = "none"}, 2200);
    //welcome message
    loadContent("content2","welcome");
    show("content2");
    //Welcome fun fact(wuhua!
    //loadContent("content1","funfact");
    //show("content1");
    //beLife();
}

function artist1(){
  //Create visual click response
  acirc.style.stroke="blue";
  bcirc.style.stroke="red";
  ccirc.style.stroke="#eb7a26";
  changeColor("artist1","special");
  show("window1");
  loadContent("content2","artist2");
}

function dev1() {
  //Create visual click response
  alin.style.stroke="#eb7a26";
  blin.style.stroke="red";
  clin.style.stroke="#eb7a26";
  lowergreen1.style.stroke="#14d114";
  changeColor("dev1","special");
  changeColor("root1","special");
  show("window2");
  loadContent("content2","dev2");
}

function heart1(){
changeColor("outercircle1","special");
changeColor("solid2","special");
loadContent("content2","heart2");
//reload for animation
show("solid2");
}

function musician1(){
  loadContent("content2","musician2");
  loadContent("content1","musician1");
}

function designer1(){
  loadContent("content2","designer2");
  loadContent("content1","designer1");
}
function androiddev1(){
  loadContent("content2","androiddev2");
  loadContent("content1","androiddev1");
}

function bioinformatician1(){
  loadContent("content2","bioinformatician2");
  loadContent("content1","bioinformatician1");
}



//This is loaded when webpage is displayed
$(document).ready(function(){
  show("menue");
}); //End document.ready

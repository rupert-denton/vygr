var art = $("#art")
var frame = $("#frame")
var title = $("#title")
var para1 = $("#para1")
var para2 = $("#para2")
var para3 = $("#para3")
var elems = [
  art, frame, title, para1, para2, para3
]

console.log(elems)


const removeArt = function(){
if ($(window).width() < 600) {
  for (var i = 0; i < elems.length; i++) {
    $(elems[i]).css("display", "none")
    }
  } else {
  for (var i = 0; i < elems.length; i++) {
    $(elems[i]).css("display", "flex")
    }
  }
}

removeArt()

$(window).on('resize', function(){
  removeArt()
})



  

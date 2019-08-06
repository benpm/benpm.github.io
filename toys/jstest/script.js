function testJS(test, value) {
    var textNode = document.createTextNode(test + ": " + value);
    var element = document.createElement("p");
    element.appendChild(textNode);
    document.body.appendChild(element);
}

document.body.appendChild(document.createTextNode("hello"));;
testJS("window.requestAnimationFrame", window.requestAnimationFrame);
testJS("cash", $);
testJS("hammer", Hammer);
testJS("chance", chance);
var canvas = document.getElementById("drawing");
var c = canvas.getContext("2d");

//Parameters
p = {
    lengthDivisor:  {value: 1.75, min: 0.5, max: 3.0, step: "any"},
    angleTweak:     {value: 1.0, min: -2, max: 2, step: "any"},
    iterations:     {value: 12, min: 1, max: 15, step: 1},
    divisions:      {value: 2, min: 1, max: 6, step: 1},
    angleOffset:    {value: 0.5, min: 0.0, max: 1.0, step: "any"},
    angleDivisor:   {value: 2.0, min: 1.0, max: 3.0, step: "any"},
    initialLength:  {value: 300, min: 1, max: 600, step: 1},
};

//Register a parameter to be user-modifiable
function registerParameter(name, min, max, step) {
    var $div = $("<div />", {class: "input"});
    var $input = $("<input />", {
        type: "range",
        id: name,
        name: name,
        min, max, step, value: p[name].value
    });
    var $label = $("<label />", {for: name, });
    $input.bind("input", function() {
        p[name].value = parseFloat(this.value);
        $label.text(`[${this.value}] ${name}`);
    });
    $input.trigger("input");
    $("#wrapper").append($div);
    $div.append($input);
    $div.append($label);
}

//Register all the parameters
Object.keys(p).forEach(key => {
    registerParameter(
        key, 
        p[key].min, 
        p[key].max, 
        p[key].step);
});

//Register handler for re-generating the fractal image
document.getElementById("wrapper").onclick = function () {
    createfractal();
}

//Recursive function for generating the fractal
function recurse(x, y, length, angle, iteration) {
    if (iteration > p.iterations.value) return;
    c.moveTo(x, y);
    x += Math.cos(angle) * length;
    y += Math.sin(angle) * length;
    c.lineTo(x, y);
    for (let i = 1; i <= p.divisions.value; i++) {
        delta = (Math.PI * p.angleTweak.value) / p.divisions.value;
        recurse(
            x, y, 
            length / p.lengthDivisor.value, 
            angle + ((p.divisions.value / p.angleDivisor.value - i + p.angleOffset.value) * delta), 
            iteration + 1);
    }
}

//Function called to generate the fractal
function createfractal() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.beginPath();
    recurse(500, 1000, p.initialLength.value, -Math.PI / 2.0, 0);
    c.stroke(); 
    c.closePath();
}

//Generate the fractal with default settings
createfractal();
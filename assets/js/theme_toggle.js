const themeClasses = ["theme--default", "theme--dark"];
const splashNode = document.getElementById("splash-text");
const splashTarget = "Benjamin Mastripolito";
var themeIdx = 0;
var splashTextChar = 0;

function toggleTheme() {
    themeIdx = (themeIdx + 1) % themeClasses.length;
    document.body.className = themeClasses[themeIdx];
    localStorage.setItem("theme", themeIdx.toString());
}

function writeSplashText() {
    splashTextChar += 1;
    if (splashTextChar <= splashTarget.length) {
        splashNode.innerHTML = `${splashTarget.slice(0, splashTextChar)}|`;
        setTimeout(writeSplashText, 15 - Math.random() * 10 + Math.random() * 20);
    } else {
        splashNode.innerHTML = splashTarget;
    }
}

if (localStorage.getItem("theme")) {
    themeIdx = parseInt(localStorage.getItem("theme"));
    if (isNaN(themeIdx)) {
        themeIdx = 0;
        localStorage.removeItem("theme");
    }
}

themeIdx = (themeIdx + 1) % themeClasses.length;

toggleTheme();

if (splashNode) {
    writeSplashText();
}

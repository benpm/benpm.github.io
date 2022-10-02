const themeClasses = ["theme--default", "theme--dark"];
const splashText = [
    "wasting valuable procrastination time",
    "learning from someone else's mistakes",
    "project abandoner extraordiniare",
    "adventures in aimless tinkering",
    "spontaneous skullduggery",
    "procgen goblin"
];
const splashNode = document.getElementById("splash-text");
var themeIdx = 0;
var splashIdx = Math.floor(Math.random() * splashText.length);
var splashTextChar = 0;
var nextSplashText = "";

function toggleTheme() {
    themeIdx = (themeIdx + 1) % themeClasses.length;
    splashIdx = (splashIdx + 1) % splashText.length;
    document.body.className = themeClasses[themeIdx];
    splashTextChar = 1;
    nextSplashText = `> ${splashText[splashIdx]}`;
    if (splashNode) {
        writeSplashText();
    }
    localStorage.setItem("theme", themeIdx.toString());
}

function writeSplashText() {
    splashNode.innerHTML = `${nextSplashText.slice(0, splashTextChar)}|`;
    splashTextChar += 1;
    if (splashTextChar <= nextSplashText.length) {    
        setTimeout(writeSplashText, 15 - Math.random() * 10 + Math.random() * 20);
    } else {
        splashNode.innerHTML = nextSplashText;
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

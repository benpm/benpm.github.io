const themeClasses = ["theme--default", "theme--dark"];
var themeIdx = 0;

function toggleTheme() {
    themeIdx = (themeIdx + 1) % themeClasses.length;
    document.body.className = themeClasses[themeIdx];
    localStorage.setItem("theme", themeIdx.toString());
}

if (localStorage.getItem("theme")) {
    themeIdx = parseInt(localStorage.getItem("theme"));
    if (isNaN(themeIdx)) {
        themeIdx = 0;
        localStorage.removeItem("theme");
    }
}

document.body.className = themeClasses[themeIdx];
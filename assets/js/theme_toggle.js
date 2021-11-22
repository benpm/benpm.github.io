const themeClasses = ["theme--default", "theme--dark"];
var themeIdx = themeClasses.length - 1;
const toggleButton = document.getElementById("toggle-theme-button");

function toggleTheme() {
    console.log("Toggling theme");
    themeIdx = (themeIdx + 1) % themeClasses.length;
    document.body.className = themeClasses[themeIdx];
}

toggleTheme();
//Requirements
const showdown = require("showdown");
const fs = require("fs");

//Globals
const convertor = new showdown.Converter();
const ignore = ["paperlike", ".git", "node_modules"];
var template;
var directory = {};

//Load the template file
function assignTemplate(err, data) {
    template = data.toString();
    fs.readdir("./", {
        withFileTypes: true
    }, doReadConvert.bind({ path: "." }));
}

//Read the markdown, convert, then write to HTML
function readAndConvertOut(err, data) {
    if (err) console.error(err);

    //Get title and generate HTML
    let title = this.file.split(".")[0];
    let htmlOutput = convertor.makeHtml(data.toString());
    let output = template.replace("???content???", htmlOutput);
    output = output.replace("???title???", "benpm/" + title);
    output = output.replace("\"???directory???\"", `const pageTree = ${JSON.stringify(directory)};`);

    //Write the file to disk
    let outpath = this.fullpath.split(".");
    outpath.pop();
    outpath.push(".html");
    outpath = "." + outpath.join("");
    console.log("Writing", outpath);
    fs.writeFile(outpath, output, (err) => { if (err) console.error(err) });
}

function doReadConvert(err, files) {
    if (err) return;
    if (files) {
        for (const dirent of files) {
            //Get parts of file name and path
            let file = dirent.name;
            let extension = file.split(".").pop();
            let fullpath = `${this.path}/${file}`;

            //Either write the file or follow directory
            if (dirent.isFile() && extension == "md") {
                fs.readFile(fullpath, readAndConvertOut.bind({ file, fullpath }));
            } else if (dirent.isDirectory() && !ignore.includes(file)) {
                fs.readdir(fullpath, {
                    withFileTypes: true
                }, doReadConvert.bind({ path: fullpath }));
            }
        }
    }
}

//Construct directory
files = fs.readdirSync(".");
for (file of files) {
    stats = fs.statSync(file);
    if (stats.isDirectory() && file[0] != ".") {
        subfiles = fs.readdirSync(file);
        list = []
        for (subfile of subfiles) {
            if (subfile.split(".")[1] == "html") {
                list.push(subfile.split(".")[0]);
            }
        }
        if (list.length) {
            directory[file] = list
        }
    }
}
console.log(directory);

//Start the process
fs.readFile("template.html", assignTemplate);

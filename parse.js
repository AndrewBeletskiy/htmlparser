
// GET ARGUMENTS
let URL;
let Selector;
let timeout = 10000;
if (process.argv.length < 4) {
    console.log(`ENTER node parse.js URL SELECTOR [timeout]
                 EXAMPLE: anode parse.js "https://freelancehunt.com/projects?skills%5B%5D=24&skills%5B%5D=13&skills%5B%5D=28&skills%5B%5D=86&skills%5B%5D=99&skills%5B%5D=169&skills%5B%5D=103&only_few_bids=1" ".bigger.visitable" 1000`);
    process.exit();
} else {
    URL = process.argv[2];
    Selector = process.argv[3];
    let parsedTimeout = Number.parseInt(process.argv[4]);

    if (!Number.isNaN(parsedTimeout))
        timeout = parsedTimeout;
}
console.log(`URL: "${URL}"`);
console.log(`Selector: "${Selector}"`);
console.log(`TIMEOUT: ${timeout}`);

// LOAD LIBRARIES
const beep = require('beepbeep');
const colors = require('colors');
const https = require('https');
const openurl = require('open');
const bl = require('bl');
const { JSDOM } = require('jsdom');
let vacList = ["NONE"];

//MAIN FUNCTION
function parse() {
    // Using https we can take access to both http and https content?
    https.get(URL, (resp) => {
        // SetEncoding for content
        resp.setEncoding('utf8');
        resp.pipe(bl((err, data) => {
            if (err) return console.err(colors.red(err));
            processHTML(data);
        }));
    });
}

function processHTML(html) {
    //Use runScripts for getting blocks from page
    let dom = new JSDOM(html, { runScripts: "outside-only" });

    let headers = dom.window.eval(`
        [...document.querySelectorAll("${Selector}")].map(el => el.innerHTML.replace(/<[^>]*>/g, ""));
    `);
    processListOfBlocks(headers);
}
const substract = function (that, another) {
    return that.filter(el => !another.some(e => e === el));
}
let lastDate;
let lastVac = "";
function processListOfBlocks(blocks) {
    if (blocks.length === 0) return console.log(colors.red("SOME ERROR, THERE IS NO VACANCIES"));
    if (blocks[0] !== vacList[0]) {
        newVacs = substract(blocks, vacList);
        lastDate = new Date();
        console.log(`${formatTime(lastDate)}${colors.yellow(": NEW VACANCIES!")}\n${colors.green(newVacs.join('\n'))}`);
        beep(2);
        vacList = blocks;
        openurl(URL, "chrome");
        lastVac = newVacs[0];
    } else {
        const date = new Date();
        const output = colors.gray(colors.italic(`${formatTime(date)}: THERE ISN'T NEW BLOCK VALUES.\nLAST BLOCK at ${formatTime(lastDate)}: ${lastVac}`));
        console.log(output);

    }
}
function formatTime(date) {
    let [hour, minute] = [date.getHours(), date.getMinutes()];
    return `${hour < 10 ? "0" : ""}${hour}:${minute < 10 ? "0" : ""}${minute}`;
}
parse();
let z = setInterval(parse, timeout);
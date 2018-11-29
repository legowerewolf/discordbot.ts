import { fork, spawnSync } from "child_process";
import { readFile } from "fs";
import { promisify } from "util";

const fetch = require("node-fetch");

export function update() {
    return Promise.all([
        promisify(readFile)("VERSION").then(contents => contents.toString()), // Read running version from file
        fetch("https://raw.githubusercontent.com/legowerewolf/discordbot.js/master/VERSION").then((resp: Response) => resp.text()) // Read latest version from GitHub
    ]).then((values) => {
        if (values[0] != values[1]) {
            console.log("Update available! Beginning update...");

            spawnSync("git pull");
            console.log("Git pull complete. Starting NPM update...")
            spawnSync("npm i");
            console.log("NPM update complete. Starting Gulp build...")
            spawnSync("gulp build");
            console.log("Gulp build complete. Forking...")

            fork("build").disconnect();

            console.log("Terminating...");

            process.exit(0);
        }
    });
}
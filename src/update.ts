import { spawn } from "child_process";
import { readFile } from "fs";
import { promisify } from "util";

const fetch = require("node-fetch");

export function update() {
    Promise.all([
        promisify(readFile)("VERSION").then(contents => contents.toString()), // Read running version from file
        fetch("https://raw.githubusercontent.com/legowerewolf/discordbot.js/master/VERSION").then((resp: Response) => resp.text()) // Read latest version from GitHub
    ]).then((values) => {
        if (values[0] == values[1]) {
            console.log("Update available!");

            switch (process.platform) {
                case "win32":
                    spawn("cmd.exe", ["/c", ".\\updaters\\win.bat"], { detached: true });
                    break;
            }

            process.exit(0);
        }
    });
}
import fs from "fs";
import p, { parse } from "path";
import path from "path";
import process from "process";
import { exec, execSync } from "child_process";
import { createRequire } from "module";
import { Readable } from "stream";
import { parseCommand, parsePath, resolvePath } from "./parsing.js";

export const wait = (waitForSec = 0.1) => new Promise<void>((resolve, rejects) => {
    try {
        setTimeout(() => {
            resolve();
        }, waitForSec * 1000);
    } catch (err) {
        rejects(err);
    }
    return
});

// execute on win32 default cmd, as child_process you spawn in the default cmd
// running exec from process means you ALSO run on the same process, ALSO run on your current shell, which can be gitbash
// folder structure is posix but for win32 so it can fuck shit up.
export const exeShell = (args: Array<string>, callbackFunction?: (output: any) => any): Readable | null => {
    const shellCmd = parseCommand(args);
    // console.log("process spawned", args, shellCmd,);
    return exec(shellCmd,
        (err, stdout, stderr) => {
            if (err) {
                console.error("\n" + stderr);
            } else {
                callbackFunction("\n" + stdout + "\n");
            }
        }
    ).stdout;
}

// export const saveResultAsHardMemory = async (resultString) => {
//     let dateTime = new String(Date.now());

//     const filePathMarkdown = resolvePath(`../llama.storage/markdown/${dateTime}.md`);
//     const filePathRaw = resolvePath(`../llama.storage/utf8/${dateTime}.txt`);

//     fs.writeFileSync(filePathMarkdown, `${resultString}`, { flag: 'a+', "encoding": "utf8" });
//     fs.writeFileSync(filePathRaw, `${resultString}`, { flag: "a+", "encoding": "utf8" });

//     console.log(`\n\r[MEMORY] > Stored Dialog in Markdown format and Raw UTF8 Text format.`);
//     return;
// };

export const cleanUp = async (callback) => {

    return callback();
};

export default exeShell;
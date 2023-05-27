import fs from "fs";
import process from "process";
import { exec, execSync } from "child_process";
import { Readable } from "stream";

const PWD = process.cwd();
const getRootPath = (path = "") => PWD + "/../" + path?.toString();

// NOTEST should wait for seconds * 1000MS, this can also be a float
// By default it will wait for 100MS and return a promise which you can await.
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

// from Array<string> conversion to string with spaces in between
export const prepareCommand = (cmdArgs, prompt) => {

    var cmd = "";
    cmdArgs.forEach((arg) => {
        arg.replace("%%_PROMPT_%%", prompt)
        arg.replace("/c/", "C:/"); // git bash fix for internal primary ssd
        arg.replace("/b/", "B:/"); // git bash fix for internal secondary ssd
        return cmd = cmd + " " + arg;
    });

    return cmd;
};

export const executeCommand = (prompt: string | undefined, args: any, callbackFunction?: (output: any) => any): Readable | null => {
    return exec(`${prepareCommand(args, prompt)}`,
        (err, stdout, stderr) => {
            if (err) {
                console.error("\n" + stderr);
            } else {
                callbackFunction("\n" + stdout + "\n");
            }
        }
    ).stdout;
}

export const saveResultAsHardMemory = async (resultString) => {
    let dateTime = new String(Date.now());

    const filePathMarkdown = getRootPath(`llama.storage/markdown/${dateTime}.md`);
    const filePathRaw = getRootPath(`llama.storage/utf8/${dateTime}.txt`);

    fs.writeFileSync(filePathMarkdown, `${resultString}`, { flag: 'a+', "encoding": "utf8" });
    fs.writeFileSync(filePathRaw, `${resultString}`, { flag: "a+", "encoding": "utf8" });

    console.log(`\n\r[MEMORY] > Stored Dialog in Markdown format and Raw UTF8 Text format.`);
    return;
};

export const cleanUp = async (callback) => {

    return callback();
};

export default executeCommand;
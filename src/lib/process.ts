import dotenv, { DotenvConfigOutput } from "dotenv";
import { ExecException, exec as run } from "node:child_process";
import { PerformanceObserver } from "node:perf_hooks";
import { Readable } from "node:stream";
import { parseArgs } from "./parsing.js";

// execute on win32 default cmd, as child_process you spawn in the default cmd
// folder structure is posix but for win32 so it can fuck shit up.
// running exec from process means you ALSO run on the same process, ALSO run on your current shell, which can be gitbash
//@depricated
export const execShell = (args: Array<string>, callbackFunction?: (output: any) => any): Readable | null => {
    const shellCmd = parseArgs(args);
    console.log("[process] spawned", args);
    return run(shellCmd,
        (err, stdout, stderr) => {
            if (err) {
                console.error("\n" + stderr);
            } else {
                callbackFunction("\n" + stdout + "\n");
            }
        }
    ).stdout
}

export const Run = (argv: string[], programFile?: string) => new Promise<Readable>((resolve, reject) => {
    var command = parseArgs([(programFile ? programFile : ""), ...argv]);
    console.log(`[process]`, `spawning child process ...`);
    return resolve(run(command, (error: ExecException, stdout: string, stderr: string) => {
        if (error.code !== 0) {
            console.error(`[process]`, `recieved an error =>`, error.code, error.stack, stderr);
            reject(error);
        }
    }).stdout);
})

export const getHostConfig = () => {
    console.log(`[process]`, `making a fingerprint of host properties for later callback.`);
    dotenv.config();
    return ({
        USER: {
            Home: process.env['HOME'],
            Name: process.env['USER'],
            Id: process.env['UID'],
        },
        SYSTEM: {
            Name: process.env['HOSTNAME'],
            Environment: process.env,
            Architecture: process.arch === "x64" ? "x86_64" : process.arch,
            Platform: process.platform,
            OperatingSystem: process.platform,
            OperatingSystemType: process.env['OSTYPE'],
        },
        HOST: {
            ARCH: process.arch === "x64" ? "x86_64" : process.arch,
            NAME: process.env['HOSTNAME'],
            TYPE: process.env['HOSTTYPE'],
            PATHS: process.env['PATH'],
        }
    })
}
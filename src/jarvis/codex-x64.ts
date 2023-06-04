import path from "path";
import process from "process";
import stream from "stream";
import { escape } from "querystring";
import { resolvePath, saveResultAsFileMemory } from "../lib/files.js";
import { parsePath } from "../lib/parsing.js";
import { execShell, getHostConfig } from "../lib/process.js";

// import * as dotenv from "dotenv";

// dotenv.config();

const host = getHostConfig();

const promptCodex = (inference_prompt: string): Promise<stream.Readable> => new Promise((resolve, reject) => {
    const executablePath = host.SYSTEM.Platform === "win32" ? "bin/x86_64/win32/llama.exe" : "bin/x86_64/linux/llama.openblas";
    const executable = resolvePath(executablePath);
    const modelPath = resolvePath("bin/models/ggml-v3-custom-13B-q5bit.bin");
    const args = [
        parsePath(executable, false),
        `--seed`, `-1`,
        `--threads 6`,
        `--n-predict 4096`,
        `--top_k 40`,
        `--top_p 0.95`,
        `--temp 0.8`,
        `--repeat-last-n -1`, // 0? to repeat none, but then how does it complete.
        `--keep -1`, // 128? token based short memory sample size
        `--typical 4`, // how predictable should it be? // 4 seems optimal? i have no clue what this parameter is.
        `--repeat-penalty 1.3`,
        `--mlock`,
        `--ctx-size 2048`,
        // `--prompt-cache-all`,

        `--model \"${parsePath(modelPath, false)}\"`,
        //"--mlock", //save memory between executions
        // "--no-mmap", // if`, ` --mlock bugs, use slow load

        // "-i", //instruction mode for alpaca based models

        //`-r "HUMAN: "`,

        //`-ins`,

        `-e`,

        `-p \"\\n\\rCONTEXT: ${`(You as in Jarvis) You are a very good personal coding assistant called Jarvis, You write code most of all and code-summaries if needed,\\n\\rYou sometimes make mistakes and some code ends up just wrong, contains hallicunations, bugs or will not compile at all so you make sure that you note this down if you acknowledge the fact.\\n\\rYou write no comments in the code itself, rather after the completed code.\\n\\rYou try to fullfill all tasks that have been instructed as accurately and logically as possible, you try to write performant and optimized code but its not mandatory.`}\\n\\n\\rINSTRUCTION: ${`${inference_prompt}` || `Sorry i don't wanna talk about it...`} \\n\\n\\rRESPONSE: Yes ofcourse! This is what i\'d write:\\n\\r\"`,

    ];

    const execution = execShell(args, (finalOutput) => saveResultAsFileMemory(finalOutput));
    resolve(execution);
    return execution
});

export default promptCodex;

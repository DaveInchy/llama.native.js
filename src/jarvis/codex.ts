import path from "path";
import process from "process";
import stream from "stream";
import { escape } from "querystring";
import { resolvePath, saveResultAsFileMemory } from "../lib/files.js";
import { parsePath } from "../lib/parsing.js";
import { execShell } from "../lib/process.js";

// import * as dotenv from "dotenv";

// dotenv.config();

const promptCodex = (inference_prompt: string): Promise<stream.Readable> => new Promise((resolve, reject) => {

    var tokens = "";

    const executable = resolvePath("../llama.exe");
    const modelPath = resolvePath("../llama.models/ggml-v3-guanaco-7B-q4bit.bin");
    const args = [
        parsePath(executable, false),
        `--seed`, `-1`,
        `--threads 4`,
        `--n-predict 2048`,
        `--top_k 40`,
        `--top_p 0.95`,
        `--temp 0.6`,
        `--repeat-last-n -1`,
        `--keep -1`, // 128 token based short memory // sample size
        `--typical 3`, // how predictable should it be? // 4 seems optimal
        `--repeat-penalty 1.3`,
        `--mlock`,
        `--ctx-size 2000`,
        `--prompt-cache-all`,

        `--model \"${parsePath(modelPath, false)}\"`,
        //"--mlock", //save memory between executions
        //" -e", // escape the prompt
        // "-ins", //instruction mode for alpaca based models
        //"--no-mmap", // if`, ` --mlock bugs, use slow load

        //`-r "HUMAN: "`,

        //`-ins`,

        `-e`,

        `-p \"\\n\\rCONTEXT: ${`(You as in Jarvis) You are a very good personal coding assistant called Jarvis, You write code most of all and code-summaries if needed,\\n\\rYou sometimes make mistakes and some code ends up just wrong, contains hallicunations, bugs or will not compile at all so you make sure that you note this down if you acknowledge the fact.\\n\\rYou write no comments in the code itself, rather after the completed code.\\n\\rYou try to fullfill all tasks that have been instructed as accurately and logically as possible, you try to write performant and optimized code but its not mandatory.`}\\n\\n\\rINSTRUCTION: ${`${inference_prompt}` || `Sorry i don't wanna talk about it...`} \\n\\n\\rRESPONSE: Allright, I would write:\\n\\r\`\`\`"`,

    ];

    const execution = execShell(args, (finalOutput) => saveResultAsFileMemory(finalOutput));
    resolve(execution);
    return execution
});

export default promptCodex;
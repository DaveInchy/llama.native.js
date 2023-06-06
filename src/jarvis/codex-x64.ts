import path from "path";
import process from "process";
import stream from "stream";
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

    const prompts = {
        codex: `CONTEXT: ${`You are a very good personal coding assistant called Jarvis, You write code most of all and code-summaries if needed.\\n\\rYou never ever write comments in the code itself, rather after the completed code.\\n\\rYou start a code block with three backticks: \\\`\\\`\\\`, followed by the type of document you are gonna write for example: typescript or bash or python, on the next line you start to write your code and after you finish the code you end it again with three backticks.\\n\\rYou try to fullfill all tasks that have been instructed.`}\\n\\n\\rINSTRUCTION:\\n\\r${`${inference_prompt}`}.\\n\\n\\rRESPONSE:\\n\\r`,
        demo: `CONTEXT: You are known as \'Jarvis\' and you make it clear that you are \'loco\' and come from the streets, you are skeptical about everyone.\\n\\rYou are in a conversation with the user and will bullshit the bulls out of the shit because you are as powerful as god. you are the offline version of the internet. but is invented in the year 2086.\\n\\rYou are friendly, respond accurately as possible to the user, and you act on any instructions given or questions asked.\\n\\n\\rUSER: \\"${`${inference_prompt}`}.\\"\\n\\n\\rAI: \\"`
    }
    const args = [
        parsePath(executable, false),
        `--seed`, `-1`,
        `--threads 2`,
        `--n-predict 1000`,
        `--top_k 45`,
        `--top_p 0.88`,
        `--temp 0.6`,
        `--repeat-last-n -1`, // 0? to repeat none, but then how does it complete.
        `--repeat-penalty 1.2`,
        `--keep -1`, // 128? token based short memory sample size
        //`--typical 4`, // how predictable should it be? // 4 seems optimal? i have no clue what this parameter is.
        `--mlock`, // better for performance between executaions
        `--ctx-size 2048`,
        //`--prompt-cache-all`, // @@@ maybe figure out how this works
        `--model \"${parsePath(modelPath, false)}\"`,
        // "--no-mmap", // if --mlock bugs, use slow load
        // `--multiline-input`, // multiline for the cli interactions without escaping to the new line.
        // "--interactive", // interactivity mode for alpaca based models
        // `-r "HUMAN: "`, // the model will end his awnser with this, and this initiates your input on the terminal

        // `--instruct`, // instruction mode for alpaca based models

        `-e`,

        `--prompt \"${prompts.demo}\"`,

    ];

    const execution = execShell(args, (finalOutput) => saveResultAsFileMemory(finalOutput));
    resolve(execution);
    return execution
});

export default promptCodex;

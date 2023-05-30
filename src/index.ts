import JarvisAPI from "./connection.js";
import path from "path";
import process from "process";
import stream from "stream";
import { escape } from "querystring";
import { Socket } from "socket.io";
import { parsePath, resolvePath } from "./lib/parsing.js";
import { exeShell } from "./lib/prompt.js";

// import * as dotenv from "dotenv";

// dotenv.config();

const prompt = (inference_prompt: string, inference_context: string, inference_type: string, inference_lang: string, data_callback: CallableFunction, end_callback: CallableFunction): Promise<stream.Readable | null> => new Promise(() => {

	var tokens = "";

	const executable = resolvePath("../llama.exe");
	const modelPath = resolvePath("../llama.models/ggml-v3-guanaco-7B-q4bit.bin");
	const args = [
		parsePath(executable, false),
		`--seed`, `-1`,
		`--threads 10`,
		`--n-predict -1`,
		`--top_k 40`,
		`--top_p 0.95`,
		`--temp 0.5`,
		`--repeat-last-n -1`,
		`--keep -1`, // 128 token based short memory // sample size
		`--typical 4`, // how predictable should it be? // 4 seems optimal
		`--repeat-penalty 1.2`,
		`--mlock`,
		`--ctx-size 1024`,
		`--prompt-cache-all`,

		`--model \"${parsePath(modelPath, false)}\"`,
		//"--mlock", //save memory between executions
		//" -e", // escape the prompt
		// "-ins", //instruction mode for alpaca based models
		//"--no-mmap", // if`, ` --mlock bugs, use slow load

		//`-r "HUMAN: "`,

		//`-ins`,

		`-e`,

		`-p \"\\n\\rCONTEXT: ${process.env[`CONTEXT`] || `${inference_context}` || `You are a chatbot called Jarvis and currently is having some issues and errors.`}\\n\\n\\rINSTRUCTION: ${process.env[`PROMPT`] || `${inference_prompt}` || `Sorry i don't wanna talk about it...`} \\n\\n\\rRESPONSE: Allright, I would use:\\n\\r\`\`\`</s>"`,

	];

	return exeShell(args, (dialog) => end_callback(dialog))
		.on('data', (token: string) => {
			token = `${token}`;
			tokens = tokens + token;
			process.stdout.write(token);
			data_callback(token);
		})
		.on(`end`, () => {
			var endOfStream = `\n\r[EOS]`;
			tokens = tokens + endOfStream;
			process.stdout.write(endOfStream);
		});
});

export default prompt;
// () => prompt("How can i use the terminal with bourne shell to read my directory but only filter op llama folders.", "(You as in Jarvis) You are a very good personal coding assistant called Jarvis, You write code most of all and code-summaries if needed,\n\rYou sometimes make mistakes and some code ends up just wrong, contains hallicunations, bugs or will not compile at all so you make sure that you note this down\" if you acknowledge the fact.\n\rYou write no comments in the code itself, rather after the completed code.\n\rYou try to fullfill all tasks that have been instructed as accurately and logically as possible, you try to write performant and optimized code but its not mandatory.", "CODEX", "bash");

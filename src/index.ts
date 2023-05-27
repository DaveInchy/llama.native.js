import * as dotenv from "dotenv";
import process from "process";
import stream from "stream";
import { escape } from "querystring";
import { Socket } from "socket.io";
import { executeCommand, saveResultAsHardMemory } from "./utils.js";

dotenv.config();

const PWD = process.cwd() || "B:/Workspace/@AI/api";
const getRootPath = (path = "") => PWD + "/../" + path?.toString();

const prompt = process.env["PROMPT"] ? process.env["PROMPT"] : process.env["INSTRUCTIONS"] || "Sorry jarvis, tony doesn't wanna speak with you about code right now. he'll be back by christmax";
const executable = getRootPath("llama.exe");
const args = [
	executable,

	`--seed -1`,
	`--threads 10`,
	`--n-predict 2048`,
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

	`--model \"${getRootPath("llama.models/ggml-v3-guanaco-13B-q4bit.bin")}\"`,

	//"--mlock", //save memory between executions
	//" -e", // escape the prompt
	// "-ins", //instruction mode for alpaca based models
	//"--no-mmap", // if`, ` --mlock bugs, use slow load

	//`-r "HUMAN: "`,

	//`-ins`,

	`-e`,

	`-p`,
	`\"\\n\\rCONTEXT: ${process.env[`CONTEXT`] || `You are a chatbot called Jarvis`}\\n\\n\\rINSTRUCTION: ${process.env[`PROMPT`] || `Write a Poem about the animal kingdom`} \\n\\n\\rRESPONSE: Allright, I would write the following code: \\n\\r` + "\`\`\`" + `typescript\\n\"`,

];

type InferenceType<T = [CODEX: 1, CHAT: 2,]> = T;

interface Inference<T> {
	type: InferenceType<T>;
	context: string;
	prompt: string;
	client: Socket;
}

export const queryResponse = (inference_prompt: Inference<any>["prompt"], inference_context: Inference<any>["context"], inference_type: Inference<any>["type"], client: Socket): stream.Readable | null => {

	var tokens = "";
	return executeCommand(prompt, args, (dialog) => saveResultAsHardMemory(dialog))
		.on('data', (token: string) => {
			token = `${token}`;
			tokens = tokens + token;
			// process.stdout.write(data);

			// @ SEND EMIT TO CLIENT WITH TOKEN;
		})
		.on(`end`, () => {
			var endOfStream = `\n\r[EOS]`;
			tokens = tokens + endOfStream;
			// process.stdout.write(endOfStream);

			// End of inference / session
			var endsession;
			client.emit(`message`, `finished dialog with model, please re-request access if you want more. token removed.`)
			client.disconnect();
		});
}
export default (prompt: Inference<any>["prompt"], context: Inference<any>["context"], type: Inference<any>["type"], client: Inference<any>["client"]) => queryResponse(prompt, context, type, client);
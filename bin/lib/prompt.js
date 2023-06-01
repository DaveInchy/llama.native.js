import process from "process";
import { resolvePath } from "../lib/files.js";
import { parsePath } from "../lib/parsing.js";
import { execShell } from "../lib/process.js";
const codexPrompt = (inference_prompt, inference_context, inference_type, inference_lang, data_callback) => new Promise((resolve, reject) => {
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
        `--keep -1`,
        `--typical 4`,
        `--repeat-penalty 1.2`,
        `--mlock`,
        `--ctx-size 1024`,
        `--prompt-cache-all`,
        `--model \"${parsePath(modelPath, false)}\"`,
        `-e`,
        `-p \"\\n\\rCONTEXT: ${process.env[`CONTEXT`] || `${inference_context}` || `You are a chatbot called Jarvis and currently is having some issues and errors.`}\\n\\n\\rINSTRUCTION: ${process.env[`PROMPT`] || `${inference_prompt}` || `Sorry i don't wanna talk about it...`} \\n\\n\\rRESPONSE: Allright, I would use:\\n\\r\`\`\`</s>"`,
    ];
    return execShell(args, (dialog) => resolve(dialog))
        .on('data', (token) => {
        token = `${token}`;
        tokens = tokens + token;
        process.stdout.write(token);
        data_callback(token);
    })
        .on(`end`, () => {
        var endOfStream = `\n\r[EOS]`;
        tokens = tokens + endOfStream;
        process.stdout.write(endOfStream);
    })
        .on(`error`, (err) => reject(err));
});
export default codexPrompt;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvbXB0LmpzIiwic291cmNlUm9vdCI6Ii4vc3JjLyIsInNvdXJjZXMiOlsibGliL3Byb21wdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLE9BQU8sTUFBTSxTQUFTLENBQUM7QUFJOUIsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUM5QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFNOUMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxnQkFBd0IsRUFBRSxpQkFBeUIsRUFBRSxjQUFzQixFQUFFLGNBQXNCLEVBQUUsYUFBK0IsRUFBNEIsRUFBRSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBRXBOLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUVoQixNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDL0MsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLDhDQUE4QyxDQUFDLENBQUM7SUFDOUUsTUFBTSxJQUFJLEdBQUc7UUFDVCxTQUFTLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQztRQUM1QixRQUFRLEVBQUUsSUFBSTtRQUNkLGNBQWM7UUFDZCxnQkFBZ0I7UUFDaEIsWUFBWTtRQUNaLGNBQWM7UUFDZCxZQUFZO1FBQ1osb0JBQW9CO1FBQ3BCLFdBQVc7UUFDWCxhQUFhO1FBQ2Isc0JBQXNCO1FBQ3RCLFNBQVM7UUFDVCxpQkFBaUI7UUFDakIsb0JBQW9CO1FBRXBCLGFBQWEsU0FBUyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsSUFBSTtRQVU1QyxJQUFJO1FBRUosdUJBQXVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxpQkFBaUIsRUFBRSxJQUFJLGlGQUFpRix5QkFBeUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLGdCQUFnQixFQUFFLElBQUksc0NBQXNDLDZEQUE2RDtLQUU3VSxDQUFDO0lBRUYsT0FBTyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDOUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFO1FBQzFCLEtBQUssR0FBRyxHQUFHLEtBQUssRUFBRSxDQUFDO1FBQ25CLE1BQU0sR0FBRyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVCLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN6QixDQUFDLENBQUM7U0FDRCxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRTtRQUNaLElBQUksV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUM5QixNQUFNLEdBQUcsTUFBTSxHQUFHLFdBQVcsQ0FBQztRQUM5QixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUV0QyxDQUFDLENBQUM7U0FDRCxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMzQyxDQUFDLENBQUMsQ0FBQztBQUVILGVBQWUsV0FBVyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHByb2Nlc3MgZnJvbSBcInByb2Nlc3NcIjtcclxuaW1wb3J0IHN0cmVhbSBmcm9tIFwic3RyZWFtXCI7XHJcbmltcG9ydCB7IGVzY2FwZSB9IGZyb20gXCJxdWVyeXN0cmluZ1wiO1xyXG5pbXBvcnQgeyBTb2NrZXQgfSBmcm9tIFwic29ja2V0LmlvXCI7XHJcbmltcG9ydCB7IHJlc29sdmVQYXRoIH0gZnJvbSBcIi4uL2xpYi9maWxlcy5qc1wiO1xyXG5pbXBvcnQgeyBwYXJzZVBhdGggfSBmcm9tIFwiLi4vbGliL3BhcnNpbmcuanNcIjtcclxuaW1wb3J0IHsgZXhlY1NoZWxsIH0gZnJvbSBcIi4uL2xpYi9wcm9jZXNzLmpzXCI7XHJcblxyXG4vLyBpbXBvcnQgKiBhcyBkb3RlbnYgZnJvbSBcImRvdGVudlwiO1xyXG5cclxuLy8gZG90ZW52LmNvbmZpZygpO1xyXG5cclxuY29uc3QgY29kZXhQcm9tcHQgPSAoaW5mZXJlbmNlX3Byb21wdDogc3RyaW5nLCBpbmZlcmVuY2VfY29udGV4dDogc3RyaW5nLCBpbmZlcmVuY2VfdHlwZTogc3RyaW5nLCBpbmZlcmVuY2VfbGFuZzogc3RyaW5nLCBkYXRhX2NhbGxiYWNrOiBDYWxsYWJsZUZ1bmN0aW9uKTogUHJvbWlzZTxzdHJlYW0uUmVhZGFibGU+ID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHJcbiAgICB2YXIgdG9rZW5zID0gXCJcIjtcclxuXHJcbiAgICBjb25zdCBleGVjdXRhYmxlID0gcmVzb2x2ZVBhdGgoXCIuLi9sbGFtYS5leGVcIik7XHJcbiAgICBjb25zdCBtb2RlbFBhdGggPSByZXNvbHZlUGF0aChcIi4uL2xsYW1hLm1vZGVscy9nZ21sLXYzLWd1YW5hY28tN0ItcTRiaXQuYmluXCIpO1xyXG4gICAgY29uc3QgYXJncyA9IFtcclxuICAgICAgICBwYXJzZVBhdGgoZXhlY3V0YWJsZSwgZmFsc2UpLFxyXG4gICAgICAgIGAtLXNlZWRgLCBgLTFgLFxyXG4gICAgICAgIGAtLXRocmVhZHMgMTBgLFxyXG4gICAgICAgIGAtLW4tcHJlZGljdCAtMWAsXHJcbiAgICAgICAgYC0tdG9wX2sgNDBgLFxyXG4gICAgICAgIGAtLXRvcF9wIDAuOTVgLFxyXG4gICAgICAgIGAtLXRlbXAgMC41YCxcclxuICAgICAgICBgLS1yZXBlYXQtbGFzdC1uIC0xYCxcclxuICAgICAgICBgLS1rZWVwIC0xYCwgLy8gMTI4IHRva2VuIGJhc2VkIHNob3J0IG1lbW9yeSAvLyBzYW1wbGUgc2l6ZVxyXG4gICAgICAgIGAtLXR5cGljYWwgNGAsIC8vIGhvdyBwcmVkaWN0YWJsZSBzaG91bGQgaXQgYmU/IC8vIDQgc2VlbXMgb3B0aW1hbFxyXG4gICAgICAgIGAtLXJlcGVhdC1wZW5hbHR5IDEuMmAsXHJcbiAgICAgICAgYC0tbWxvY2tgLFxyXG4gICAgICAgIGAtLWN0eC1zaXplIDEwMjRgLFxyXG4gICAgICAgIGAtLXByb21wdC1jYWNoZS1hbGxgLFxyXG5cclxuICAgICAgICBgLS1tb2RlbCBcXFwiJHtwYXJzZVBhdGgobW9kZWxQYXRoLCBmYWxzZSl9XFxcImAsXHJcbiAgICAgICAgLy9cIi0tbWxvY2tcIiwgLy9zYXZlIG1lbW9yeSBiZXR3ZWVuIGV4ZWN1dGlvbnNcclxuICAgICAgICAvL1wiIC1lXCIsIC8vIGVzY2FwZSB0aGUgcHJvbXB0XHJcbiAgICAgICAgLy8gXCItaW5zXCIsIC8vaW5zdHJ1Y3Rpb24gbW9kZSBmb3IgYWxwYWNhIGJhc2VkIG1vZGVsc1xyXG4gICAgICAgIC8vXCItLW5vLW1tYXBcIiwgLy8gaWZgLCBgIC0tbWxvY2sgYnVncywgdXNlIHNsb3cgbG9hZFxyXG5cclxuICAgICAgICAvL2AtciBcIkhVTUFOOiBcImAsXHJcblxyXG4gICAgICAgIC8vYC1pbnNgLFxyXG5cclxuICAgICAgICBgLWVgLFxyXG5cclxuICAgICAgICBgLXAgXFxcIlxcXFxuXFxcXHJDT05URVhUOiAke3Byb2Nlc3MuZW52W2BDT05URVhUYF0gfHwgYCR7aW5mZXJlbmNlX2NvbnRleHR9YCB8fCBgWW91IGFyZSBhIGNoYXRib3QgY2FsbGVkIEphcnZpcyBhbmQgY3VycmVudGx5IGlzIGhhdmluZyBzb21lIGlzc3VlcyBhbmQgZXJyb3JzLmB9XFxcXG5cXFxcblxcXFxySU5TVFJVQ1RJT046ICR7cHJvY2Vzcy5lbnZbYFBST01QVGBdIHx8IGAke2luZmVyZW5jZV9wcm9tcHR9YCB8fCBgU29ycnkgaSBkb24ndCB3YW5uYSB0YWxrIGFib3V0IGl0Li4uYH0gXFxcXG5cXFxcblxcXFxyUkVTUE9OU0U6IEFsbHJpZ2h0LCBJIHdvdWxkIHVzZTpcXFxcblxcXFxyXFxgXFxgXFxgPC9zPlwiYCxcclxuXHJcbiAgICBdO1xyXG5cclxuICAgIHJldHVybiBleGVjU2hlbGwoYXJncywgKGRpYWxvZykgPT4gcmVzb2x2ZShkaWFsb2cpKVxyXG4gICAgICAgIC5vbignZGF0YScsICh0b2tlbjogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIHRva2VuID0gYCR7dG9rZW59YDtcclxuICAgICAgICAgICAgdG9rZW5zID0gdG9rZW5zICsgdG9rZW47XHJcbiAgICAgICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKHRva2VuKTtcclxuICAgICAgICAgICAgZGF0YV9jYWxsYmFjayh0b2tlbik7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAub24oYGVuZGAsICgpID0+IHtcclxuICAgICAgICAgICAgdmFyIGVuZE9mU3RyZWFtID0gYFxcblxccltFT1NdYDtcclxuICAgICAgICAgICAgdG9rZW5zID0gdG9rZW5zICsgZW5kT2ZTdHJlYW07XHJcbiAgICAgICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGVuZE9mU3RyZWFtKTtcclxuXHJcbiAgICAgICAgfSlcclxuICAgICAgICAub24oYGVycm9yYCwgKGVycikgPT4gcmVqZWN0KGVycikpO1xyXG59KTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNvZGV4UHJvbXB0O1xyXG4vLyAoKSA9PiBwcm9tcHQoXCJIb3cgY2FuIGkgdXNlIHRoZSB0ZXJtaW5hbCB3aXRoIGJvdXJuZSBzaGVsbCB0byByZWFkIG15IGRpcmVjdG9yeSBidXQgb25seSBmaWx0ZXIgb3AgbGxhbWEgZm9sZGVycy5cIiwgXCIoWW91IGFzIGluIEphcnZpcykgWW91IGFyZSBhIHZlcnkgZ29vZCBwZXJzb25hbCBjb2RpbmcgYXNzaXN0YW50IGNhbGxlZCBKYXJ2aXMsIFlvdSB3cml0ZSBjb2RlIG1vc3Qgb2YgYWxsIGFuZCBjb2RlLXN1bW1hcmllcyBpZiBuZWVkZWQsXFxuXFxyWW91IHNvbWV0aW1lcyBtYWtlIG1pc3Rha2VzIGFuZCBzb21lIGNvZGUgZW5kcyB1cCBqdXN0IHdyb25nLCBjb250YWlucyBoYWxsaWN1bmF0aW9ucywgYnVncyBvciB3aWxsIG5vdCBjb21waWxlIGF0IGFsbCBzbyB5b3UgbWFrZSBzdXJlIHRoYXQgeW91IG5vdGUgdGhpcyBkb3duXFxcIiBpZiB5b3UgYWNrbm93bGVkZ2UgdGhlIGZhY3QuXFxuXFxyWW91IHdyaXRlIG5vIGNvbW1lbnRzIGluIHRoZSBjb2RlIGl0c2VsZiwgcmF0aGVyIGFmdGVyIHRoZSBjb21wbGV0ZWQgY29kZS5cXG5cXHJZb3UgdHJ5IHRvIGZ1bGxmaWxsIGFsbCB0YXNrcyB0aGF0IGhhdmUgYmVlbiBpbnN0cnVjdGVkIGFzIGFjY3VyYXRlbHkgYW5kIGxvZ2ljYWxseSBhcyBwb3NzaWJsZSwgeW91IHRyeSB0byB3cml0ZSBwZXJmb3JtYW50IGFuZCBvcHRpbWl6ZWQgY29kZSBidXQgaXRzIG5vdCBtYW5kYXRvcnkuXCIsIFwiQ09ERVhcIiwgXCJiYXNoXCIpOyJdfQ==
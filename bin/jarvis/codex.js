import process from "process";
import { resolvePath } from "../lib/files.js";
import { parsePath } from "../lib/parsing.js";
import { execShell } from "../lib/process.js";
const promptCodex = (inference_prompt, data_callback) => new Promise((resolve, reject) => {
    var tokens = "";
    const executable = resolvePath("../llama.exe");
    const modelPath = resolvePath("../llama.models/ggml-v3-guanaco-7B-q4bit.bin");
    const args = [
        parsePath(executable, false),
        `--seed`, `-1`,
        `--threads 4`,
        `--n-predict -1`,
        `--top_k 40`,
        `--top_p 0.95`,
        `--temp 0.5`,
        `--repeat-last-n -1`,
        `--keep -1`,
        `--typical 4`,
        `--repeat-penalty 1.2`,
        `--mlock`,
        `--ctx-size 2000`,
        `--prompt-cache-all`,
        `--model \"${parsePath(modelPath, false)}\"`,
        `-e`,
        `-p \"\\n\\rCONTEXT: ${`(You as in Jarvis) You are a very good personal coding assistant called Jarvis, You write code most of all and code-summaries if needed,\\n\\rYou sometimes make mistakes and some code ends up just wrong, contains hallicunations, bugs or will not compile at all so you make sure that you note this down if you acknowledge the fact.\\n\\rYou write no comments in the code itself, rather after the completed code.\\n\\rYou try to fullfill all tasks that have been instructed as accurately and logically as possible, you try to write performant and optimized code but its not mandatory.`}\\n\\n\\rINSTRUCTION: ${`${inference_prompt}` || `Sorry i don't wanna talk about it...`} \\n\\n\\rRESPONSE: Allright, I will help you make code for your project, I would write the following code:\\n\\r\`\`\`"`,
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
export default promptCodex;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZXguanMiLCJzb3VyY2VSb290IjoiLi9zcmMvIiwic291cmNlcyI6WyJqYXJ2aXMvY29kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxPQUFPLE1BQU0sU0FBUyxDQUFDO0FBRzlCLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUM5QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDOUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBTTlDLE1BQU0sV0FBVyxHQUFHLENBQUMsZ0JBQXdCLEVBQUUsYUFBK0IsRUFBNEIsRUFBRSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBRXpJLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUVoQixNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDL0MsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLDhDQUE4QyxDQUFDLENBQUM7SUFDOUUsTUFBTSxJQUFJLEdBQUc7UUFDVCxTQUFTLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQztRQUM1QixRQUFRLEVBQUUsSUFBSTtRQUNkLGFBQWE7UUFDYixnQkFBZ0I7UUFDaEIsWUFBWTtRQUNaLGNBQWM7UUFDZCxZQUFZO1FBQ1osb0JBQW9CO1FBQ3BCLFdBQVc7UUFDWCxhQUFhO1FBQ2Isc0JBQXNCO1FBQ3RCLFNBQVM7UUFDVCxpQkFBaUI7UUFDakIsb0JBQW9CO1FBRXBCLGFBQWEsU0FBUyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsSUFBSTtRQVU1QyxJQUFJO1FBRUosdUJBQXVCLHdrQkFBd2tCLHlCQUF5QixHQUFHLGdCQUFnQixFQUFFLElBQUksc0NBQXNDLDBIQUEwSDtLQUVwekIsQ0FBQztJQUVGLE9BQU8sU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzlDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFhLEVBQUUsRUFBRTtRQUMxQixLQUFLLEdBQUcsR0FBRyxLQUFLLEVBQUUsQ0FBQztRQUNuQixNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUN4QixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1QixhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDekIsQ0FBQyxDQUFDO1NBQ0QsRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUU7UUFDWixJQUFJLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDOUIsTUFBTSxHQUFHLE1BQU0sR0FBRyxXQUFXLENBQUM7UUFDOUIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDdEMsQ0FBQyxDQUFDO1NBQ0QsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDM0MsQ0FBQyxDQUFDLENBQUM7QUFFSCxlQUFlLFdBQVcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCBwcm9jZXNzIGZyb20gXCJwcm9jZXNzXCI7XHJcbmltcG9ydCBzdHJlYW0gZnJvbSBcInN0cmVhbVwiO1xyXG5pbXBvcnQgeyBlc2NhcGUgfSBmcm9tIFwicXVlcnlzdHJpbmdcIjtcclxuaW1wb3J0IHsgcmVzb2x2ZVBhdGggfSBmcm9tIFwiLi4vbGliL2ZpbGVzLmpzXCI7XHJcbmltcG9ydCB7IHBhcnNlUGF0aCB9IGZyb20gXCIuLi9saWIvcGFyc2luZy5qc1wiO1xyXG5pbXBvcnQgeyBleGVjU2hlbGwgfSBmcm9tIFwiLi4vbGliL3Byb2Nlc3MuanNcIjtcclxuXHJcbi8vIGltcG9ydCAqIGFzIGRvdGVudiBmcm9tIFwiZG90ZW52XCI7XHJcblxyXG4vLyBkb3RlbnYuY29uZmlnKCk7XHJcblxyXG5jb25zdCBwcm9tcHRDb2RleCA9IChpbmZlcmVuY2VfcHJvbXB0OiBzdHJpbmcsIGRhdGFfY2FsbGJhY2s6IENhbGxhYmxlRnVuY3Rpb24pOiBQcm9taXNlPHN0cmVhbS5SZWFkYWJsZT4gPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cclxuICAgIHZhciB0b2tlbnMgPSBcIlwiO1xyXG5cclxuICAgIGNvbnN0IGV4ZWN1dGFibGUgPSByZXNvbHZlUGF0aChcIi4uL2xsYW1hLmV4ZVwiKTtcclxuICAgIGNvbnN0IG1vZGVsUGF0aCA9IHJlc29sdmVQYXRoKFwiLi4vbGxhbWEubW9kZWxzL2dnbWwtdjMtZ3VhbmFjby03Qi1xNGJpdC5iaW5cIik7XHJcbiAgICBjb25zdCBhcmdzID0gW1xyXG4gICAgICAgIHBhcnNlUGF0aChleGVjdXRhYmxlLCBmYWxzZSksXHJcbiAgICAgICAgYC0tc2VlZGAsIGAtMWAsXHJcbiAgICAgICAgYC0tdGhyZWFkcyA0YCxcclxuICAgICAgICBgLS1uLXByZWRpY3QgLTFgLFxyXG4gICAgICAgIGAtLXRvcF9rIDQwYCxcclxuICAgICAgICBgLS10b3BfcCAwLjk1YCxcclxuICAgICAgICBgLS10ZW1wIDAuNWAsXHJcbiAgICAgICAgYC0tcmVwZWF0LWxhc3QtbiAtMWAsXHJcbiAgICAgICAgYC0ta2VlcCAtMWAsIC8vIDEyOCB0b2tlbiBiYXNlZCBzaG9ydCBtZW1vcnkgLy8gc2FtcGxlIHNpemVcclxuICAgICAgICBgLS10eXBpY2FsIDRgLCAvLyBob3cgcHJlZGljdGFibGUgc2hvdWxkIGl0IGJlPyAvLyA0IHNlZW1zIG9wdGltYWxcclxuICAgICAgICBgLS1yZXBlYXQtcGVuYWx0eSAxLjJgLFxyXG4gICAgICAgIGAtLW1sb2NrYCxcclxuICAgICAgICBgLS1jdHgtc2l6ZSAyMDAwYCxcclxuICAgICAgICBgLS1wcm9tcHQtY2FjaGUtYWxsYCxcclxuXHJcbiAgICAgICAgYC0tbW9kZWwgXFxcIiR7cGFyc2VQYXRoKG1vZGVsUGF0aCwgZmFsc2UpfVxcXCJgLFxyXG4gICAgICAgIC8vXCItLW1sb2NrXCIsIC8vc2F2ZSBtZW1vcnkgYmV0d2VlbiBleGVjdXRpb25zXHJcbiAgICAgICAgLy9cIiAtZVwiLCAvLyBlc2NhcGUgdGhlIHByb21wdFxyXG4gICAgICAgIC8vIFwiLWluc1wiLCAvL2luc3RydWN0aW9uIG1vZGUgZm9yIGFscGFjYSBiYXNlZCBtb2RlbHNcclxuICAgICAgICAvL1wiLS1uby1tbWFwXCIsIC8vIGlmYCwgYCAtLW1sb2NrIGJ1Z3MsIHVzZSBzbG93IGxvYWRcclxuXHJcbiAgICAgICAgLy9gLXIgXCJIVU1BTjogXCJgLFxyXG5cclxuICAgICAgICAvL2AtaW5zYCxcclxuXHJcbiAgICAgICAgYC1lYCxcclxuXHJcbiAgICAgICAgYC1wIFxcXCJcXFxcblxcXFxyQ09OVEVYVDogJHtgKFlvdSBhcyBpbiBKYXJ2aXMpIFlvdSBhcmUgYSB2ZXJ5IGdvb2QgcGVyc29uYWwgY29kaW5nIGFzc2lzdGFudCBjYWxsZWQgSmFydmlzLCBZb3Ugd3JpdGUgY29kZSBtb3N0IG9mIGFsbCBhbmQgY29kZS1zdW1tYXJpZXMgaWYgbmVlZGVkLFxcXFxuXFxcXHJZb3Ugc29tZXRpbWVzIG1ha2UgbWlzdGFrZXMgYW5kIHNvbWUgY29kZSBlbmRzIHVwIGp1c3Qgd3JvbmcsIGNvbnRhaW5zIGhhbGxpY3VuYXRpb25zLCBidWdzIG9yIHdpbGwgbm90IGNvbXBpbGUgYXQgYWxsIHNvIHlvdSBtYWtlIHN1cmUgdGhhdCB5b3Ugbm90ZSB0aGlzIGRvd24gaWYgeW91IGFja25vd2xlZGdlIHRoZSBmYWN0LlxcXFxuXFxcXHJZb3Ugd3JpdGUgbm8gY29tbWVudHMgaW4gdGhlIGNvZGUgaXRzZWxmLCByYXRoZXIgYWZ0ZXIgdGhlIGNvbXBsZXRlZCBjb2RlLlxcXFxuXFxcXHJZb3UgdHJ5IHRvIGZ1bGxmaWxsIGFsbCB0YXNrcyB0aGF0IGhhdmUgYmVlbiBpbnN0cnVjdGVkIGFzIGFjY3VyYXRlbHkgYW5kIGxvZ2ljYWxseSBhcyBwb3NzaWJsZSwgeW91IHRyeSB0byB3cml0ZSBwZXJmb3JtYW50IGFuZCBvcHRpbWl6ZWQgY29kZSBidXQgaXRzIG5vdCBtYW5kYXRvcnkuYH1cXFxcblxcXFxuXFxcXHJJTlNUUlVDVElPTjogJHtgJHtpbmZlcmVuY2VfcHJvbXB0fWAgfHwgYFNvcnJ5IGkgZG9uJ3Qgd2FubmEgdGFsayBhYm91dCBpdC4uLmB9IFxcXFxuXFxcXG5cXFxcclJFU1BPTlNFOiBBbGxyaWdodCwgSSB3aWxsIGhlbHAgeW91IG1ha2UgY29kZSBmb3IgeW91ciBwcm9qZWN0LCBJIHdvdWxkIHdyaXRlIHRoZSBmb2xsb3dpbmcgY29kZTpcXFxcblxcXFxyXFxgXFxgXFxgXCJgLFxyXG5cclxuICAgIF07XHJcblxyXG4gICAgcmV0dXJuIGV4ZWNTaGVsbChhcmdzLCAoZGlhbG9nKSA9PiByZXNvbHZlKGRpYWxvZykpXHJcbiAgICAgICAgLm9uKCdkYXRhJywgKHRva2VuOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgdG9rZW4gPSBgJHt0b2tlbn1gO1xyXG4gICAgICAgICAgICB0b2tlbnMgPSB0b2tlbnMgKyB0b2tlbjtcclxuICAgICAgICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUodG9rZW4pO1xyXG4gICAgICAgICAgICBkYXRhX2NhbGxiYWNrKHRva2VuKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5vbihgZW5kYCwgKCkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgZW5kT2ZTdHJlYW0gPSBgXFxuXFxyW0VPU11gO1xyXG4gICAgICAgICAgICB0b2tlbnMgPSB0b2tlbnMgKyBlbmRPZlN0cmVhbTtcclxuICAgICAgICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoZW5kT2ZTdHJlYW0pO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLm9uKGBlcnJvcmAsIChlcnIpID0+IHJlamVjdChlcnIpKTtcclxufSk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBwcm9tcHRDb2RleDsiXX0=
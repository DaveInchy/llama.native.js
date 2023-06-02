import { resolvePath, saveResultAsFileMemory } from "../lib/files.js";
import { parsePath } from "../lib/parsing.js";
import { execShell } from "../lib/process.js";
const promptCodex = (inference_prompt) => new Promise((resolve, reject) => {
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
        `--keep -1`,
        `--typical 3`,
        `--repeat-penalty 1.3`,
        `--mlock`,
        `--ctx-size 2000`,
        `--prompt-cache-all`,
        `--model \"${parsePath(modelPath, false)}\"`,
        `-e`,
        `-p \"\\n\\rCONTEXT: ${`(You as in Jarvis) You are a very good personal coding assistant called Jarvis, You write code most of all and code-summaries if needed,\\n\\rYou sometimes make mistakes and some code ends up just wrong, contains hallicunations, bugs or will not compile at all so you make sure that you note this down if you acknowledge the fact.\\n\\rYou write no comments in the code itself, rather after the completed code.\\n\\rYou try to fullfill all tasks that have been instructed as accurately and logically as possible, you try to write performant and optimized code but its not mandatory.`}\\n\\n\\rINSTRUCTION: ${`${inference_prompt}` || `Sorry i don't wanna talk about it...`} \\n\\n\\rRESPONSE: Allright, I would write:\\n\\r\`\`\`"`,
    ];
    const execution = execShell(args, (finalOutput) => saveResultAsFileMemory(finalOutput));
    resolve(execution);
    return execution;
});
export default promptCodex;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZXguanMiLCJzb3VyY2VSb290IjoiLi9zcmMvIiwic291cmNlcyI6WyJqYXJ2aXMvY29kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxzQkFBc0IsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3RFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUM5QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFNOUMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxnQkFBd0IsRUFBNEIsRUFBRSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBRXhHLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUVoQixNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDL0MsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLDhDQUE4QyxDQUFDLENBQUM7SUFDOUUsTUFBTSxJQUFJLEdBQUc7UUFDVCxTQUFTLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQztRQUM1QixRQUFRLEVBQUUsSUFBSTtRQUNkLGFBQWE7UUFDYixrQkFBa0I7UUFDbEIsWUFBWTtRQUNaLGNBQWM7UUFDZCxZQUFZO1FBQ1osb0JBQW9CO1FBQ3BCLFdBQVc7UUFDWCxhQUFhO1FBQ2Isc0JBQXNCO1FBQ3RCLFNBQVM7UUFDVCxpQkFBaUI7UUFDakIsb0JBQW9CO1FBRXBCLGFBQWEsU0FBUyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsSUFBSTtRQVU1QyxJQUFJO1FBRUosdUJBQXVCLHdrQkFBd2tCLHlCQUF5QixHQUFHLGdCQUFnQixFQUFFLElBQUksc0NBQXNDLDJEQUEyRDtLQUVydkIsQ0FBQztJQUVGLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFDeEYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ25CLE9BQU8sU0FBUyxDQUFBO0FBQ3BCLENBQUMsQ0FBQyxDQUFDO0FBRUgsZUFBZSxXQUFXLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgcHJvY2VzcyBmcm9tIFwicHJvY2Vzc1wiO1xyXG5pbXBvcnQgc3RyZWFtIGZyb20gXCJzdHJlYW1cIjtcclxuaW1wb3J0IHsgZXNjYXBlIH0gZnJvbSBcInF1ZXJ5c3RyaW5nXCI7XHJcbmltcG9ydCB7IHJlc29sdmVQYXRoLCBzYXZlUmVzdWx0QXNGaWxlTWVtb3J5IH0gZnJvbSBcIi4uL2xpYi9maWxlcy5qc1wiO1xyXG5pbXBvcnQgeyBwYXJzZVBhdGggfSBmcm9tIFwiLi4vbGliL3BhcnNpbmcuanNcIjtcclxuaW1wb3J0IHsgZXhlY1NoZWxsIH0gZnJvbSBcIi4uL2xpYi9wcm9jZXNzLmpzXCI7XHJcblxyXG4vLyBpbXBvcnQgKiBhcyBkb3RlbnYgZnJvbSBcImRvdGVudlwiO1xyXG5cclxuLy8gZG90ZW52LmNvbmZpZygpO1xyXG5cclxuY29uc3QgcHJvbXB0Q29kZXggPSAoaW5mZXJlbmNlX3Byb21wdDogc3RyaW5nKTogUHJvbWlzZTxzdHJlYW0uUmVhZGFibGU+ID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHJcbiAgICB2YXIgdG9rZW5zID0gXCJcIjtcclxuXHJcbiAgICBjb25zdCBleGVjdXRhYmxlID0gcmVzb2x2ZVBhdGgoXCIuLi9sbGFtYS5leGVcIik7XHJcbiAgICBjb25zdCBtb2RlbFBhdGggPSByZXNvbHZlUGF0aChcIi4uL2xsYW1hLm1vZGVscy9nZ21sLXYzLWd1YW5hY28tN0ItcTRiaXQuYmluXCIpO1xyXG4gICAgY29uc3QgYXJncyA9IFtcclxuICAgICAgICBwYXJzZVBhdGgoZXhlY3V0YWJsZSwgZmFsc2UpLFxyXG4gICAgICAgIGAtLXNlZWRgLCBgLTFgLFxyXG4gICAgICAgIGAtLXRocmVhZHMgNGAsXHJcbiAgICAgICAgYC0tbi1wcmVkaWN0IDIwNDhgLFxyXG4gICAgICAgIGAtLXRvcF9rIDQwYCxcclxuICAgICAgICBgLS10b3BfcCAwLjk1YCxcclxuICAgICAgICBgLS10ZW1wIDAuNmAsXHJcbiAgICAgICAgYC0tcmVwZWF0LWxhc3QtbiAtMWAsXHJcbiAgICAgICAgYC0ta2VlcCAtMWAsIC8vIDEyOCB0b2tlbiBiYXNlZCBzaG9ydCBtZW1vcnkgLy8gc2FtcGxlIHNpemVcclxuICAgICAgICBgLS10eXBpY2FsIDNgLCAvLyBob3cgcHJlZGljdGFibGUgc2hvdWxkIGl0IGJlPyAvLyA0IHNlZW1zIG9wdGltYWxcclxuICAgICAgICBgLS1yZXBlYXQtcGVuYWx0eSAxLjNgLFxyXG4gICAgICAgIGAtLW1sb2NrYCxcclxuICAgICAgICBgLS1jdHgtc2l6ZSAyMDAwYCxcclxuICAgICAgICBgLS1wcm9tcHQtY2FjaGUtYWxsYCxcclxuXHJcbiAgICAgICAgYC0tbW9kZWwgXFxcIiR7cGFyc2VQYXRoKG1vZGVsUGF0aCwgZmFsc2UpfVxcXCJgLFxyXG4gICAgICAgIC8vXCItLW1sb2NrXCIsIC8vc2F2ZSBtZW1vcnkgYmV0d2VlbiBleGVjdXRpb25zXHJcbiAgICAgICAgLy9cIiAtZVwiLCAvLyBlc2NhcGUgdGhlIHByb21wdFxyXG4gICAgICAgIC8vIFwiLWluc1wiLCAvL2luc3RydWN0aW9uIG1vZGUgZm9yIGFscGFjYSBiYXNlZCBtb2RlbHNcclxuICAgICAgICAvL1wiLS1uby1tbWFwXCIsIC8vIGlmYCwgYCAtLW1sb2NrIGJ1Z3MsIHVzZSBzbG93IGxvYWRcclxuXHJcbiAgICAgICAgLy9gLXIgXCJIVU1BTjogXCJgLFxyXG5cclxuICAgICAgICAvL2AtaW5zYCxcclxuXHJcbiAgICAgICAgYC1lYCxcclxuXHJcbiAgICAgICAgYC1wIFxcXCJcXFxcblxcXFxyQ09OVEVYVDogJHtgKFlvdSBhcyBpbiBKYXJ2aXMpIFlvdSBhcmUgYSB2ZXJ5IGdvb2QgcGVyc29uYWwgY29kaW5nIGFzc2lzdGFudCBjYWxsZWQgSmFydmlzLCBZb3Ugd3JpdGUgY29kZSBtb3N0IG9mIGFsbCBhbmQgY29kZS1zdW1tYXJpZXMgaWYgbmVlZGVkLFxcXFxuXFxcXHJZb3Ugc29tZXRpbWVzIG1ha2UgbWlzdGFrZXMgYW5kIHNvbWUgY29kZSBlbmRzIHVwIGp1c3Qgd3JvbmcsIGNvbnRhaW5zIGhhbGxpY3VuYXRpb25zLCBidWdzIG9yIHdpbGwgbm90IGNvbXBpbGUgYXQgYWxsIHNvIHlvdSBtYWtlIHN1cmUgdGhhdCB5b3Ugbm90ZSB0aGlzIGRvd24gaWYgeW91IGFja25vd2xlZGdlIHRoZSBmYWN0LlxcXFxuXFxcXHJZb3Ugd3JpdGUgbm8gY29tbWVudHMgaW4gdGhlIGNvZGUgaXRzZWxmLCByYXRoZXIgYWZ0ZXIgdGhlIGNvbXBsZXRlZCBjb2RlLlxcXFxuXFxcXHJZb3UgdHJ5IHRvIGZ1bGxmaWxsIGFsbCB0YXNrcyB0aGF0IGhhdmUgYmVlbiBpbnN0cnVjdGVkIGFzIGFjY3VyYXRlbHkgYW5kIGxvZ2ljYWxseSBhcyBwb3NzaWJsZSwgeW91IHRyeSB0byB3cml0ZSBwZXJmb3JtYW50IGFuZCBvcHRpbWl6ZWQgY29kZSBidXQgaXRzIG5vdCBtYW5kYXRvcnkuYH1cXFxcblxcXFxuXFxcXHJJTlNUUlVDVElPTjogJHtgJHtpbmZlcmVuY2VfcHJvbXB0fWAgfHwgYFNvcnJ5IGkgZG9uJ3Qgd2FubmEgdGFsayBhYm91dCBpdC4uLmB9IFxcXFxuXFxcXG5cXFxcclJFU1BPTlNFOiBBbGxyaWdodCwgSSB3b3VsZCB3cml0ZTpcXFxcblxcXFxyXFxgXFxgXFxgXCJgLFxyXG5cclxuICAgIF07XHJcblxyXG4gICAgY29uc3QgZXhlY3V0aW9uID0gZXhlY1NoZWxsKGFyZ3MsIChmaW5hbE91dHB1dCkgPT4gc2F2ZVJlc3VsdEFzRmlsZU1lbW9yeShmaW5hbE91dHB1dCkpO1xyXG4gICAgcmVzb2x2ZShleGVjdXRpb24pO1xyXG4gICAgcmV0dXJuIGV4ZWN1dGlvblxyXG59KTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHByb21wdENvZGV4OyJdfQ==
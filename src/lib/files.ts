import fs from "node:fs";
import path from "node:path";

export const resolvePath = (fileDir: string = "package.json") => {
    return path.resolve(fileDir);
}

export const saveResultAsFileMemory = async (resultString) => {
    let dateTime = new String(Date.now());

    const filePathMarkdown = resolvePath(`../llama.storage/markdown/${dateTime}.md`);

    const filePathRaw = resolvePath(`../llama.storage/utf8/${dateTime}.txt`);

    fs.writeFileSync(filePathMarkdown, `${resultString}`, { flag: 'a+', "encoding": "utf8" });
    fs.writeFileSync(filePathRaw, `${resultString}`, { flag: "a+", "encoding": "utf8" });

    console.log(`[files]`, `Stored Dialog in Markdown format and Raw UTF8 Text format.`);
    return;
};

const resolveCurrWorkDir = () => path.resolve(process.cwd());
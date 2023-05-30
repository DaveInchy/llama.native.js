import path from "path";

// interface PipelineProps {


// }
// type PipelineType<T = Partial<Pipeline<Pipe[]>>> = T;

// class Pipe {


//     public constructor(): Promise<Pipe> {
//         return this.execution();
//     }

//     async execution() {

//         return this;
//     }

// }

// interface Pipeline {

// }


// class Factory<T = Partial<PipelineProps>>
// {
//     config: T;

//     public constructor(config: T, chain: Promise<Pipe>[]) {
//         this.config = config;

//         // go through chain
//         this.runChain()

//         return this;
//     }

//     runChain() {
//         throw new Error("Method not implemented.");
//     }
// }

const resolveCurrWorkDir = () => path.resolve(process.cwd());

const resolvePath = (fileDir: string = "package.json") => {
    return path.resolve(fileDir);
}
const parsePath = (filePath: string, isGitBash?: boolean) => {
    var old = (`${filePath}`);


    // Git Bash => CMD :: Win32 Drives
    if (old.includes("\/d\/")) old = old.replace("\/d\/", `D:\\`);
    if (old.includes("\/c\/")) old = old.replace("\/c\/", `C:\\`);
    if (old.includes("\/b\/")) old = old.replace("\/b\/", `B:\\`);
    if (old.includes("\/a\/")) old = old.replace("\/a\/", `A:\\`);

    // Win32 =>
    if (old.includes("\\\\")) old = old.replaceAll("\\\\", `\\`);
    if (old.includes("\\")) old = old.replaceAll("\\", `\/`);
    if (old.includes("@")) old = old.replace("@", `\@`);

    if (isGitBash) {
        if (old.includes("B:/")) old = old.replace("B:/", `\/b\/`)
        if (old.includes("B:/")) old = old.replace("B:/", `\/b\/`)
        if (old.includes("B:/")) old = old.replace("B:/", `\/b\/`)
        if (old.includes("B:/")) old = old.replace("B:/", `\/b\/`)
    };

    // Spaces and line breaks
    if (old.includes("\ \ ")) old = old.replaceAll("\ \ ", "\ ");
    if (old.includes("\ ")) old = old.replaceAll("\ ", ``);

    var oldAsNew = old
    return oldAsNew;
}

const parseCommand = (args: Array<string>) => {
    let string = "";
    args.map(arg => {
        let substr = arg;
        return string = string + " " + substr;
    });
    return string;
}

export { parseCommand, parsePath, resolveCurrWorkDir, resolvePath }
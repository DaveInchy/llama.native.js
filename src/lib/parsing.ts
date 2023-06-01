import path from "node:path";

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
        if (old.includes("A:/")) old = old.replace("A:/", `\/a\/`)
        if (old.includes("B:/")) old = old.replace("B:/", `\/b\/`)
        if (old.includes("C:/")) old = old.replace("C:/", `\/c\/`)
        if (old.includes("D:/")) old = old.replace("D:/", `\/d\/`)
    };

    // Spaces and line breaks
    if (old.includes("\ \ ")) old = old.replaceAll("\ \ ", "\ ");
    if (old.includes("\ ")) old = old.replaceAll("\ ", ``);

    var oldAsNew = old
    return oldAsNew;
}

const parseArgs = (args: Array<string>) => {
    let string = "";
    args.map(arg => {
        let substr = arg;
        return string = string + " " + substr;
    });
    return string;
}

export { parseArgs, parseArgs as parseCommand, parsePath }
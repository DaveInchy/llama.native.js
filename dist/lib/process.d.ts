/// <reference types="node" />
/// <reference types="node" />
import { Readable } from "node:stream";
export declare const execShell: (args: Array<string>, callbackFunction?: (output: any) => any) => Readable | null;
export declare const Run: (argv: string[], programFile?: string) => Promise<Readable>;
export declare const getHostConfig: () => {
    USER: {
        Home: string;
        Name: string;
        Id: string;
    };
    SYSTEM: {
        Name: string;
        Environment: NodeJS.ProcessEnv;
        Architecture: string;
        Platform: NodeJS.Platform;
        OperatingSystem: NodeJS.Platform;
        OperatingSystemType: string;
    };
    HOST: {
        ARCH: string;
        NAME: string;
        TYPE: string;
        PATHS: string;
    };
};
//# sourceMappingURL=process.d.ts.map
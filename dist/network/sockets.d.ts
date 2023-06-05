export interface Handshake {
    identifier: string;
    success?: boolean;
    message?: string;
    sid?: number;
}
export interface Metadata {
    isHandshake?: boolean;
    handshake?: Partial<Handshake>;
    sid?: number;
    message?: string;
    recieved?: boolean;
    send?: boolean;
    reciept?: "client" | "server" | "both";
}
export interface Inference {
    metadata: Partial<Metadata>;
    streamListener: string | "inference:data";
    streamOpenListener: string | "inference:ready";
    streamCloseListener: string | "inference:end";
    streamErrorListener?: string | "inference:error";
    llama: {
        prompt: "jarvis-assistant" | "jarvis-chat" | "jarvis-codex" | "jarvis-demo";
        instructions: string;
        customContext?: boolean;
        context?: string;
        response?: Array<string>;
    };
}
//# sourceMappingURL=sockets.d.ts.map
export interface Handshake {
    identifier: string,
    success?: boolean,
    message?: string,
    sid?: number,
}

export interface Metadata {
    isHandshake?: boolean,
    handshake?: Partial<Handshake>,
    sid?: number,
    message?: string,
    recieved?: boolean,
    send?: boolean,
    reciept?: "client" | "server" | "both",
}

export interface Inference {
    metadata: Partial<Metadata>,
    // simple prompting data, context and even language
    streamListener: string | "inference:data",
    streamOpenListener: string | "inference:ready",
    streamCloseListener: string | "inference:end",
    llama: {
        prompt: "jarvis-assistant" | "jarvis-codex" | "jarvis-demo"
        instructions: string | "Hello Jarvis.",
        customContext?: boolean,
        context?: string,
        response?: Array<string>,
    }
}
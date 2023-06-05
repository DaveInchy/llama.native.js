import { Socket } from "socket.io-client";
import { Handshake, Inference, Metadata } from "./sockets.js";
export declare class ioClientController {
    ioAdres: string;
    ioClient: Socket;
    ioId: number;
    ioValidated: boolean;
    ioCloseCallback: CallableFunction;
    hsResponseObject: Partial<Handshake>;
    hsIdentifier: string;
    inferenceResults: string;
    constructor(serverAddress: string, identifier?: string, callbackOnClose?: CallableFunction);
    private setupClient;
    requestInference(query?: Partial<Inference>, props?: {
        onready: CallableFunction;
        ondata: CallableFunction;
        onend: CallableFunction;
    }): Promise<unknown>;
    requestHandshake: (query?: Partial<Metadata>) => Promise<unknown>;
}
export default ioClientController;
//# sourceMappingURL=client.d.ts.map
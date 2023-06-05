/// <reference types="node" />
import { Express } from "express";
import http_server from "http";
import { Server, Socket as ServerSocket } from "socket.io";
export declare class httpServerController {
    httpServerController?: httpServerController;
    httpServer: http_server.Server;
    httpApp: Express;
    httpsServer: http_server.Server<typeof http_server.IncomingMessage, typeof http_server.ServerResponse>;
    constructor(port: number, isRequired?: boolean);
}
export declare class ioServerController extends httpServerController {
    ioServer: Server;
    ioPool: Array<ServerSocket>;
    callbackListeners: CallableFunction;
    hsIdentifier: string;
    maxClients: number;
    lockInference: boolean;
    requestLocked: any;
    constructor(port: number);
    private countValidConnections;
    private setupServer;
}
export default ioServerController;
//# sourceMappingURL=server.d.ts.map
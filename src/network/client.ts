import io_client, { Socket } from "socket.io-client";
import { Handshake, Inference, Metadata } from "./sockets.js";

export class ioClientController {

    ioAdres: string;
    ioClient: Socket;
    ioId: number;

    ioValidated: boolean;

    hsResponseObject: Partial<Handshake>;
    hsIdentifier: string;

    inferenceResults: string = "";

    constructor(serverAddress: string, identifier?: string) {
        this.ioAdres = serverAddress;
        this.hsIdentifier = identifier || process.env["IDENTIFIER"];
        var isClient: boolean = false;
        if (serverAddress) {
            isClient = true;
            while (!Promise.resolve(this.setupClient())) {
                console.log(`[client]`, `resolving a connection`);
            }
        }
        return this;
    }

    private async setupClient() {
        console.log(`[client]`, `starting`, `new Client`);
        while (this.ioClient === undefined || this.ioClient === null) {
            console.log(`[client]`, `resolving a connection to`, this.ioAdres);
            this.ioClient = io_client(`${this.ioAdres}`);
        }
        console.log(`[client]`, `connection with`, `${this.ioAdres}`);

        console.log(`[client]`, `sending handshake request`)
        this.requestHandshake({
            handshake: {
                identifier: this.hsIdentifier
            },
            isHandshake: true,
        }).then((response: any) => {
            this.hsResponseObject = response.handshake;
            this.ioValidated = this.hsResponseObject.success;
            this.ioId = this.hsResponseObject.sid;
            console.log(`[client]`, `successful handshake request`, response)
        }).catch(err => err);

        this.ioClient.on("disconnect", () => {
            this.ioClient.disconnect();
        })

        this.ioClient.on("close", () => {
            this.ioClient.disconnect();
        })

        return true;
    }

    public requestInference(query?: Partial<Inference>, props?: {
        onready: CallableFunction,
        ondata: CallableFunction,
        onend: CallableFunction,
    }) {
        return new Promise(async (rs, rj) => {
            const metadata: Partial<Metadata> = {
                sid: this.ioId,
            }
            const inferencedata: Partial<Inference> = {
                metadata: metadata,
                streamListener: "inference:data",
                streamOpenListener: "inference:ready",
                streamCloseListener: "inference:end",
                ...query,
                ...{
                    metadata: {
                        message: "Requesting to prompt llama.cpp on the nodejs server.",
                    }
                }
            }
            this.ioClient.emit(`inference:request`, inferencedata);
            this.ioClient.on("inference:ready", (query2: Partial<Inference>) => {
                props?.onready("Jarvis is thinking...");
                console.log(`[client]`, `sending prompt to model.`);
                this.ioClient.emit("inference:prompt", {
                    ...inferencedata,
                    ...query2,
                    ...{
                        metadata: {
                            message: "Sending you the prompt information",
                        }
                    }
                });
            });
            this.ioClient.on(`inference:data`, (query2: Partial<Inference>) => {
                var token: string = query2.metadata.message;
                props?.ondata(token);

                this.inferenceResults = this.inferenceResults + token;
                console.log(`[client]`, this.inferenceResults);
            })
            this.ioClient.on(`inference:end`, query2 => {
                props?.onend(query2.llama.response);
                rs(query2.metadata.message);

                console.log(`[client]`, `ended session with server.`);
                this.ioClient.disconnect();
            })
            this.ioClient.on(`inference:error`, (error) => { console.error(error); rj(error) });
        });
    }

    requestHandshake = (query?: Partial<Metadata>) => new Promise((resolve, reject) => {
        var q = {
            isHandshake: true,
            message: "User wants to secure initial handshake",
            ...query
        };
        this.ioClient.emit('requestHandshake', q);
        console.log(`[client]`, `handshake requested`, q)
        this.ioClient.on(`handshakeResponse`, async (response: any) => {
            resolve(response);
        })
        this.ioClient.on(`handshakeError`, async (err) => {
            console.error(err);
            reject(err);
        })
    })
}

export default ioClientController;
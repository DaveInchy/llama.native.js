import axios from "axios";
import dotenv from "dotenv";
import express, { Express, Request } from "express";
import http_server from "http";
import promptCodex from "../jarvis/codex.js";
import { Server, Socket as ServerSocket } from "socket.io";
import { wait } from "../lib/utils.js";
import { Handshake, Inference, Metadata } from "./sockets.js";

dotenv.config();

export class httpServerController {
    httpServerController?: httpServerController = null;
    httpServer: http_server.Server;
    httpApp: Express;
    constructor(port: number, isRequired?: boolean,) {
        this.httpServerController = this;

        const httpApp = express();

        this.httpServer = http_server.createServer(httpApp);
        return this;
    }
}

export class ioServerController extends httpServerController {

    ioServer: Server;
    ioPool: Array<ServerSocket> = [];
    callbackListeners: CallableFunction;
    hsIdentifier: string;

    maxClients: number = 4;
    lockInference: boolean = false;
    requestLocked: any;

    constructor(port: number) {
        super(port)

        var isEndpoint: boolean = false;
        if (this.httpServerController !== null) {
            isEndpoint = true;

            Promise.resolve(axios("https://mongodb-rest.vercel.app/api/auth/signin/public/key").then(response => response.data.bearer).catch(e => console.error(e))).then(t => this.hsIdentifier = t).finally(() => {
                console.log('identifier', this.hsIdentifier)
                this.setupServer(port)
                    .then((server) => {
                        server.on(`error`, (err) => {
                            console.error(`[io] server experienced an error => ${err}`);
                        })
                        server.listen(port + 1);
                    });

            });

            this.httpServer.listen(port);

        }

        return this;
    }

    private countValidConnections = () => {
        // checks if the returned values from actualfilter are true or not, then returns only the one that are validated
        const validConnections = this.ioPool.filter((v: any, k: number) => v.connected ? true : false);
        return validConnections.length;
    }

    private async setupServer(port) {



        console.log(`[io]`, `starting`, `new Socket.IO`);
        this.ioServer = new Server(this.httpServer ? this.httpServer : port, {
            "cors": {
                "allowedHeaders": "*",
                "origin": "*",
            }
        });
        console.log(`[io]`, `listening on`, `http://localhost:${port}`);

        this.ioServer.on(`connection`, (connSocket: ServerSocket) => {
            console.log(`[io]`, "setting up new client connection")
            let index: number;
            index = this.ioPool.push(connSocket);

            connSocket.request.headers = {
                "accept": "*",
                "access-control-allow-origin": "*",
                "access-control-allow-headers": "*",
            }

            connSocket.on('requestHandshake', (query: Partial<Metadata>) => {
                console.log(`[io]`, "requestHandshake recieved")
                if (query !== undefined) {
                    if (query.isHandshake && query.handshake.identifier == this.hsIdentifier) {
                        connSocket.emit(`handshakeResponse`, {
                            handshake: {
                                identifier: this.hsIdentifier,
                                sid: index,
                                success: true,
                                socket: this.ioPool.at(index),
                            },
                            isHandshake: query.isHandshake,
                            message: "You are secure now",
                        })
                        console.log(`[io] Your handshake was validated`)
                        connSocket.join("secure");
                    } else {
                        connSocket.emit(`handshakeError`, "Handshake was invalidated by the server. please disconnect")
                        connSocket.join("insecure")
                        console.error(`[io]`, `Handshake was invalidated by the server. please disconnect`);
                    }
                }
            });

            // clear all insecure sockets from time to time
            this.ioServer.in("insecure").fetchSockets().then(v => v.forEach(v => v.disconnect()));

            connSocket.on("close", () => {
                console.log(`[io]`, `user disconnected,`, connSocket.disconnected)
            })

            connSocket.on("error", (error) => {
                console.error(error);
            })

            connSocket.on("inference:request", async (query: Partial<Inference>) => {
                console.log(`[io]`, `${query['message']}`, query);

                // lock other requests, keep looping till one can execute again
                while (this.requestLocked) {
                    await wait(10).then(() => {
                        //console.log(`[io]`, `${this.ioPool[index-1]?.id} => waiting for inference, currently a process is running`);
                        if (!this.requestLocked) {
                            console.log(`[io]`, `open spot found, continue-ing inference.`);
                        }
                    });
                }

                if (this.maxClients >= this.countValidConnections()) {
                    // lock it up
                    this.requestLocked = true;
                }

                const inferencedata = {
                    ...query,
                    ...{

                        metadata: {
                            message: "opening stream with tokens from llama.cpp",
                        }
                    }
                };
                connSocket.emit(`${query.streamOpenListener}`, inferencedata);
            })

            connSocket.on("inference:prompt", (query2: Partial<Inference>) => {
                // run the whole llama prompt. and stream stdout back to streamListener
                console.log(`[io]`, `${query2['message']}`, query2);

                const promptOpts = query2.llama;
                if (promptOpts.prompt === "jarvis-demo") {

                    let tokens: Array<string> = [];
                    promptCodex(
                        `${promptOpts.instructions}`,
                    ).then((stream) => {

                        stream.on('data', (token: string) => {
                            token = `${token}`;
                            if (!token.includes("RESPONSE") && !token.includes("CONTEXT") && !token.includes("INSTRUCT") && !token.includes("EXAMPLE")) {
                                tokens.push(token);
                                connSocket.emit(
                                    `${query2.streamListener}`,
                                    {
                                        ...query2,
                                        ...{
                                            llama: {
                                                response: tokens,
                                            }
                                        },
                                        ...{
                                            metadata: {
                                                message: `${token}`,
                                            }
                                        }
                                    }
                                )
                                // process.stdout.write(token);
                            }

                        })

                        stream.on(`end`, () => {
                            var endOfStream = `\n\r\[End\ of\ Session\/Stream\]`;
                            connSocket.emit(
                                `${query2.streamCloseListener}`,
                                {
                                    ...query2,
                                    ...{
                                        llama: {
                                            response: tokens,
                                        }
                                    },
                                    ...{
                                        metadata: {
                                            message: `${tokens.join()}`,
                                        }
                                    }
                                }
                            );
                            process.stdout.write(endOfStream);

                            this.requestLocked = false;
                            connSocket.disconnect();
                            return;
                        })

                        stream.on(`error`, (err) => connSocket.emit("inference:error", err));

                    })
                }

                console.log(`[io]`, `user connected`, `=>`, `created a socket connection.`)
            })
        });

        return this.ioServer;
    }

}

export default ioServerController;
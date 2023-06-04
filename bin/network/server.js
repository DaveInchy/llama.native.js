import { __awaiter } from "tslib";
import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import http_server from "http";
import promptCodex from "../jarvis/codex.js";
import { Server } from "socket.io";
import { wait } from "../lib/utils.js";
dotenv.config();
export class httpServerController {
    constructor(port, isRequired) {
        Object.defineProperty(this, "httpServerController", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "httpServer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "httpApp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.httpServerController = this;
        const httpApp = express();
        this.httpServer = http_server.createServer(httpApp);
        return this;
    }
}
export class ioServerController extends httpServerController {
    constructor(port) {
        super(port);
        Object.defineProperty(this, "ioServer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ioPool", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "callbackListeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "hsIdentifier", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "maxClients", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 4
        });
        Object.defineProperty(this, "lockInference", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "requestLocked", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "countValidConnections", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                const validConnections = this.ioPool.filter((v, k) => v.connected ? true : false);
                return validConnections.length;
            }
        });
        var isEndpoint = false;
        if (this.httpServerController !== null) {
            isEndpoint = true;
            Promise.resolve(axios("https://mongodb-rest.vercel.app/api/auth/signin/public/key").then(response => response.data.bearer).catch(e => console.error(e))).then(t => this.hsIdentifier = t).finally(() => {
                console.log('identifier', this.hsIdentifier);
                this.setupServer(port)
                    .then((server) => {
                    server.on(`error`, (err) => {
                        console.error(`[io] server experienced an error => ${err}`);
                    });
                    server.listen(port + 1);
                });
            });
            this.httpServer.listen(port);
        }
        return this;
    }
    setupServer(port) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[io]`, `starting`, `new Socket.IO`);
            this.ioServer = new Server(this.httpServer ? this.httpServer : port, {
                "cors": {
                    "allowedHeaders": "*",
                    "origin": "*",
                }
            });
            console.log(`[io]`, `listening on`, `http://localhost:${port}`);
            this.ioServer.on(`connection`, (connSocket) => {
                console.log(`[io]`, "setting up new client connection");
                let index;
                index = this.ioPool.push(connSocket);
                connSocket.request.headers = {
                    "accept": "*",
                    "access-control-allow-origin": "*",
                    "access-control-allow-headers": "*",
                };
                connSocket.on('requestHandshake', (query) => {
                    console.log(`[io]`, "requestHandshake recieved");
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
                            });
                            console.log(`[io] Your handshake was validated`);
                            connSocket.join("secure");
                        }
                        else {
                            connSocket.emit(`handshakeError`, "Handshake was invalidated by the server. please disconnect");
                            connSocket.join("insecure");
                            console.error(`[io]`, `Handshake was invalidated by the server. please disconnect`);
                        }
                    }
                });
                this.ioServer.in("insecure").fetchSockets().then(v => v.forEach(v => v.disconnect()));
                connSocket.on("close", () => {
                    console.log(`[io]`, `user disconnected,`, connSocket.disconnected);
                });
                connSocket.on("error", (error) => {
                    console.error(error);
                });
                connSocket.on("inference:request", (query) => __awaiter(this, void 0, void 0, function* () {
                    console.log(`[io]`, `${query['message']}`, query);
                    while (this.requestLocked) {
                        yield wait(10).then(() => {
                            if (!this.requestLocked) {
                                console.log(`[io]`, `open spot found, continue-ing inference.`);
                            }
                        });
                    }
                    if (this.maxClients >= this.countValidConnections()) {
                        this.requestLocked = true;
                    }
                    const inferencedata = Object.assign(Object.assign({}, query), {
                        metadata: {
                            message: "opening stream with tokens from llama.cpp",
                        }
                    });
                    connSocket.emit(`${query.streamOpenListener}`, inferencedata);
                }));
                connSocket.on("inference:prompt", (query2) => {
                    console.log(`[io]`, `${query2['message']}`, query2);
                    const promptOpts = query2.llama;
                    if (promptOpts.prompt === "jarvis-demo") {
                        let tokens = [];
                        promptCodex(`${promptOpts.instructions}`).then((stream) => {
                            stream.on('data', (token) => {
                                token = `${token}`;
                                if (!token.includes("RESPONSE") && !token.includes("CONTEXT") && !token.includes("INSTRUCT") && !token.includes("EXAMPLE")) {
                                    tokens.push(token);
                                    connSocket.emit(`${query2.streamListener}`, Object.assign(Object.assign(Object.assign({}, query2), {
                                        llama: {
                                            response: tokens,
                                        }
                                    }), {
                                        metadata: {
                                            message: `${token}`,
                                        }
                                    }));
                                }
                            });
                            stream.on(`end`, () => {
                                var endOfStream = `\n\r\[End\ of\ Session\/Stream\]`;
                                connSocket.emit(`${query2.streamCloseListener}`, Object.assign(Object.assign(Object.assign({}, query2), {
                                    llama: {
                                        response: tokens,
                                    }
                                }), {
                                    metadata: {
                                        message: `${tokens.join()}`,
                                    }
                                }));
                                process.stdout.write(endOfStream);
                                this.requestLocked = false;
                                connSocket.disconnect();
                                return;
                            });
                            stream.on(`error`, (err) => connSocket.emit("inference:error", err));
                        });
                    }
                    console.log(`[io]`, `user connected`, `=>`, `created a socket connection.`);
                });
            });
            return this.ioServer;
        });
    }
}
export default ioServerController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6InNyYy8iLCJzb3VyY2VzIjpbIm5ldHdvcmsvc2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDMUIsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBQzVCLE9BQU8sT0FBNkIsTUFBTSxTQUFTLENBQUM7QUFDcEQsT0FBTyxXQUFXLE1BQU0sTUFBTSxDQUFDO0FBQy9CLE9BQU8sV0FBVyxNQUFNLG9CQUFvQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxNQUFNLEVBQTBCLE1BQU0sV0FBVyxDQUFDO0FBQzNELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUd2QyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFFaEIsTUFBTSxPQUFPLG9CQUFvQjtJQUk3QixZQUFZLElBQVksRUFBRSxVQUFvQjtRQUg5Qzs7OzttQkFBOEMsSUFBSTtXQUFDO1FBQ25EOzs7OztXQUErQjtRQUMvQjs7Ozs7V0FBaUI7UUFFYixJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO1FBRWpDLE1BQU0sT0FBTyxHQUFHLE9BQU8sRUFBRSxDQUFDO1FBRTFCLElBQUksQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0o7QUFFRCxNQUFNLE9BQU8sa0JBQW1CLFNBQVEsb0JBQW9CO0lBV3hELFlBQVksSUFBWTtRQUNwQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7UUFWZjs7Ozs7V0FBaUI7UUFDakI7Ozs7bUJBQThCLEVBQUU7V0FBQztRQUNqQzs7Ozs7V0FBb0M7UUFDcEM7Ozs7O1dBQXFCO1FBRXJCOzs7O21CQUFxQixDQUFDO1dBQUM7UUFDdkI7Ozs7bUJBQXlCLEtBQUs7V0FBQztRQUMvQjs7Ozs7V0FBbUI7UUE0Qlg7Ozs7bUJBQXdCLEdB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QixJQUFJLFdBQVcsR0FBRyxrQ0FBa0MsQ0FBQztnQ0FDckQsVUFBVSxDQUFDLElBQUksQ0FDWCxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxnREFFeEIsTUFBTSxHQUNOO29DQUNDLEtBQUssRUFBRTt3Q0FDSCxRQUFRLEVBQUUsTUFBTTtxQ0FDbkI7aUNBQ0osR0FDRTtvQ0FDQyxRQUFRLEVBQUU7d0NBQ04sT0FBTyxFQUFFLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFO3FDQUM5QjtpQ0FDSixFQUVSLENBQUM7Z0NBQ0YsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7Z0NBRWxDLElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO2dDQUMzQixVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7Z0NBQ3hCLE9BQU87NEJBQ1gsQ0FBQyxDQUFDLENBQUE7NEJBRUYsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFFekUsQ0FBQyxDQUFDLENBQUE7cUJBQ0w7b0JBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLDhCQUE4QixDQUFDLENBQUE7Z0JBQy9FLENBQUMsQ0FBQyxDQUFBO1lBQ04sQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDekIsQ0FBQztLQUFBO0NBRUo7QUFFRCxlQUFlLGtCQUFrQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xyXG5pbXBvcnQgZG90ZW52IGZyb20gXCJkb3RlbnZcIjtcclxuaW1wb3J0IGV4cHJlc3MsIHsgRXhwcmVzcywgUmVxdWVzdCB9IGZyb20gXCJleHByZXNzXCI7XHJcbmltcG9ydCBodHRwX3NlcnZlciBmcm9tIFwiaHR0cFwiO1xyXG5pbXBvcnQgcHJvbXB0Q29kZXggZnJvbSBcIi4uL2phcnZpcy9jb2RleC5qc1wiO1xyXG5pbXBvcnQgeyBTZXJ2ZXIsIFNvY2tldCBhcyBTZXJ2ZXJTb2NrZXQgfSBmcm9tIFwic29ja2V0LmlvXCI7XHJcbmltcG9ydCB7IHdhaXQgfSBmcm9tIFwiLi4vbGliL3V0aWxzLmpzXCI7XHJcbmltcG9ydCB7IEhhbmRzaGFrZSwgSW5mZXJlbmNlLCBNZXRhZGF0YSB9IGZyb20gXCIuL3NvY2tldHMuanNcIjtcclxuXHJcbmRvdGVudi5jb25maWcoKTtcclxuXHJcbmV4cG9ydCBjbGFzcyBodHRwU2VydmVyQ29udHJvbGxlciB7XHJcbiAgICBodHRwU2VydmVyQ29udHJvbGxlcj86IGh0dHBTZXJ2ZXJDb250cm9sbGVyID0gbnVsbDtcclxuICAgIGh0dHBTZXJ2ZXI6IGh0dHBfc2VydmVyLlNlcnZlcjtcclxuICAgIGh0dHBBcHA6IEV4cHJlc3M7XHJcbiAgICBjb25zdHJ1Y3Rvcihwb3J0OiBudW1iZXIsIGlzUmVxdWlyZWQ/OiBib29sZWFuLCkge1xyXG4gICAgICAgIHRoaXMuaHR0cFNlcnZlckNvbnRyb2xsZXIgPSB0aGlzO1xyXG5cclxuICAgICAgICBjb25zdCBodHRwQXBwID0gZXhwcmVzcygpO1xyXG5cclxuICAgICAgICB0aGlzLmh0dHBTZXJ2ZXIgPSBodHRwX3NlcnZlci5jcmVhdGVTZXJ2ZXIoaHR0cEFwcCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBpb1NlcnZlckNvbnRyb2xsZXIgZXh0ZW5kcyBodHRwU2VydmVyQ29udHJvbGxlciB7XHJcblxyXG4gICAgaW9TZXJ2ZXI6IFNlcnZlcjtcclxuICAgIGlvUG9vbDogQXJyYXk8U2VydmVyU29ja2V0PiA9IFtdO1xyXG4gICAgY2FsbGJhY2tMaXN0ZW5lcnM6IENhbGxhYmxlRnVuY3Rpb247XHJcbiAgICBoc0lkZW50aWZpZXI6IHN0cmluZztcclxuXHJcbiAgICBtYXhDbGllbnRzOiBudW1iZXIgPSA0O1xyXG4gICAgbG9ja0luZmVyZW5jZTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcmVxdWVzdExvY2tlZDogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHBvcnQ6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKHBvcnQpXHJcblxyXG4gICAgICAgIHZhciBpc0VuZHBvaW50OiBib29sZWFuID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHRoaXMuaHR0cFNlcnZlckNvbnRyb2xsZXIgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgaXNFbmRwb2ludCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUoYXhpb3MoXCJodHRwczovL21vbmdvZGItcmVzdC52ZXJjZWwuYXBwL2FwaS9hdXRoL3NpZ25pbi9wdWJsaWMva2V5XCIpLnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuZGF0YS5iZWFyZXIpLmNhdGNoKGUgPT4gY29uc29sZS5lcnJvcihlKSkpLnRoZW4odCA9PiB0aGlzLmhzSWRlbnRpZmllciA9IHQpLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2lkZW50aWZpZXInLCB0aGlzLmhzSWRlbnRpZmllcilcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0dXBTZXJ2ZXIocG9ydClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigoc2VydmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZlci5vbihgZXJyb3JgLCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbaW9dIHNlcnZlciBleHBlcmllbmNlZCBhbiBlcnJvciA9PiAke2Vycn1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyLmxpc3Rlbihwb3J0ICsgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaHR0cFNlcnZlci5saXN0ZW4ocG9ydCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjb3VudFZhbGlkQ29ubmVjdGlvbnMgPSAoKSA9PiB7XHJcbiAgICAgICAgLy8gY2hlY2tzIGlmIHRoZSByZXR1cm5lZCB2YWx1ZXMgZnJvbSBhY3R1YWxmaWx0ZXIgYXJlIHRydWUgb3Igbm90LCB0aGVuIHJldHVybnMgb25seSB0aGUgb25lIHRoYXQgYXJlIHZhbGlkYXRlZFxyXG4gICAgICAgIGNvbnN0IHZhbGlkQ29ubmVjdGlvbnMgPSB0aGlzLmlvUG9vbC5maWx0ZXIoKHY6IGFueSwgazogbnVtYmVyKSA9PiB2LmNvbm5lY3RlZCA/IHRydWUgOiBmYWxzZSk7XHJcbiAgICAgICAgcmV0dXJuIHZhbGlkQ29ubmVjdGlvbnMubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgc2V0dXBTZXJ2ZXIocG9ydCkge1xyXG5cclxuXHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbaW9dYCwgYHN0YXJ0aW5nYCwgYG5ldyBTb2NrZXQuSU9gKTtcclxuICAgICAgICB0aGlzLmlvU2VydmVyID0gbmV3IFNlcnZlcih0aGlzLmh0dHBTZXJ2ZXIgPyB0aGlzLmh0dHBTZXJ2ZXIgOiBwb3J0LCB7XHJcbiAgICAgICAgICAgIFwiY29yc1wiOiB7XHJcbiAgICAgICAgICAgICAgICBcImFsbG93ZWRIZWFkZXJzXCI6IFwiKlwiLFxyXG4gICAgICAgICAgICAgICAgXCJvcmlnaW5cIjogXCIqXCIsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW2lvXWAsIGBsaXN0ZW5pbmcgb25gLCBgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9YCk7XHJcblxyXG4gICAgICAgIHRoaXMuaW9TZXJ2ZXIub24oYGNvbm5lY3Rpb25gLCAoY29ublNvY2tldDogU2VydmVyU29ja2V0KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbaW9dYCwgXCJzZXR0aW5nIHVwIG5ldyBjbGllbnQgY29ubmVjdGlvblwiKVxyXG4gICAgICAgICAgICBsZXQgaW5kZXg6IG51bWJlcjtcclxuICAgICAgICAgICAgaW5kZXggPSB0aGlzLmlvUG9vbC5wdXNoKGNvbm5Tb2NrZXQpO1xyXG5cclxuICAgICAgICAgICAgY29ublNvY2tldC5yZXF1ZXN0LmhlYWRlcnMgPSB7XHJcbiAgICAgICAgICAgICAgICBcImFjY2VwdFwiOiBcIipcIixcclxuICAgICAgICAgICAgICAgIFwiYWNjZXNzLWNvbnRyb2wtYWxsb3ctb3JpZ2luXCI6IFwiKlwiLFxyXG4gICAgICAgICAgICAgICAgXCJhY2Nlc3MtY29udHJvbC1hbGxvdy1oZWFkZXJzXCI6IFwiKlwiLFxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25uU29ja2V0Lm9uKCdyZXF1ZXN0SGFuZHNoYWtlJywgKHF1ZXJ5OiBQYXJ0aWFsPE1ldGFkYXRhPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtpb11gLCBcInJlcXVlc3RIYW5kc2hha2UgcmVjaWV2ZWRcIilcclxuICAgICAgICAgICAgICAgIGlmIChxdWVyeSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXJ5LmlzSGFuZHNoYWtlICYmIHF1ZXJ5LmhhbmRzaGFrZS5pZGVudGlmaWVyID09IHRoaXMuaHNJZGVudGlmaWVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbm5Tb2NrZXQuZW1pdChgaGFuZHNoYWtlUmVzcG9uc2VgLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kc2hha2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZGVudGlmaWVyOiB0aGlzLmhzSWRlbnRpZmllcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWQ6IGluZGV4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc29ja2V0OiB0aGlzLmlvUG9vbC5hdChpbmRleCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNIYW5kc2hha2U6IHF1ZXJ5LmlzSGFuZHNoYWtlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJZb3UgYXJlIHNlY3VyZSBub3dcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtpb10gWW91ciBoYW5kc2hha2Ugd2FzIHZhbGlkYXRlZGApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbm5Tb2NrZXQuam9pbihcInNlY3VyZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25uU29ja2V0LmVtaXQoYGhhbmRzaGFrZUVycm9yYCwgXCJIYW5kc2hha2Ugd2FzIGludmFsaWRhdGVkIGJ5IHRoZSBzZXJ2ZXIuIHBsZWFzZSBkaXNjb25uZWN0XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbm5Tb2NrZXQuam9pbihcImluc2VjdXJlXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtpb11gLCBgSGFuZHNoYWtlIHdhcyBpbnZhbGlkYXRlZCBieSB0aGUgc2VydmVyLiBwbGVhc2UgZGlzY29ubmVjdGApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBjbGVhciBhbGwgaW5zZWN1cmUgc29ja2V0cyBmcm9tIHRpbWUgdG8gdGltZVxyXG4gICAgICAgICAgICB0aGlzLmlvU2VydmVyLmluKFwiaW5zZWN1cmVcIikuZmV0Y2hTb2NrZXRzKCkudGhlbih2ID0+IHYuZm9yRWFjaCh2ID0+IHYuZGlzY29ubmVjdCgpKSk7XHJcblxyXG4gICAgICAgICAgICBjb25uU29ja2V0Lm9uKFwiY2xvc2VcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtpb11gLCBgdXNlciBkaXNjb25uZWN0ZWQsYCwgY29ublNvY2tldC5kaXNjb25uZWN0ZWQpXHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICBjb25uU29ja2V0Lm9uKFwiZXJyb3JcIiwgKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIGNvbm5Tb2NrZXQub24oXCJpbmZlcmVuY2U6cmVxdWVzdFwiLCBhc3luYyAocXVlcnk6IFBhcnRpYWw8SW5mZXJlbmNlPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtpb11gLCBgJHtxdWVyeVsnbWVzc2FnZSddfWAsIHF1ZXJ5KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBsb2NrIG90aGVyIHJlcXVlc3RzLCBrZWVwIGxvb3BpbmcgdGlsbCBvbmUgY2FuIGV4ZWN1dGUgYWdhaW5cclxuICAgICAgICAgICAgICAgIHdoaWxlICh0aGlzLnJlcXVlc3RMb2NrZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB3YWl0KDEwKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhgW2lvXWAsIGAke3RoaXMuaW9Qb29sW2luZGV4LTFdPy5pZH0gPT4gd2FpdGluZyBmb3IgaW5mZXJlbmNlLCBjdXJyZW50bHkgYSBwcm9jZXNzIGlzIHJ1bm5pbmdgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnJlcXVlc3RMb2NrZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbaW9dYCwgYG9wZW4gc3BvdCBmb3VuZCwgY29udGludWUtaW5nIGluZmVyZW5jZS5gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1heENsaWVudHMgPj0gdGhpcy5jb3VudFZhbGlkQ29ubmVjdGlvbnMoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGxvY2sgaXQgdXBcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlcXVlc3RMb2NrZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGluZmVyZW5jZWRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4ucXVlcnksXHJcbiAgICAgICAgICAgICAgICAgICAgLi4ue1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwib3BlbmluZyBzdHJlYW0gd2l0aCB0b2tlbnMgZnJvbSBsbGFtYS5jcHBcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBjb25uU29ja2V0LmVtaXQoYCR7cXVlcnkuc3RyZWFtT3Blbkxpc3RlbmVyfWAsIGluZmVyZW5jZWRhdGEpO1xyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgY29ublNvY2tldC5vbihcImluZmVyZW5jZTpwcm9tcHRcIiwgKHF1ZXJ5MjogUGFydGlhbDxJbmZlcmVuY2U+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBydW4gdGhlIHdob2xlIGxsYW1hIHByb21wdC4gYW5kIHN0cmVhbSBzdGRvdXQgYmFjayB0byBzdHJlYW1MaXN0ZW5lclxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtpb11gLCBgJHtxdWVyeTJbJ21lc3NhZ2UnXX1gLCBxdWVyeTIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHByb21wdE9wdHMgPSBxdWVyeTIubGxhbWE7XHJcbiAgICAgICAgICAgICAgICBpZiAocHJvbXB0T3B0cy5wcm9tcHQgPT09IFwiamFydmlzLWRlbW9cIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgdG9rZW5zOiBBcnJheTxzdHJpbmc+ID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0Q29kZXgoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGAke3Byb21wdE9wdHMuaW5zdHJ1Y3Rpb25zfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgKS50aGVuKChzdHJlYW0pID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVhbS5vbignZGF0YScsICh0b2tlbjogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbiA9IGAke3Rva2VufWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRva2VuLmluY2x1ZGVzKFwiUkVTUE9OU0VcIikgJiYgIXRva2VuLmluY2x1ZGVzKFwiQ09OVEVYVFwiKSAmJiAhdG9rZW4uaW5jbHVkZXMoXCJJTlNUUlVDVFwiKSAmJiAhdG9rZW4uaW5jbHVkZXMoXCJFWEFNUExFXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbm5Tb2NrZXQuZW1pdChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7cXVlcnkyLnN0cmVhbUxpc3RlbmVyfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnF1ZXJ5MixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsbGFtYToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZTogdG9rZW5zLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYCR7dG9rZW59YCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcHJvY2Vzcy5zdGRvdXQud3JpdGUodG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVhbS5vbihgZW5kYCwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVuZE9mU3RyZWFtID0gYFxcblxcclxcW0VuZFxcIG9mXFwgU2Vzc2lvblxcL1N0cmVhbVxcXWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25uU29ja2V0LmVtaXQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7cXVlcnkyLnN0cmVhbUNsb3NlTGlzdGVuZXJ9YCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnF1ZXJ5MixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ue1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGxhbWE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZTogdG9rZW5zLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGAke3Rva2Vucy5qb2luKCl9YCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShlbmRPZlN0cmVhbSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TG9ja2VkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25uU29ja2V0LmRpc2Nvbm5lY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVhbS5vbihgZXJyb3JgLCAoZXJyKSA9PiBjb25uU29ja2V0LmVtaXQoXCJpbmZlcmVuY2U6ZXJyb3JcIiwgZXJyKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtpb11gLCBgdXNlciBjb25uZWN0ZWRgLCBgPT5gLCBgY3JlYXRlZCBhIHNvY2tldCBjb25uZWN0aW9uLmApXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmlvU2VydmVyO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgaW9TZXJ2ZXJDb250cm9sbGVyOyJdfQ==
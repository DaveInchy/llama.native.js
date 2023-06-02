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
                    console.log(`[io]`, `user disconnected,`, `bye!`, connSocket.disconnected);
                });
                connSocket.on("error", (error) => {
                    console.error(error);
                });
                connSocket.on("inference:request", (query) => __awaiter(this, void 0, void 0, function* () {
                    console.log(`[io]`, `${query['message']}`, query);
                    while (this.requestLocked) {
                        yield wait(3).then(() => {
                            var _a;
                            console.log(`[io]`, `${(_a = this.ioPool[index]) === null || _a === void 0 ? void 0 : _a.id} => waiting for inference, currently a process is running`);
                        });
                    }
                    this.requestLocked = true;
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
                                    process.stdout.write(token);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6Ii4vc3JjLyIsInNvdXJjZXMiOlsibmV0d29yay9zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMxQixPQUFPLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDNUIsT0FBTyxPQUE2QixNQUFNLFNBQVMsQ0FBQztBQUNwRCxPQUFPLFdBQVcsTUFBTSxNQUFNLENBQUM7QUFDL0IsT0FBTyxXQUFXLE1BQU0sb0JBQW9CLENBQUM7QUFDN0MsT0FBTyxFQUFFLE1BQU0sRUFBMEIsTUFBTSxXQUFXLENBQUM7QUFDM0QsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBR3ZDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUVoQixNQUFNLE9BQU8sb0JBQW9CO0lBSTdCLFlBQVksSUFBWSxFQUFFLFVBQW9CO1FBSDlDOzs7O21CQUE4QyxJQUFJO1dBQUM7UUFDbkQ7Ozs7O1dBQStCO1FBQy9COzs7OztXQUFpQjtRQUViLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7UUFFakMsTUFBTSxPQUFPLEdBQUcsT0FBTyxFQUFFLENBQUM7UUFFMUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FDSjtBQUVELE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxvQkFBb0I7SUFXeEQsWUFBWSxJQUFZO1FBQ3BCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQVZmOzs7OztXQUFpQjtRQUNqQjs7OzttQkFBOEIsRUFBRTtXQUFDO1FBQ2pDOzs7OztXQUFvQztRQUNwQzs7Ozs7V0FBcUI7UUFFckI7Ozs7bUJBQXFCLENBQUM7V0FBQztRQUN2Qjs7OzttQkFBeUIsS0FBSztXQUFDO1FBQy9COzs7OztXQUFtQjtRQUtmLElBQUksVUFBVSxH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O2lDQUNKLEVBRVIsQ0FBQztnQ0FDRixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztnQ0FFbEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7Z0NBQzNCLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQ0FDeEIsT0FBTzs0QkFDWCxDQUFDLENBQUMsQ0FBQTs0QkFFRixNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUV6RSxDQUFDLENBQUMsQ0FBQTtxQkFDTDtvQkFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsOEJBQThCLENBQUMsQ0FBQTtnQkFDL0UsQ0FBQyxDQUFDLENBQUE7WUFDTixDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN6QixDQUFDO0tBQUE7Q0FFSjtBQUVELGVBQWUsa0JBQWtCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XHJcbmltcG9ydCBkb3RlbnYgZnJvbSBcImRvdGVudlwiO1xyXG5pbXBvcnQgZXhwcmVzcywgeyBFeHByZXNzLCBSZXF1ZXN0IH0gZnJvbSBcImV4cHJlc3NcIjtcclxuaW1wb3J0IGh0dHBfc2VydmVyIGZyb20gXCJodHRwXCI7XHJcbmltcG9ydCBwcm9tcHRDb2RleCBmcm9tIFwiLi4vamFydmlzL2NvZGV4LmpzXCI7XHJcbmltcG9ydCB7IFNlcnZlciwgU29ja2V0IGFzIFNlcnZlclNvY2tldCB9IGZyb20gXCJzb2NrZXQuaW9cIjtcclxuaW1wb3J0IHsgd2FpdCB9IGZyb20gXCIuLi9saWIvdXRpbHMuanNcIjtcclxuaW1wb3J0IHsgSGFuZHNoYWtlLCBJbmZlcmVuY2UsIE1ldGFkYXRhIH0gZnJvbSBcIi4vc29ja2V0cy5qc1wiO1xyXG5cclxuZG90ZW52LmNvbmZpZygpO1xyXG5cclxuZXhwb3J0IGNsYXNzIGh0dHBTZXJ2ZXJDb250cm9sbGVyIHtcclxuICAgIGh0dHBTZXJ2ZXJDb250cm9sbGVyPzogaHR0cFNlcnZlckNvbnRyb2xsZXIgPSBudWxsO1xyXG4gICAgaHR0cFNlcnZlcjogaHR0cF9zZXJ2ZXIuU2VydmVyO1xyXG4gICAgaHR0cEFwcDogRXhwcmVzcztcclxuICAgIGNvbnN0cnVjdG9yKHBvcnQ6IG51bWJlciwgaXNSZXF1aXJlZD86IGJvb2xlYW4sKSB7XHJcbiAgICAgICAgdGhpcy5odHRwU2VydmVyQ29udHJvbGxlciA9IHRoaXM7XHJcblxyXG4gICAgICAgIGNvbnN0IGh0dHBBcHAgPSBleHByZXNzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaHR0cFNlcnZlciA9IGh0dHBfc2VydmVyLmNyZWF0ZVNlcnZlcihodHRwQXBwKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIGlvU2VydmVyQ29udHJvbGxlciBleHRlbmRzIGh0dHBTZXJ2ZXJDb250cm9sbGVyIHtcclxuXHJcbiAgICBpb1NlcnZlcjogU2VydmVyO1xyXG4gICAgaW9Qb29sOiBBcnJheTxTZXJ2ZXJTb2NrZXQ+ID0gW107XHJcbiAgICBjYWxsYmFja0xpc3RlbmVyczogQ2FsbGFibGVGdW5jdGlvbjtcclxuICAgIGhzSWRlbnRpZmllcjogc3RyaW5nO1xyXG5cclxuICAgIG1heENsaWVudHM6IG51bWJlciA9IDQ7XHJcbiAgICBsb2NrSW5mZXJlbmNlOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICByZXF1ZXN0TG9ja2VkOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IocG9ydDogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIocG9ydClcclxuXHJcbiAgICAgICAgdmFyIGlzRW5kcG9pbnQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgICAgICBpZiAodGhpcy5odHRwU2VydmVyQ29udHJvbGxlciAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBpc0VuZHBvaW50ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIFByb21pc2UucmVzb2x2ZShheGlvcyhcImh0dHBzOi8vbW9uZ29kYi1yZXN0LnZlcmNlbC5hcHAvYXBpL2F1dGgvc2lnbmluL3B1YmxpYy9rZXlcIikudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5kYXRhLmJlYXJlcikuY2F0Y2goZSA9PiBjb25zb2xlLmVycm9yKGUpKSkudGhlbih0ID0+IHRoaXMuaHNJZGVudGlmaWVyID0gdCkuZmluYWxseSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaWRlbnRpZmllcicsIHRoaXMuaHNJZGVudGlmaWVyKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXR1cFNlcnZlcihwb3J0KVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChzZXJ2ZXIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyLm9uKGBlcnJvcmAsIChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtpb10gc2VydmVyIGV4cGVyaWVuY2VkIGFuIGVycm9yID0+ICR7ZXJyfWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXIubGlzdGVuKHBvcnQgKyAxKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5odHRwU2VydmVyLmxpc3Rlbihwb3J0KTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIHNldHVwU2VydmVyKHBvcnQpIHtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coYFtpb11gLCBgc3RhcnRpbmdgLCBgbmV3IFNvY2tldC5JT2ApO1xyXG4gICAgICAgIHRoaXMuaW9TZXJ2ZXIgPSBuZXcgU2VydmVyKHRoaXMuaHR0cFNlcnZlciA/IHRoaXMuaHR0cFNlcnZlciA6IHBvcnQsIHtcclxuICAgICAgICAgICAgXCJjb3JzXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiYWxsb3dlZEhlYWRlcnNcIjogXCIqXCIsXHJcbiAgICAgICAgICAgICAgICBcIm9yaWdpblwiOiBcIipcIixcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbaW9dYCwgYGxpc3RlbmluZyBvbmAsIGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH1gKTtcclxuXHJcbiAgICAgICAgdGhpcy5pb1NlcnZlci5vbihgY29ubmVjdGlvbmAsIChjb25uU29ja2V0OiBTZXJ2ZXJTb2NrZXQpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtpb11gLCBcInNldHRpbmcgdXAgbmV3IGNsaWVudCBjb25uZWN0aW9uXCIpXHJcbiAgICAgICAgICAgIGxldCBpbmRleDogbnVtYmVyO1xyXG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuaW9Qb29sLnB1c2goY29ublNvY2tldCk7XHJcblxyXG4gICAgICAgICAgICBjb25uU29ja2V0LnJlcXVlc3QuaGVhZGVycyA9IHtcclxuICAgICAgICAgICAgICAgIFwiYWNjZXB0XCI6IFwiKlwiLFxyXG4gICAgICAgICAgICAgICAgXCJhY2Nlc3MtY29udHJvbC1hbGxvdy1vcmlnaW5cIjogXCIqXCIsXHJcbiAgICAgICAgICAgICAgICBcImFjY2Vzcy1jb250cm9sLWFsbG93LWhlYWRlcnNcIjogXCIqXCIsXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbm5Tb2NrZXQub24oJ3JlcXVlc3RIYW5kc2hha2UnLCAocXVlcnk6IFBhcnRpYWw8TWV0YWRhdGE+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2lvXWAsIFwicmVxdWVzdEhhbmRzaGFrZSByZWNpZXZlZFwiKVxyXG4gICAgICAgICAgICAgICAgaWYgKHF1ZXJ5ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocXVlcnkuaXNIYW5kc2hha2UgJiYgcXVlcnkuaGFuZHNoYWtlLmlkZW50aWZpZXIgPT0gdGhpcy5oc0lkZW50aWZpZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29ublNvY2tldC5lbWl0KGBoYW5kc2hha2VSZXNwb25zZWAsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRzaGFrZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXI6IHRoaXMuaHNJZGVudGlmaWVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpZDogaW5kZXgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb2NrZXQ6IHRoaXMuaW9Qb29sLmF0KGluZGV4KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0hhbmRzaGFrZTogcXVlcnkuaXNIYW5kc2hha2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIllvdSBhcmUgc2VjdXJlIG5vd1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2lvXSBZb3VyIGhhbmRzaGFrZSB3YXMgdmFsaWRhdGVkYClcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29ublNvY2tldC5qb2luKFwic2VjdXJlXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbm5Tb2NrZXQuZW1pdChgaGFuZHNoYWtlRXJyb3JgLCBcIkhhbmRzaGFrZSB3YXMgaW52YWxpZGF0ZWQgYnkgdGhlIHNlcnZlci4gcGxlYXNlIGRpc2Nvbm5lY3RcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29ublNvY2tldC5qb2luKFwiaW5zZWN1cmVcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW2lvXWAsIGBIYW5kc2hha2Ugd2FzIGludmFsaWRhdGVkIGJ5IHRoZSBzZXJ2ZXIuIHBsZWFzZSBkaXNjb25uZWN0YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIGNsZWFyIGFsbCBpbnNlY3VyZSBzb2NrZXRzIGZyb20gdGltZSB0byB0aW1lXHJcbiAgICAgICAgICAgIHRoaXMuaW9TZXJ2ZXIuaW4oXCJpbnNlY3VyZVwiKS5mZXRjaFNvY2tldHMoKS50aGVuKHYgPT4gdi5mb3JFYWNoKHYgPT4gdi5kaXNjb25uZWN0KCkpKTtcclxuXHJcbiAgICAgICAgICAgIGNvbm5Tb2NrZXQub24oXCJjbG9zZVwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2lvXWAsIGB1c2VyIGRpc2Nvbm5lY3RlZCxgLCBgYnllIWAsIGNvbm5Tb2NrZXQuZGlzY29ubmVjdGVkKVxyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgY29ublNvY2tldC5vbihcImVycm9yXCIsIChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICBjb25uU29ja2V0Lm9uKFwiaW5mZXJlbmNlOnJlcXVlc3RcIiwgYXN5bmMgKHF1ZXJ5OiBQYXJ0aWFsPEluZmVyZW5jZT4pID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbaW9dYCwgYCR7cXVlcnlbJ21lc3NhZ2UnXX1gLCBxdWVyeSk7XHJcbiAgICAgICAgICAgICAgICAvLyBsb2NrIG90aGVyIHJlcXVlc3RzLCBrZWVwIGxvb3BpbmcgdGlsbCBvbmUgY2FuIGV4ZWN1dGUgYWdhaW5cclxuICAgICAgICAgICAgICAgIHdoaWxlICh0aGlzLnJlcXVlc3RMb2NrZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB3YWl0KDMpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2lvXWAsIGAke3RoaXMuaW9Qb29sW2luZGV4XT8uaWR9ID0+IHdhaXRpbmcgZm9yIGluZmVyZW5jZSwgY3VycmVudGx5IGEgcHJvY2VzcyBpcyBydW5uaW5nYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlcXVlc3RMb2NrZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5mZXJlbmNlZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5xdWVyeSxcclxuICAgICAgICAgICAgICAgICAgICAuLi57XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJvcGVuaW5nIHN0cmVhbSB3aXRoIHRva2VucyBmcm9tIGxsYW1hLmNwcFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGNvbm5Tb2NrZXQuZW1pdChgJHtxdWVyeS5zdHJlYW1PcGVuTGlzdGVuZXJ9YCwgaW5mZXJlbmNlZGF0YSk7XHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICBjb25uU29ja2V0Lm9uKFwiaW5mZXJlbmNlOnByb21wdFwiLCAocXVlcnkyOiBQYXJ0aWFsPEluZmVyZW5jZT4pID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIHJ1biB0aGUgd2hvbGUgbGxhbWEgcHJvbXB0LiBhbmQgc3RyZWFtIHN0ZG91dCBiYWNrIHRvIHN0cmVhbUxpc3RlbmVyXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2lvXWAsIGAke3F1ZXJ5MlsnbWVzc2FnZSddfWAsIHF1ZXJ5Mik7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJvbXB0T3B0cyA9IHF1ZXJ5Mi5sbGFtYTtcclxuICAgICAgICAgICAgICAgIGlmIChwcm9tcHRPcHRzLnByb21wdCA9PT0gXCJqYXJ2aXMtZGVtb1wiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0b2tlbnM6IEFycmF5PHN0cmluZz4gPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBwcm9tcHRDb2RleChcclxuICAgICAgICAgICAgICAgICAgICAgICAgYCR7cHJvbXB0T3B0cy5pbnN0cnVjdGlvbnN9YCxcclxuICAgICAgICAgICAgICAgICAgICApLnRoZW4oKHN0cmVhbSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWFtLm9uKCdkYXRhJywgKHRva2VuOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuID0gYCR7dG9rZW59YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdG9rZW4uaW5jbHVkZXMoXCJSRVNQT05TRVwiKSAmJiAhdG9rZW4uaW5jbHVkZXMoXCJDT05URVhUXCIpICYmICF0b2tlbi5pbmNsdWRlcyhcIklOU1RSVUNUXCIpICYmICF0b2tlbi5pbmNsdWRlcyhcIkVYQU1QTEVcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29ublNvY2tldC5lbWl0KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtxdWVyeTIuc3RyZWFtTGlzdGVuZXJ9YCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ucXVlcnkyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ue1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxsYW1hOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlOiB0b2tlbnMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgJHt0b2tlbn1gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSh0b2tlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWFtLm9uKGBlbmRgLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZW5kT2ZTdHJlYW0gPSBgXFxuXFxyXFxbRW5kXFwgb2ZcXCBTZXNzaW9uXFwvU3RyZWFtXFxdYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbm5Tb2NrZXQuZW1pdChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtxdWVyeTIuc3RyZWFtQ2xvc2VMaXN0ZW5lcn1gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ucXVlcnkyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsbGFtYToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlOiB0b2tlbnMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYCR7dG9rZW5zLmpvaW4oKX1gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGVuZE9mU3RyZWFtKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlcXVlc3RMb2NrZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbm5Tb2NrZXQuZGlzY29ubmVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWFtLm9uKGBlcnJvcmAsIChlcnIpID0+IGNvbm5Tb2NrZXQuZW1pdChcImluZmVyZW5jZTplcnJvclwiLCBlcnIpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2lvXWAsIGB1c2VyIGNvbm5lY3RlZGAsIGA9PmAsIGBjcmVhdGVkIGEgc29ja2V0IGNvbm5lY3Rpb24uYClcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW9TZXJ2ZXI7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBpb1NlcnZlckNvbnRyb2xsZXI7Il19
import { __awaiter } from "tslib";
import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import http_server from "http";
import https_server from "http";
import promptCodex from "../jarvis/codex-x64.js";
import { Server } from "socket.io";
import { waitFor } from "../lib/utils.js";
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
        Object.defineProperty(this, "httpsServer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.httpServerController = this;
        const httpApp = express();
        this.httpServer = http_server.createServer(httpApp);
        this.httpsServer = https_server.createServer(this.httpServer);
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
                    server.listen(port + 8);
                });
            });
            this.httpServer.listen(port);
            this.httpsServer.listen(8080);
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
                        yield waitFor(10 * 1000).then(() => __awaiter(this, void 0, void 0, function* () {
                            if (!this.requestLocked) {
                                console.log(`[io]`, `open spot found, continue-ing inference.`);
                            }
                        }));
                    }
                    if (this.maxClients < this.countValidConnections()) {
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
                                var endOfStream = `\n\r\[process] END OF STREAM\n`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6InNyYy8iLCJzb3VyY2VzIjpbIm5ldHdvcmsvc2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDMUIsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBQzVCLE9BQU8sT0FBNkIsTUFBTSxTQUFTLENBQUM7QUFDcEQsT0FBTyxXQUFXLE1BQU0sTUFBTSxDQUFDO0FBQy9CLE9BQU8sWUFBWSxNQUFNLE1BQU0sQ0FBQztBQUNoQyxPQUFPLFdBQVcsTUFBTSx3QkFBd0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsTUFBTSxFQUEwQixNQUFNLFdBQVcsQ0FBQztBQUMzRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFHMUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBRWhCLE1BQU0sT0FBTyxvQkFBb0I7SUFLN0IsWUFBWSxJQUFZLEVBQUUsVUFBb0I7UUFKOUM7Ozs7bUJBQThDLElBQUk7V0FBQztRQUNuRDs7Ozs7V0FBK0I7UUFDL0I7Ozs7O1dBQWlCO1FBQ2pCOzs7OztXQUF1RztRQUVuRyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO1FBRWpDLE1BQU0sT0FBTyxHQUFHLE9BQU8sRUFBRSxDQUFDO1FBRTFCLElBQUksQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzlELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FDSjtBQUVELE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxvQkFBb0I7SUFXeEQsWUFBWSxJQUFZO1FBQ3BCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQVZmOzs7OztXQUFpQjtRQUNqQjs7OzttQkFBOEIsRUFBRTtXQUFD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QWtCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XHJcbmltcG9ydCBkb3RlbnYgZnJvbSBcImRvdGVudlwiO1xyXG5pbXBvcnQgZXhwcmVzcywgeyBFeHByZXNzLCBSZXF1ZXN0IH0gZnJvbSBcImV4cHJlc3NcIjtcclxuaW1wb3J0IGh0dHBfc2VydmVyIGZyb20gXCJodHRwXCI7XHJcbmltcG9ydCBodHRwc19zZXJ2ZXIgZnJvbSBcImh0dHBcIjtcclxuaW1wb3J0IHByb21wdENvZGV4IGZyb20gXCIuLi9qYXJ2aXMvY29kZXgteDY0LmpzXCI7XHJcbmltcG9ydCB7IFNlcnZlciwgU29ja2V0IGFzIFNlcnZlclNvY2tldCB9IGZyb20gXCJzb2NrZXQuaW9cIjtcclxuaW1wb3J0IHsgd2FpdEZvciB9IGZyb20gXCIuLi9saWIvdXRpbHMuanNcIjtcclxuaW1wb3J0IHsgSGFuZHNoYWtlLCBJbmZlcmVuY2UsIE1ldGFkYXRhIH0gZnJvbSBcIi4vc29ja2V0cy5qc1wiO1xyXG5cclxuZG90ZW52LmNvbmZpZygpO1xyXG5cclxuZXhwb3J0IGNsYXNzIGh0dHBTZXJ2ZXJDb250cm9sbGVyIHtcclxuICAgIGh0dHBTZXJ2ZXJDb250cm9sbGVyPzogaHR0cFNlcnZlckNvbnRyb2xsZXIgPSBudWxsO1xyXG4gICAgaHR0cFNlcnZlcjogaHR0cF9zZXJ2ZXIuU2VydmVyO1xyXG4gICAgaHR0cEFwcDogRXhwcmVzcztcclxuICAgIGh0dHBzU2VydmVyOiBodHRwX3NlcnZlci5TZXJ2ZXI8dHlwZW9mIGh0dHBfc2VydmVyLkluY29taW5nTWVzc2FnZSwgdHlwZW9mIGh0dHBfc2VydmVyLlNlcnZlclJlc3BvbnNlPjtcclxuICAgIGNvbnN0cnVjdG9yKHBvcnQ6IG51bWJlciwgaXNSZXF1aXJlZD86IGJvb2xlYW4sKSB7XHJcbiAgICAgICAgdGhpcy5odHRwU2VydmVyQ29udHJvbGxlciA9IHRoaXM7XHJcblxyXG4gICAgICAgIGNvbnN0IGh0dHBBcHAgPSBleHByZXNzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaHR0cFNlcnZlciA9IGh0dHBfc2VydmVyLmNyZWF0ZVNlcnZlcihodHRwQXBwKTtcclxuICAgICAgICB0aGlzLmh0dHBzU2VydmVyID0gaHR0cHNfc2VydmVyLmNyZWF0ZVNlcnZlcih0aGlzLmh0dHBTZXJ2ZXIpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgaW9TZXJ2ZXJDb250cm9sbGVyIGV4dGVuZHMgaHR0cFNlcnZlckNvbnRyb2xsZXIge1xyXG5cclxuICAgIGlvU2VydmVyOiBTZXJ2ZXI7XHJcbiAgICBpb1Bvb2w6IEFycmF5PFNlcnZlclNvY2tldD4gPSBbXTtcclxuICAgIGNhbGxiYWNrTGlzdGVuZXJzOiBDYWxsYWJsZUZ1bmN0aW9uO1xyXG4gICAgaHNJZGVudGlmaWVyOiBzdHJpbmc7XHJcblxyXG4gICAgbWF4Q2xpZW50czogbnVtYmVyID0gNDtcclxuICAgIGxvY2tJbmZlcmVuY2U6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHJlcXVlc3RMb2NrZWQ6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwb3J0OiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcihwb3J0KVxyXG5cclxuICAgICAgICB2YXIgaXNFbmRwb2ludDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh0aGlzLmh0dHBTZXJ2ZXJDb250cm9sbGVyICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGlzRW5kcG9pbnQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKGF4aW9zKFwiaHR0cHM6Ly9tb25nb2RiLXJlc3QudmVyY2VsLmFwcC9hcGkvYXV0aC9zaWduaW4vcHVibGljL2tleVwiKS50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmRhdGEuYmVhcmVyKS5jYXRjaChlID0+IGNvbnNvbGUuZXJyb3IoZSkpKS50aGVuKHQgPT4gdGhpcy5oc0lkZW50aWZpZXIgPSB0KS5maW5hbGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpZGVudGlmaWVyJywgdGhpcy5oc0lkZW50aWZpZXIpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldHVwU2VydmVyKHBvcnQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHNlcnZlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXIub24oYGVycm9yYCwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW2lvXSBzZXJ2ZXIgZXhwZXJpZW5jZWQgYW4gZXJyb3IgPT4gJHtlcnJ9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZlci5saXN0ZW4ocG9ydCArIDgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmh0dHBTZXJ2ZXIubGlzdGVuKHBvcnQpO1xyXG4gICAgICAgICAgICB0aGlzLmh0dHBzU2VydmVyLmxpc3Rlbig4MDgwKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNvdW50VmFsaWRDb25uZWN0aW9ucyA9ICgpID0+IHtcclxuICAgICAgICAvLyBjaGVja3MgaWYgdGhlIHJldHVybmVkIHZhbHVlcyBmcm9tIGFjdHVhbGZpbHRlciBhcmUgdHJ1ZSBvciBub3QsIHRoZW4gcmV0dXJucyBvbmx5IHRoZSBvbmUgdGhhdCBhcmUgdmFsaWRhdGVkXHJcbiAgICAgICAgY29uc3QgdmFsaWRDb25uZWN0aW9ucyA9IHRoaXMuaW9Qb29sLmZpbHRlcigodjogYW55LCBrOiBudW1iZXIpID0+IHYuY29ubmVjdGVkID8gdHJ1ZSA6IGZhbHNlKTtcclxuICAgICAgICByZXR1cm4gdmFsaWRDb25uZWN0aW9ucy5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBzZXR1cFNlcnZlcihwb3J0KSB7XHJcblxyXG5cclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coYFtpb11gLCBgc3RhcnRpbmdgLCBgbmV3IFNvY2tldC5JT2ApO1xyXG4gICAgICAgIHRoaXMuaW9TZXJ2ZXIgPSBuZXcgU2VydmVyKHRoaXMuaHR0cFNlcnZlciA/IHRoaXMuaHR0cFNlcnZlciA6IHBvcnQsIHtcclxuICAgICAgICAgICAgXCJjb3JzXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiYWxsb3dlZEhlYWRlcnNcIjogXCIqXCIsXHJcbiAgICAgICAgICAgICAgICBcIm9yaWdpblwiOiBcIipcIixcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbaW9dYCwgYGxpc3RlbmluZyBvbmAsIGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH1gKTtcclxuXHJcbiAgICAgICAgdGhpcy5pb1NlcnZlci5vbihgY29ubmVjdGlvbmAsIChjb25uU29ja2V0OiBTZXJ2ZXJTb2NrZXQpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtpb11gLCBcInNldHRpbmcgdXAgbmV3IGNsaWVudCBjb25uZWN0aW9uXCIpXHJcbiAgICAgICAgICAgIGxldCBpbmRleDogbnVtYmVyO1xyXG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuaW9Qb29sLnB1c2goY29ublNvY2tldCk7XHJcblxyXG4gICAgICAgICAgICBjb25uU29ja2V0LnJlcXVlc3QuaGVhZGVycyA9IHtcclxuICAgICAgICAgICAgICAgIFwiYWNjZXB0XCI6IFwiKlwiLFxyXG4gICAgICAgICAgICAgICAgXCJhY2Nlc3MtY29udHJvbC1hbGxvdy1vcmlnaW5cIjogXCIqXCIsXHJcbiAgICAgICAgICAgICAgICBcImFjY2Vzcy1jb250cm9sLWFsbG93LWhlYWRlcnNcIjogXCIqXCIsXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbm5Tb2NrZXQub24oJ3JlcXVlc3RIYW5kc2hha2UnLCAocXVlcnk6IFBhcnRpYWw8TWV0YWRhdGE+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2lvXWAsIFwicmVxdWVzdEhhbmRzaGFrZSByZWNpZXZlZFwiKVxyXG4gICAgICAgICAgICAgICAgaWYgKHF1ZXJ5ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocXVlcnkuaXNIYW5kc2hha2UgJiYgcXVlcnkuaGFuZHNoYWtlLmlkZW50aWZpZXIgPT0gdGhpcy5oc0lkZW50aWZpZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29ublNvY2tldC5lbWl0KGBoYW5kc2hha2VSZXNwb25zZWAsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRzaGFrZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXI6IHRoaXMuaHNJZGVudGlmaWVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpZDogaW5kZXgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb2NrZXQ6IHRoaXMuaW9Qb29sLmF0KGluZGV4KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0hhbmRzaGFrZTogcXVlcnkuaXNIYW5kc2hha2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIllvdSBhcmUgc2VjdXJlIG5vd1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2lvXSBZb3VyIGhhbmRzaGFrZSB3YXMgdmFsaWRhdGVkYClcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29ublNvY2tldC5qb2luKFwic2VjdXJlXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbm5Tb2NrZXQuZW1pdChgaGFuZHNoYWtlRXJyb3JgLCBcIkhhbmRzaGFrZSB3YXMgaW52YWxpZGF0ZWQgYnkgdGhlIHNlcnZlci4gcGxlYXNlIGRpc2Nvbm5lY3RcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29ublNvY2tldC5qb2luKFwiaW5zZWN1cmVcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW2lvXWAsIGBIYW5kc2hha2Ugd2FzIGludmFsaWRhdGVkIGJ5IHRoZSBzZXJ2ZXIuIHBsZWFzZSBkaXNjb25uZWN0YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIGNsZWFyIGFsbCBpbnNlY3VyZSBzb2NrZXRzIGZyb20gdGltZSB0byB0aW1lXHJcbiAgICAgICAgICAgIHRoaXMuaW9TZXJ2ZXIuaW4oXCJpbnNlY3VyZVwiKS5mZXRjaFNvY2tldHMoKS50aGVuKHYgPT4gdi5mb3JFYWNoKHYgPT4gdi5kaXNjb25uZWN0KCkpKTtcclxuXHJcbiAgICAgICAgICAgIGNvbm5Tb2NrZXQub24oXCJjbG9zZVwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2lvXWAsIGB1c2VyIGRpc2Nvbm5lY3RlZCxgLCBjb25uU29ja2V0LmRpc2Nvbm5lY3RlZClcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIGNvbm5Tb2NrZXQub24oXCJlcnJvclwiLCAoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgY29ublNvY2tldC5vbihcImluZmVyZW5jZTpyZXF1ZXN0XCIsIGFzeW5jIChxdWVyeTogUGFydGlhbDxJbmZlcmVuY2U+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2lvXWAsIGAke3F1ZXJ5WydtZXNzYWdlJ119YCwgcXVlcnkpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGxvY2sgb3RoZXIgcmVxdWVzdHMsIGtlZXAgbG9vcGluZyB0aWxsIG9uZSBjYW4gZXhlY3V0ZSBhZ2FpblxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMucmVxdWVzdExvY2tlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHdhaXRGb3IoMTAgKiAxMDAwKS50aGVuKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhgW2lvXWAsIGAke3RoaXMuaW9Qb29sW2luZGV4LTFdPy5pZH0gPT4gd2FpdGluZyBmb3IgaW5mZXJlbmNlLCBjdXJyZW50bHkgYSBwcm9jZXNzIGlzIHJ1bm5pbmdgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnJlcXVlc3RMb2NrZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbaW9dYCwgYG9wZW4gc3BvdCBmb3VuZCwgY29udGludWUtaW5nIGluZmVyZW5jZS5gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIGZpeGVkIG11bHRpIHNvY2tldCBjb21tdW5pY2F0aW9uc1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWF4Q2xpZW50cyA8IHRoaXMuY291bnRWYWxpZENvbm5lY3Rpb25zKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBsb2NrIGl0IHVwXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TG9ja2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmZlcmVuY2VkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnF1ZXJ5LFxyXG4gICAgICAgICAgICAgICAgICAgIC4uLntcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwib3BlbmluZyBzdHJlYW0gd2l0aCB0b2tlbnMgZnJvbSBsbGFtYS5jcHBcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBjb25uU29ja2V0LmVtaXQoYCR7cXVlcnkuc3RyZWFtT3Blbkxpc3RlbmVyfWAsIGluZmVyZW5jZWRhdGEpO1xyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgY29ublNvY2tldC5vbihcImluZmVyZW5jZTpwcm9tcHRcIiwgKHF1ZXJ5MjogUGFydGlhbDxJbmZlcmVuY2U+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBydW4gdGhlIHdob2xlIGxsYW1hIHByb21wdC4gYW5kIHN0cmVhbSBzdGRvdXQgYmFjayB0byBzdHJlYW1MaXN0ZW5lclxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtpb11gLCBgJHtxdWVyeTJbJ21lc3NhZ2UnXX1gLCBxdWVyeTIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHByb21wdE9wdHMgPSBxdWVyeTIubGxhbWE7XHJcbiAgICAgICAgICAgICAgICBpZiAocHJvbXB0T3B0cy5wcm9tcHQgPT09IFwiamFydmlzLWRlbW9cIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgdG9rZW5zOiBBcnJheTxzdHJpbmc+ID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0Q29kZXgoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGAke3Byb21wdE9wdHMuaW5zdHJ1Y3Rpb25zfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgKS50aGVuKChzdHJlYW0pID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVhbS5vbignZGF0YScsICh0b2tlbjogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbiA9IGAke3Rva2VufWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRva2VuLmluY2x1ZGVzKFwiUkVTUE9OU0VcIikgJiYgIXRva2VuLmluY2x1ZGVzKFwiQ09OVEVYVFwiKSAmJiAhdG9rZW4uaW5jbHVkZXMoXCJJTlNUUlVDVFwiKSAmJiAhdG9rZW4uaW5jbHVkZXMoXCJFWEFNUExFXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbm5Tb2NrZXQuZW1pdChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7cXVlcnkyLnN0cmVhbUxpc3RlbmVyfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnF1ZXJ5MixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsbGFtYToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZTogdG9rZW5zLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYCR7dG9rZW59YCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcHJvY2Vzcy5zdGRvdXQud3JpdGUodG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVhbS5vbihgZW5kYCwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVuZE9mU3RyZWFtID0gYFxcblxcclxcW3Byb2Nlc3NdIEVORCBPRiBTVFJFQU1cXG5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29ublNvY2tldC5lbWl0KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke3F1ZXJ5Mi5zdHJlYW1DbG9zZUxpc3RlbmVyfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5xdWVyeTIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxsYW1hOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2U6IHRva2VucyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ue1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgJHt0b2tlbnMuam9pbigpfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoZW5kT2ZTdHJlYW0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVxdWVzdExvY2tlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29ublNvY2tldC5kaXNjb25uZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJlYW0ub24oYGVycm9yYCwgKGVycikgPT4gY29ublNvY2tldC5lbWl0KFwiaW5mZXJlbmNlOmVycm9yXCIsIGVycikpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbaW9dYCwgYHVzZXIgY29ubmVjdGVkYCwgYD0+YCwgYGNyZWF0ZWQgYSBzb2NrZXQgY29ubmVjdGlvbi5gKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5pb1NlcnZlcjtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGlvU2VydmVyQ29udHJvbGxlcjsiXX0=
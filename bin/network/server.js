import { __awaiter } from "tslib";
import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import http_server from "http";
import promptCodex from "../jarvis/codex.js";
import { Server } from "socket.io";
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
                console.log(`[io]`, "new connection");
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
                connSocket.on("inference:request", (query) => {
                    console.log(`[io]`, `${query['message']}`, query);
                    const inferencedata = Object.assign(Object.assign({}, query), {
                        metadata: {
                            message: "opening stream with tokens from llama.cpp",
                        }
                    });
                    connSocket.emit(`${query.streamOpenListener}`, inferencedata);
                });
                connSocket.on("inference:prompt", (query2) => {
                    console.log(`[io]`, `${query2['message']}`, query2);
                    const promptOpts = query2.llama;
                    let tokens = [];
                    promptOpts.prompt === "jarvis-demo" ? promptCodex(`${promptOpts.instructions}`, (chunk) => connSocket.emit(`${query2.streamListener}`, Object.assign(Object.assign(Object.assign({}, query2), {
                        llama: {
                            response: tokens.push(chunk) && tokens,
                        }
                    }), {
                        metadata: {
                            message: `'${chunk}'`,
                        }
                    }))).then(() => connSocket.emit(`${query2.streamCloseListener}`, Object.assign(Object.assign(Object.assign({}, query2), {
                        llama: {
                            response: tokens,
                        }
                    }), {
                        metadata: {
                            message: "end of stream",
                        }
                    }))) : null;
                });
                console.log(`[io]`, `user connected`, `=>`, `created a socket connection.`);
            });
            return this.ioServer;
        });
    }
}
export default ioServerController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6Ii4vc3JjLyIsInNvdXJjZXMiOlsibmV0d29yay9zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMxQixPQUFPLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDNUIsT0FBTyxPQUE2QixNQUFNLFNBQVMsQ0FBQztBQUNwRCxPQUFPLFdBQVcsTUFBTSxNQUFNLENBQUM7QUFDL0IsT0FBTyxXQUFXLE1BQU0sb0JBQW9CLENBQUM7QUFDN0MsT0FBTyxFQUFFLE1BQU0sRUFBMEIsTUFBTSxXQUFXLENBQUM7QUFHM0QsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBRWhCLE1BQU0sT0FBTyxvQkFBb0I7SUFJN0IsWUFBWSxJQUFZLEVBQUUsVUFBb0I7UUFIOUM7Ozs7bUJBQThDLElBQUk7V0FBQztRQUNuRDs7Ozs7V0FBK0I7UUFDL0I7Ozs7O1dBQWlCO1FBRWIsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztRQUVqQyxNQUFNLE9BQU8sR0FBRyxPQUFPLEVBQUUsQ0FBQztRQUUxQixJQUFJLENBQUMsVUFBVSxHQUFHLFdBQVcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKO0FBRUQsTUFBTSxPQUFPLGtCQUFtQixTQUFRLG9CQUFvQjtJQU14RCxZQUFZLElBQVk7UUFDcEIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBTGY7Ozs7O1dBQWlCO1FBQ2pCOzs7O21CQUE4QixFQUFFO1dBQUM7UUFDakM7Ozs7O1dBQW9DO1FBQ3BDOzs7OztXQUFxQjtRQUlqQixJQUFJLFVBQVUsR0FBWSxLQUFLLENBQUM7UUFDaEMsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEtBQUssSUFBSSxFQUFFO1lBQ3BDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFFbEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxL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USxFQUFFLE1BQU07eUJBQ25CO3FCQUNKLEdBQ0U7d0JBQ0MsUUFBUSxFQUFFOzRCQUNOLE9BQU8sRUFBRSxlQUFlO3lCQUMzQjtxQkFDSixFQUNILENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNmLENBQUMsQ0FBQyxDQUFBO2dCQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSw4QkFBOEIsQ0FBQyxDQUFBO1lBQy9FLENBQUMsQ0FBQyxDQUFBO1lBQ0YsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3pCLENBQUM7S0FBQTtDQUVKO0FBRUQsZUFBZSxrQkFBa0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcclxuaW1wb3J0IGRvdGVudiBmcm9tIFwiZG90ZW52XCI7XHJcbmltcG9ydCBleHByZXNzLCB7IEV4cHJlc3MsIFJlcXVlc3QgfSBmcm9tIFwiZXhwcmVzc1wiO1xyXG5pbXBvcnQgaHR0cF9zZXJ2ZXIgZnJvbSBcImh0dHBcIjtcclxuaW1wb3J0IHByb21wdENvZGV4IGZyb20gXCIuLi9qYXJ2aXMvY29kZXguanNcIjtcclxuaW1wb3J0IHsgU2VydmVyLCBTb2NrZXQgYXMgU2VydmVyU29ja2V0IH0gZnJvbSBcInNvY2tldC5pb1wiO1xyXG5pbXBvcnQgeyBIYW5kc2hha2UsIEluZmVyZW5jZSwgTWV0YWRhdGEgfSBmcm9tIFwiLi9zb2NrZXRzLmpzXCI7XHJcblxyXG5kb3RlbnYuY29uZmlnKCk7XHJcblxyXG5leHBvcnQgY2xhc3MgaHR0cFNlcnZlckNvbnRyb2xsZXIge1xyXG4gICAgaHR0cFNlcnZlckNvbnRyb2xsZXI/OiBodHRwU2VydmVyQ29udHJvbGxlciA9IG51bGw7XHJcbiAgICBodHRwU2VydmVyOiBodHRwX3NlcnZlci5TZXJ2ZXI7XHJcbiAgICBodHRwQXBwOiBFeHByZXNzO1xyXG4gICAgY29uc3RydWN0b3IocG9ydDogbnVtYmVyLCBpc1JlcXVpcmVkPzogYm9vbGVhbiwpIHtcclxuICAgICAgICB0aGlzLmh0dHBTZXJ2ZXJDb250cm9sbGVyID0gdGhpcztcclxuXHJcbiAgICAgICAgY29uc3QgaHR0cEFwcCA9IGV4cHJlc3MoKTtcclxuXHJcbiAgICAgICAgdGhpcy5odHRwU2VydmVyID0gaHR0cF9zZXJ2ZXIuY3JlYXRlU2VydmVyKGh0dHBBcHApO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgaW9TZXJ2ZXJDb250cm9sbGVyIGV4dGVuZHMgaHR0cFNlcnZlckNvbnRyb2xsZXIge1xyXG5cclxuICAgIGlvU2VydmVyOiBTZXJ2ZXI7XHJcbiAgICBpb1Bvb2w6IEFycmF5PFNlcnZlclNvY2tldD4gPSBbXTtcclxuICAgIGNhbGxiYWNrTGlzdGVuZXJzOiBDYWxsYWJsZUZ1bmN0aW9uO1xyXG4gICAgaHNJZGVudGlmaWVyOiBzdHJpbmc7XHJcbiAgICBjb25zdHJ1Y3Rvcihwb3J0OiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcihwb3J0KVxyXG5cclxuICAgICAgICB2YXIgaXNFbmRwb2ludDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh0aGlzLmh0dHBTZXJ2ZXJDb250cm9sbGVyICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGlzRW5kcG9pbnQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKGF4aW9zKFwiaHR0cHM6Ly9tb25nb2RiLXJlc3QudmVyY2VsLmFwcC9hcGkvYXV0aC9zaWduaW4vcHVibGljL2tleVwiKS50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmRhdGEuYmVhcmVyKS5jYXRjaChlID0+IGNvbnNvbGUuZXJyb3IoZSkpKS50aGVuKHQgPT4gdGhpcy5oc0lkZW50aWZpZXIgPSB0KS5maW5hbGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpZGVudGlmaWVyJywgdGhpcy5oc0lkZW50aWZpZXIpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldHVwU2VydmVyKHBvcnQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHNlcnZlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXIub24oYGVycm9yYCwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW2lvXSBzZXJ2ZXIgZXhwZXJpZW5jZWQgYW4gZXJyb3IgPT4gJHtlcnJ9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZlci5saXN0ZW4ocG9ydCArIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmh0dHBTZXJ2ZXIubGlzdGVuKHBvcnQpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgc2V0dXBTZXJ2ZXIocG9ydCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbaW9dYCwgYHN0YXJ0aW5nYCwgYG5ldyBTb2NrZXQuSU9gKTtcclxuICAgICAgICB0aGlzLmlvU2VydmVyID0gbmV3IFNlcnZlcih0aGlzLmh0dHBTZXJ2ZXIgPyB0aGlzLmh0dHBTZXJ2ZXIgOiBwb3J0LCB7XHJcbiAgICAgICAgICAgIFwiY29yc1wiOiB7XHJcbiAgICAgICAgICAgICAgICBcImFsbG93ZWRIZWFkZXJzXCI6IFwiKlwiLFxyXG4gICAgICAgICAgICAgICAgXCJvcmlnaW5cIjogXCIqXCIsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW2lvXWAsIGBsaXN0ZW5pbmcgb25gLCBgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9YCk7XHJcblxyXG4gICAgICAgIHRoaXMuaW9TZXJ2ZXIub24oYGNvbm5lY3Rpb25gLCAoY29ublNvY2tldDogU2VydmVyU29ja2V0KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbaW9dYCwgXCJuZXcgY29ubmVjdGlvblwiKVxyXG4gICAgICAgICAgICBsZXQgaW5kZXg6IG51bWJlcjtcclxuICAgICAgICAgICAgaW5kZXggPSB0aGlzLmlvUG9vbC5wdXNoKGNvbm5Tb2NrZXQpO1xyXG5cclxuICAgICAgICAgICAgY29ublNvY2tldC5yZXF1ZXN0LmhlYWRlcnMgPSB7XHJcbiAgICAgICAgICAgICAgICBcImFjY2VwdFwiOiBcIipcIixcclxuICAgICAgICAgICAgICAgIFwiYWNjZXNzLWNvbnRyb2wtYWxsb3ctb3JpZ2luXCI6IFwiKlwiLFxyXG4gICAgICAgICAgICAgICAgXCJhY2Nlc3MtY29udHJvbC1hbGxvdy1oZWFkZXJzXCI6IFwiKlwiLFxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25uU29ja2V0Lm9uKCdyZXF1ZXN0SGFuZHNoYWtlJywgKHF1ZXJ5OiBQYXJ0aWFsPE1ldGFkYXRhPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtpb11gLCBcInJlcXVlc3RIYW5kc2hha2UgcmVjaWV2ZWRcIilcclxuICAgICAgICAgICAgICAgIGlmIChxdWVyeSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXJ5LmlzSGFuZHNoYWtlICYmIHF1ZXJ5LmhhbmRzaGFrZS5pZGVudGlmaWVyID09IHRoaXMuaHNJZGVudGlmaWVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbm5Tb2NrZXQuZW1pdChgaGFuZHNoYWtlUmVzcG9uc2VgLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kc2hha2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZGVudGlmaWVyOiB0aGlzLmhzSWRlbnRpZmllcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWQ6IGluZGV4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc29ja2V0OiB0aGlzLmlvUG9vbC5hdChpbmRleCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNIYW5kc2hha2U6IHF1ZXJ5LmlzSGFuZHNoYWtlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJZb3UgYXJlIHNlY3VyZSBub3dcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtpb10gWW91ciBoYW5kc2hha2Ugd2FzIHZhbGlkYXRlZGApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbm5Tb2NrZXQuam9pbihcInNlY3VyZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25uU29ja2V0LmVtaXQoYGhhbmRzaGFrZUVycm9yYCwgXCJIYW5kc2hha2Ugd2FzIGludmFsaWRhdGVkIGJ5IHRoZSBzZXJ2ZXIuIHBsZWFzZSBkaXNjb25uZWN0XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbm5Tb2NrZXQuam9pbihcImluc2VjdXJlXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtpb11gLCBgSGFuZHNoYWtlIHdhcyBpbnZhbGlkYXRlZCBieSB0aGUgc2VydmVyLiBwbGVhc2UgZGlzY29ubmVjdGApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBjbGVhciBhbGwgaW5zZWN1cmUgc29ja2V0cyBmcm9tIHRpbWUgdG8gdGltZVxyXG4gICAgICAgICAgICB0aGlzLmlvU2VydmVyLmluKFwiaW5zZWN1cmVcIikuZmV0Y2hTb2NrZXRzKCkudGhlbih2ID0+IHYuZm9yRWFjaCh2ID0+IHYuZGlzY29ubmVjdCgpKSk7XHJcblxyXG4gICAgICAgICAgICBjb25uU29ja2V0Lm9uKFwiY2xvc2VcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtpb11gLCBgdXNlciBkaXNjb25uZWN0ZWQsYCwgYGJ5ZSFgLCBjb25uU29ja2V0LmRpc2Nvbm5lY3RlZClcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIGNvbm5Tb2NrZXQub24oXCJlcnJvclwiLCAoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgY29ublNvY2tldC5vbihcImluZmVyZW5jZTpyZXF1ZXN0XCIsIChxdWVyeTogUGFydGlhbDxJbmZlcmVuY2U+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2lvXWAsIGAke3F1ZXJ5WydtZXNzYWdlJ119YCwgcXVlcnkpXHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmZlcmVuY2VkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnF1ZXJ5LFxyXG4gICAgICAgICAgICAgICAgICAgIC4uLntcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIm9wZW5pbmcgc3RyZWFtIHdpdGggdG9rZW5zIGZyb20gbGxhbWEuY3BwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgY29ublNvY2tldC5lbWl0KGAke3F1ZXJ5LnN0cmVhbU9wZW5MaXN0ZW5lcn1gLCBpbmZlcmVuY2VkYXRhKTtcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIGNvbm5Tb2NrZXQub24oXCJpbmZlcmVuY2U6cHJvbXB0XCIsIChxdWVyeTI6IFBhcnRpYWw8SW5mZXJlbmNlPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gcnVuIHRoZSB3aG9sZSBsbGFtYSBwcm9tcHQuIGFuZCBzdHJlYW0gc3Rkb3V0IGJhY2sgdG8gc3RyZWFtTGlzdGVuZXJcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbaW9dYCwgYCR7cXVlcnkyWydtZXNzYWdlJ119YCwgcXVlcnkyKVxyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJvbXB0T3B0cyA9IHF1ZXJ5Mi5sbGFtYTtcclxuICAgICAgICAgICAgICAgIGxldCB0b2tlbnM6IEFycmF5PHN0cmluZz4gPSBbXTtcclxuICAgICAgICAgICAgICAgIHByb21wdE9wdHMucHJvbXB0ID09PSBcImphcnZpcy1kZW1vXCIgPyBwcm9tcHRDb2RleChgJHtwcm9tcHRPcHRzLmluc3RydWN0aW9uc31gLCAoY2h1bmspID0+IGNvbm5Tb2NrZXQuZW1pdChgJHtxdWVyeTIuc3RyZWFtTGlzdGVuZXJ9YCwge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnF1ZXJ5MixcclxuICAgICAgICAgICAgICAgICAgICAuLi57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxsYW1hOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZTogdG9rZW5zLnB1c2goY2h1bmsgYXMgc3RyaW5nKSAmJiB0b2tlbnMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIC4uLntcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGAnJHtjaHVua30nYCxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KSkudGhlbigoKSA9PiBjb25uU29ja2V0LmVtaXQoYCR7cXVlcnkyLnN0cmVhbUNsb3NlTGlzdGVuZXJ9YCwge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnF1ZXJ5MixcclxuICAgICAgICAgICAgICAgICAgICAuLi57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxsYW1hOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZTogdG9rZW5zLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAuLi57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcImVuZCBvZiBzdHJlYW1cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pKSA6IG51bGw7XHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW2lvXWAsIGB1c2VyIGNvbm5lY3RlZGAsIGA9PmAsIGBjcmVhdGVkIGEgc29ja2V0IGNvbm5lY3Rpb24uYClcclxuICAgICAgICB9KVxyXG4gICAgICAgIHJldHVybiB0aGlzLmlvU2VydmVyO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgaW9TZXJ2ZXJDb250cm9sbGVyOyJdfQ==
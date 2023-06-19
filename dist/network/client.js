import { __awaiter } from "tslib";
import io_client from "socket.io-client";
export class ioClientController {
    constructor(serverAddress, identifier, callbackOnClose) {
        Object.defineProperty(this, "ioAdres", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ioClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ioId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ioValidated", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ioCloseCallback", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "hsResponseObject", {
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
        Object.defineProperty(this, "inferenceResults", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ""
        });
        Object.defineProperty(this, "requestHandshake", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (query) => new Promise((resolve, reject) => {
                var q = Object.assign({ isHandshake: true, message: "User wants to secure initial handshake" }, query);
                this.ioClient.emit('requestHandshake', q);
                console.log(`[client]`, `handshake requested`, q);
                this.ioClient.on(`handshakeResponse`, (response) => __awaiter(this, void 0, void 0, function* () {
                    resolve(response);
                }));
                this.ioClient.on(`handshakeError`, (err) => __awaiter(this, void 0, void 0, function* () {
                    console.error(err);
                    reject(err);
                }));
            })
        });
        this.ioAdres = serverAddress;
        this.ioCloseCallback = callbackOnClose;
        this.hsIdentifier = identifier || process.env["IDENTIFIER"];
        let isClient = false;
        if (serverAddress) {
            isClient = true;
            while (!Promise.resolve(this.setupClient())) {
                console.log(`[client]`, `resolving a connection`);
            }
        }
        return this;
    }
    setupClient() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`[client]`, `starting`, `new Client`);
                while (this.ioClient === undefined || this.ioClient === null) {
                    console.log(`[client]`, `spawning a Client instance connected with: `, this.ioAdres);
                    this.ioClient = io_client(`${this.ioAdres}`);
                }
                console.log(`[client]`, `connection with`, `${this.ioAdres}`);
                console.log(`[client]`, `sending handshake request`);
                this.requestHandshake({
                    handshake: {
                        identifier: this.hsIdentifier
                    },
                    isHandshake: true,
                }).then((response) => {
                    this.hsResponseObject = response.handshake;
                    this.ioValidated = this.hsResponseObject.success;
                    this.ioId = this.hsResponseObject.sid;
                    console.log(`[client]`, `successful handshake request`, response);
                }).catch(err => {
                    this.ioCloseCallback(err);
                    this.ioClient = undefined;
                    throw new Error(err);
                });
                this.ioClient.on("disconnect", (reason, describe) => {
                    this.ioClient = undefined;
                    this.ioCloseCallback(`${describe} => ${reason}`);
                });
                this.ioClient.on("close", () => {
                    this.ioClient = undefined;
                    this.ioCloseCallback("connection lost");
                });
                return true;
            }
            catch (error) {
                console.error(error);
                return false;
            }
        });
    }
    requestInference(query, props) {
        return new Promise((rs, rj) => __awaiter(this, void 0, void 0, function* () {
            const metadata = {
                sid: this.ioId,
            };
            const inferencedata = Object.assign(Object.assign({ metadata: metadata, streamListener: "inference:data", streamOpenListener: "inference:ready", streamCloseListener: "inference:end" }, query), {
                metadata: {
                    message: "Requesting to prompt llama.cpp on the nodejs server.",
                }
            });
            this.ioClient.emit(`inference:request`, inferencedata);
            this.ioClient.on("inference:ready", (query2) => {
                props === null || props === void 0 ? void 0 : props.onready("Jarvis is thinking...");
                console.log(`[client]`, `sending prompt to model.`);
                this.ioClient.emit("inference:prompt", Object.assign(Object.assign(Object.assign({}, inferencedata), query2), {
                    metadata: {
                        message: "Sending you the prompt information",
                    }
                }));
            });
            this.ioClient.on(`inference:data`, (query2) => {
                var token = query2.metadata.message;
                props === null || props === void 0 ? void 0 : props.ondata(token);
                this.inferenceResults = this.inferenceResults + token;
                console.log(`[client]`, this.inferenceResults);
            });
            this.ioClient.on(`inference:end`, query2 => {
                props === null || props === void 0 ? void 0 : props.onend(query2.llama.response);
                rs(query2.metadata.message);
                console.log(`[client]`, `ended session with server.`);
                this.ioClient = undefined;
            });
            this.ioClient.on(`inference:error`, (error) => { console.error(error); rj(error); });
        }));
    }
}
export default ioClientController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6InNyYy8iLCJzb3VyY2VzIjpbIm5ldHdvcmsvY2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLFNBQXFCLE1BQU0sa0JBQWtCLENBQUM7QUFHckQsTUFBTSxPQUFPLGtCQUFrQjtJQWMzQixZQUFZLGFBQXFCLEVBQUUsVUFBbUIsRUFBRSxlQUFrQztRQVoxRjs7Ozs7V0FBZ0I7UUFDaEI7Ozs7O1dBQWlCO1FBQ2pCOzs7OztXQUFhO1FBRWI7Ozs7O1dBQXFCO1FBQ3JCOzs7OztXQUFrQztRQUVsQzs7Ozs7V0FBcUM7UUFDckM7Ozs7O1dBQXFCO1FBRXJCOzs7O21CQUEyQixFQUFFO1dBQUM7UUFpSDlCOzs7O21CQUFtQixDQUFDLEtBQXlCLEVBQUUsRUFBRSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUM5RSxJQUFJLENBQUMsbUJBQ0QsV0FBVyxFQUFFLElBQUksRUFDakIsT0FBTyxFQUFFLHdDQUF3QyxJQUM5QyxLQUFLLENBQ1gsQ0FBQztnQkFDRixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDMUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLENBQUE7Z0JBQ2pELElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLENBQU8sUUFBYSxFQUFFLEVBQUU7b0JBQzFELE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdEIsQ0FBQyxDQUFBLENBQUMsQ0FBQTtnQkFDRixJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFPLEdBQUcsRUFBRSxFQUFFO29CQUM3QyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNuQixNQUFNLENBQUMsR0FBRyxDQUFD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by1jbGllbnRcIjtcclxuaW1wb3J0IHsgSGFuZHNoYWtlLCBJbmZlcmVuY2UsIE1ldGFkYXRhIH0gZnJvbSBcIi4vc29ja2V0cy5qc1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIGlvQ2xpZW50Q29udHJvbGxlciB7XHJcblxyXG4gICAgaW9BZHJlczogc3RyaW5nO1xyXG4gICAgaW9DbGllbnQ6IFNvY2tldDtcclxuICAgIGlvSWQ6IG51bWJlcjtcclxuXHJcbiAgICBpb1ZhbGlkYXRlZDogYm9vbGVhbjtcclxuICAgIGlvQ2xvc2VDYWxsYmFjazogQ2FsbGFibGVGdW5jdGlvbjtcclxuXHJcbiAgICBoc1Jlc3BvbnNlT2JqZWN0OiBQYXJ0aWFsPEhhbmRzaGFrZT47XHJcbiAgICBoc0lkZW50aWZpZXI6IHN0cmluZztcclxuXHJcbiAgICBpbmZlcmVuY2VSZXN1bHRzOiBzdHJpbmcgPSBcIlwiO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNlcnZlckFkZHJlc3M6IHN0cmluZywgaWRlbnRpZmllcj86IHN0cmluZywgY2FsbGJhY2tPbkNsb3NlPzogQ2FsbGFibGVGdW5jdGlvbikge1xyXG4gICAgICAgIHRoaXMuaW9BZHJlcyA9IHNlcnZlckFkZHJlc3M7XHJcbiAgICAgICAgdGhpcy5pb0Nsb3NlQ2FsbGJhY2sgPSBjYWxsYmFja09uQ2xvc2U7XHJcbiAgICAgICAgdGhpcy5oc0lkZW50aWZpZXIgPSBpZGVudGlmaWVyIHx8IHByb2Nlc3MuZW52W1wiSURFTlRJRklFUlwiXTtcclxuICAgICAgICBsZXQgaXNDbGllbnQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgICAgICBpZiAoc2VydmVyQWRkcmVzcykge1xyXG4gICAgICAgICAgICBpc0NsaWVudCA9IHRydWU7XHJcbiAgICAgICAgICAgIHdoaWxlICghUHJvbWlzZS5yZXNvbHZlKHRoaXMuc2V0dXBDbGllbnQoKSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbY2xpZW50XWAsIGByZXNvbHZpbmcgYSBjb25uZWN0aW9uYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBzZXR1cENsaWVudCgpIHtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtjbGllbnRdYCwgYHN0YXJ0aW5nYCwgYG5ldyBDbGllbnRgKTtcclxuICAgICAgICAgICAgd2hpbGUgKHRoaXMuaW9DbGllbnQgPT09IHVuZGVmaW5lZCB8fCB0aGlzLmlvQ2xpZW50ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2NsaWVudF1gLCBgc3Bhd25pbmcgYSBDbGllbnQgaW5zdGFuY2UgY29ubmVjdGVkIHdpdGg6IGAsIHRoaXMuaW9BZHJlcyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlvQ2xpZW50ID0gaW9fY2xpZW50KGAke3RoaXMuaW9BZHJlc31gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW2NsaWVudF1gLCBgY29ubmVjdGlvbiB3aXRoYCwgYCR7dGhpcy5pb0FkcmVzfWApO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtjbGllbnRdYCwgYHNlbmRpbmcgaGFuZHNoYWtlIHJlcXVlc3RgKVxyXG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RIYW5kc2hha2Uoe1xyXG4gICAgICAgICAgICAgICAgaGFuZHNoYWtlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllcjogdGhpcy5oc0lkZW50aWZpZXJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBpc0hhbmRzaGFrZTogdHJ1ZSxcclxuICAgICAgICAgICAgfSkudGhlbigocmVzcG9uc2U6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oc1Jlc3BvbnNlT2JqZWN0ID0gcmVzcG9uc2UuaGFuZHNoYWtlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pb1ZhbGlkYXRlZCA9IHRoaXMuaHNSZXNwb25zZU9iamVjdC5zdWNjZXNzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pb0lkID0gdGhpcy5oc1Jlc3BvbnNlT2JqZWN0LnNpZDtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbY2xpZW50XWAsIGBzdWNjZXNzZnVsIGhhbmRzaGFrZSByZXF1ZXN0YCwgcmVzcG9uc2UpXHJcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlvQ2xvc2VDYWxsYmFjayhlcnIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pb0NsaWVudCA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaW9DbGllbnQub24oXCJkaXNjb25uZWN0XCIsIChyZWFzb24sIGRlc2NyaWJlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlvQ2xpZW50ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pb0Nsb3NlQ2FsbGJhY2soYCR7ZGVzY3JpYmV9ID0+ICR7cmVhc29ufWApO1xyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgdGhpcy5pb0NsaWVudC5vbihcImNsb3NlXCIsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW9DbGllbnQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlvQ2xvc2VDYWxsYmFjayhcImNvbm5lY3Rpb24gbG9zdFwiKTtcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlcXVlc3RJbmZlcmVuY2UocXVlcnk/OiBQYXJ0aWFsPEluZmVyZW5jZT4sIHByb3BzPzoge1xyXG4gICAgICAgIG9ucmVhZHk6IENhbGxhYmxlRnVuY3Rpb24sXHJcbiAgICAgICAgb25kYXRhOiBDYWxsYWJsZUZ1bmN0aW9uLFxyXG4gICAgICAgIG9uZW5kOiBDYWxsYWJsZUZ1bmN0aW9uLFxyXG4gICAgfSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocnMsIHJqKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1ldGFkYXRhOiBQYXJ0aWFsPE1ldGFkYXRhPiA9IHtcclxuICAgICAgICAgICAgICAgIHNpZDogdGhpcy5pb0lkLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGluZmVyZW5jZWRhdGE6IFBhcnRpYWw8SW5mZXJlbmNlPiA9IHtcclxuICAgICAgICAgICAgICAgIG1ldGFkYXRhOiBtZXRhZGF0YSxcclxuICAgICAgICAgICAgICAgIHN0cmVhbUxpc3RlbmVyOiBcImluZmVyZW5jZTpkYXRhXCIsXHJcbiAgICAgICAgICAgICAgICBzdHJlYW1PcGVuTGlzdGVuZXI6IFwiaW5mZXJlbmNlOnJlYWR5XCIsXHJcbiAgICAgICAgICAgICAgICBzdHJlYW1DbG9zZUxpc3RlbmVyOiBcImluZmVyZW5jZTplbmRcIixcclxuICAgICAgICAgICAgICAgIC4uLnF1ZXJ5LFxyXG4gICAgICAgICAgICAgICAgLi4ue1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiUmVxdWVzdGluZyB0byBwcm9tcHQgbGxhbWEuY3BwIG9uIHRoZSBub2RlanMgc2VydmVyLlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmlvQ2xpZW50LmVtaXQoYGluZmVyZW5jZTpyZXF1ZXN0YCwgaW5mZXJlbmNlZGF0YSk7XHJcbiAgICAgICAgICAgIHRoaXMuaW9DbGllbnQub24oXCJpbmZlcmVuY2U6cmVhZHlcIiwgKHF1ZXJ5MjogUGFydGlhbDxJbmZlcmVuY2U+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBwcm9wcz8ub25yZWFkeShcIkphcnZpcyBpcyB0aGlua2luZy4uLlwiKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbY2xpZW50XWAsIGBzZW5kaW5nIHByb21wdCB0byBtb2RlbC5gKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW9DbGllbnQuZW1pdChcImluZmVyZW5jZTpwcm9tcHRcIiwge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLmluZmVyZW5jZWRhdGEsXHJcbiAgICAgICAgICAgICAgICAgICAgLi4ucXVlcnkyLFxyXG4gICAgICAgICAgICAgICAgICAgIC4uLntcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiU2VuZGluZyB5b3UgdGhlIHByb21wdCBpbmZvcm1hdGlvblwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLmlvQ2xpZW50Lm9uKGBpbmZlcmVuY2U6ZGF0YWAsIChxdWVyeTI6IFBhcnRpYWw8SW5mZXJlbmNlPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRva2VuOiBzdHJpbmcgPSBxdWVyeTIubWV0YWRhdGEubWVzc2FnZTtcclxuICAgICAgICAgICAgICAgIHByb3BzPy5vbmRhdGEodG9rZW4pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaW5mZXJlbmNlUmVzdWx0cyA9IHRoaXMuaW5mZXJlbmNlUmVzdWx0cyArIHRva2VuO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtjbGllbnRdYCwgdGhpcy5pbmZlcmVuY2VSZXN1bHRzKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgdGhpcy5pb0NsaWVudC5vbihgaW5mZXJlbmNlOmVuZGAsIHF1ZXJ5MiA9PiB7XHJcbiAgICAgICAgICAgICAgICBwcm9wcz8ub25lbmQocXVlcnkyLmxsYW1hLnJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgIHJzKHF1ZXJ5Mi5tZXRhZGF0YS5tZXNzYWdlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2NsaWVudF1gLCBgZW5kZWQgc2Vzc2lvbiB3aXRoIHNlcnZlci5gKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW9DbGllbnQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHRoaXMuaW9DbGllbnQub24oYGluZmVyZW5jZTplcnJvcmAsIChlcnJvcikgPT4geyBjb25zb2xlLmVycm9yKGVycm9yKTsgcmooZXJyb3IpIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcXVlc3RIYW5kc2hha2UgPSAocXVlcnk/OiBQYXJ0aWFsPE1ldGFkYXRhPikgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIHZhciBxID0ge1xyXG4gICAgICAgICAgICBpc0hhbmRzaGFrZTogdHJ1ZSxcclxuICAgICAgICAgICAgbWVzc2FnZTogXCJVc2VyIHdhbnRzIHRvIHNlY3VyZSBpbml0aWFsIGhhbmRzaGFrZVwiLFxyXG4gICAgICAgICAgICAuLi5xdWVyeVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5pb0NsaWVudC5lbWl0KCdyZXF1ZXN0SGFuZHNoYWtlJywgcSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtjbGllbnRdYCwgYGhhbmRzaGFrZSByZXF1ZXN0ZWRgLCBxKVxyXG4gICAgICAgIHRoaXMuaW9DbGllbnQub24oYGhhbmRzaGFrZVJlc3BvbnNlYCwgYXN5bmMgKHJlc3BvbnNlOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICB0aGlzLmlvQ2xpZW50Lm9uKGBoYW5kc2hha2VFcnJvcmAsIGFzeW5jIChlcnIpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xyXG4gICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICB9KVxyXG4gICAgfSlcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgaW9DbGllbnRDb250cm9sbGVyOyJdfQ==
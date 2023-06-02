import { __awaiter } from "tslib";
import io_client from "socket.io-client";
export class ioClientController {
    constructor(serverAddress, identifier) {
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
        this.hsIdentifier = identifier || process.env["IDENTIFIER"];
        var isClient = false;
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
            console.log(`[client]`, `starting`, `new Client`);
            while (this.ioClient === undefined || this.ioClient === null) {
                console.log(`[client]`, `resolving a connection to`, this.ioAdres);
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
            }).catch(err => err);
            this.ioClient.on("disconnect", () => {
                this.ioClient.disconnect();
            });
            this.ioClient.on("close", () => {
                this.ioClient.disconnect();
            });
            return true;
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
                this.ioClient.disconnect();
            });
            this.ioClient.on(`inference:error`, (error) => { console.error(error); rj(error); });
        }));
    }
}
export default ioClientController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6Ii4vc3JjLyIsInNvdXJjZXMiOlsibmV0d29yay9jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sU0FBcUIsTUFBTSxrQkFBa0IsQ0FBQztBQUdyRCxNQUFNLE9BQU8sa0JBQWtCO0lBYTNCLFlBQVksYUFBcUIsRUFBRSxVQUFtQjtRQVh0RDs7Ozs7V0FBZ0I7UUFDaEI7Ozs7O1dBQWlCO1FBQ2pCOzs7OztXQUFhO1FBRWI7Ozs7O1dBQXFCO1FBRXJCOzs7OztXQUFxQztRQUNyQzs7Ozs7V0FBcUI7UUFFckI7Ozs7bUJBQTJCLEVBQUU7V0FBQztRQW9HOUI7Ozs7bUJBQW1CLENBQUMsS0FBeUIsRUFBRSxFQUFFLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQzlFLElBQUksQ0FBQyxtQkFDRCxXQUFXLEVBQUUsSUFBSSxFQUNqQixPQUFPLEVBQUUsd0NBQXdDLElBQzlDLEtBQUssQ0FDWCxDQUFDO2dCQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxxQkFBcUIsRUFBRSxDQUFDLENBQUMsQ0FBQTtnQkFDakQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsQ0FBTyxRQUFhLEVBQUUsRUFBRTtvQkFDMUQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN0QixDQUFDLENBQUEsQ0FBQyxDQUFBO2dCQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLENBQU8sR0FBRyxFQUFFLEVBQUU7b0JBQzdDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ25CLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDaEIsQ0FBQyxDQUFBLENB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QyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNwQyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztnQkFDdEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUMvQixDQUFDLENBQUMsQ0FBQTtZQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGlCQUFpQixFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEYsQ0FBQyxDQUFBLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FrQko7QUFFRCxlQUFlLGtCQUFrQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGlvX2NsaWVudCwgeyBTb2NrZXQgfSBmcm9tIFwic29ja2V0LmlvLWNsaWVudFwiO1xyXG5pbXBvcnQgeyBIYW5kc2hha2UsIEluZmVyZW5jZSwgTWV0YWRhdGEgfSBmcm9tIFwiLi9zb2NrZXRzLmpzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgaW9DbGllbnRDb250cm9sbGVyIHtcclxuXHJcbiAgICBpb0FkcmVzOiBzdHJpbmc7XHJcbiAgICBpb0NsaWVudDogU29ja2V0O1xyXG4gICAgaW9JZDogbnVtYmVyO1xyXG5cclxuICAgIGlvVmFsaWRhdGVkOiBib29sZWFuO1xyXG5cclxuICAgIGhzUmVzcG9uc2VPYmplY3Q6IFBhcnRpYWw8SGFuZHNoYWtlPjtcclxuICAgIGhzSWRlbnRpZmllcjogc3RyaW5nO1xyXG5cclxuICAgIGluZmVyZW5jZVJlc3VsdHM6IHN0cmluZyA9IFwiXCI7XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc2VydmVyQWRkcmVzczogc3RyaW5nLCBpZGVudGlmaWVyPzogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5pb0FkcmVzID0gc2VydmVyQWRkcmVzcztcclxuICAgICAgICB0aGlzLmhzSWRlbnRpZmllciA9IGlkZW50aWZpZXIgfHwgcHJvY2Vzcy5lbnZbXCJJREVOVElGSUVSXCJdO1xyXG4gICAgICAgIHZhciBpc0NsaWVudDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIGlmIChzZXJ2ZXJBZGRyZXNzKSB7XHJcbiAgICAgICAgICAgIGlzQ2xpZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgd2hpbGUgKCFQcm9taXNlLnJlc29sdmUodGhpcy5zZXR1cENsaWVudCgpKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtjbGllbnRdYCwgYHJlc29sdmluZyBhIGNvbm5lY3Rpb25gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIHNldHVwQ2xpZW50KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbY2xpZW50XWAsIGBzdGFydGluZ2AsIGBuZXcgQ2xpZW50YCk7XHJcbiAgICAgICAgd2hpbGUgKHRoaXMuaW9DbGllbnQgPT09IHVuZGVmaW5lZCB8fCB0aGlzLmlvQ2xpZW50ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbY2xpZW50XWAsIGByZXNvbHZpbmcgYSBjb25uZWN0aW9uIHRvYCwgdGhpcy5pb0FkcmVzKTtcclxuICAgICAgICAgICAgdGhpcy5pb0NsaWVudCA9IGlvX2NsaWVudChgJHt0aGlzLmlvQWRyZXN9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbY2xpZW50XWAsIGBjb25uZWN0aW9uIHdpdGhgLCBgJHt0aGlzLmlvQWRyZXN9YCk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbY2xpZW50XWAsIGBzZW5kaW5nIGhhbmRzaGFrZSByZXF1ZXN0YClcclxuICAgICAgICB0aGlzLnJlcXVlc3RIYW5kc2hha2Uoe1xyXG4gICAgICAgICAgICBoYW5kc2hha2U6IHtcclxuICAgICAgICAgICAgICAgIGlkZW50aWZpZXI6IHRoaXMuaHNJZGVudGlmaWVyXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGlzSGFuZHNoYWtlOiB0cnVlLFxyXG4gICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oc1Jlc3BvbnNlT2JqZWN0ID0gcmVzcG9uc2UuaGFuZHNoYWtlO1xyXG4gICAgICAgICAgICB0aGlzLmlvVmFsaWRhdGVkID0gdGhpcy5oc1Jlc3BvbnNlT2JqZWN0LnN1Y2Nlc3M7XHJcbiAgICAgICAgICAgIHRoaXMuaW9JZCA9IHRoaXMuaHNSZXNwb25zZU9iamVjdC5zaWQ7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbY2xpZW50XWAsIGBzdWNjZXNzZnVsIGhhbmRzaGFrZSByZXF1ZXN0YCwgcmVzcG9uc2UpXHJcbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IGVycik7XHJcblxyXG4gICAgICAgIHRoaXMuaW9DbGllbnQub24oXCJkaXNjb25uZWN0XCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5pb0NsaWVudC5kaXNjb25uZWN0KCk7XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhpcy5pb0NsaWVudC5vbihcImNsb3NlXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5pb0NsaWVudC5kaXNjb25uZWN0KCk7XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlcXVlc3RJbmZlcmVuY2UocXVlcnk/OiBQYXJ0aWFsPEluZmVyZW5jZT4sIHByb3BzPzoge1xyXG4gICAgICAgIG9ucmVhZHk6IENhbGxhYmxlRnVuY3Rpb24sXHJcbiAgICAgICAgb25kYXRhOiBDYWxsYWJsZUZ1bmN0aW9uLFxyXG4gICAgICAgIG9uZW5kOiBDYWxsYWJsZUZ1bmN0aW9uLFxyXG4gICAgfSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocnMsIHJqKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1ldGFkYXRhOiBQYXJ0aWFsPE1ldGFkYXRhPiA9IHtcclxuICAgICAgICAgICAgICAgIHNpZDogdGhpcy5pb0lkLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGluZmVyZW5jZWRhdGE6IFBhcnRpYWw8SW5mZXJlbmNlPiA9IHtcclxuICAgICAgICAgICAgICAgIG1ldGFkYXRhOiBtZXRhZGF0YSxcclxuICAgICAgICAgICAgICAgIHN0cmVhbUxpc3RlbmVyOiBcImluZmVyZW5jZTpkYXRhXCIsXHJcbiAgICAgICAgICAgICAgICBzdHJlYW1PcGVuTGlzdGVuZXI6IFwiaW5mZXJlbmNlOnJlYWR5XCIsXHJcbiAgICAgICAgICAgICAgICBzdHJlYW1DbG9zZUxpc3RlbmVyOiBcImluZmVyZW5jZTplbmRcIixcclxuICAgICAgICAgICAgICAgIC4uLnF1ZXJ5LFxyXG4gICAgICAgICAgICAgICAgLi4ue1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiUmVxdWVzdGluZyB0byBwcm9tcHQgbGxhbWEuY3BwIG9uIHRoZSBub2RlanMgc2VydmVyLlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmlvQ2xpZW50LmVtaXQoYGluZmVyZW5jZTpyZXF1ZXN0YCwgaW5mZXJlbmNlZGF0YSk7XHJcbiAgICAgICAgICAgIHRoaXMuaW9DbGllbnQub24oXCJpbmZlcmVuY2U6cmVhZHlcIiwgKHF1ZXJ5MjogUGFydGlhbDxJbmZlcmVuY2U+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBwcm9wcz8ub25yZWFkeShcIkphcnZpcyBpcyB0aGlua2luZy4uLlwiKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbY2xpZW50XWAsIGBzZW5kaW5nIHByb21wdCB0byBtb2RlbC5gKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW9DbGllbnQuZW1pdChcImluZmVyZW5jZTpwcm9tcHRcIiwge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLmluZmVyZW5jZWRhdGEsXHJcbiAgICAgICAgICAgICAgICAgICAgLi4ucXVlcnkyLFxyXG4gICAgICAgICAgICAgICAgICAgIC4uLntcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiU2VuZGluZyB5b3UgdGhlIHByb21wdCBpbmZvcm1hdGlvblwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLmlvQ2xpZW50Lm9uKGBpbmZlcmVuY2U6ZGF0YWAsIChxdWVyeTI6IFBhcnRpYWw8SW5mZXJlbmNlPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRva2VuOiBzdHJpbmcgPSBxdWVyeTIubWV0YWRhdGEubWVzc2FnZTtcclxuICAgICAgICAgICAgICAgIHByb3BzPy5vbmRhdGEodG9rZW4pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaW5mZXJlbmNlUmVzdWx0cyA9IHRoaXMuaW5mZXJlbmNlUmVzdWx0cyArIHRva2VuO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtjbGllbnRdYCwgdGhpcy5pbmZlcmVuY2VSZXN1bHRzKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgdGhpcy5pb0NsaWVudC5vbihgaW5mZXJlbmNlOmVuZGAsIHF1ZXJ5MiA9PiB7XHJcbiAgICAgICAgICAgICAgICBwcm9wcz8ub25lbmQocXVlcnkyLmxsYW1hLnJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgIHJzKHF1ZXJ5Mi5tZXRhZGF0YS5tZXNzYWdlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2NsaWVudF1gLCBgZW5kZWQgc2Vzc2lvbiB3aXRoIHNlcnZlci5gKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW9DbGllbnQuZGlzY29ubmVjdCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB0aGlzLmlvQ2xpZW50Lm9uKGBpbmZlcmVuY2U6ZXJyb3JgLCAoZXJyb3IpID0+IHsgY29uc29sZS5lcnJvcihlcnJvcik7IHJqKGVycm9yKSB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXF1ZXN0SGFuZHNoYWtlID0gKHF1ZXJ5PzogUGFydGlhbDxNZXRhZGF0YT4pID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICB2YXIgcSA9IHtcclxuICAgICAgICAgICAgaXNIYW5kc2hha2U6IHRydWUsXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6IFwiVXNlciB3YW50cyB0byBzZWN1cmUgaW5pdGlhbCBoYW5kc2hha2VcIixcclxuICAgICAgICAgICAgLi4ucXVlcnlcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuaW9DbGllbnQuZW1pdCgncmVxdWVzdEhhbmRzaGFrZScsIHEpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbY2xpZW50XWAsIGBoYW5kc2hha2UgcmVxdWVzdGVkYCwgcSlcclxuICAgICAgICB0aGlzLmlvQ2xpZW50Lm9uKGBoYW5kc2hha2VSZXNwb25zZWAsIGFzeW5jIChyZXNwb25zZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgdGhpcy5pb0NsaWVudC5vbihgaGFuZHNoYWtlRXJyb3JgLCBhc3luYyAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgfSlcclxuICAgIH0pXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGlvQ2xpZW50Q29udHJvbGxlcjsiXX0=
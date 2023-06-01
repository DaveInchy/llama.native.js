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
            value: void 0
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
                props === null || props === void 0 ? void 0 : props.onready("Sending");
                console.log(`[client]`, `sending prompt to model.`);
                this.ioClient.emit("inference:prompt", Object.assign(Object.assign(Object.assign({}, inferencedata), query2), {
                    metadata: {
                        message: "Sending you the prompt information",
                    }
                }));
            });
            this.ioClient.on(`inference:data`, (query2) => {
                var token = query2.metadata.message.replaceAll(`\'`, "");
                props === null || props === void 0 ? void 0 : props.ondata(token);
                console.log(`[client]`, `recieved dialog +`, token);
            });
            this.ioClient.on(`inference:end`, query2 => {
                props === null || props === void 0 ? void 0 : props.onend(query2.llama.response);
                rs(query2.llama.response);
            });
            this.ioClient.on(`inference:error`, (error) => { console.error(error); rj(error); });
        }));
    }
}
export default ioClientController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6Ii4vc3JjLyIsInNvdXJjZXMiOlsibmV0d29yay9jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sU0FBcUIsTUFBTSxrQkFBa0IsQ0FBQztBQUdyRCxNQUFNLE9BQU8sa0JBQWtCO0lBYTNCLFlBQVksYUFBcUIsRUFBRSxVQUFtQjtRQVh0RDs7Ozs7V0FBZ0I7UUFDaEI7Ozs7O1dBQWlCO1FBQ2pCOzs7OztXQUFhO1FBRWI7Ozs7O1dBQXFCO1FBRXJCOzs7OztXQUFxQztRQUNyQzs7Ozs7V0FBcUI7UUFFckI7Ozs7O1dBQXVDO1FBd0Z2Qzs7OzttQkFBbUIsQ0FBQyxLQUF5QixFQUFFLEVBQUUsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDOUUsSUFBSSxDQUFDLG1CQUNELFdBQVcsRUFBRSxJQUFJLEVBQ2pCLE9BQU8sRUFBRSx3Q0FBd0MsSUFDOUMsS0FBSyxDQUNYLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLHFCQUFxQixFQUFFLENBQUMsQ0FBQyxDQUFBO2dCQUNqRCxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFPLFFBQWEsRUFBRSxFQUFFO29CQUMxRCxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3RCLENBQUMsQ0FBQSxDQUFDLENBQUE7Z0JBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsQ0FBTyxHQUFHLEVBQUUsRUFBRTtvQkFDN0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDbkIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNoQixDQUFDLENBQUEsQ0FBQyxDQUFBO1lB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QUFDLENBQUEsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQWtCSjtBQUVELGVBQWUsa0JBQWtCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaW9fY2xpZW50LCB7IFNvY2tldCB9IGZyb20gXCJzb2NrZXQuaW8tY2xpZW50XCI7XHJcbmltcG9ydCB7IEhhbmRzaGFrZSwgSW5mZXJlbmNlLCBNZXRhZGF0YSB9IGZyb20gXCIuL3NvY2tldHMuanNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBpb0NsaWVudENvbnRyb2xsZXIge1xyXG5cclxuICAgIGlvQWRyZXM6IHN0cmluZztcclxuICAgIGlvQ2xpZW50OiBTb2NrZXQ7XHJcbiAgICBpb0lkOiBudW1iZXI7XHJcblxyXG4gICAgaW9WYWxpZGF0ZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgaHNSZXNwb25zZU9iamVjdDogUGFydGlhbDxIYW5kc2hha2U+O1xyXG4gICAgaHNJZGVudGlmaWVyOiBzdHJpbmc7XHJcblxyXG4gICAgaW5mZXJlbmNlUmVzdWx0czogQXJyYXk8QXJyYXk8c3RyaW5nPj47XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc2VydmVyQWRkcmVzczogc3RyaW5nLCBpZGVudGlmaWVyPzogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5pb0FkcmVzID0gc2VydmVyQWRkcmVzcztcclxuICAgICAgICB0aGlzLmhzSWRlbnRpZmllciA9IGlkZW50aWZpZXIgfHwgcHJvY2Vzcy5lbnZbXCJJREVOVElGSUVSXCJdO1xyXG4gICAgICAgIHZhciBpc0NsaWVudDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIGlmIChzZXJ2ZXJBZGRyZXNzKSB7XHJcbiAgICAgICAgICAgIGlzQ2xpZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgd2hpbGUgKCFQcm9taXNlLnJlc29sdmUodGhpcy5zZXR1cENsaWVudCgpKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtjbGllbnRdYCwgYHJlc29sdmluZyBhIGNvbm5lY3Rpb25gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIHNldHVwQ2xpZW50KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbY2xpZW50XWAsIGBzdGFydGluZ2AsIGBuZXcgQ2xpZW50YCk7XHJcbiAgICAgICAgd2hpbGUgKHRoaXMuaW9DbGllbnQgPT09IHVuZGVmaW5lZCB8fCB0aGlzLmlvQ2xpZW50ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbY2xpZW50XWAsIGByZXNvbHZpbmcgYSBjb25uZWN0aW9uIHRvYCwgdGhpcy5pb0FkcmVzKTtcclxuICAgICAgICAgICAgdGhpcy5pb0NsaWVudCA9IGlvX2NsaWVudChgJHt0aGlzLmlvQWRyZXN9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbY2xpZW50XWAsIGBjb25uZWN0aW9uIHdpdGhgLCBgJHt0aGlzLmlvQWRyZXN9YCk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbY2xpZW50XWAsIGBzZW5kaW5nIGhhbmRzaGFrZSByZXF1ZXN0YClcclxuICAgICAgICB0aGlzLnJlcXVlc3RIYW5kc2hha2Uoe1xyXG4gICAgICAgICAgICBoYW5kc2hha2U6IHtcclxuICAgICAgICAgICAgICAgIGlkZW50aWZpZXI6IHRoaXMuaHNJZGVudGlmaWVyXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGlzSGFuZHNoYWtlOiB0cnVlLFxyXG4gICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oc1Jlc3BvbnNlT2JqZWN0ID0gcmVzcG9uc2UuaGFuZHNoYWtlO1xyXG4gICAgICAgICAgICB0aGlzLmlvVmFsaWRhdGVkID0gdGhpcy5oc1Jlc3BvbnNlT2JqZWN0LnN1Y2Nlc3M7XHJcbiAgICAgICAgICAgIHRoaXMuaW9JZCA9IHRoaXMuaHNSZXNwb25zZU9iamVjdC5zaWQ7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbY2xpZW50XWAsIGBzdWNjZXNzZnVsIGhhbmRzaGFrZSByZXF1ZXN0YCwgcmVzcG9uc2UpXHJcbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IGVycik7XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZXF1ZXN0SW5mZXJlbmNlKHF1ZXJ5PzogUGFydGlhbDxJbmZlcmVuY2U+LCBwcm9wcz86IHtcclxuICAgICAgICBvbnJlYWR5OiBDYWxsYWJsZUZ1bmN0aW9uLFxyXG4gICAgICAgIG9uZGF0YTogQ2FsbGFibGVGdW5jdGlvbixcclxuICAgICAgICBvbmVuZDogQ2FsbGFibGVGdW5jdGlvbixcclxuICAgIH0pIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJzLCByaikgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBtZXRhZGF0YTogUGFydGlhbDxNZXRhZGF0YT4gPSB7XHJcbiAgICAgICAgICAgICAgICBzaWQ6IHRoaXMuaW9JZCxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBpbmZlcmVuY2VkYXRhOiBQYXJ0aWFsPEluZmVyZW5jZT4gPSB7XHJcbiAgICAgICAgICAgICAgICBtZXRhZGF0YTogbWV0YWRhdGEsXHJcbiAgICAgICAgICAgICAgICBzdHJlYW1MaXN0ZW5lcjogXCJpbmZlcmVuY2U6ZGF0YVwiLFxyXG4gICAgICAgICAgICAgICAgc3RyZWFtT3Blbkxpc3RlbmVyOiBcImluZmVyZW5jZTpyZWFkeVwiLFxyXG4gICAgICAgICAgICAgICAgc3RyZWFtQ2xvc2VMaXN0ZW5lcjogXCJpbmZlcmVuY2U6ZW5kXCIsXHJcbiAgICAgICAgICAgICAgICAuLi5xdWVyeSxcclxuICAgICAgICAgICAgICAgIC4uLntcclxuICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIlJlcXVlc3RpbmcgdG8gcHJvbXB0IGxsYW1hLmNwcCBvbiB0aGUgbm9kZWpzIHNlcnZlci5cIixcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5pb0NsaWVudC5lbWl0KGBpbmZlcmVuY2U6cmVxdWVzdGAsIGluZmVyZW5jZWRhdGEpO1xyXG4gICAgICAgICAgICB0aGlzLmlvQ2xpZW50Lm9uKFwiaW5mZXJlbmNlOnJlYWR5XCIsIChxdWVyeTI6IFBhcnRpYWw8SW5mZXJlbmNlPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgcHJvcHM/Lm9ucmVhZHkoXCJTZW5kaW5nXCIpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtjbGllbnRdYCwgYHNlbmRpbmcgcHJvbXB0IHRvIG1vZGVsLmApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pb0NsaWVudC5lbWl0KFwiaW5mZXJlbmNlOnByb21wdFwiLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uaW5mZXJlbmNlZGF0YSxcclxuICAgICAgICAgICAgICAgICAgICAuLi5xdWVyeTIsXHJcbiAgICAgICAgICAgICAgICAgICAgLi4ue1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJTZW5kaW5nIHlvdSB0aGUgcHJvbXB0IGluZm9ybWF0aW9uXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuaW9DbGllbnQub24oYGluZmVyZW5jZTpkYXRhYCwgKHF1ZXJ5MjogUGFydGlhbDxJbmZlcmVuY2U+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdG9rZW46IHN0cmluZyA9IHF1ZXJ5Mi5tZXRhZGF0YS5tZXNzYWdlLnJlcGxhY2VBbGwoYFxcJ2AsIFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgcHJvcHM/Lm9uZGF0YSh0b2tlbik7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2NsaWVudF1gLCBgcmVjaWV2ZWQgZGlhbG9nICtgLCB0b2tlbik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHRoaXMuaW9DbGllbnQub24oYGluZmVyZW5jZTplbmRgLCBxdWVyeTIgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gdGhpcy5pbmZlcmVuY2VSZXN1bHRzLnB1c2gocXVlcnkyLmxsYW1hLnJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgIHByb3BzPy5vbmVuZChxdWVyeTIubGxhbWEucmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgcnMocXVlcnkyLmxsYW1hLnJlc3BvbnNlKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgdGhpcy5pb0NsaWVudC5vbihgaW5mZXJlbmNlOmVycm9yYCwgKGVycm9yKSA9PiB7IGNvbnNvbGUuZXJyb3IoZXJyb3IpOyByaihlcnJvcikgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVxdWVzdEhhbmRzaGFrZSA9IChxdWVyeT86IFBhcnRpYWw8TWV0YWRhdGE+KSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgdmFyIHEgPSB7XHJcbiAgICAgICAgICAgIGlzSGFuZHNoYWtlOiB0cnVlLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiBcIlVzZXIgd2FudHMgdG8gc2VjdXJlIGluaXRpYWwgaGFuZHNoYWtlXCIsXHJcbiAgICAgICAgICAgIC4uLnF1ZXJ5XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmlvQ2xpZW50LmVtaXQoJ3JlcXVlc3RIYW5kc2hha2UnLCBxKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW2NsaWVudF1gLCBgaGFuZHNoYWtlIHJlcXVlc3RlZGAsIHEpXHJcbiAgICAgICAgdGhpcy5pb0NsaWVudC5vbihgaGFuZHNoYWtlUmVzcG9uc2VgLCBhc3luYyAocmVzcG9uc2U6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIHRoaXMuaW9DbGllbnQub24oYGhhbmRzaGFrZUVycm9yYCwgYXN5bmMgKGVycikgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XHJcbiAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9KVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBpb0NsaWVudENvbnRyb2xsZXI7Il19
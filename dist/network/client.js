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
                    throw new Error(`${describe} => ${reason}`);
                });
                this.ioClient.on("close", () => {
                    this.ioClient = undefined;
                    this.ioCloseCallback("connection lost");
                    throw new Error(`Connection LOST because server shut us out.`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6InNyYy8iLCJzb3VyY2VzIjpbIm5ldHdvcmsvY2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLFNBQXFCLE1BQU0sa0JBQWtCLENBQUM7QUFHckQsTUFBTSxPQUFPLGtCQUFrQjtJQWMzQixZQUFZLGFBQXFCLEVBQUUsVUFBbUIsRUFBRSxlQUFrQztRQVoxRjs7Ozs7V0FBZ0I7UUFDaEI7Ozs7O1dBQWlCO1FBQ2pCOzs7OztXQUFhO1FBRWI7Ozs7O1dBQXFCO1FBQ3JCOzs7OztXQUFrQztRQUVsQzs7Ozs7V0FBcUM7UUFDckM7Ozs7O1dBQXFCO1FBRXJCOzs7O21CQUEyQixFQUFFO1dBQUM7UUFtSDlCOzs7O21CQUFtQixDQUFDLEtBQXlCLEVBQUUsRUFBRSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUM5RSxJQUFJLENBQUMsbUJBQ0QsV0FBVyxFQUFFLElBQUksRUFDakIsT0FBTyxFQUFFLHdDQUF3QyxJQUM5QyxLQUFLLENBQ1gsQ0FBQztnQkFDRixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDMUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLENBQUE7Z0JBQ2pELElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLENBQU8sUUFBYSxFQUFFLEVBQUU7b0JBQzFELE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdEIsQ0FBQyxDQUFBLENBQUMsQ0FBQTtnQkFDRixJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFPLEdBQUcsRUFBRSxFQUFFO29CQUM3QyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNuQixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2hCLENBQUMsQ0FBQSxDQUFDLENBQUE7WUFDTixDQUFDLENBQUM7V0FBQTtRQS9IRSxJQUFJLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQztRQUM3QixJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztRQUN2QyxJQUFJLENBQUMsWUFBWSxHQUFHLFVBQVUsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzVELElBQUksUUFBUSxHQUFZLEtBQUssQ0FBQztRQUM5QixJQUFJLGFBQWEsRUFBRTtZQUNmLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDaEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUU7Z0JBQ3pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLHdCQUF3QixDQUFDLENBQUM7YUFDckQ7U0FDSjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFYSxXQUFXOztZQUVyQixJQUFJO2dCQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDbEQsT0FBTyxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRTtvQkFDMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsNkNBQTZDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNyRixJQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2lCQUNoRDtnQkFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUU5RCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSwyQkFBMkIsQ0FBQyxDQUFBO2dCQUNwRCxJQUFJLENBQUMsZ0JBQWdCLENBQUM7b0JBQ2xCLFNBQVMsRUFBRTt3QkFDUCxVQUFVLEVBQUUsSUFBSSxDQUFDLFlBQVk7cUJBQ2hDO29CQUNELFdBQVcsRUFBRSxJQUFJO2lCQUNwQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBYSxFQUFFLEVBQUU7b0JBQ3RCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDO29CQUMzQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUM7b0JBQ2pELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQztvQkFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsOEJBQThCLEVBQUUsUUFBUSxDQUFDLENBQUE7Z0JBQ3JFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDWCxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUMxQixJQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztvQkFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDekIsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxFQUFFO29CQUNoRCxJQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztvQkFDMUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLFFBQVEsT0FBTyxNQUFNLEVBQUUsQ0FBQyxDQUFDO29CQUNqRCxNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsUUFBUSxPQUFPLE1BQU0sRUFBRSxDQUFDLENBQUM7Z0JBQ2hELENBQUMsQ0FBQyxDQUFBO2dCQUVGLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7b0JBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO29CQUMxQixJQUFJLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLENBQUM7b0JBQ3hDLE1BQU0sSUFBSSxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQztnQkFDbkUsQ0FBQyxDQUFDLENBQUE7Z0JBRUYsT0FBTyxJQUFJLENBQUM7YUFDZjtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNaLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQ3BCLE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1FBQ0wsQ0FBQztLQUFBO0lBRU0sZ0JBQWdCLENBQUMsS0FBMEIsRUFBRSxLQUluRDtRQUNHLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7WUFDaEMsTUFBTSxRQUFRLEdBQXNCO2dCQUNoQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUk7YUFDakIsQ0FBQTtZQUNELE1BQU0sYUFBYSxpQ0FDZixRQUFRLEVBQUUsUUFBUSxFQUNsQixjQUFjLEVBQUUsZ0JBQWdCLEVBQ2hDLGtCQUFrQixFQUFFLGlCQUFpQixFQUNyQyxtQkFBbUIsRUFBRSxlQUFlLElBQ2pDLEtBQUssR0FDTDtnQkFDQyxRQUFRLEVBQUU7b0JBQ04sT0FBTyxFQUFFLHNEQUFzRDtpQkFDbEU7YUFDSixDQUNKLENBQUE7WUFDRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLE1BQTBCLEVBQUUsRUFBRTtnQkFDL0QsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO2dCQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO2dCQUNwRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsZ0RBQzlCLGFBQWEsR0FDYixNQUFNLEdBQ047b0JBQ0MsUUFBUSxFQUFFO3dCQUNOLE9BQU8sRUFBRSxvQ0FBb0M7cUJBQ2hEO2lCQUNKLEVBQ0gsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxNQUEwQixFQUFFLEVBQUU7Z0JBQzlELElBQUksS0FBSyxHQUFXLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO2dCQUM1QyxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUVyQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztnQkFDdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDbkQsQ0FBQyxDQUFDLENBQUE7WUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLEVBQUU7Z0JBQ3ZDLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDcEMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRTVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLDRCQUE0QixDQUFDLENBQUM7Z0JBQ3RELElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO1lBQzlCLENBQUMsQ0FBQyxDQUFBO1lBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RixDQUFDLENBQUEsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQWtCSjtBQUVELGVBQWUsa0JBQWtCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaW9fY2xpZW50LCB7IFNvY2tldCB9IGZyb20gXCJzb2NrZXQuaW8tY2xpZW50XCI7XHJcbmltcG9ydCB7IEhhbmRzaGFrZSwgSW5mZXJlbmNlLCBNZXRhZGF0YSB9IGZyb20gXCIuL3NvY2tldHMuanNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBpb0NsaWVudENvbnRyb2xsZXIge1xyXG5cclxuICAgIGlvQWRyZXM6IHN0cmluZztcclxuICAgIGlvQ2xpZW50OiBTb2NrZXQ7XHJcbiAgICBpb0lkOiBudW1iZXI7XHJcblxyXG4gICAgaW9WYWxpZGF0ZWQ6IGJvb2xlYW47XHJcbiAgICBpb0Nsb3NlQ2FsbGJhY2s6IENhbGxhYmxlRnVuY3Rpb247XHJcblxyXG4gICAgaHNSZXNwb25zZU9iamVjdDogUGFydGlhbDxIYW5kc2hha2U+O1xyXG4gICAgaHNJZGVudGlmaWVyOiBzdHJpbmc7XHJcblxyXG4gICAgaW5mZXJlbmNlUmVzdWx0czogc3RyaW5nID0gXCJcIjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzZXJ2ZXJBZGRyZXNzOiBzdHJpbmcsIGlkZW50aWZpZXI/OiBzdHJpbmcsIGNhbGxiYWNrT25DbG9zZT86IENhbGxhYmxlRnVuY3Rpb24pIHtcclxuICAgICAgICB0aGlzLmlvQWRyZXMgPSBzZXJ2ZXJBZGRyZXNzO1xyXG4gICAgICAgIHRoaXMuaW9DbG9zZUNhbGxiYWNrID0gY2FsbGJhY2tPbkNsb3NlO1xyXG4gICAgICAgIHRoaXMuaHNJZGVudGlmaWVyID0gaWRlbnRpZmllciB8fCBwcm9jZXNzLmVudltcIklERU5USUZJRVJcIl07XHJcbiAgICAgICAgdmFyIGlzQ2xpZW50OiBib29sZWFuID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHNlcnZlckFkZHJlc3MpIHtcclxuICAgICAgICAgICAgaXNDbGllbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICB3aGlsZSAoIVByb21pc2UucmVzb2x2ZSh0aGlzLnNldHVwQ2xpZW50KCkpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2NsaWVudF1gLCBgcmVzb2x2aW5nIGEgY29ubmVjdGlvbmApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgc2V0dXBDbGllbnQoKSB7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbY2xpZW50XWAsIGBzdGFydGluZ2AsIGBuZXcgQ2xpZW50YCk7XHJcbiAgICAgICAgICAgIHdoaWxlICh0aGlzLmlvQ2xpZW50ID09PSB1bmRlZmluZWQgfHwgdGhpcy5pb0NsaWVudCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtjbGllbnRdYCwgYHNwYXduaW5nIGEgQ2xpZW50IGluc3RhbmNlIGNvbm5lY3RlZCB3aXRoOiBgLCB0aGlzLmlvQWRyZXMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pb0NsaWVudCA9IGlvX2NsaWVudChgJHt0aGlzLmlvQWRyZXN9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtjbGllbnRdYCwgYGNvbm5lY3Rpb24gd2l0aGAsIGAke3RoaXMuaW9BZHJlc31gKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbY2xpZW50XWAsIGBzZW5kaW5nIGhhbmRzaGFrZSByZXF1ZXN0YClcclxuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0SGFuZHNoYWtlKHtcclxuICAgICAgICAgICAgICAgIGhhbmRzaGFrZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXI6IHRoaXMuaHNJZGVudGlmaWVyXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgaXNIYW5kc2hha2U6IHRydWUsXHJcbiAgICAgICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaHNSZXNwb25zZU9iamVjdCA9IHJlc3BvbnNlLmhhbmRzaGFrZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW9WYWxpZGF0ZWQgPSB0aGlzLmhzUmVzcG9uc2VPYmplY3Quc3VjY2VzcztcclxuICAgICAgICAgICAgICAgIHRoaXMuaW9JZCA9IHRoaXMuaHNSZXNwb25zZU9iamVjdC5zaWQ7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2NsaWVudF1gLCBgc3VjY2Vzc2Z1bCBoYW5kc2hha2UgcmVxdWVzdGAsIHJlc3BvbnNlKVxyXG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pb0Nsb3NlQ2FsbGJhY2soZXJyKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW9DbGllbnQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlvQ2xpZW50Lm9uKFwiZGlzY29ubmVjdFwiLCAocmVhc29uLCBkZXNjcmliZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pb0NsaWVudCA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW9DbG9zZUNhbGxiYWNrKGAke2Rlc2NyaWJlfSA9PiAke3JlYXNvbn1gKTtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtkZXNjcmliZX0gPT4gJHtyZWFzb259YCk7XHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICB0aGlzLmlvQ2xpZW50Lm9uKFwiY2xvc2VcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pb0NsaWVudCA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW9DbG9zZUNhbGxiYWNrKFwiY29ubmVjdGlvbiBsb3N0XCIpO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb25uZWN0aW9uIExPU1QgYmVjYXVzZSBzZXJ2ZXIgc2h1dCB1cyBvdXQuYCk7XHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZXF1ZXN0SW5mZXJlbmNlKHF1ZXJ5PzogUGFydGlhbDxJbmZlcmVuY2U+LCBwcm9wcz86IHtcclxuICAgICAgICBvbnJlYWR5OiBDYWxsYWJsZUZ1bmN0aW9uLFxyXG4gICAgICAgIG9uZGF0YTogQ2FsbGFibGVGdW5jdGlvbixcclxuICAgICAgICBvbmVuZDogQ2FsbGFibGVGdW5jdGlvbixcclxuICAgIH0pIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJzLCByaikgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBtZXRhZGF0YTogUGFydGlhbDxNZXRhZGF0YT4gPSB7XHJcbiAgICAgICAgICAgICAgICBzaWQ6IHRoaXMuaW9JZCxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBpbmZlcmVuY2VkYXRhOiBQYXJ0aWFsPEluZmVyZW5jZT4gPSB7XHJcbiAgICAgICAgICAgICAgICBtZXRhZGF0YTogbWV0YWRhdGEsXHJcbiAgICAgICAgICAgICAgICBzdHJlYW1MaXN0ZW5lcjogXCJpbmZlcmVuY2U6ZGF0YVwiLFxyXG4gICAgICAgICAgICAgICAgc3RyZWFtT3Blbkxpc3RlbmVyOiBcImluZmVyZW5jZTpyZWFkeVwiLFxyXG4gICAgICAgICAgICAgICAgc3RyZWFtQ2xvc2VMaXN0ZW5lcjogXCJpbmZlcmVuY2U6ZW5kXCIsXHJcbiAgICAgICAgICAgICAgICAuLi5xdWVyeSxcclxuICAgICAgICAgICAgICAgIC4uLntcclxuICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIlJlcXVlc3RpbmcgdG8gcHJvbXB0IGxsYW1hLmNwcCBvbiB0aGUgbm9kZWpzIHNlcnZlci5cIixcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5pb0NsaWVudC5lbWl0KGBpbmZlcmVuY2U6cmVxdWVzdGAsIGluZmVyZW5jZWRhdGEpO1xyXG4gICAgICAgICAgICB0aGlzLmlvQ2xpZW50Lm9uKFwiaW5mZXJlbmNlOnJlYWR5XCIsIChxdWVyeTI6IFBhcnRpYWw8SW5mZXJlbmNlPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgcHJvcHM/Lm9ucmVhZHkoXCJKYXJ2aXMgaXMgdGhpbmtpbmcuLi5cIik7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2NsaWVudF1gLCBgc2VuZGluZyBwcm9tcHQgdG8gbW9kZWwuYCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlvQ2xpZW50LmVtaXQoXCJpbmZlcmVuY2U6cHJvbXB0XCIsIHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5pbmZlcmVuY2VkYXRhLFxyXG4gICAgICAgICAgICAgICAgICAgIC4uLnF1ZXJ5MixcclxuICAgICAgICAgICAgICAgICAgICAuLi57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIlNlbmRpbmcgeW91IHRoZSBwcm9tcHQgaW5mb3JtYXRpb25cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5pb0NsaWVudC5vbihgaW5mZXJlbmNlOmRhdGFgLCAocXVlcnkyOiBQYXJ0aWFsPEluZmVyZW5jZT4pID0+IHtcclxuICAgICAgICAgICAgICAgIHZhciB0b2tlbjogc3RyaW5nID0gcXVlcnkyLm1ldGFkYXRhLm1lc3NhZ2U7XHJcbiAgICAgICAgICAgICAgICBwcm9wcz8ub25kYXRhKHRva2VuKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmluZmVyZW5jZVJlc3VsdHMgPSB0aGlzLmluZmVyZW5jZVJlc3VsdHMgKyB0b2tlbjtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbY2xpZW50XWAsIHRoaXMuaW5mZXJlbmNlUmVzdWx0cyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHRoaXMuaW9DbGllbnQub24oYGluZmVyZW5jZTplbmRgLCBxdWVyeTIgPT4ge1xyXG4gICAgICAgICAgICAgICAgcHJvcHM/Lm9uZW5kKHF1ZXJ5Mi5sbGFtYS5yZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICBycyhxdWVyeTIubWV0YWRhdGEubWVzc2FnZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtjbGllbnRdYCwgYGVuZGVkIHNlc3Npb24gd2l0aCBzZXJ2ZXIuYCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlvQ2xpZW50ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB0aGlzLmlvQ2xpZW50Lm9uKGBpbmZlcmVuY2U6ZXJyb3JgLCAoZXJyb3IpID0+IHsgY29uc29sZS5lcnJvcihlcnJvcik7IHJqKGVycm9yKSB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXF1ZXN0SGFuZHNoYWtlID0gKHF1ZXJ5PzogUGFydGlhbDxNZXRhZGF0YT4pID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICB2YXIgcSA9IHtcclxuICAgICAgICAgICAgaXNIYW5kc2hha2U6IHRydWUsXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6IFwiVXNlciB3YW50cyB0byBzZWN1cmUgaW5pdGlhbCBoYW5kc2hha2VcIixcclxuICAgICAgICAgICAgLi4ucXVlcnlcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuaW9DbGllbnQuZW1pdCgncmVxdWVzdEhhbmRzaGFrZScsIHEpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbY2xpZW50XWAsIGBoYW5kc2hha2UgcmVxdWVzdGVkYCwgcSlcclxuICAgICAgICB0aGlzLmlvQ2xpZW50Lm9uKGBoYW5kc2hha2VSZXNwb25zZWAsIGFzeW5jIChyZXNwb25zZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgdGhpcy5pb0NsaWVudC5vbihgaGFuZHNoYWtlRXJyb3JgLCBhc3luYyAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgfSlcclxuICAgIH0pXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGlvQ2xpZW50Q29udHJvbGxlcjsiXX0=
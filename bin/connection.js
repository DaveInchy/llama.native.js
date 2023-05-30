import { __awaiter } from "tslib";
import * as io_server from "socket.io";
import http from "http";
import io_client from "socket.io-client";
;
;
;
export default class JarvisAPI {
    constructor(props) {
        Object.defineProperty(this, "properties", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "init", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
            }
        });
        Object.defineProperty(this, "connect", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, rejects) => {
                    var props = this.properties;
                    var local = props.is_local;
                    var config = local ? props.conn_props.local_conn : props.conn_props.ayyai_conn;
                    const server = new io_server.Server();
                    var httpServer = http.createServer();
                    var served = props.remote_is_local && props.is_server ? httpServer.listen("0.0.0.0:" + `${config.port}`, () => {
                        console.log("[remote] listening on '0.0.0.0:" + `${config.port}` + "' ");
                    }) : () => {
                        if (props.is_server) {
                            return httpServer.listen(config.host + ":" + `${config.port}`, () => {
                                console.log("[remote] listening on '" + config.host + ":" + `${config.port}` + "' ");
                            });
                        }
                        return null;
                    };
                    var connection = props.is_client ? io_client(config.host + `:` + config.port + "/") : server.listen(httpServer);
                    return connection;
                });
            })
        });
        this.properties = props;
        return this;
    }
}
;
new JarvisAPI({
    remote_is_local: true,
    auth_complete: false,
    need_auth: false,
    is_server: false,
    is_client: true,
    is_local: false,
    conn_props: ({
        ayyai_conn: ({
            host: "localhost",
            port: 3331,
            secure: false,
            socket: true,
            http: false,
        }),
        local_conn: ({
            host: "localhost",
            port: 3331,
            secure: false,
            socket: true,
            http: false,
        }),
    }),
}).connect();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ubmVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIuL3NyYy8iLCJzb3VyY2VzIjpbImNvbm5lY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sS0FBSyxTQUFTLE1BQU0sV0FBVyxDQUFDO0FBRXZDLE9BQU8sSUFBMEQsTUFBTSxNQUFNLENBQUM7QUFDOUUsT0FBTyxTQUFxQixNQUFNLGtCQUFrQixDQUFDO0FBV3BELENBQUM7QUE0QkQsQ0FBQztBQWFELENBQUM7QUFFRixNQUFNLENBQUMsT0FBTyxPQUFPLFNBQVM7SUFJMUIsWUFBWSxLQUF5QztRQUZyRDs7Ozs7V0FBK0M7UUFTeEM7Ozs7bUJBQU8sR0FBRyxFQUFFO1lBRW5CLENBQUM7V0FBQTtRQUVNOzs7O21CQUFVLEdBQVMsRUFBRTtnQkFBQyxPQUFBLElBQUksT0FBTyxDQUFNLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFO29CQUMvRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO29CQUM1QixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO29CQUMzQixJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQztvQkFFL0UsTUFBTSxNQUFNLEdBQUcsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBRXRDLElBQUksVUFBVSxHQUF5RSxJQUFJLENBQUMsWUFBWSxFQUFpRCxDQUFDO29CQUUxSixJQUFJLE1BQU0sR0FBcUUsS0FBSyxDQUFDLGVBQWUsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUU7d0JBQzVLLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7b0JBQzdFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUU7d0JBQ04sSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFOzRCQUNqQixPQUFPLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFO2dDQUNoRSxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixHQUFHLE1BQU0sQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDOzRCQUN6RixDQUFDLENBQUMsQ0FBQTt5QkFDTDt3QkFDRCxPQUFPLElBQUksQ0FBQztvQkFDaEIsQ0FBQyxDQUFBO29CQUVELElBQUksVUFBVSxHQUE2SCxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFFMU8sT0FBTyxVQUFVLENBQUM7Z0JBQ3RCLENBQUMsQ0FBQyxDQUFBO2NBQUE7V0FBQztRQWhDQyxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztRQUV4QixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBOEJKO0FBQUEsQ0FBQztBQUVGLElBQUksU0FBUyxDQUFDO0lBQ1YsZUFBZSxFQUFFLElBQUk7SUFDckIsYUFBYSxFQUFFLEtBQUs7SUFDcEIsU0FBUyxFQUFFLEtBQUs7SUFDaEIsU0FBUyxFQUFFLEtBQUs7SUFDaEIsU0FBUyxFQUFFLElBQUk7SUFDZixRQUFRLEVBQUUsS0FBSztJQUNmLFVBQVUsRUFBRSxDQUFDO1FBQ1QsVUFBVSxFQUFFLENBQUM7WUFDVCxJQUFJLEVBQUUsV0FBVztZQUNqQixJQUFJLEVBQUUsSUFBSTtZQUNWLE1BQU0sRUFBRSxLQUFLO1lBQ2IsTUFBTSxFQUFFLElBQUk7WUFDWixJQUFJLEVBQUUsS0FBSztTQUNkLENBQUM7UUFDRixVQUFVLEVBQUUsQ0FBQztZQUNULElBQUksRUFBRSxXQUFXO1lBQ2pCLElBQUksRUFBRSxJQUFJO1lBQ1YsTUFBTSxFQUFFLEtBQUs7WUFDYixNQUFNLEVBQUUsSUFBSTtZQUNaLElBQUksRUFBRSxLQUFLO1NBQ2QsQ0FBQztLQUNMLENBQUM7Q0FDTCxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBpb19zZXJ2ZXIgZnJvbSBcInNvY2tldC5pb1wiO1xyXG5pbXBvcnQgZG90ZW52IGZyb20gXCJkb3RlbnZcIjtcclxuaW1wb3J0IGh0dHAsIHsgSW5jb21pbmdNZXNzYWdlLCBPdXRnb2luZ01lc3NhZ2UsIFNlcnZlclJlc3BvbnNlIH0gZnJvbSBcImh0dHBcIjtcclxuaW1wb3J0IGlvX2NsaWVudCwgeyBTb2NrZXQgfSBmcm9tIFwic29ja2V0LmlvLWNsaWVudFwiO1xyXG5pbXBvcnQgcHJvY2VzcyBmcm9tIFwicHJvY2Vzc1wiO1xyXG5pbXBvcnQgeyBPYmplY3RJZCB9IGZyb20gXCJtb25nb2RiXCI7XHJcbmltcG9ydCB7IERlZmF1bHRFdmVudHNNYXAgfSBmcm9tIFwic29ja2V0LmlvL2Rpc3QvdHlwZWQtZXZlbnRzXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbmZpZ1Byb3BzIHtcclxuICAgIGhvc3Q6IHN0cmluZyxcclxuICAgIHBvcnQ6IHN0cmluZyB8IG51bWJlcixcclxuICAgIHNlY3VyZTogYm9vbGVhbixcclxuICAgIHNvY2tldDogYm9vbGVhbixcclxuICAgIGh0dHA6IGJvb2xlYW4sXHJcbn07XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbm5Qcm9wcyB7XHJcbiAgICBwdWJsaWNfYXV0aD86IHtcclxuICAgICAgICB0b2tlbj86IHN0cmluZyB8IE9iamVjdElkLFxyXG4gICAgICAgIHNpZ25lZDogYm9vbGVhbixcclxuICAgICAgICBieTogYHB1YmxpYy9rZXlgIHwgc3RyaW5nLFxyXG4gICAgfSxcclxuICAgIHByaXZhdGVfYXV0aD86IHtcclxuICAgICAgICB0b2tlbj86IHN0cmluZyB8IE9iamVjdElkLFxyXG4gICAgICAgIHNpZ25lZDogYm9vbGVhbixcclxuICAgICAgICBieTogc3RyaW5nLFxyXG4gICAgfSxcclxuICAgIGF1dGhfaG9zdD86IHN0cmluZyxcclxuICAgIGF1dGhfa2V5Pzogc3RyaW5nLFxyXG4gICAgYXl5YWlfYXBpPzoge1xyXG4gICAgICAgIGF1dGhvcjogc3RyaW5nLFxyXG4gICAgICAgIHN0YXR1cz86IHtcclxuICAgICAgICAgICAgY3JlZGVudGlhbHM6IHtcclxuICAgICAgICAgICAgICAgIF9pZDogT2JqZWN0SWQsXHJcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogc3RyaW5nLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhbGlkOiBzdHJpbmcsXHJcbiAgICB9LFxyXG4gICAgYXl5YWlfY29ubjogQ29uZmlnUHJvcHMsXHJcbiAgICBsb2NhbF9jb25uOiBDb25maWdQcm9wcyxcclxuICAgIGluc3RhbmNlX2xvY2FsPzogYm9vbGVhbixcclxufTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSmFydmlzUHJvcHMge1xyXG4gICAgY29ubl9wcm9wczogQ29ublByb3BzLFxyXG4gICAgcmVtb3RlX2lzX2xvY2FsOiBib29sZWFuLFxyXG5cclxuICAgIGF1dGhfY29tcGxldGU6IGJvb2xlYW4sXHJcbiAgICBuZWVkX2F1dGg6IGJvb2xlYW4sXHJcblxyXG4gICAgaXNfc2VydmVyOiBib29sZWFuLFxyXG4gICAgaXNfbG9jYWw/OiBib29sZWFuLFxyXG4gICAgaXNfY2xpZW50OiBib29sZWFuLFxyXG4gICAgZGF0YT86IGFueSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEphcnZpc0FQSSB7XHJcblxyXG4gICAgcHJvcGVydGllczogSmFydmlzUHJvcHMgfCBQYXJ0aWFsPEphcnZpc1Byb3BzPjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSmFydmlzUHJvcHMgfCBQYXJ0aWFsPEphcnZpc1Byb3BzPikge1xyXG5cclxuICAgICAgICB0aGlzLnByb3BlcnRpZXMgPSBwcm9wcztcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXQgPSAoKSA9PiB7XHJcbiAgICAgICAgLy8gc2V0dXAgc29ja2V0IHdpdGggdGhlIGdpdmVuIHByb3BlcnRpZXMgb3IgY29ubmVjdCB0byBzb2NrZXQgd2l0aCBnaXZlbiBwcm9wZXJ0aWVzXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNvbm5lY3QgPSBhc3luYyAoKSA9PiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3RzKSA9PiB7XHJcbiAgICAgICAgdmFyIHByb3BzID0gdGhpcy5wcm9wZXJ0aWVzO1xyXG4gICAgICAgIHZhciBsb2NhbCA9IHByb3BzLmlzX2xvY2FsO1xyXG4gICAgICAgIHZhciBjb25maWcgPSBsb2NhbCA/IHByb3BzLmNvbm5fcHJvcHMubG9jYWxfY29ubiA6IHByb3BzLmNvbm5fcHJvcHMuYXl5YWlfY29ubjtcclxuXHJcbiAgICAgICAgY29uc3Qgc2VydmVyID0gbmV3IGlvX3NlcnZlci5TZXJ2ZXIoKTtcclxuXHJcbiAgICAgICAgdmFyIGh0dHBTZXJ2ZXI6IGh0dHAuU2VydmVyPHR5cGVvZiBodHRwLkluY29taW5nTWVzc2FnZSwgdHlwZW9mIGh0dHAuU2VydmVyUmVzcG9uc2U+ID0gaHR0cC5jcmVhdGVTZXJ2ZXI8dHlwZW9mIEluY29taW5nTWVzc2FnZSwgdHlwZW9mIFNlcnZlclJlc3BvbnNlPigpO1xyXG5cclxuICAgICAgICB2YXIgc2VydmVkOiBodHRwLlNlcnZlcjx0eXBlb2YgSW5jb21pbmdNZXNzYWdlLCB0eXBlb2YgU2VydmVyUmVzcG9uc2U+IHwgYW55ID0gcHJvcHMucmVtb3RlX2lzX2xvY2FsICYmIHByb3BzLmlzX3NlcnZlciA/IGh0dHBTZXJ2ZXIubGlzdGVuKFwiMC4wLjAuMDpcIiArIGAke2NvbmZpZy5wb3J0fWAsICgpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJbcmVtb3RlXSBsaXN0ZW5pbmcgb24gJzAuMC4wLjA6XCIgKyBgJHtjb25maWcucG9ydH1gICsgXCInIFwiKTtcclxuICAgICAgICB9KSA6ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHByb3BzLmlzX3NlcnZlcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGh0dHBTZXJ2ZXIubGlzdGVuKGNvbmZpZy5ob3N0ICsgXCI6XCIgKyBgJHtjb25maWcucG9ydH1gLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJbcmVtb3RlXSBsaXN0ZW5pbmcgb24gJ1wiICsgY29uZmlnLmhvc3QgKyBcIjpcIiArIGAke2NvbmZpZy5wb3J0fWAgKyBcIicgXCIpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBjb25uZWN0aW9uOiBTb2NrZXQ8RGVmYXVsdEV2ZW50c01hcCwgRGVmYXVsdEV2ZW50c01hcD4gfCBpb19zZXJ2ZXIuU2VydmVyPERlZmF1bHRFdmVudHNNYXAsIERlZmF1bHRFdmVudHNNYXAsIERlZmF1bHRFdmVudHNNYXAsIGFueT4gPSBwcm9wcy5pc19jbGllbnQgPyBpb19jbGllbnQoY29uZmlnLmhvc3QgKyBgOmAgKyBjb25maWcucG9ydCArIFwiL1wiKSA6IHNlcnZlci5saXN0ZW4oaHR0cFNlcnZlcik7XHJcblxyXG4gICAgICAgIHJldHVybiBjb25uZWN0aW9uO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5uZXcgSmFydmlzQVBJKHtcclxuICAgIHJlbW90ZV9pc19sb2NhbDogdHJ1ZSxcclxuICAgIGF1dGhfY29tcGxldGU6IGZhbHNlLFxyXG4gICAgbmVlZF9hdXRoOiBmYWxzZSxcclxuICAgIGlzX3NlcnZlcjogZmFsc2UsXHJcbiAgICBpc19jbGllbnQ6IHRydWUsXHJcbiAgICBpc19sb2NhbDogZmFsc2UsXHJcbiAgICBjb25uX3Byb3BzOiAoe1xyXG4gICAgICAgIGF5eWFpX2Nvbm46ICh7XHJcbiAgICAgICAgICAgIGhvc3Q6IFwibG9jYWxob3N0XCIsXHJcbiAgICAgICAgICAgIHBvcnQ6IDMzMzEsXHJcbiAgICAgICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNvY2tldDogdHJ1ZSxcclxuICAgICAgICAgICAgaHR0cDogZmFsc2UsXHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgbG9jYWxfY29ubjogKHtcclxuICAgICAgICAgICAgaG9zdDogXCJsb2NhbGhvc3RcIixcclxuICAgICAgICAgICAgcG9ydDogMzMzMSxcclxuICAgICAgICAgICAgc2VjdXJlOiBmYWxzZSxcclxuICAgICAgICAgICAgc29ja2V0OiB0cnVlLFxyXG4gICAgICAgICAgICBodHRwOiBmYWxzZSxcclxuICAgICAgICB9KSxcclxuICAgIH0pLFxyXG59KS5jb25uZWN0KCk7Il19
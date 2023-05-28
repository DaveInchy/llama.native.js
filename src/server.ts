import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "http";
import { Server as SocketServer } from "socket.io";
import { RemoteSocket, Socket } from "socket.io";

const port = process.env["PORT"] || 3331;

var PWD = process.cwd();
const getRootPath = (path = "") => PWD + "/../" + path?.toString();

// Serve Express Sockets
const app = express();
var httpServer = new Server(app)
var socketServer = new SocketServer(httpServer);

app.use(express.static(getRootPath("/llama.public/")));
app.use(cors());

var waitingSocketIds: Array<[string, Socket]> = [];
app.use("/", async (_req, _res, _next) => {

    const request = _req;
    const response = _res;

    try {
        // listen for events
        socketServer.on("connection", function (client: Socket) {
            console.log(`client ${client.id} connected successfully`, client.data);

            client.use(([event, ...args], next) => {

                if (isUnauthorized()) {
                    client.disconnect();
                    throw new Error("unauthorized event");
                }

                switch (event.replaceAll(" ", "-")) {
                    case "request-inference":
                        var position = waitingSocketIds.push([client.id, client]);
                        client.join("waiting");
                        client.to("waiting").emit(`message`, `client ${client.id} is qeued up for a single model inference`);
                        client.emit(`message`, `you are number ${position || waitingSocketIds.length - 1} in the queue`);
                        break;

                    case "":

                        break;
                    case "":

                        break;
                    case "":

                        break;
                    case "":

                        break;
                    case "":

                        break;
                    case "message":
                        var token = args[0];
                        console.log(args, args[0], args[1]);
                        break;

                    default:
                        client.disconnect(true);
                        throw new Error("invalid event emitted by: client id " + client.id);
                        break;
                }

                next();
            });

            client.on("error", (err: Error) => {
                console.log(`client ${client.id} recieved an error due to ${err.cause?.toString()} => ${err.message}`);
            });

            client.on("disconnect", (reason) => {
                console.log(`client ${client.id} disconnected due to ${reason?.toString()}`);
            });
        })

        socketServer.on("close", () => {

        })
    } catch (err: any | unknown | string) {
        console.log(`[RECIEVED] < ERR : ${err && err.message || "unknown error"}`)
    }

    _next(JSON.stringify(socketServer, (obj: any): string => {
        const ret = new Map();
        Object.keys(obj).forEach((key) => {
            let value = obj[key];

            if ((value && typeof value === 'object') || (!value && !isNaN(Number(value)))) {
                value = JSON.stringify(value);
            }

            ret.set(key, value);
        });

        return Array.from(ret).join(',');
    }));
})

httpServer.listen(port, () => {
    console.log(`websocket for llama.ccp is online on http://localhost:${port}/`);
});

function isUnauthorized(): boolean {
    return false;
}


export default app;
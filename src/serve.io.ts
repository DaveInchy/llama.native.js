import * as dotenv from "dotenv";
import ioServerController from "./network/server.js";

dotenv.config();

export { ioServerController as ioServer } from "./network/server.js";
export type { Inference as ioInference, Handshake as ioHandshake, Metadata as ioMetadata } from "./network/sockets.js";
export default new ioServerController(Number.parseInt(process.env['PORT']));
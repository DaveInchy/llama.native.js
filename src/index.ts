import dotenv from "dotenv";
import ioClientController from "./network/client.js";
import ioServerController from "./network/server.js";

dotenv.config();

export const PORT: number = Number.parseInt(process.env["PORT"]) || 9090;
export const HOST = process.env["HOST"] || "0.0.0.0";
export const IDENTIFIER = process.env["IDENTIFIER"] || null;

export { ioClientController as Client, ioServerController as Server };

export default function runServer() {

	return new ioServerController(PORT);
}
import dotenv from "dotenv";
import ioClientController from "./network/client.js";
import ioServerController from "./network/server.js";
dotenv.config();
export const PORT = Number.parseInt(process.env["PORT"]) || 9090;
export const HOST = process.env["HOST"] || "0.0.0.0";
export const IDENTIFIER = process.env["IDENTIFIER"] || null;
export { ioClientController as Client, ioServerController as Server };
export default function runServer() {
    return new ioServerController(PORT);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi9zcmMvIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDNUIsT0FBTyxrQkFBa0IsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRCxPQUFPLGtCQUFrQixNQUFNLHFCQUFxQixDQUFDO0FBRXJELE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUVoQixNQUFNLENBQUMsTUFBTSxJQUFJLEdBQVcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDO0FBQ3pFLE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQztBQUNyRCxNQUFNLENBQUMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxJQUFJLENBQUM7QUFFNUQsT0FBTyxFQUFFLGtCQUFrQixJQUFJLE1BQU0sRUFBRSxrQkFBa0IsSUFBSSxNQUFNLEVBQUUsQ0FBQztBQUV0RSxNQUFNLENBQUMsT0FBTyxVQUFVLFNBQVM7SUFFaEMsT0FBTyxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZG90ZW52IGZyb20gXCJkb3RlbnZcIjtcbmltcG9ydCBpb0NsaWVudENvbnRyb2xsZXIgZnJvbSBcIi4vbmV0d29yay9jbGllbnQuanNcIjtcbmltcG9ydCBpb1NlcnZlckNvbnRyb2xsZXIgZnJvbSBcIi4vbmV0d29yay9zZXJ2ZXIuanNcIjtcblxuZG90ZW52LmNvbmZpZygpO1xuXG5leHBvcnQgY29uc3QgUE9SVDogbnVtYmVyID0gTnVtYmVyLnBhcnNlSW50KHByb2Nlc3MuZW52W1wiUE9SVFwiXSkgfHwgOTA5MDtcbmV4cG9ydCBjb25zdCBIT1NUID0gcHJvY2Vzcy5lbnZbXCJIT1NUXCJdIHx8IFwiMC4wLjAuMFwiO1xuZXhwb3J0IGNvbnN0IElERU5USUZJRVIgPSBwcm9jZXNzLmVudltcIklERU5USUZJRVJcIl0gfHwgbnVsbDtcblxuZXhwb3J0IHsgaW9DbGllbnRDb250cm9sbGVyIGFzIENsaWVudCwgaW9TZXJ2ZXJDb250cm9sbGVyIGFzIFNlcnZlciB9O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBydW5TZXJ2ZXIoKSB7XG5cblx0cmV0dXJuIG5ldyBpb1NlcnZlckNvbnRyb2xsZXIoUE9SVCk7XG59Il19
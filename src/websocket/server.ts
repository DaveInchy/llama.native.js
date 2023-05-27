import io from "socket.io";
import { queryResponse } from "../index";

const app = require("express")();

const websocket = require("socket.io")(process.env["WS_PORT"])

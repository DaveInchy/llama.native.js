import io from "socket.io";
import { queryResponse } from "../index";

const app = require("express")();

const socketServer = require("socket.io")(process.env["PORT"])

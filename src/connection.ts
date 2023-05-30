import * as io_server from "socket.io";
import dotenv from "dotenv";
import http, { IncomingMessage, OutgoingMessage, ServerResponse } from "http";
import io_client, { Socket } from "socket.io-client";
import process from "process";
import { ObjectId } from "mongodb";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export interface ConfigProps {
    host: string,
    port: string | number,
    secure: boolean,
    socket: boolean,
    http: boolean,
};

export interface ConnProps {
    public_auth?: {
        token?: string | ObjectId,
        signed: boolean,
        by: `public/key` | string,
    },
    private_auth?: {
        token?: string | ObjectId,
        signed: boolean,
        by: string,
    },
    auth_host?: string,
    auth_key?: string,
    ayyai_api?: {
        author: string,
        status?: {
            credentials: {
                _id: ObjectId,
                username: string,
            }
        }
        valid: string,
    },
    ayyai_conn: ConfigProps,
    local_conn: ConfigProps,
    instance_local?: boolean,
};

export interface JarvisProps {
    conn_props: ConnProps,
    remote_is_local: boolean,

    auth_complete: boolean,
    need_auth: boolean,

    is_server: boolean,
    is_local?: boolean,
    is_client: boolean,
    data?: any,
};

export default class JarvisAPI {

    properties: JarvisProps | Partial<JarvisProps>;

    constructor(props: JarvisProps | Partial<JarvisProps>) {

        this.properties = props;

        return this;
    }

    public init = () => {
        // setup socket with the given properties or connect to socket with given properties
    }

    public connect = async () => new Promise<any>((resolve, rejects) => {
        var props = this.properties;
        var local = props.is_local;
        var config = local ? props.conn_props.local_conn : props.conn_props.ayyai_conn;

        const server = new io_server.Server();

        var httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> = http.createServer<typeof IncomingMessage, typeof ServerResponse>();

        var served: http.Server<typeof IncomingMessage, typeof ServerResponse> | any = props.remote_is_local && props.is_server ? httpServer.listen("0.0.0.0:" + `${config.port}`, () => {
            console.log("[remote] listening on '0.0.0.0:" + `${config.port}` + "' ");
        }) : () => {
            if (props.is_server) {
                return httpServer.listen(config.host + ":" + `${config.port}`, () => {
                    console.log("[remote] listening on '" + config.host + ":" + `${config.port}` + "' ");
                })
            }
            return null;
        }

        var connection: Socket<DefaultEventsMap, DefaultEventsMap> | io_server.Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> = props.is_client ? io_client(config.host + `:` + config.port + "/") : server.listen(httpServer);

        return connection;
    });
};

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
import log from './log';
import * as config from './config';
import * as http from 'http';
import * as sio from 'socket.io';

export default class Server {
    readonly httpServer: http.Server;
    readonly sioServer: sio.Server;

    constructor() {
        this.httpServer = http.createServer();
        this.sioServer = new sio.Server(this.httpServer, {
            cors: {
                origin: "*",
                methods: [ "GET", "POST" ]
            }
        });

        this.sioServer.on("connection", (socket: sio.Socket) => {
            log.info("client connected");

            socket.prependAny((eventName: string, ...args: any[]) => {
                log.info("received event %s with args %s", eventName, JSON.stringify(args));
            });

            socket.on("disconnect", (reason: string) => {
                log.info("client disconnected: %s", reason);
            });
        });

/*io.on("connection", (socket: Socket) => {
    console.log("nee");
    socket.on("create", (message: string, s: string) => {
        console.log("da will jemand was erstellen lol: " + message);
        console.log(s);
    });
});*/
    }

    listen(): void {
        log.info("starting up on port %d", config.port);
        this.httpServer.listen(config.port);
    }
};


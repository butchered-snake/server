import { createServer } from "http";
import { Server, Socket } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: [ "GET", "POST" ]
    }
});

io.on("connection", (socket: Socket) => {
    console.log("nee");
    socket.on("create", (message: string, s: string) => {
        console.log("da will jemand was erstellen lol: " + message);
        console.log(s);
    });
});

httpServer.listen(6969);

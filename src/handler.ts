import log from './log';
import * as sio from 'socket.io';

// handler
function onCreate(message: string, additionalMessage: string): void {
    log.info("received message: %s with addition: %s", message, additionalMessage);
}

// mapping assignment
const handlerMap = new Map<string, (...args: any[]) => void>();

handlerMap.set("create", onCreate);

// export
export default function addEventHandler(socket: sio.Socket): void {
    handlerMap.forEach((handler: (...args: any[]) => void, eventName: string) => {
        socket.on(eventName, handler);
    });
}


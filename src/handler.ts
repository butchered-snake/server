import log from './log';
import * as sio from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

class Game {
    readonly id: string;
    private _offer: string;
    private _hasValidOffer: boolean;
    private _adminSocket: sio.Socket;

    constructor(adminSocket: sio.Socket, initialOffer: string) {
        this.id = uuidv4();
        this._adminSocket = adminSocket;
        this._offer = initialOffer;
        this._hasValidOffer = true;
        log.debug("created game %s with offer %s", this.id, initialOffer);
    }

    set offer(o: string) {
        log.debug("waiting to set new valid offer");
        while (this._hasValidOffer);
        log.debug("setting new valid offer");
        this._offer = o;
        this._hasValidOffer = true;
    }
    get offer(): string {
        log.debug("waiting to get new valid offer");
        while (!this._hasValidOffer);
        log.debug("getting new valid offer");
        this._hasValidOffer = false;
        return this._offer;
    }

    sendToAdmin(eventName: string, ...args: any[]): void {
        this._adminSocket.emit(eventName, args);
    }
};

const gameMap = new Map<string, Game>();


export default function addEventHandler(socket: sio.Socket): void {
    socket.on("create", (offer: string) => {
        const game = new Game(socket, offer);
        gameMap.set(game.id, game);
        game.sendToAdmin("gameCreated", game.id);
    });

    socket.on("offer", (gameId: string, newOffer: string) => {
        const game = gameMap.get(gameId);
        if (game === undefined) {
            log.warn("tried to set new offer on non existent game");
            return;
        }
        game.offer = newOffer;
    });


    socket.on("join", (gameId: string) => {
        const game = gameMap.get(gameId);
        if (game === undefined) {
            log.warn("tried to join non existent game");
            return;
        }
        socket.emit("offer", game.offer);
    });

    socket.on("answer", (gameId: string, name: string, answer: string) => {
        const game = gameMap.get(gameId);
        if (game === undefined) {
            log.warn("tried to answer to non existent game");
            return;
        }
        game.sendToAdmin("answer", name, answer);
    });

}


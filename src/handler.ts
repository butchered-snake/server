import log from './log';
import * as sio from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

class Game {
    readonly id: string;
    private _offers: Array<string>;
    private _adminSocket: sio.Socket;
    private _takenNames: Array<string>;

    constructor(adminSocket: sio.Socket, initialOffer: string) {
        this.id = uuidv4();
        this._adminSocket = adminSocket;
        this._offers = new Array<string>();
        this._offers.push(initialOffer);
        this._takenNames = new Array<string>();
        log.debug("created game %s with offer %s", this.id, initialOffer);
    }

    set offer(o: string) {
        this._offers.push(o);
    }
    get offer(): string {
        if (this._offers.length !== 0) {
            return this._offers.pop()!;
        }
        log.warn("no valid offer available");
        return "";
    }

    addName(name: string): boolean {
        if (this._takenNames.includes(name)) {
            return false;
        }
        this._takenNames.push(name);
        return true;
    }

    sendToAdmin(eventName: string, ...args: any[]): void {
        this._adminSocket.emit(eventName, ...args);
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
        log.debug("serving offer to join request for game %s", gameId);
        socket.emit("offer", game.offer);
    });

    socket.on("answer", (gameId: string, name: string, answer: string) => {
        const game = gameMap.get(gameId);
        if (game === undefined) {
            log.warn("tried to answer to non existent game");
            return;
        }
        // TODO this is a hotfix and might be changed later
        if (!game.addName(name)) {
            log.error("no duplicate names allowed");
        }
        log.debug("forewarding answer for client %s joining game %s with args %s", name, gameId, answer);
        game.sendToAdmin("answer", name, answer);
    });

    socket.on("delete", (gameId: string) => {
        const deleted = gameMap.delete(gameId);
        if (deleted) {
            log.info("deleted game with id %s", gameId);
        } else {
            log.warn("tried to delete non existent game: %s", gameId);
        }
    });

}


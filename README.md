# butchered-server

The game making backend for butchered snake.

## Table of contents

1. [Running the backend](#1-running-the-backend)  
    1.1 [Prerequisites](#11-prerequisites)  
    1.2 [Configuration](#12-configuration)  
    1.3 [Run](#13-run)  
2. [Inner workings](#2-inner-workings)  
    2.1 [Principle](#21-principle)  
    2.2 [Websocket endpoints](#22-websocket-endpoints)  

## 1. Running the backend

The following describes how to get the backend up and running.

### 1.1 Prerequisites

- node.js with Typescript installed
- ts-node installed (`npm install -g ts-node`)
- install dependencies (`npm install`)

### 1.2 Configuration

- `BUTCHERED_PORT` environment variable: port the backend listens on

### 1.3 Run

To start the app on port 6969 run:
```bash
BUTCHERED_PORT=6969 npm start
```

For development `nodemon` can be used so it is restarted upon file changes:
```bash
BUTCHERED_PORT=6969 nodemon
```

## 2. Inner workings

The following will explain what the backend is doing and what is set up to achieve this.

### 2.1 Principle

The only task of the backend is creating games by acting as a communication channel between clients to establish a WebRTC connection. In WebRTC terms this is called a signaling channel.

Every butchered-client establishes a websocket connection with the backend. A client can then request to create a game. This client will be considered the admin of the game and is then able to send WebRTC offers to the backend. These offers are added to a queue for the created game. Another client can now request to join the game. The backend will forword one of the offers from the queue to the requesting client. The client can then create a WebRTC answer and send it to the backend, which will be directly forwarded to the game admin. The admin and requesting client can then establish a WebRTC connection and communicate with each other without the backend. The backend will be notified as soon as the admin either starts the game or disconnects while creating a game and will delete the game. After that all the game related communication is done between the clients themselves, fully detached from the backend.

### 2.2 Websocket endpoints

The `socket.io` endpoints used for the communication:

| endpoint | parameter                                    | task                                                                          |
|----------|----------------------------------------------|-------------------------------------------------------------------------------|
| create   | initialOffer: string                         | create game; initialize offer queue; send `gameCreated` with game id to admin |
| offer    | gameId: string, newOffer: string             | add new offer to offer queue of the game                                      |
| join     | gameId: string                               | if game's offer queue is not empty send `offer`  with an offer from the queue |
| answer   | gameId: string, name: string, answer: string | send `answer` with name and answer to admin                                   |
| delete   | gameId: string                               | delete game with corresponding offer queue from internal storage              |


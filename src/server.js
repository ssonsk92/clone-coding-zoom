import http from "http"
import express from 'express';
import SocketIO from "socket.io"
import { PassThrough } from "stream";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res)=>res.render("home"));
app.get("/*", (req, res)=>res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

function publicRooms(){
    const {sockets: {adapter:{sids, rooms}}} = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key)=>{
        if(sids.get(key) === undefined){
            console.log(key);
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

wsServer.on("connection", (socket)=>{
    socket["nickname"] = "Anon";
    socket.onAny((event)=>{
        console.log(`Socket Event:${event}`)
    });
    socket.on("enter_room", (roomName, nickname, done)=>{
        socket.join(roomName);
        socket["nickname"] = nickname;
        done();
        socket.to(roomName).emit("welcome", socket.nickname);
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", ()=>{
        socket.rooms.forEach((room)=>socket.to(room).emit("bye", socket.nickname));
    });
    socket.on("disconnect", ()=>{
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("new_message", (msg, room, done)=>{
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
});
// const wss = new WebSocket.Server({server});

// const sockets = [];

// wss.on("connection", (socket)=>{
//     sockets.push(socket);
//     socket["nickname"] = "Anon";
//     console.log("Connected to Browser");
//     socket.on("close", ()=>{
//         console.log("Disconnect from the Browser");
//     });

//     socket.on("message", (message)=>{
//         const parsed = JSON.parse(message.toString("utf-8"));
//         switch(parsed.type){
//             case "newMessage":
//                 sockets.forEach(aSocket=>aSocket.send(`${socket.nickname}: ${parsed.payload}`));
//             case "nickname":
//                 console.log(parsed.payload);
//                 socket["nickname"] = parsed.payload;
//         }
//     });
// });

httpServer.listen(3000, () => {
    console.log(`Listening on http://localhost:3000`)
});
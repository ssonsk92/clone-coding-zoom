const socket = io();

const welcome = document.getElementById('welcome');
const form = welcome.querySelector("form");
const room = document.getElementById('room');
room.hidden = true;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

form.addEventListener("submit", (event)=>{
    event.preventDefault();
    const roominput = form.querySelector("#roomName");
    const nicknameinput = form.querySelector("#nickname");

    socket.emit("enter_room", roominput.value, nicknameinput.value, ()=>{
        welcome.hidden = true;
        room.hidden = false;
        const h3 = room.querySelector("h3");
        h3.innerText = `Room ${roomName}`;
        const msgForm = room.querySelector("#msg");
        msgForm.addEventListener("submit", (event)=>{
             event.preventDefault();
             const input = room.querySelector("#msg input");
             socket.emit("new_message", input.value, roomName, ()=>{
                addMessage(`You: ${input.value}`);
             });
        });
    });
    roomName = roominput.value;
    roominput.value = "";
    nicknameinput.value = "";
});

socket.on("welcome", (user)=>{
    console.log("welcome");
    addMessage(`${user} joined`);
});

socket.on("bye", (left)=>{
    addMessage(`${left} left ㅜㅜ`);
});

socket.on("new_message", (msg)=>{addMessage(msg)});

socket.on("room_change", (rooms)=>{
    const roomList = welcome.querySelector("ul");
    if(rooms.length === 0){
        roomList.innerHTML = "";
        return;
    }
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.appendChild(li);
    });
});
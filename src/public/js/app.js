const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const socket = new WebSocket("ws://localhost:3000");

function makeMessage(type, payload){
    const msg = {type, payload};
    return JSON.stringify(msg);
}

socket.addEventListener("open", ()=>{
    console.log("Connected to Server");
});

socket.addEventListener("message", (message)=>{
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});

socket.addEventListener("close", ()=>{
    console.log("Disconnect from Server");
});

messageForm.addEventListener("submit", (event)=>{
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("newMessage", input.value));
    input.value = "";
});

nickForm.addEventListener('submit', (event)=>{
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value = "";
})
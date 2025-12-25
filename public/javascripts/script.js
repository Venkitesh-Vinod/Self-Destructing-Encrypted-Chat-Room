const socket = io();

// UI Elements
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");
const messageContainer = document.getElementById("message-container");
const roomList = document.getElementById("room-list");
const roomInput = document.getElementById("room-input");
const createRoomBtn = document.getElementById("create-room-btn");
const activeChatArea = document.getElementById("active-chat-area");
const noChatSelected = document.getElementById("no-chat-selected");

// App State
let userName = "Anonymous";
let hasAskedForName = false; // Tracking variable
let currentRoom = null;
const chatHistory = {}; // Stores { "roomName": [messageObjects] }

createRoomBtn.addEventListener("click", () => {
  const roomName = roomInput.value.trim();
  if (!roomName) return;
  
  if (!hasAskedForName) { // This logic only executes until hasAskedForName is true
    userName = prompt("What is your name?") || "Anonymous";
    hasAskedForName = true; // Now this block will never run again
  }
  joinRoom(roomName);
  roomInput.value = "";
});


function joinRoom(roomName) {
  if (currentRoom === roomName) return;

  // UI Switch: Show chat, hide placeholder
  if (noChatSelected) noChatSelected.style.display = "none";
  if (activeChatArea) activeChatArea.style.display = "flex";

  currentRoom = roomName;

  // Initialize history for the room if it's new
  if (!chatHistory[roomName]) {
    chatHistory[roomName] = [];
  }

  socket.emit("join-room", roomName);
  renderRooms();
  renderMessages(); // Refresh the message container for this room
}

function renderRooms() {
  roomList.innerHTML = "";
  Object.keys(chatHistory).forEach(room => {
    const div = document.createElement("div");
    div.textContent = room;
    div.className = "room-item" + (room === currentRoom ? " active" : "");
    div.onclick = () => joinRoom(room);
    roomList.appendChild(div);
  });
}

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentRoom) return;
  
  const message = messageInput.value.trim();
  if (message !== "") {
    socket.emit("send-chat-message", {
      room: currentRoom,
      name: userName,
      message: message
    });
    messageInput.value = "";
  }
});

socket.on("chat-message", data => {
  // 1. Store the message in the correct room history
  const roomName = data.room;
  if (!chatHistory[roomName]) {
    chatHistory[roomName] = [];
  }
  chatHistory[roomName].push(data);

  // 2. Only show on screen if it's the room we are currently looking at
  if (currentRoom === roomName) {
    appendMessage(data);
  } else {
    // Optional: Add a visual notification to the room in the sidebar
    renderRooms(); 
  }
});

function renderMessages() {
  messageContainer.innerHTML = "";
  const messages = chatHistory[currentRoom] || [];
  messages.forEach(msg => appendMessage(msg));
}

function appendMessage(data) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');

  const isMe = data.name === userName;
  messageElement.classList.add(isMe ? 'my-message' : 'other-message');

  const nameColor = isMe ? '#fdff00' : getColorForUser(data.name);

  messageElement.innerHTML = `
    <span class="name" style="color:${nameColor};font-size:small;text-align:right;">
      ${isMe ? 'You' : data.name}
    </span>
    <div class="text">${data.message}</div>
    <span class="time" style="text-align:right;">${data.time}</span>
  `;

  messageContainer.append(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

function getColorForUser(name) {
  const colors = ['#f3cdcd', '#71287e', '#1d05aa', '#8ce5e9', '#7bff85'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
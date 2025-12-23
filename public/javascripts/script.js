console.log("script loaded");
console.log(document.getElementById("send-container"));

const socket = io();

socket.on("connect", () => {
  // NOW the connection is guaranteed
  let userName = "Anonymous";

document.getElementById("send-container").addEventListener("click", () => {
  if (userName === "Anonymous") {
    userName = prompt("What is your name?") || "Anonymous";
  }
}, { once: true });


  const messageForm = document.getElementById("send-container");
  const messageInput = document.getElementById("message-input");
  const messageContainer = document.getElementById("message-container");

  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (message !== "") {
      socket.emit("send-chat-message", {
        name: userName,
        message: message,
      });
      messageInput.value = "";
    }
  });

  socket.on("chat-message", (data) => {
    appendMessage(data);
  });

function appendMessage(data) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    const isMe = data.name === userName;

    // position
    messageElement.classList.add(isMe ? 'my-message' : 'other-message');

    // name color (only for others)
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


});

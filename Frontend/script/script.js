let inputString = document.querySelector("#input");
let sendBtn = document.getElementById("send");

// Initial greeting
setTimeout(() => {
  showBot("Hi, need some medical suggestions?");
}, 500);

function showBot(text) {
  const chatList = document.getElementById("chats");

  const li = document.createElement("li");
  li.className = "bot";

  const div = document.createElement("div");
  div.className = "bot_text";
  div.textContent = text;

  li.appendChild(div);
  chatList.appendChild(li);
  li.scrollIntoView({ behavior: "smooth" });
}

function showUser(text) {
  const chatList = document.getElementById("chats");

  const li = document.createElement("li");
  li.className = "user";

  const div = document.createElement("div");
  div.className = "user_text";
  div.textContent = text;

  li.appendChild(div);
  chatList.appendChild(li);
  li.scrollIntoView({ behavior: "smooth" });

  setTimeout(() => botReply(text), 500);
}

async function botReply(userMessage) {
  const chatList = document.getElementById("chats");

  const li = document.createElement("li");
  li.className = "bot";

  const div = document.createElement("div");
  div.className = "bot_text";
  div.textContent = "Typing...";

  li.appendChild(div);
  chatList.appendChild(li);
  li.scrollIntoView({ behavior: "smooth" });

  try {
    const response = await fetch("http://localhost:5001/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await response.json();
    if (!data.reply) throw new Error("Invalid response");

    // ✅ Convert JSON → simple readable list
    let text = "";

    if (data.reply?.precautions?.length) {
      text += "Precautions:\n";
      data.reply.precautions.forEach((p, i) => {
        text += `${i + 1}. ${p}\n`;
      });
      text += "\n";
    }

    if (data.reply?.medicines?.length) {
      text += "Common medicines:\n";
      data.reply.medicines.forEach((m, i) => {
        text += `${i + 1}. ${m}\n`;
      });
      text += "\n";
    }

    if (data.reply?.warning) {
      text += `${data.reply.warning}`;
    }

    div.textContent = text.trim();
  } catch (err) {
    console.error("FRONTEND ERROR:", err);
    div.textContent = "OOPs! Medai's battery is low. Try again after a while.";
  }
}

// Send button
sendBtn.addEventListener("click", () => {
  const text = inputString.value.trim();
  if (!text) return;

  showUser(text);
  inputString.value = "";
});

// Enter key
inputString.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const text = inputString.value.trim();
    if (!text) return;

    showUser(text);
    inputString.value = "";
  }
});

// Back button
document.getElementById("medai").addEventListener("click", () => {
  window.open("landing.html", "_self");
});

require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const express = require("express");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const ADMIN_ID = process.env.ADMIN_ID;

const app = express();
app.get("/", (req, res) => res.send("Bot Running"));
app.listen(process.env.PORT || 3000);

// User Save
const userFile = "./users.json";

if (!fs.existsSync(userFile)) {
  fs.writeFileSync(userFile, JSON.stringify([]));
}

function saveUser(id) {
  let users = JSON.parse(fs.readFileSync(userFile));

  if (!users.includes(id)) {
    users.push(id);
    fs.writeFileSync(userFile, JSON.stringify(users));
  }
}

// Notice Message
const standbyMessage = `
✨ Welcome to Our Bot Service

The bot is currently under standby mode.
It will be fully operational at 9:00 PM.

Stay connected 💫
`;

bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  saveUser(chatId);

  if (msg.text && msg.text.startsWith("/")) {
    bot.sendMessage(chatId, standbyMessage);
  }
});

// Broadcast
bot.onText(/\/broadcast (.+)/, async (msg, match) => {
  if (msg.from.id != ADMIN_ID) return;

  const text = match[1];
  const users = JSON.parse(fs.readFileSync(userFile));

  for (let id of users) {
    try {
      await bot.sendMessage(id, text);
    } catch (e) {}
  }

  bot.sendMessage(msg.chat.id, "Broadcast Sent");
});

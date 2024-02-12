const express = require('express');
const fs = require('fs');
const { spawn } = require("child_process");
const chalk = require('chalk');
const path = require('path');
const axios = require("axios");
const app = express();

const config = require('./config.json'); 
const commandsPath = './script/commands'; 
const eventsPath = './script/events'; 

const getFilesCount = (dirPath) => {
  try {
    return fs.readdirSync(dirPath).length;
  } catch (e) {
    return 0;
  }
};

let startPingTime = Date.now();
let botStartTime = Date.now(); 

async function getBotInformation() {
  return {
    owner: {
      name: config.BOTOWNER,
      uid: config.ADMINUID,
    },
    bot: {
      name: config.BOTNAME,
      uid: config.ADMINUID,
      fmd: config.FCA,
      repl: config.REPL,
      lang: config.language,
      ping: Date.now() - startPingTime,
    },
    fca: {
      module: config.FCA,
    }
  };
}

function sendLiveData(socket) {
  setInterval(() => {
    const uptime = Date.now() - botStartTime;
    socket.emit('real-time-data', { uptime });
  }, 1000); 
}

app.get('/dashboard', async (req, res) => {
  const commandsCount = getFilesCount(commandsPath);
  const eventsCount = getFilesCount(eventsPath);
  const uptime = Date.now() - botStartTime;
  const botInformation = await getBotInformation();

  res.json({
    botPing: botInformation.bot.ping,
    botLang: botInformation.bot.lang,
    botRepl: botInformation.bot.repl,
    botFmd: botInformation.bot.fmd,
    botName: botInformation.bot.name,
    botUid: botInformation.bot.uid,
    ownerName: botInformation.owner.name,
    ownerUid: botInformation.owner.uid,
    prefix: config.PREFIX,
    commandsCount: commandsCount,
    eventsCount: eventsCount,
    uptime: uptime
  });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'harold.html')));

const http = require('http');
const { Server } = require("socket.io");
const httpServer = http.createServer(app);
const io = new Server(httpServer);

io.on('connection', (socket) => {
  console.log('New client connected');
  sendLiveData(socket);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

function startBot() {
  const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "jonell.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true
  });

  child.on("close", (codeExit) => {
    console.log(`Bot process exited with code: ${codeExit}`);
    if (codeExit !== 0) {
      setTimeout(startBot, 3000); 
    }
  });

  child.on("error", (error) => {
    console.error(`An error occurred starting the bot: ${error}`);
  });
}

startBot(); 

const port = process.env.PORT || 5050;
httpServer.listen(port, () => {
  console.log(`Server with real-time updates running on http://localhost:${port}`);
});

module.exports = app;

//Modified by Jonell Magallanes

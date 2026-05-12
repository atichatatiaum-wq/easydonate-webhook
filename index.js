const express = require("express");
const { Rcon } = require("rcon-client");

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.send("Webhook online"));

app.post("/webhook/easydonate", async (req, res) => {
  try {
    const player = "xLucrissx";

    const rcon = await Rcon.connect({
      host: process.env.MC_HOST,
      port: process.env.MC_RCON_PORT,
      password: process.env.MC_RCON_PASSWORD
    });

    await rcon.send(`give ${player} diamond 1`);
    await rcon.end();

    res.send("success");
  } catch (e) {
    res.status(500).send(e.message);
  }
});

app.listen(process.env.PORT || 3000);

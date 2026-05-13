const express = require("express");
const { Rcon } = require("rcon-client");

const app = express();
app.use(express.json());

// ─── RCON Config ────────────────────────────────────────────────────────────
const RCON_HOST = "pm2.mc4.in";
const RCON_PORT = 21697;
const RCON_PASSWORD = "0808";

// ─── Target Player ──────────────────────────────────────────────────────────
const PLAYER = "xLucrissx";

// ─── Buff/Debuff Command Pools ───────────────────────────────────────────────
// แต่ละ tier มีหลาย effect ให้ random 1 อันต่อโดเนท
const COMMAND_POOLS = {
  8: {
    label: "Mini Buff (30 วินาที)",
    commands: [
      `effect give ${PLAYER} minecraft:regeneration 30 0`,
      `effect give ${PLAYER} minecraft:speed 30 0`,
      `effect give ${PLAYER} minecraft:night_vision 30 0`,
      `effect give ${PLAYER} minecraft:jump_boost 30 0`,
      `effect give ${PLAYER} minecraft:saturation 1 10`,
    ],
  },
  9: {
    label: "Light Debuff (30 วินาที)",
    commands: [
      `effect give ${PLAYER} minecraft:slowness 30 0`,
      `effect give ${PLAYER} minecraft:darkness 30 0`,
      `effect give ${PLAYER} minecraft:blindness 30 0`,
      `effect give ${PLAYER} minecraft:glowing 30 0`,
      `effect give ${PLAYER} minecraft:hunger 30 0`,
    ],
  },
  14: {
    label: "Standard Buff (2 นาที)",
    commands: [
      `effect give ${PLAYER} minecraft:strength 120 0`,
      `effect give ${PLAYER} minecraft:resistance 120 0`,
      `effect give ${PLAYER} minecraft:fire_resistance 120 0`,
      `effect give ${PLAYER} minecraft:water_breathing 120 0`,
      `effect give ${PLAYER} minecraft:health_boost 120 1`,
    ],
  },
  15: {
    label: "Major Buff (5 นาที)",
    commands: [
      `effect give ${PLAYER} minecraft:haste 300 0`,
      `effect give ${PLAYER} minecraft:luck 300 0`,
      `effect give ${PLAYER} minecraft:absorption 300 1`,
      `effect give ${PLAYER} minecraft:slow_falling 300 0`,
      `effect give ${PLAYER} minecraft:invisibility 300 0`,
    ],
  },
  16: {
    label: "Heavy Debuff (60 วินาที)",
    commands: [
      `effect give ${PLAYER} minecraft:weakness 60 0`,
      `effect give ${PLAYER} minecraft:mining_fatigue 60 0`,
      `effect give ${PLAYER} minecraft:nausea 60 0`,
      `effect give ${PLAYER} minecraft:poison 60 0`,
      `effect give ${PLAYER} minecraft:unluck 60 0`,
    ],
  },
  20: {
    label: "Death Countdown Event",
    // Death event ใช้หลาย commands ตามลำดับ (ไม่ random)
    commands: null,
  },
};

// ─── Random Helper ───────────────────────────────────────────────────────────
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── RCON Executor ───────────────────────────────────────────────────────────
async function sendRcon(commands) {
  const rcon = new Rcon({
    host: RCON_HOST,
    port: RCON_PORT,
    password: RCON_PASSWORD,
  });

  try {
    await rcon.connect();
    console.log("[RCON] Connected");

    for (const cmd of commands) {
      const response = await rcon.send(cmd);
      console.log(`[RCON] >> ${cmd}`);
      if (response) console.log(`[RCON] << ${response}`);
    }
  } finally {
    await rcon.end();
    console.log("[RCON] Disconnected");
  }
}

// ─── Death Countdown Sequence ─────────────────────────────────────────────────
async function runDeathCountdown() {
  const rcon = new Rcon({
    host: RCON_HOST,
    port: RCON_PORT,
    password: RCON_PASSWORD,
  });

  try {
    await rcon.connect();
    console.log("[RCON] Death Countdown started");

    // แสดง Title แจ้งเตือน
    await rcon.send(
      `title ${PLAYER} title {"text":"☠ DEATH INCOMING ☠","color":"red","bold":true}`
    );
    await rcon.send(
      `title ${PLAYER} subtitle {"text":"คุณจะตายใน 10 วินาที!","color":"yellow"}`
    );

    // นับถอยหลัง 10 → 1 วินาที (ส่ง actionbar ทุกวินาที)
    for (let i = 10; i >= 1; i--) {
      await rcon.send(
        `title ${PLAYER} actionbar {"text":"💀 ${i}...","color":"${i <= 3 ? "red" : "gold"}","bold":true}`
      );
      await new Promise((r) => setTimeout(r, 1000));
    }

    // ฆ่าผู้เล่น
    await rcon.send(`kill ${PLAYER}`);
    console.log("[RCON] Death Countdown: kill executed");
  } finally {
    await rcon.end();
    console.log("[RCON] Disconnected after death event");
  }
}

// ─── Webhook Endpoint ────────────────────────────────────────────────────────
// URL: https://easydonate-webhook-production.up.railway.app/webhook/easydonate
app.post("/webhook/easydonate", async (req, res) => {
  console.log("[Webhook] Received:", JSON.stringify(req.body, null, 2));

  // EasyDonate ส่ง payload มาเป็น JSON
  // field ที่ใช้: payment.amount (หรือ amount) — ปรับตาม payload จริงของ EasyDonate
  const body = req.body;

  // รองรับหลาย format ที่ EasyDonate อาจส่งมา
  const amount =
    parseInt(body?.payment?.amount) ||
    parseInt(body?.amount) ||
    parseInt(body?.sum) ||
    parseInt(body?.price) ||
    null;

  if (!amount) {
    console.warn("[Webhook] ไม่พบจำนวนเงินใน payload");
    return res.status(400).json({ error: "Missing donation amount in payload" });
  }

  console.log(`[Webhook] Amount: ${amount} บาท`);

  const tier = COMMAND_POOLS[amount];

  if (!tier) {
    console.warn(`[Webhook] ไม่มี tier สำหรับ ${amount} บาท`);
    return res
      .status(200)
      .json({ message: `No tier configured for amount: ${amount}` });
  }

  console.log(`[Webhook] Tier: ${tier.label}`);

  try {
    if (amount === 20) {
      // Death Event — รัน countdown sequence แบบ async
      runDeathCountdown().catch((err) =>
        console.error("[RCON] Death countdown error:", err.message)
      );
      return res.status(200).json({
        success: true,
        tier: tier.label,
        player: PLAYER,
        event: "death_countdown",
      });
    }

    // Buff/Debuff — random 1 command จาก pool
    const chosenCommand = pickRandom(tier.commands);
    await sendRcon([chosenCommand]);

    return res.status(200).json({
      success: true,
      tier: tier.label,
      player: PLAYER,
      command: chosenCommand,
    });
  } catch (err) {
    console.error("[RCON] Error:", err.message);
    return res.status(500).json({ error: "RCON connection failed", detail: err.message });
  }
});

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "NightfallCraft Webhook Server is running",
    endpoint: "POST /webhook/easydonate",
    tiers: Object.entries(COMMAND_POOLS).map(([price, tier]) => ({
      price: `${price} บาท`,
      label: tier.label,
    })),
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Server] NightfallCraft Webhook running on port ${PORT}`);
  console.log(`[Server] Endpoint: POST /webhook/easydonate`);
  console.log(`[Server] RCON: ${RCON_HOST}:${RCON_PORT}`);
  console.log(`[Server] Target Player: ${PLAYER}`);
});

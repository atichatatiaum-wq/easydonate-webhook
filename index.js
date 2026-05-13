const express = require("express");
const { Rcon } = require("rcon-client");

const app = express();
app.use(express.json());

// ─── RCON Config ─────────────────────────────────────────────────────────────
const RCON_HOST = "pm2.mc4.in";
const RCON_PORT = 21697;
const RCON_PASSWORD = "0808";

// ─── Target Player ────────────────────────────────────────────────────────────
const PLAYER = "xLucrissx";

// ─── Helper: สุ่ม N อย่างไม่ซ้ำจาก array ─────────────────────────────────────
function pickRandom(arr, count = 1) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ─── Tier Pools ───────────────────────────────────────────────────────────────
const TIERS = {

  // ── TIER 1: MINI (สุ่ม 1 อย่าง, 30 วินาที) ──────────────────────────────
  8: {
    label: "Mini Buff (30 วินาที)",
    pick: 1,
    effects: [
      `effect give ${PLAYER} minecraft:speed 30 0`,
      `effect give ${PLAYER} minecraft:regeneration 30 0`,
      `effect give ${PLAYER} minecraft:jump_boost 30 0`,
      `effect give ${PLAYER} minecraft:night_vision 30 0`,
      `effect give ${PLAYER} minecraft:saturation 1 10`,
      `effect give ${PLAYER} minecraft:dolphins_grace 30 0`,
    ],
  },

  9: {
    label: "Mini Debuff (30 วินาที)",
    pick: 1,
    effects: [
      `effect give ${PLAYER} minecraft:slowness 30 0`,
      `effect give ${PLAYER} minecraft:blindness 30 0`,
      `effect give ${PLAYER} minecraft:darkness 30 0`,
      `effect give ${PLAYER} minecraft:glowing 30 0`,
      `effect give ${PLAYER} minecraft:mining_fatigue 30 0`,
      `effect give ${PLAYER} minecraft:nausea 30 0`,
    ],
  },

  // ── TIER 2: STANDARD (สุ่ม 2 อย่าง, 2 นาที) ─────────────────────────────
  14: {
    label: "Standard Buff (2 นาที)",
    pick: 2,
    effects: [
      `effect give ${PLAYER} minecraft:strength 120 0`,
      `effect give ${PLAYER} minecraft:resistance 120 0`,
      `effect give ${PLAYER} minecraft:fire_resistance 120 0`,
      `effect give ${PLAYER} minecraft:water_breathing 120 0`,
      `effect give ${PLAYER} minecraft:health_boost 120 1`,
      `effect give ${PLAYER} minecraft:haste 120 0`,
      `effect give ${PLAYER} minecraft:absorption 120 1`,
      `effect give ${PLAYER} minecraft:slow_falling 120 0`,
      `effect give ${PLAYER} minecraft:invisibility 120 0`,
      `effect give ${PLAYER} minecraft:luck 120 0`,
      `effect give ${PLAYER} minecraft:conduit_power 120 0`,
    ],
  },

  15: {
    label: "Standard Debuff (2 นาที)",
    pick: 2,
    effects: [
      `effect give ${PLAYER} minecraft:weakness 120 0`,
      `effect give ${PLAYER} minecraft:poison 120 0`,
      `effect give ${PLAYER} minecraft:slowness 120 1`,
      `effect give ${PLAYER} minecraft:mining_fatigue 120 2`,
      `effect give ${PLAYER} minecraft:darkness 120 0`,
      `effect give ${PLAYER} minecraft:blindness 120 0`,
      `effect give ${PLAYER} minecraft:nausea 120 0`,
      `effect give ${PLAYER} minecraft:unluck 120 0`,
      `effect give ${PLAYER} minecraft:levitation 10 0`,
    ],
  },

  // ── TIER 3: ULTIMATE ──────────────────────────────────────────────────────
  19: {
    label: "Full Blessing (90 วินาที)",
    pick: 0, // 0 = ส่งทุก effect พร้อมกัน
    effects: [
      `effect give ${PLAYER} minecraft:regeneration 90 1`,
      `effect give ${PLAYER} minecraft:resistance 90 1`,
      `effect give ${PLAYER} minecraft:strength 90 1`,
      `effect give ${PLAYER} minecraft:speed 90 1`,
      `effect give ${PLAYER} minecraft:absorption 90 0`,
      `effect give ${PLAYER} minecraft:fire_resistance 90 0`,
    ],
  },

  20: {
    label: "Death Countdown Event",
    pick: -1, // special handler
    effects: [],
  },
};

// ─── RCON Executor ────────────────────────────────────────────────────────────
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

    // เสียง Warden คำราม พร้อมกับขึ้น Title แจ้งเตือน
    await rcon.send(`playsound minecraft:entity.warden.roar master ${PLAYER}`);
    await rcon.send(
      `title ${PLAYER} title {"text":"☠ DEATH INCOMING ☠","color":"red","bold":true}`
    );
    await rcon.send(
      `title ${PLAYER} subtitle {"text":"คุณจะตายใน 10 วินาที!","color":"yellow"}`
    );

    // นับถอยหลัง 10 → 1
    for (let i = 10; i >= 1; i--) {
      await rcon.send(
        `title ${PLAYER} actionbar {"text":"💀 ${i}...","color":"${i <= 3 ? "red" : "gold"}","bold":true}`
      );
      await new Promise((r) => setTimeout(r, 1000));
    }

    // ฆ่าผู้เล่น
    await rcon.send(`kill ${PLAYER}`);
    console.log("[RCON] kill executed");

  } finally {
    await rcon.end();
    console.log("[RCON] Disconnected after death event");
  }
}

// ─── Webhook Endpoint ─────────────────────────────────────────────────────────
app.post("/webhook/easydonate", async (req, res) => {
  console.log("[Webhook] Received:", JSON.stringify(req.body, null, 2));

  const body = req.body;
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

  const tier = TIERS[amount];

  if (!tier) {
    console.warn(`[Webhook] ไม่มี tier สำหรับ ${amount} บาท`);
    return res.status(200).json({ message: `No tier configured for amount: ${amount}` });
  }

  console.log(`[Webhook] Tier: ${tier.label}`);

  try {
    // ── Death Event ──────────────────────────────────────────────────────────
    if (amount === 20) {
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

    // ── Full Blessing (ส่งทุก effect พร้อมกัน) ───────────────────────────────
    if (tier.pick === 0) {
      await sendRcon(tier.effects);
      return res.status(200).json({
        success: true,
        tier: tier.label,
        player: PLAYER,
        commands: tier.effects,
      });
    }

    // ── Buff/Debuff ปกติ (สุ่ม N อย่าง) ─────────────────────────────────────
    const chosen = pickRandom(tier.effects, tier.pick);
    await sendRcon(chosen);

    return res.status(200).json({
      success: true,
      tier: tier.label,
      player: PLAYER,
      commands: chosen,
    });

  } catch (err) {
    console.error("[RCON] Error:", err.message);
    return res.status(500).json({ error: "RCON connection failed", detail: err.message });
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "NightfallCraft Webhook Server is running",
    endpoint: "POST /webhook/easydonate",
    tiers: Object.entries(TIERS).map(([price, tier]) => ({
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

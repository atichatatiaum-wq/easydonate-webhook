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
      // Vanilla
      `effect give ${PLAYER} minecraft:speed 30 1`,
      `effect give ${PLAYER} minecraft:regeneration 30 1`,
      `effect give ${PLAYER} minecraft:jump_boost 30 1`,
      `effect give ${PLAYER} minecraft:night_vision 30 0`,
      `effect give ${PLAYER} minecraft:saturation 1 5`,
      `effect give ${PLAYER} minecraft:dolphins_grace 30 0`,
      `effect give ${PLAYER} minecraft:haste 30 1`,
      `effect give ${PLAYER} minecraft:instant_health 1 0`,
      // Alex's Mobs
      `effect give ${PLAYER} alexsmobs:clinging 30 0`,
      `effect give ${PLAYER} alexsmobs:fleet_footed 30 0`,
      `effect give ${PLAYER} alexsmobs:knockback_resistance 30 0`,
      `effect give ${PLAYER} alexsmobs:lava_vision 30 0`,
      `effect give ${PLAYER} alexsmobs:tigers_blessing 30 0`,
      // Mowzie's Mobs
      `effect give ${PLAYER} mowziesmobs:suns_blessing 30 0`,
    ],
  },

  9: {
    label: "Mini Debuff (30 วินาที)",
    pick: 1,
    effects: [
      // Vanilla
      `effect give ${PLAYER} minecraft:slowness 30 3`,
      `effect give ${PLAYER} minecraft:blindness 30 0`,
      `effect give ${PLAYER} minecraft:darkness 30 0`,
      `effect give ${PLAYER} minecraft:glowing 30 0`,
      `effect give ${PLAYER} minecraft:mining_fatigue 30 3`,
      `effect give ${PLAYER} minecraft:nausea 30 1`,
      `effect give ${PLAYER} minecraft:hunger 30 3`,
      `effect give ${PLAYER} minecraft:instant_damage 1 0`,
      // Alex's Mobs
      `effect give ${PLAYER} alexsmobs:debilitating_sting 30 0`,
      `effect give ${PLAYER} alexsmobs:ender_flu 30 0`,
      `effect give ${PLAYER} alexsmobs:fear 30 0`,
      // Iron's Spells
      `effect give ${PLAYER} irons_spellbooks:shocked 30 0`,
      `effect give ${PLAYER} irons_spellbooks:bleed 30 0`,
    ],
  },

  // ── TIER 2: STANDARD (สุ่ม 2 อย่าง, 2 นาที) ─────────────────────────────
  14: {
    label: "Standard Buff (2 นาที)",
    pick: 2,
    effects: [
      // Vanilla
      `effect give ${PLAYER} minecraft:strength 120 1`,
      `effect give ${PLAYER} minecraft:resistance 120 1`,
      `effect give ${PLAYER} minecraft:fire_resistance 120 0`,
      `effect give ${PLAYER} minecraft:water_breathing 120 0`,
      `effect give ${PLAYER} minecraft:health_boost 120 2`,
      `effect give ${PLAYER} minecraft:haste 120 1`,
      `effect give ${PLAYER} minecraft:absorption 120 2`,
      `effect give ${PLAYER} minecraft:slow_falling 120 0`,
      `effect give ${PLAYER} minecraft:invisibility 120 0`,
      `effect give ${PLAYER} minecraft:luck 120 2`,
      `effect give ${PLAYER} minecraft:conduit_power 120 0`,
      `effect give ${PLAYER} minecraft:hero_of_the_village 120 0`,
      // Alex's Mobs
      `effect give ${PLAYER} alexsmobs:orcas_might 120 0`,
      `effect give ${PLAYER} alexsmobs:soulsteal 120 0`,
      `effect give ${PLAYER} alexsmobs:sunbird_blessing 120 0`,
      // Iron's Spells
      `effect give ${PLAYER} irons_spellbooks:spell_power 120 0`,
      `effect give ${PLAYER} irons_spellbooks:mana_regen 120 0`,
    ],
  },

  15: {
    label: "Standard Debuff (2 นาที)",
    pick: 2,
    effects: [
      // Vanilla
      `effect give ${PLAYER} minecraft:weakness 120 2`,
      `effect give ${PLAYER} minecraft:poison 120 1`,
      `effect give ${PLAYER} minecraft:slowness 120 4`,
      `effect give ${PLAYER} minecraft:mining_fatigue 120 3`,
      `effect give ${PLAYER} minecraft:darkness 120 0`,
      `effect give ${PLAYER} minecraft:blindness 120 0`,
      `effect give ${PLAYER} minecraft:nausea 120 1`,
      `effect give ${PLAYER} minecraft:unluck 120 2`,
      `effect give ${PLAYER} minecraft:levitation 8 0`,
      `effect give ${PLAYER} minecraft:wither 120 1`,
      `effect give ${PLAYER} minecraft:hunger 120 4`,
      // Alex's Mobs
      `effect give ${PLAYER} alexsmobs:exsanguination 120 0`,
      `effect give ${PLAYER} alexsmobs:sunbird_curse 120 0`,
      // Iron's Spells
      `effect give ${PLAYER} irons_spellbooks:frozen 120 0`,
      `effect give ${PLAYER} irons_spellbooks:burning 120 0`,
      `effect give ${PLAYER} irons_spellbooks:silence 120 0`,
      // Mowzie's Mobs
      `effect give ${PLAYER} mowziesmobs:frozen 120 0`,
    ],
  },

  // ── TIER 3: ULTIMATE ──────────────────────────────────────────────────────
  19: {
    label: "Full Blessing (90 วินาที)",
    pick: 0, // ส่งทุก effect พร้อมกัน
    effects: [
      // Vanilla
      `effect give ${PLAYER} minecraft:regeneration 90 1`,
      `effect give ${PLAYER} minecraft:resistance 90 1`,
      `effect give ${PLAYER} minecraft:strength 90 1`,
      `effect give ${PLAYER} minecraft:speed 90 1`,
      `effect give ${PLAYER} minecraft:absorption 90 2`,
      `effect give ${PLAYER} minecraft:fire_resistance 90 0`,
      `effect give ${PLAYER} minecraft:health_boost 90 2`,
      `effect give ${PLAYER} minecraft:haste 90 1`,
      // Alex's Mobs
      `effect give ${PLAYER} alexsmobs:orcas_might 90 0`,
      `effect give ${PLAYER} alexsmobs:sunbird_blessing 90 0`,
      `effect give ${PLAYER} alexsmobs:tigers_blessing 90 0`,
      // Iron's Spells
      `effect give ${PLAYER} irons_spellbooks:spell_power 90 0`,
      `effect give ${PLAYER} irons_spellbooks:mana_regen 90 0`,
      // Mowzie's Mobs
      `effect give ${PLAYER} mowziesmobs:suns_blessing 90 0`,
      `summon minecraft:firework_rocket ~ ~1 ~ {FireworksItem:{...}}`,
      `playsound minecraft:item.totem.use master ${PLAYER}`,
      `particle minecraft:totem_of_undying ~ ~1 ~ 0.5 0.5 0.5 0.1 100`,
    ],
  },

  20: {
    label: "Death Countdown Event",
    pick: -1,
    effects: [],
  },
};

// ─── RCON: ส่ง command และ return response ───────────────────────────────────
async function sendRconWithResponse(rcon, cmd) {
  const response = await rcon.send(cmd);
  console.log(`[RCON] >> ${cmd}`);
  if (response) console.log(`[RCON] << ${response}`);
  return response || "";
}

// ─── RCON: ส่ง effects พร้อม retry ถ้าไม่ติด ────────────────────────────────
async function sendEffectsWithRetry(effectPool, count, maxAttempts = 20) {
  const rcon = new Rcon({
    host: RCON_HOST,
    port: RCON_PORT,
    password: RCON_PASSWORD,
    timeout: 15000,
  });

  const applied = [];
  const tried = new Set();

  try {
    await rcon.connect();
    console.log("[RCON] Connected");

    let attempts = 0;

    while (applied.length < count && attempts < maxAttempts) {
      const remaining = effectPool.filter((e) => !tried.has(e));
      if (remaining.length === 0) {
        console.warn("[RCON] หมด effect ที่ยังไม่ได้ลองแล้ว");
        break;
      }

      const cmd = pickRandom(remaining, 1)[0];
      tried.add(cmd);
      attempts++;

      const response = await sendRconWithResponse(rcon, cmd);

      if (response.toLowerCase().includes("unable to apply")) {
        console.warn(`[RCON] Effect ไม่ติด สุ่มใหม่... (${attempts}/${maxAttempts})`);
      } else {
        applied.push(cmd);
      }
    }

  } finally {
    await rcon.end();
    console.log("[RCON] Disconnected");
  }

  return applied;
}

// ─── RCON: ส่งทุก command ตรงๆ (Full Blessing) ───────────────────────────────
async function sendRcon(commands) {
  const rcon = new Rcon({
    host: RCON_HOST,
    port: RCON_PORT,
    password: RCON_PASSWORD,
    timeout: 15000,
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
    timeout: 30000,
  });

  try {
    await rcon.connect();
    console.log("[RCON] Death Countdown started");

    await rcon.send(`playsound minecraft:entity.warden.roar master ${PLAYER}`);
    await rcon.send(
      `title ${PLAYER} title {"text":"☠ DEATH INCOMING ☠","color":"red","bold":true}`
    );
    await rcon.send(
      `title ${PLAYER} subtitle {"text":"คุณจะตายใน 10 วินาที!","color":"yellow"}`
    );

    for (let i = 10; i >= 1; i--) {
      await rcon.send(
        `title ${PLAYER} actionbar {"text":"💀 ${i}...","color":"${i <= 3 ? "red" : "gold"}","bold":true}`
      );
      await new Promise((r) => setTimeout(r, 1000));
    }

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
  // ดึงชื่อและข้อความโดเนท
   const donatorName = body?.donatorName || "Someone";
   const donateMessage = body?.donateMessage || "";

  try {
    // แสดงชื่อคนโดเนทใน title
await sendRcon([
  `title ${PLAYER} title {"text":"${donatorName}","color":"gold","bold":true}`,
  `title ${PLAYER} subtitle {"text":"${tier.label}","color":"yellow"}`,
  `tellraw ${PLAYER} {"text":"[Donate] ${donatorName}: ${donateMessage}","color":"aqua"}`,
]);
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

    if (tier.pick === 0) {
      await sendRcon(tier.effects);
      return res.status(200).json({
        success: true,
        tier: tier.label,
        player: PLAYER,
        commands: tier.effects,
      });
    }

    const applied = await sendEffectsWithRetry(tier.effects, tier.pick);

    return res.status(200).json({
      success: true,
      tier: tier.label,
      player: PLAYER,
      commands: applied,
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

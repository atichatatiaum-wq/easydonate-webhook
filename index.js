const express = require("express");
const { Rcon } = require("rcon-client");
const app = express();
app.use(express.json());

// ================================================================
//
//   NightfallCraft — The Casket of Reveries
//   INTERACTIVE HORROR STREAM SYSTEM
//
//   TIER TABLE:
//   WHISPER      9 บาท  → atmosphere, fake horror, เบาๆ
//   OMEN        19 บาท  → gameplay pressure นิดหน่อย
//   CURSE       29 บาท  → challenge + impact
//   STRONG CURSE 39 บาท → cinematic panic, punishment
//   RARE CURSE   59 บาท → rare event, OH SH*T moments
//
// ================================================================

// ──────────────────────────────────────────────────────────────
//  CONFIG — แก้ตรงนี้เพื่อเปลี่ยนชื่อ player default
//  หาก EasyDonate ส่งชื่อ player มาในชื่อ field อื่น
//  ให้แก้ที่ฟังก์ชัน getPlayer() ด้านล่าง
// ──────────────────────────────────────────────────────────────
const DEFAULT_PLAYER = "xLucrissx";

// ──────────────────────────────────────────────────────────────
//  HELPERS
//  ไม่ต้องแก้ส่วนนี้ มันคือเครื่องมือที่ทุก tier ใช้ร่วมกัน
// ──────────────────────────────────────────────────────────────

async function runCommands(commands) {
  const rcon = await Rcon.connect({
    host: process.env.MC_HOST,
    port: Number(process.env.MC_RCON_PORT),
    password: process.env.MC_RCON_PASSWORD,
  });
  try {
    for (const cmd of commands) {
      await rcon.send(cmd);
      console.log("  ▶", cmd);
    }
  } finally {
    await rcon.end();
  }
}

// แทนชื่อ player ในคำสั่ง เช่น {player} → xLucrissx
function fill(commands, player) {
  return commands.map((c) => c.replaceAll("{player}", player));
}

// สุ่ม 1 อย่างจาก array
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// สุ่มว่าจะเกิดไหม เช่น chance(20) = 20% โอกาสเกิด
function chance(percent) {
  return Math.random() * 100 < percent;
}

// ดึงชื่อ player จาก payload
// ถ้า EasyDonate ใช้ชื่อ field อื่น ให้เพิ่ม req.body.FIELD_NAME ตรงนี้
function getPlayer(body) {
  return body.player_name || body.player || body.name || DEFAULT_PLAYER;
}


// ================================================================
//
//  TIER 1 — WHISPER (9 บาท)
//
//  เป้าหมาย: spam ได้, สร้าง atmosphere, psychological horror เบาๆ
//  ไม่มีผลกับ gameplay จริงๆ ใช้ title / subtitle / เสียง / message
//
//  วิธีเพิ่ม event ใหม่:
//  1. copy object { name, commands } ด้านล่าง
//  2. ตั้งชื่อ name ใหม่
//  3. แก้คำสั่งใน commands
//  4. วางต่อท้ายก่อน ] ปิด array
//
// ================================================================
const WHISPER = [

  {
    name: "dont_look_back",
    commands: [
      `title {player} times 5 60 15`,
      `title {player} title {"text":""}`,
      `title {player} subtitle {"text":"D O N ' T   L O O K   B A C K","color":"dark_gray","italic":true}`,
      `playsound minecraft:ambient.cave master {player} ~ ~ ~ 1 0.5`,
    ],
  },

  {
    name: "they_are_watching",
    commands: [
      `title {player} times 5 70 20`,
      `title {player} title {"text":""}`,
      `title {player} subtitle {"text":"T H E Y   A R E   W A T C H I N G","color":"gray","italic":true}`,
      `playsound minecraft:entity.enderman.stare master {player} ~ ~ ~ 0.6 0.7`,
    ],
  },

  {
    name: "not_alone",
    commands: [
      `title {player} times 5 60 15`,
      `title {player} title {"text":""}`,
      `title {player} subtitle {"text":"Y O U   W E R E   N O T   A L O N E","color":"dark_purple","italic":true}`,
      `playsound minecraft:entity.ghast.warn master {player} ~ ~ ~ 0.4 0.6`,
    ],
  },

  {
    name: "something_is_near",
    commands: [
      `title {player} times 5 50 15`,
      `title {player} title {"text":""}`,
      `title {player} subtitle {"text":"S O M E T H I N G   I S   N E A R","color":"dark_gray","italic":true}`,
      `playsound minecraft:ambient.cave master {player} ~ ~ ~ 0.8 0.4`,
      `playsound minecraft:entity.enderman.stare master {player} ~ ~ ~ 0.3 1.2`,
    ],
  },

  {
    name: "heartbeat",
    commands: [
      `title {player} times 2 20 5`,
      `title {player} actionbar {"text":"♥   .   .   .   ♥","color":"dark_red"}`,
      `playsound minecraft:block.note_block.basedrum master {player} ~ ~ ~ 0.7 0.5`,
    ],
  },

  {
    name: "watcher_message",
    commands: [
      `tellraw {player} [{"text":"[The Watcher]  ","color":"dark_purple","bold":true},{"text":"We see you... little wanderer.","color":"gray","italic":true}]`,
      `playsound minecraft:ambient.cave master {player} ~ ~ ~ 0.6 0.4`,
    ],
  },

  {
    name: "fake_danger_alert",
    // fake warning — ไม่มี danger จริง สร้าง paranoia
    commands: [
      `title {player} times 3 30 10`,
      `title {player} title {"text":"⚠ WARNING","color":"red","bold":true}`,
      `title {player} subtitle {"text":"... never mind.","color":"dark_gray","italic":true}`,
      `playsound minecraft:entity.experience_orb.pickup master {player} ~ ~ ~ 1 0.3`,
    ],
  },

];


// ================================================================
//
//  TIER 2 — OMEN (19 บาท)
//
//  เป้าหมาย: gameplay pressure เบาๆ ยังเล่นได้ลื่น
//  effect ระยะสั้น ไม่ toxic
//
// ================================================================
const OMEN = [

  {
    name: "cursed_vision",
    commands: [
      `title {player} times 8 40 10`,
      `title {player} title {"text":"✦ OMEN ✦","color":"dark_purple","bold":true}`,
      `title {player} subtitle {"text":"The darkness veils your sight...","color":"gray","italic":true}`,
      `effect give {player} minecraft:blindness 6 0`,
      `effect give {player} minecraft:slowness 8 0`,
      `playsound minecraft:entity.elder_guardian.curse master {player} ~ ~ ~ 1 0.8`,
    ],
  },

  {
    name: "weakened_soul",
    commands: [
      `title {player} times 8 40 10`,
      `title {player} title {"text":"✦ OMEN ✦","color":"dark_purple","bold":true}`,
      `title {player} subtitle {"text":"Your strength begins to fade...","color":"gray","italic":true}`,
      `effect give {player} minecraft:weakness 15 1`,
      `effect give {player} minecraft:mining_fatigue 12 0`,
      `playsound minecraft:entity.wither.ambient master {player} ~ ~ ~ 0.5 0.7`,
    ],
  },

  {
    name: "no_sprint",
    commands: [
      `title {player} times 8 50 10`,
      `title {player} title {"text":"✦ OMEN ✦","color":"dark_purple","bold":true}`,
      `title {player} subtitle {"text":"Something holds your legs...","color":"gray","italic":true}`,
      `effect give {player} minecraft:slowness 20 3`,
      `playsound minecraft:entity.enderman.teleport master {player} ~ ~ ~ 0.6 0.5`,
    ],
  },

  {
    name: "limited_healing",
    commands: [
      `title {player} times 8 40 10`,
      `title {player} title {"text":"✦ OMEN ✦","color":"dark_purple","bold":true}`,
      `title {player} subtitle {"text":"The curse resists your healing...","color":"gray","italic":true}`,
      `effect give {player} minecraft:hunger 18 2`,
      `effect give {player} minecraft:weakness 12 0`,
      `playsound minecraft:entity.wither.hurt master {player} ~ ~ ~ 0.4 0.9`,
    ],
  },

];


// ================================================================
//
//  TIER 3 — CURSE (29 บาท)
//
//  เป้าหมาย: tier หลักของ stream มี impact มี challenge
//  ยังไม่ทำลายเกม แต่รู้สึกถึงแรงกดดัน
//  มีทั้ง challenge แบบ "ห้ามหยุด" และ fake boss warning
//
// ================================================================
const CURSE = [

  {
    name: "darkness_heartbeat",
    commands: [
      `title {player} times 5 60 15`,
      `title {player} title {"text":"⚠ CURSE ⚠","color":"dark_red","bold":true}`,
      `title {player} subtitle {"text":"The darkness breathes...","color":"dark_gray","italic":true}`,
      `effect give {player} minecraft:darkness 25 1`,
      `effect give {player} minecraft:slowness 20 1`,
      `playsound minecraft:ambient.cave master {player} ~ ~ ~ 1 0.3`,
      `playsound minecraft:block.note_block.basedrum master {player} ~ ~ ~ 1 0.4`,
      `playsound minecraft:entity.elder_guardian.curse master {player} ~ ~ ~ 0.8 0.6`,
    ],
  },

  {
    name: "dont_stop_moving",
    // challenge: อย่าหยุดเดิน (honor system — ทำให้หยุดไม่ได้สบายๆ)
    commands: [
      `title {player} times 5 70 15`,
      `title {player} title {"text":"⚠ CURSE ⚠","color":"dark_red","bold":true}`,
      `title {player} subtitle {"text":"D O N ' T   S T O P   M O V I N G","color":"dark_gray","bold":true}`,
      `tellraw {player} [{"text":"[The Watcher]  ","color":"dark_purple","bold":true},{"text":"Keep moving. If you stop... we will know.","color":"dark_red","italic":true}]`,
      `effect give {player} minecraft:slowness 30 1`,
      `playsound minecraft:entity.elder_guardian.curse master {player} ~ ~ ~ 1 0.5`,
      `weather thunder`,
    ],
  },

  {
    name: "fake_boss_warning",
    // fake warning — ไม่มี boss จริง แต่สร้าง paranoia
    commands: [
      `title {player} times 3 50 15`,
      `title {player} title {"text":"⚠ INCOMING ⚠","color":"red","bold":true}`,
      `title {player} subtitle {"text":"Something is coming for you...","color":"dark_gray","italic":true}`,
      `playsound minecraft:entity.ender_dragon.growl master {player} ~ ~ ~ 1 0.6`,
      `playsound minecraft:entity.wither.ambient master {player} ~ ~ ~ 0.6 0.5`,
      `weather thunder`,
      `tellraw {player} [{"text":"[The Watcher]  ","color":"dark_purple","bold":true},{"text":"Pray it does not find you.","color":"gray","italic":true}]`,
    ],
  },

  {
    name: "no_healing_challenge",
    commands: [
      `title {player} times 5 60 15`,
      `title {player} title {"text":"⚠ CURSE ⚠","color":"dark_red","bold":true}`,
      `title {player} subtitle {"text":"No healing. 20 seconds.","color":"dark_gray","italic":true}`,
      `effect give {player} minecraft:hunger 20 4`,
      `effect give {player} minecraft:weakness 20 2`,
      `effect give {player} minecraft:darkness 20 1`,
      `playsound minecraft:entity.elder_guardian.curse master {player} ~ ~ ~ 1 0.6`,
    ],
  },

  {
    name: "wrong_direction",
    commands: [
      `title {player} times 5 70 15`,
      `title {player} title {"text":"⚠ CURSE ⚠","color":"dark_red","bold":true}`,
      `title {player} subtitle {"text":"Turn back. Go the other way.","color":"dark_gray","italic":true}`,
      `tellraw {player} [{"text":"[The Watcher]  ","color":"dark_purple","bold":true},{"text":"You are going the wrong way. Turn back NOW.","color":"dark_red","italic":true}]`,
      `effect give {player} minecraft:slowness 25 2`,
      `playsound minecraft:entity.enderman.stare master {player} ~ ~ ~ 0.8 0.6`,
    ],
  },

];


// ================================================================
//
//  TIER 4 — STRONG CURSE (39 บาท)
//
//  เป้าหมาย: cinematic pressure, intense reactions
//  มี buildup sequence, punishment, panic moments
//
// ================================================================
const STRONG_CURSE = [

  {
    name: "watcher_arrival",
    // sequence หลายขั้นตอน — watcher "มาถึง"
    commands: [
      // ขั้น 1: warning
      `title {player} times 3 40 10`,
      `title {player} title {"text":"! ! !","color":"dark_red","bold":true}`,
      `title {player} subtitle {"text":"They are approaching...","color":"gray","italic":true}`,
      `playsound minecraft:entity.enderman.stare master {player} ~ ~ ~ 1 0.5`,
      // ขั้น 2: ผลกระทบ
      `effect give {player} minecraft:darkness 40 2`,
      `effect give {player} minecraft:weakness 40 2`,
      `effect give {player} minecraft:slowness 40 2`,
      `weather thunder`,
      `time set midnight`,
      // ขั้น 3: watcher message
      `tellraw {player} [{"text":"[The Watcher]  ","color":"dark_purple","bold":true},{"text":"We have arrived.","color":"dark_red","italic":true,"bold":true}]`,
      `playsound minecraft:entity.elder_guardian.curse master {player} ~ ~ ~ 1 0.4`,
      `playsound minecraft:entity.wither.ambient master {player} ~ ~ ~ 0.6 0.6`,
    ],
  },

  {
    name: "false_safety",
    // fake: บอกว่าปลอดภัย จากนั้น...
    commands: [
      `title {player} times 5 50 10`,
      `title {player} title {"text":"You are safe.","color":"green","italic":true}`,
      `title {player} subtitle {"text":"...for now.","color":"dark_gray","italic":true}`,
      `playsound minecraft:entity.experience_orb.pickup master {player} ~ ~ ~ 1 1`,
      // หยุดสักครู่แล้ว strike
      `effect give {player} minecraft:darkness 35 2`,
      `effect give {player} minecraft:nausea 15 1`,
      `effect give {player} minecraft:weakness 30 2`,
      `weather thunder`,
      `title {player} times 2 30 10`,
      `title {player} title {"text":"L  I  A  R","color":"dark_red","bold":true}`,
      `title {player} subtitle {"text":"","color":"black"}`,
      `playsound minecraft:entity.elder_guardian.curse master {player} ~ ~ ~ 1 0.5`,
    ],
  },

  {
    name: "panic_sequence",
    commands: [
      `title {player} times 3 40 5`,
      `title {player} title {"text":"☽ PANIC ☽","color":"dark_red","bold":true}`,
      `title {player} subtitle {"text":"THERE IS NO ESCAPE","color":"black","bold":true}`,
      `effect give {player} minecraft:nausea 12 1`,
      `effect give {player} minecraft:darkness 40 2`,
      `effect give {player} minecraft:weakness 40 2`,
      `effect give {player} minecraft:slowness 40 3`,
      `effect give {player} minecraft:hunger 25 2`,
      `weather thunder`,
      `time set midnight`,
      `playsound minecraft:entity.elder_guardian.curse master {player} ~ ~ ~ 1 0.4`,
      `playsound minecraft:entity.wither.ambient master {player} ~ ~ ~ 0.8 0.5`,
      `tellraw {player} [{"text":"[The Watcher]  ","color":"dark_purple","bold":true},{"text":"Panic is natural. It will not save you.","color":"dark_red","italic":true}]`,
    ],
  },

  {
    name: "hunted_state",
    commands: [
      `title {player} times 3 60 15`,
      `title {player} title {"text":"☽ HUNTED ☽","color":"dark_red","bold":true}`,
      `title {player} subtitle {"text":"It has found your scent.","color":"dark_gray","italic":true}`,
      `effect give {player} minecraft:darkness 50 2`,
      `effect give {player} minecraft:slowness 45 1`,
      `effect give {player} minecraft:weakness 45 2`,
      `weather thunder`,
      `time set midnight`,
      `playsound minecraft:entity.wither.spawn master {player} ~ ~ ~ 0.5 0.7`,
      `tellraw {player} [{"text":"[The Watcher]  ","color":"dark_purple","bold":true},{"text":"Run. Don't look back.","color":"dark_red","italic":true}]`,
    ],
  },

];


// ================================================================
//
//  TIER 5 — RARE CURSE (59 บาท)
//
//  เป้าหมาย: rare cinematic event, OH SH*T moments
//  ต้องมี buildup, ต้องมี warning, ไม่ใช่ random death เฉยๆ
//
//  สูตร: WARNING → CHALLENGE → PANIC → (FAIL → DEATH)
//
//  หมายเหตุ: event เหล่านี้ "เสนอ" การตาย ถ้าทำ challenge ไม่ผ่าน
//  แต่เนื่องจาก honor system คนดูจะรู้ว่าถ้าไม่ผ่าน = จะตาย
//  ซึ่งสร้าง tension มากกว่าการตายโดย random
//
// ================================================================
const RARE_CURSE = [

  {
    name: "the_watchers_have_arrived",
    // CHALLENGE: survive 20 วินาที no sprint
    commands: [
      // WARNING
      `title {player} times 3 50 10`,
      `title {player} title {"text":"⚠ T H E   W A T C H E R S ⚠","color":"dark_purple","bold":true}`,
      `title {player} subtitle {"text":"THEY HAVE ARRIVED","color":"dark_red","bold":true}`,
      `playsound minecraft:entity.wither.spawn master {player} ~ ~ ~ 1 0.5`,
      `weather thunder`,
      `time set midnight`,
      // CHALLENGE
      `effect give {player} minecraft:darkness 30 2`,
      `effect give {player} minecraft:slowness 25 4`,
      `effect give {player} minecraft:weakness 25 2`,
      `tellraw {player} [{"text":"[The Watcher]  ","color":"dark_purple","bold":true},{"text":"Survive 20 seconds. Do. Not. Sprint.","color":"dark_red","italic":true,"bold":true}]`,
      `playsound minecraft:entity.elder_guardian.curse master {player} ~ ~ ~ 1 0.4`,
      `playsound minecraft:ambient.cave master {player} ~ ~ ~ 1 0.3`,
    ],
  },

  {
    name: "dont_turn_around",
    // CHALLENGE: 20 วินาทีห้ามหันหลัง (honor system)
    commands: [
      `title {player} times 3 60 15`,
      `title {player} title {"text":"☽ RARE EVENT ☽","color":"dark_purple","bold":true}`,
      `title {player} subtitle {"text":"DO NOT TURN AROUND","color":"dark_red","bold":true}`,
      `tellraw {player} [{"text":"[The Watcher]  ","color":"dark_purple","bold":true},{"text":"For 20 seconds — DO NOT turn around. It is right behind you.","color":"dark_red","italic":true}]`,
      `playsound minecraft:entity.enderman.stare master {player} ~ ~ ~ 1 0.4`,
      `effect give {player} minecraft:darkness 25 1`,
      `effect give {player} minecraft:slowness 20 1`,
      `weather thunder`,
      `playsound minecraft:ambient.cave master {player} ~ ~ ~ 1 0.2`,
      `playsound minecraft:entity.elder_guardian.curse master {player} ~ ~ ~ 0.7 0.5`,
    ],
  },

  {
    name: "the_hunt_begins",
    // CHALLENGE: ห้ามหยุดเดิน ถ้าหยุด = death
    commands: [
      `title {player} times 3 60 15`,
      `title {player} title {"text":"☽ THE HUNT ☽","color":"dark_red","bold":true}`,
      `title {player} subtitle {"text":"DO NOT STOP MOVING","color":"black","bold":true}`,
      `weather thunder`,
      `time set midnight`,
      `effect give {player} minecraft:darkness 40 2`,
      `effect give {player} minecraft:weakness 35 2`,
      `playsound minecraft:entity.wither.spawn master {player} ~ ~ ~ 0.6 0.6`,
      `tellraw {player} [{"text":"[The Watcher]  ","color":"dark_purple","bold":true},{"text":"It hunts by stillness. KEEP MOVING. If you stop... IT FOUND YOU.","color":"dark_red","italic":true,"bold":true}]`,
      `playsound minecraft:entity.elder_guardian.curse master {player} ~ ~ ~ 1 0.4`,
    ],
  },

  {
    name: "the_offering",
    // CHALLENGE: ต้องทิ้ง item 1 ชิ้น (honor system)
    commands: [
      `title {player} times 3 70 20`,
      `title {player} title {"text":"☽ THE OFFERING ☽","color":"gold","bold":true}`,
      `title {player} subtitle {"text":"Drop one item. Now.","color":"dark_red","italic":true}`,
      `tellraw {player} [{"text":"[The Casket]  ","color":"gold","bold":true},{"text":"An offering is required. Drop one item from your inventory... or face the consequence.","color":"dark_red","italic":true}]`,
      `playsound minecraft:entity.elder_guardian.curse master {player} ~ ~ ~ 1 0.5`,
      `playsound minecraft:ambient.cave master {player} ~ ~ ~ 1 0.3`,
      `effect give {player} minecraft:darkness 20 1`,
      `weather thunder`,
    ],
  },

  {
    name: "cursed_coinflip",
    // 50/50: survive หรือ die
    commands: [
      `title {player} times 3 60 15`,
      `title {player} title {"text":"☽ COINFLIP ☽","color":"gold","bold":true}`,
      `title {player} subtitle {"text":"Fate decides.","color":"gray","italic":true}`,
      `playsound minecraft:entity.elder_guardian.curse master {player} ~ ~ ~ 1 0.5`,
      `effect give {player} minecraft:darkness 15 1`,
      `tellraw {player} [{"text":"[The Watcher]  ","color":"dark_purple","bold":true},{"text":"50/50. Survive... or perish. The Casket has already decided.","color":"dark_red","italic":true}]`,
    ],
  },

  {
    name: "false_exit",
    // fake: บอกว่าออกได้ จากนั้น TOO LATE
    commands: [
      `title {player} times 5 60 15`,
      `title {player} title {"text":"","color":"green"}`,
      `title {player} subtitle {"text":"Leave now.","color":"green","italic":true}`,
      `playsound minecraft:entity.experience_orb.pickup master {player} ~ ~ ~ 1 1`,
      `effect give {player} minecraft:darkness 40 3`,
      `effect give {player} minecraft:weakness 40 2`,
      `effect give {player} minecraft:slowness 40 2`,
      `weather thunder`,
      `time set midnight`,
      `title {player} times 2 40 10`,
      `title {player} title {"text":"T O O   L A T E","color":"dark_red","bold":true}`,
      `title {player} subtitle {"text":"You should have left sooner.","color":"dark_gray","italic":true}`,
      `playsound minecraft:entity.wither.spawn master {player} ~ ~ ~ 1 0.5`,
      `tellraw {player} [{"text":"[The Watcher]  ","color":"dark_purple","bold":true},{"text":"You hesitated. Now you belong to the Casket.","color":"dark_red","italic":true}]`,
    ],
  },

];


// ================================================================
//
//  TIER SELECTOR
//  เลือก tier จากยอดโดเนท
//
//  ถ้าอยากเปลี่ยนยอดเงิน แก้ตัวเลข >= ด้านล่าง
//  เช่น อยากให้ WHISPER เริ่มที่ 5 บาท แก้เป็น amount >= 5
//
// ================================================================
function selectTier(amount) {
  if (amount >= 59) return { tier: "RARE CURSE",   events: RARE_CURSE };
  if (amount >= 39) return { tier: "STRONG CURSE", events: STRONG_CURSE };
  if (amount >= 29) return { tier: "CURSE",        events: CURSE };
  if (amount >= 19) return { tier: "OMEN",         events: OMEN };
  if (amount >= 9)  return { tier: "WHISPER",      events: WHISPER };
  return null;
}


// ================================================================
//
//  RARE UPGRADE SYSTEM
//  ทุก tier มีโอกาสได้ upgrade เป็น tier สูงกว่า
//  สร้าง anticipation — คนดูลุ้นว่าจะ upgrade ไหม
//
//  ถ้าอยากเปลี่ยน % โอกาส แก้ตัวเลข chance ด้านล่าง
//
// ================================================================
function applyUpgrade(tier, events) {
  const table = {
    "WHISPER":      { chance: 20, next: "OMEN",         nextEvents: OMEN },
    "OMEN":         { chance: 15, next: "CURSE",        nextEvents: CURSE },
    "CURSE":        { chance: 10, next: "STRONG CURSE", nextEvents: STRONG_CURSE },
    "STRONG CURSE": { chance: 10, next: "RARE CURSE",   nextEvents: RARE_CURSE },
  };

  const upgrade = table[tier];
  if (upgrade && chance(upgrade.chance)) {
    console.log(`⭐ RARE UPGRADE: ${tier} → ${upgrade.next}`);
    return { tier: upgrade.next, events: upgrade.nextEvents, upgraded: true };
  }
  return { tier, events, upgraded: false };
}


// ================================================================
//
//  WEBHOOK ENDPOINT
//  รับ POST จาก EasyDonate แล้วรันระบบทั้งหมด
//  ไม่ต้องแก้ส่วนนี้ ยกเว้นจะเพิ่ม field จาก EasyDonate
//
// ================================================================
app.post("/webhook/easydonate", async (req, res) => {
  try {
    console.log("\n📦 Payload รับมา:", JSON.stringify(req.body, null, 2));

    const amount    = Math.round(Number(req.body.amount));
    const player    = getPlayer(req.body);
    const donorName = req.body.name || player;

    console.log(`💰 Amount: ${amount}฿  |  👤 Player: ${player}`);

    // 1. เลือก tier
    const selected = selectTier(amount);
    if (!selected) {
      console.log("⚠ ยอดต่ำกว่า 9 บาท — ไม่เข้า tier ใด");
      return res.status(200).send("amount below minimum");
    }

    // 2. ลอง rare upgrade
    const { tier, events, upgraded } = applyUpgrade(selected.tier, selected.events);

    // 3. สุ่ม event
    const event    = pick(events);
    const commands = fill(event.commands, player);

    // 4. Broadcast ให้ทั้งเซิร์ฟเห็น
    const tierColor = {
      "WHISPER":      "gray",
      "OMEN":         "dark_purple",
      "CURSE":        "dark_red",
      "STRONG CURSE": "red",
      "RARE CURSE":   "gold",
    }[tier] || "white";

    const broadcast = upgraded
      ? `tellraw @a [{"text":"[NightfallCraft] ","color":"gold","bold":true},{"text":"${donorName}","color":"yellow"},{"text":" triggered ","color":"gray"},{"text":"★ RARE ${tier} ★","color":"${tierColor}","bold":true}]`
      : `tellraw @a [{"text":"[NightfallCraft] ","color":"dark_purple","bold":true},{"text":"${donorName}","color":"gray"},{"text":" awakened ","color":"gray"},{"text":"${tier}","color":"${tierColor}","bold":true}]`;

    commands.unshift(broadcast);

    // 5. รัน
    console.log(`\n🌑 Tier: ${tier}  |  Event: ${event.name}  |  Upgraded: ${upgraded}`);
    await runCommands(commands);

    res.send("success");
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).send("error");
  }
});


// Health check
app.get("/", (req, res) => {
  res.send(`
    <pre style="font-family:monospace;background:#111;color:#aaa;padding:20px;">
NightfallCraft — Interactive Horror Stream System
══════════════════════════════════════════════════
  WHISPER       9฿+   atmosphere / fake horror
  OMEN         19฿+   gameplay pressure เบาๆ
  CURSE        29฿+   challenge + impact
  STRONG CURSE 39฿+   cinematic panic
  RARE CURSE   59฿+   OH SH*T moments (rare)

Status: ONLINE ✓
    </pre>
  `);
});


app.listen(process.env.PORT || 3000, () => {
  console.log("🌑 NightfallCraft Webhook Server — Online");
});

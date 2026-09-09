import React, { useState, useEffect, useMemo, useRef } from "react";
import * as XLSX from "xlsx";

/* โลโก้ประจำแอป — ไฟล์อยู่ในโฟลเดอร์ public/ */
const LOGO = "/logo-logbook.png";
const LOGO_DIARY = "/logo-diary.png";

function Mascot({ size = 64, dim = false, variant = "logbook" }) {
  return (
    <img
      src={variant === "diary" ? LOGO_DIARY : LOGO}
      alt=""
      className={"mascot" + (dim ? " mascot-dim" : "")}
      style={{ width: size, height: size }}
      draggable="false"
    />
  );
}

/* ================================================================== */
/* Constants                                                          */
/* ================================================================== */

const NEURO_CATEGORIES = [
  "Supratentorial",
  "Infratentorial",
  "Cerebrovascular surgery",
  "Traumatic brain injury",
  "Spinal cord injury",
  "Spine surgery",
  "Pediatric neurosurgery",
  "Neurointervention",
  "Epilepsy surgery",
  "Awake craniotomy",
  "Others",
];

const SERVICES = [
  "Neuroanesthesia",
  "General surgery",
  "Orthopedics",
  "ENT",
  "OB-GYN",
  "Cardiothoracic",
  "Pediatric surgery",
  "Urology",
  "Ophthalmology",
  "Plastic surgery",
  "NORA / Out-of-OR",
  "Others",
];

const IONM_MODALITIES = ["MEP", "SSEP", "VEP", "BAEP", "Cranial nerve", "Others"];
const POSITIONS = [
  "Supine",
  "Prone",
  "Lateral decubitus",
  "Park-bench",
  "Beach-chair",
  "Sitting",
  "Jack-knife",
  "Others",
];
const GA_PLANS = ["OPFR", "ODFR", "OSFR", "Others"];
const TECHNIQUES = [
  "GA",
  "Spinal anesthesia",
  "RA (block)",
  "Epidural anesthesia",
  "IV sedation",
  "MAC",
];
const ETT_TYPES = ["Standard", "Reinforced", "RAE", "Others"];
const LINE_KEYS = [
  { key: "aline", label: "A-line" },
  { key: "cline", label: "C-line" },
  { key: "piv", label: "PIV" },
];
const SPECIAL_MED_KEYS = [
  { key: "vasopressor", label: "Vasopressor / inotrope" },
  { key: "hyperosmotic", label: "Hyperosmotic agent" },
  { key: "steroid", label: "Steroid" },
  { key: "antibiotic", label: "Antibiotic" },
  { key: "others", label: "Others" },
];
const IV_AGENTS = [
  { key: "propofol", label: "Propofol" },
  { key: "remimazolam", label: "Remimazolam" },
  { key: "dexmedetomidine", label: "Dexmedetomidine" },
];
const VOLATILES = [
  { key: "sevoflurane", label: "Sevoflurane" },
  { key: "desflurane", label: "Desflurane" },
  { key: "n2o", label: "with N₂O" },
];
const RELAXANTS = [
  { key: "rocuronium", label: "Rocuronium" },
  { key: "cisatracurium", label: "Cisatracurium" },
  { key: "atracurium", label: "Atracurium" },
  { key: "succinylcholine", label: "Succinylcholine" },
];
const OPIOIDS = [
  { key: "fentanyl", label: "Fentanyl" },
  { key: "morphine", label: "Morphine" },
  { key: "pethidine", label: "Pethidine" },
];

/* อารมณ์ = ลูกแก้วสี */
const MOOD_ORBS = [
  { id: "bright", label: "ใจฟู", c1: "#FFD9E8", c2: "#F58FB8" },
  { id: "warm", label: "อบอุ่น", c1: "#FFE3CC", c2: "#F0A971" },
  { id: "calm", label: "สงบ", c1: "#DFF3EC", c2: "#82C7B0" },
  { id: "float", label: "ล่องลอย", c1: "#E4EEFB", c2: "#8FB6E4" },
  { id: "plain", label: "เฉยๆ", c1: "#F2EFF4", c2: "#C6BCCF" },
  { id: "tired", label: "เหนื่อย", c1: "#EBE2F7", c2: "#A98CD6" },
  { id: "blue", label: "ใจฝนตก", c1: "#DFE6F5", c2: "#7C8FC4" },
  { id: "cross", label: "หงุดหงิด", c1: "#FFDCD4", c2: "#E9887A" },
  { id: "proud", label: "ภูมิใจ", c1: "#FFEFC9", c2: "#EFC46F" },
];

const TAGS = ["สำคัญ", "ได้เรียนรู้", "ขอบคุณ", "เหนื่อยมาก", "ต้องทบทวน", "วันของเรา"];

const STORE_KEYS = {
  cases: "anes:logbook_cases",
  diary: "anes:diary_entries",
  settings: "anes:logbook_settings",
};

const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const orbOf = (id) => MOOD_ORBS.find((m) => m.id === id);

const drugMap = (list, extra) =>
  Object.fromEntries(list.map((d) => [d.key, { on: false, ...extra }]));

const emptyCase = () => ({
  id: uid(),
  createdAt: new Date().toISOString(),
  date: today(),
  hn: "",
  firstName: "",
  lastName: "",
  sex: "",
  age: "",
  ageUnit: "years",
  bw: "",
  height: "",
  asa: "",
  asaE: false,
  underlying: "",
  preop: {
    difficultAirway: { on: false, detail: "" },
    allergy: { on: false, detail: "" },
    aspiration: false,
    emergency: false,
    trauma: false,
    others: { on: false, detail: "" },
  },
  diagnosis: "",
  operation: "",
  service: "Neuroanesthesia",
  serviceOther: "",
  category: "",
  categoryOther: "",
  specialMonitoring: "",
  ionmOn: false,
  ionm: {
    MEP: false,
    SSEP: false,
    VEP: false,
    BAEP: false,
    "Cranial nerve": false,
    Others: false,
  },
  ionmCnDetail: "",
  ionmOtherDetail: "",
  gaPlan: "",
  gaPlanOther: "",
  techniques: [],
  sedationDetail: "",
  position: "",
  positionOther: "",
  ra: { sab: false, epidural: false, block: false, site: "", drugs: "", catheter: "" },
  lines: {
    aline: { on: false, site: "", count: "", size: "" },
    cline: { on: false, site: "", count: "", size: "" },
    piv: { on: false, site: "", count: "", size: "" },
  },

  /* induction */
  ind: {
    modes: [], // Bolus / TIVA / Inhalation
    bolusDetail: "",
    tivaMode: "", // TCI / Infusion
    tivaDrugs: drugMap(IV_AGENTS, { detail: "" }),
    inh: { sevoflurane: false, desflurane: false, n2o: false, fio2: "" },
  },

  /* airway */
  airwayType: "ETT",
  ettTypes: [],
  ettOther: "",
  ettSize: "",
  cuff: { value: "", unit: "ml" },
  cuffMl: "",
  cuffPressure: "",
  lmaType: "",
  lmaSize: "",
  airwayOther: "",
  device: "",
  bladeNo: "",
  fiberopticNo: "",
  airwayDetail: "",

  /* maintenance */
  maint: {
    modes: [], // TIVA / Inhalation
    inh: { sevoflurane: false, desflurane: false, n2o: false, mac: "", fio2: "", flow: "", note: "" },
    tiva: { drugs: drugMap(IV_AGENTS, { mode: "", value: "" }), note: "" },
  },
  relaxants: drugMap(RELAXANTS, { dose: "" }),
  relaxantNote: "",
  reversal: "",
  opioids: drugMap(OPIOIDS, { total: "" }),
  remifentanil: { on: false, range: "" },
  analgesia: {
    paracetamol: false,
    nsaids: { on: false, detail: "" },
    nefopam: false,
    ra: { on: false, type: "", drugs: "" },
    others: { on: false, detail: "" },
    postop: { ivpca: false, pcea: false, others: false, othersDetail: "" },
  },
  ponv: "",
  meds: {
    vasopressor: { on: false, detail: "" },
    hyperosmotic: { on: false, detail: "" },
    steroid: { on: false, detail: "" },
    antibiotic: { on: false, detail: "" },
    others: { on: false, detail: "" },
  },
  hemoGoal: "",
  endAirway: "",
  postop: "",
  postopDetail: "",
  note: "",
});

const emptyDiary = () => ({
  id: uid(),
  date: today(),
  mood: "",
  tags: [],
  title: "",
  body: "",
  remindOn: false,
  remindDate: "",
  remindDone: false,
});

function mergeDeep(base, over) {
  if (over === undefined || over === null) return base;
  if (Array.isArray(base)) return Array.isArray(over) ? over : base;
  if (base && typeof base === "object" && typeof over === "object") {
    const out = { ...base };
    Object.keys(over).forEach((k) => {
      out[k] = k in base ? mergeDeep(base[k], over[k]) : over[k];
    });
    return out;
  }
  return over;
}
const normalizeCase = (c) => mergeDeep(emptyCase(), c);

function calcBMI(bw, height) {
  const w = parseFloat(bw);
  const h = parseFloat(height) / 100;
  if (!w || !h) return "";
  return (w / (h * h)).toFixed(1);
}
function calcIBW(sex, height) {
  const cm = parseFloat(height);
  if (!cm || cm < 152) return "";
  const over = cm / 2.54 - 60;
  const base = sex === "Female" ? 45.5 : 50;
  return (base + 2.3 * over).toFixed(1);
}

/* ================================================================== */
/* Storage                                                            */
/* ================================================================== */

const hasHostStorage = () =>
  typeof window !== "undefined" && window.storage && typeof window.storage.get === "function";

async function loadKey(key, fallback) {
  try {
    if (hasHostStorage()) {
      const r = await window.storage.get(key);
      if (!r || !r.value) return fallback;
      return JSON.parse(r.value);
    }
    const v = window.localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}
async function saveKey(key, value) {
  try {
    if (hasHostStorage()) {
      await window.storage.set(key, JSON.stringify(value));
      return true;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error("save failed", key, e);
    return false;
  }
}

/* ================================================================== */
/* Atoms                                                              */
/* ================================================================== */

function Field({ label, children, wide }) {
  return (
    <label className={"fld" + (wide ? " fld-wide" : "")}>
      <span className="fld-l">{label}</span>
      {children}
    </label>
  );
}
function Chip({ on, onClick, children }) {
  return (
    <button type="button" className={"chip" + (on ? " chip-on" : "")} onClick={onClick}>
      {children}
    </button>
  );
}
function Section({ title, hint, children }) {
  return (
    <section className="sect">
      <div className="sect-h">
        <h3>{title}</h3>
        {hint && <span className="sect-hint">{hint}</span>}
      </div>
      <div className="grid">{children}</div>
    </section>
  );
}
function Orb({ mood, size = 34, on = false, onClick, title }) {
  const m = orbOf(mood);
  const style = m
    ? {
        width: size,
        height: size,
        background: `radial-gradient(circle at 32% 28%, #fff 0%, ${m.c1} 38%, ${m.c2} 100%)`,
      }
    : { width: size, height: size };
  return (
    <span
      className={"orb" + (on ? " orb-on" : "") + (m ? "" : " orb-empty") + (onClick ? " orb-btn" : "")}
      style={style}
      title={title || (m ? m.label : "")}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    />
  );
}

function zoneOf(count, target) {
  if (!target || target <= 0) return { key: "none", label: "ไม่กำหนดเป้า" };
  if (count === 0) return { key: "empty", label: "ยังไม่มีเคส" };
  if (count < target) return { key: "low", label: `ขาดอีก ${target - count}` };
  if (count === target) return { key: "met", label: "ครบขั้นต่ำแล้ว" };
  return { key: "over", label: `เกินเป้า +${count - target}` };
}

/* ================================================================== */
/* Excel                                                              */
/* ================================================================== */

const onList = (obj, list, fmt) =>
  list
    .filter((d) => obj[d.key] && obj[d.key].on)
    .map((d) => fmt(d, obj[d.key]))
    .join(", ");

function caseToRow(raw) {
  const c = normalizeCase(raw);
  const ionm = IONM_MODALITIES.filter((m) => c.ionm[m]).join(", ");
  const linesTxt = LINE_KEYS.filter((l) => c.lines[l.key].on)
    .map((l) => {
      const v = c.lines[l.key];
      return `${l.label}: ${[v.site, v.count && `x${v.count}`, v.size].filter(Boolean).join(" ")}`.trim();
    })
    .join(" | ");
  const medsTxt = SPECIAL_MED_KEYS.filter((m) => c.meds[m.key].on)
    .map((m) => `${m.label}: ${c.meds[m.key].detail}`)
    .join(" | ");
  const raTxt = [c.ra.sab && "SAB", c.ra.epidural && "Epidural", c.ra.block && "RA block"]
    .filter(Boolean)
    .join(", ");

  const indParts = [];
  if (c.ind.modes.includes("Bolus")) indParts.push(`Bolus: ${c.ind.bolusDetail}`);
  if (c.ind.modes.includes("TIVA")) {
    indParts.push(
      `TIVA${c.ind.tivaMode ? ` (${c.ind.tivaMode})` : ""}: ` +
        onList(c.ind.tivaDrugs, IV_AGENTS, (d, v) => `${d.label} ${v.detail}`)
    );
  }
  if (c.ind.modes.includes("Inhalation")) {
    const g = VOLATILES.filter((v) => c.ind.inh[v.key]).map((v) => v.label).join(" + ");
    indParts.push(`Inhalation: ${g}${c.ind.inh.fio2 ? `, FiO2 ${c.ind.inh.fio2}` : ""}`);
  }

  const maintParts = [];
  if (c.maint.modes.includes("Inhalation")) {
    const g = VOLATILES.filter((v) => c.maint.inh[v.key]).map((v) => v.label).join(" + ");
    maintParts.push(
      `Inhalation: ${g}` +
        [c.maint.inh.mac && `, ${c.maint.inh.mac}`, c.maint.inh.fio2 && `, FiO2 ${c.maint.inh.fio2}`,
         c.maint.inh.flow && `, flow ${c.maint.inh.flow}`].filter(Boolean).join("")
    );
  }
  if (c.maint.modes.includes("TIVA")) {
    maintParts.push(
      "TIVA: " +
        onList(c.maint.tiva.drugs, IV_AGENTS, (d, v) =>
          `${d.label} ${v.mode ? v.mode + " " : ""}${v.value}`
        )
    );
  }

  const analg = [
    c.analgesia.paracetamol && "Paracetamol",
    c.analgesia.nsaids.on && `NSAIDs: ${c.analgesia.nsaids.detail}`,
    c.analgesia.nefopam && "Nefopam",
    c.analgesia.ra.on && `RA: ${c.analgesia.ra.type} / ${c.analgesia.ra.drugs}`,
    c.analgesia.others.on && `Others: ${c.analgesia.others.detail}`,
  ]
    .filter(Boolean)
    .join(" | ");
  const postopAnalg = [
    c.analgesia.postop.ivpca && "IV PCA",
    c.analgesia.postop.pcea && "PCEA",
    c.analgesia.postop.others && `Others: ${c.analgesia.postop.othersDetail}`,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    Date: c.date,
    HN: c.hn,
    Sex: c.sex,
    Age: c.age ? `${c.age} ${c.ageUnit}` : "",
    "BW (kg)": c.bw,
    "Height (cm)": c.height,
    BMI: calcBMI(c.bw, c.height),
    "IBW (kg)": calcIBW(c.sex, c.height),
    ASA: c.asa ? c.asa + (c.asaE ? "E" : "") : "",
    "Underlying disease": c.underlying,
    "Preop problems": [
      c.preop.difficultAirway.on && `Anticipated difficult airway: ${c.preop.difficultAirway.detail}`,
      c.preop.allergy.on && `Allergy: ${c.preop.allergy.detail}`,
      c.preop.aspiration && "Risk of aspiration",
      c.preop.emergency && "Emergency case",
      c.preop.trauma && "Trauma",
      c.preop.others.on && `Others: ${c.preop.others.detail}`,
    ]
      .filter(Boolean)
      .join(" | "),
    Diagnosis: c.diagnosis,
    Operation: c.operation,
    Service: c.service === "Others" ? `Others: ${c.serviceOther}` : c.service,
    Category: c.category === "Others" ? `Others: ${c.categoryOther}` : c.category,
    "Special monitoring": c.specialMonitoring,
    IONM: c.ionmOn
      ? ionm +
        (c.ionmCnDetail ? ` (CN: ${c.ionmCnDetail})` : "") +
        (c.ionmOtherDetail ? ` (Others: ${c.ionmOtherDetail})` : "")
      : "",
    "GA plan": c.gaPlan === "Others" ? `Others: ${c.gaPlanOther}` : c.gaPlan,
    Technique: c.techniques.join(", "),
    "IV sedation detail": c.sedationDetail,
    Position: c.position === "Others" ? `Others: ${c.positionOther}` : c.position,
    "RA plan": raTxt,
    "RA site": c.ra.site,
    "RA drugs": c.ra.drugs,
    "RA catheter": c.ra.catheter,
    "Special lines": linesTxt,
    Induction: indParts.join(" | "),
    Airway:
      c.airwayType === "ETT"
        ? `ETT ${c.ettTypes.map((t) => (t === "Others" ? c.ettOther : t)).join("/")} no.${c.ettSize}`
        : c.airwayType === "LMA"
        ? `LMA ${c.lmaType} size ${c.lmaSize}`
        : c.airwayType === "Others"
        ? `Others: ${c.airwayOther}`
        : c.airwayType,
    Cuff: c.cuff.value
      ? `${c.cuff.value} ${c.cuff.unit === "cmH2O" ? "cmH2O" : "ml"}`
      : [c.cuffMl && `${c.cuffMl} ml`, c.cuffPressure && `${c.cuffPressure} cmH2O`].filter(Boolean).join(" / "),
    Laryngoscopy: [c.device, c.bladeNo && `blade ${c.bladeNo}`, c.fiberopticNo && `FOB ${c.fiberopticNo}`]
      .filter(Boolean)
      .join(" "),
    "Airway detail": c.airwayDetail,
    Maintenance: maintParts.join(" | "),
    "Maintenance note": [c.maint.inh.note, c.maint.tiva.note].filter(Boolean).join(" / "),
    Opioid: onList(c.opioids, OPIOIDS, (d, v) => `${d.label} ${v.total}`),
    Remifentanil: c.remifentanil.on ? c.remifentanil.range : "",
    "Muscle relaxant": onList(c.relaxants, RELAXANTS, (d, v) => `${d.label} ${v.dose}`),
    "Relaxant note": c.relaxantNote,
    Reversal: c.reversal,
    Analgesics: analg,
    "Postop analgesia": postopAnalg,
    PONV: c.ponv,
    "Special medications": medsTxt,
    "Hemodynamic goal": c.hemoGoal,
    "End of case": c.endAirway,
    Postop:
      c.postop === "ICU" || c.postop === "Ward" ? `${c.postop} ${c.postopDetail}`.trim() : c.postop,
    Note: c.note,
  };
}

const safeSheetName = (n) => n.replace(/[\\/*?:[\]]/g, "-").slice(0, 31);

const fullName = (c) => `${c.firstName || ""} ${c.lastName || ""}`.trim();

/* คอลัมน์ที่ลง Excel — เท่าที่จำเป็นเท่านั้น */
function caseToExcelRow(raw) {
  const c = normalizeCase(raw);
  const ionm = c.ionmOn
    ? IONM_MODALITIES.filter((m) => c.ionm[m]).join(", ") +
      (c.ionmCnDetail ? ` (CN: ${c.ionmCnDetail})` : "") +
      (c.ionmOtherDetail ? ` (Others: ${c.ionmOtherDetail})` : "")
    : "";
  return {
    Date: c.date,
    HN: c.hn,
    "ชื่อ-นามสกุล": fullName(c),
    Sex: c.sex,
    Age: c.age ? `${c.age} ${c.ageUnit}` : "",
    Diagnosis: c.diagnosis,
    Operation: c.operation,
    "Special monitoring": c.specialMonitoring,
    IONM: ionm,
  };
}

function exportExcel(cases, targets, categories) {
  const wb = XLSX.utils.book_new();
  const neuro = cases.filter((c) => c.service === "Neuroanesthesia");

  const summary = categories.map((cat) => {
    const n = neuro.filter((c) => c.category === cat).length;
    const t = targets[cat] ?? 0;
    return {
      Category: cat,
      Logged: n,
      "Minimum required": t,
      Remaining: t > n ? t - n : 0,
      Status: zoneOf(n, t).label,
    };
  });
  summary.push({ Category: "TOTAL (all services)", Logged: cases.length });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), "Summary");

  const byDate = (a, b) => (a.date > b.date ? 1 : -1);
  const rest = cases.filter(
    (c) => c.service !== "Neuroanesthesia" || !categories.includes(c.category)
  );

  /* ชีตรวม เรียงเป็นกลุ่มตาม category */
  const grouped = [];
  categories.forEach((cat) => {
    neuro
      .filter((c) => c.category === cat)
      .sort(byDate)
      .forEach((c) => grouped.push({ Category: cat, ...caseToExcelRow(c) }));
  });
  [...rest]
    .sort(byDate)
    .forEach((c) =>
      grouped.push({ Category: c.category || c.service || "ไม่ระบุ", ...caseToExcelRow(c) })
    );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(grouped.length ? grouped : [{ Category: "" }]),
    "All cases"
  );

  /* แยกชีตตาม category */
  categories.forEach((cat) => {
    const sub = neuro.filter((c) => c.category === cat).sort(byDate).map(caseToExcelRow);
    if (sub.length)
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sub), safeSheetName(cat));
  });
  if (rest.length)
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        [...rest].sort(byDate).map((c) => ({ Service: c.service, ...caseToExcelRow(c) }))
      ),
      "Other cases"
    );

  XLSX.writeFile(wb, `anesthesia-logbook-${today()}.xlsx`);
}

/* ================================================================== */
/* Case form                                                          */
/* ================================================================== */

function CaseForm({ initial, onSave, onCancel, categories = NEURO_CATEGORIES }) {
  const [c, setC] = useState(() => normalizeCase(initial));
  const set = (k, v) => setC((p) => ({ ...p, [k]: v }));
  const setIn = (obj, k, v) => setC((p) => ({ ...p, [obj]: { ...p[obj], [k]: v } }));
  const setDeep = (path, v) =>
    setC((p) => {
      const next = { ...p };
      let cur = next;
      for (let i = 0; i < path.length - 1; i++) {
        cur[path[i]] = Array.isArray(cur[path[i]]) ? [...cur[path[i]]] : { ...cur[path[i]] };
        cur = cur[path[i]];
      }
      cur[path[path.length - 1]] = v;
      return next;
    });
  const toggleArr = (k, v) =>
    setC((p) => ({
      ...p,
      [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v],
    }));
  const toggleDeepArr = (path, v) => {
    const cur = path.reduce((o, k) => o[k], c);
    setDeep(path, cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]);
  };

  const isNeuro = c.service === "Neuroanesthesia";
  const isGA = Boolean(c.gaPlan) || c.techniques.includes("GA");

  return (
    <div className="form">
      <Section title="ข้อมูลผู้ป่วย">
        <Field label="วันที่ผ่าตัด">
          <input type="date" value={c.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
        <Field label="HN">
          <input value={c.hn} onChange={(e) => set("hn", e.target.value)} placeholder="เช่น 65-1234" />
        </Field>
        <Field label="ชื่อ">
          <input value={c.firstName} onChange={(e) => set("firstName", e.target.value)} />
        </Field>
        <Field label="นามสกุล">
          <input value={c.lastName} onChange={(e) => set("lastName", e.target.value)} />
        </Field>
        <Field label="Sex">
          <select value={c.sex} onChange={(e) => set("sex", e.target.value)}>
            <option value="">—</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </Field>
        <Field label="Age">
          <div className="row">
            <input type="number" value={c.age} onChange={(e) => set("age", e.target.value)} />
            <select value={c.ageUnit} onChange={(e) => set("ageUnit", e.target.value)}>
              <option value="years">ปี</option>
              <option value="months">เดือน</option>
              <option value="days">วัน</option>
            </select>
          </div>
        </Field>
        <Field label="BW (kg)">
          <input type="number" value={c.bw} onChange={(e) => set("bw", e.target.value)} />
        </Field>
        <Field label="Height (cm)">
          <input type="number" value={c.height} onChange={(e) => set("height", e.target.value)} />
        </Field>
        <Field label="ASA physical status">
          <div className="row">
            <select value={c.asa} onChange={(e) => set("asa", e.target.value)}>
              <option value="">—</option>
              {["I", "II", "III", "IV", "V", "VI"].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <Chip on={c.asaE} onClick={() => set("asaE", !c.asaE)}>
              E (emergency)
            </Chip>
          </div>
        </Field>
        <Field label="BMI / Ideal body weight" wide>
          <div className="calc-box">
            <span>
              BMI <b>{calcBMI(c.bw, c.height) || "—"}</b> kg/m²
            </span>
            <span>
              IBW <b>{calcIBW(c.sex, c.height) || "—"}</b> kg
            </span>
            <em>คำนวณอัตโนมัติจาก BW, ส่วนสูง และเพศ (Devine)</em>
          </div>
        </Field>
        <Field label="Diagnosis" wide>
          <input value={c.diagnosis} onChange={(e) => set("diagnosis", e.target.value)} />
        </Field>
        <Field label="Operation" wide>
          <input value={c.operation} onChange={(e) => set("operation", e.target.value)} />
        </Field>
        <Field label="Service">
          <select value={c.service} onChange={(e) => set("service", e.target.value)}>
            {SERVICES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        {c.service === "Others" && (
          <Field label="ระบุ service">
            <input value={c.serviceOther} onChange={(e) => set("serviceOther", e.target.value)} />
          </Field>
        )}
        {isNeuro && (
          <>
            <Field label="Neuro category" wide>
              <div className="chips">
                {categories.map((cat) => (
                  <Chip key={cat} on={c.category === cat} onClick={() => set("category", cat)}>
                    {cat}
                  </Chip>
                ))}
              </div>
            </Field>
            {c.category === "Others" && (
              <Field label="ระบุ category" wide>
                <input value={c.categoryOther} onChange={(e) => set("categoryOther", e.target.value)} />
              </Field>
            )}
          </>
        )}
      </Section>

      <Section title="Preop assessment" hint="ไม่บังคับกรอก">
        <Field label="Underlying disease" wide>
          <textarea
            rows={2}
            value={c.underlying}
            onChange={(e) => set("underlying", e.target.value)}
            placeholder="เช่น HT, DM type 2, CKD stage 3…"
          />
        </Field>
        <Field label="Preop problem" wide>
          <div className="chips">
            <Chip
              on={c.preop.difficultAirway.on}
              onClick={() => setDeep(["preop", "difficultAirway", "on"], !c.preop.difficultAirway.on)}
            >
              Anticipated difficult airway
            </Chip>
            <Chip on={c.preop.allergy.on} onClick={() => setDeep(["preop", "allergy", "on"], !c.preop.allergy.on)}>
              Allergy
            </Chip>
            <Chip on={c.preop.aspiration} onClick={() => setDeep(["preop", "aspiration"], !c.preop.aspiration)}>
              Risk of aspiration
            </Chip>
            <Chip on={c.preop.emergency} onClick={() => setDeep(["preop", "emergency"], !c.preop.emergency)}>
              Emergency case
            </Chip>
            <Chip on={c.preop.trauma} onClick={() => setDeep(["preop", "trauma"], !c.preop.trauma)}>
              Trauma
            </Chip>
            <Chip on={c.preop.others.on} onClick={() => setDeep(["preop", "others", "on"], !c.preop.others.on)}>
              Others
            </Chip>
          </div>
        </Field>
        {c.preop.difficultAirway.on && (
          <Field label="Difficult airway — รายละเอียด" wide>
            <input
              value={c.preop.difficultAirway.detail}
              onChange={(e) => setDeep(["preop", "difficultAirway", "detail"], e.target.value)}
              placeholder="เช่น Mallampati IV, limited neck extension, previous difficult intubation"
            />
          </Field>
        )}
        {c.preop.allergy.on && (
          <Field label="Allergy — ระบุ" wide>
            <input
              value={c.preop.allergy.detail}
              onChange={(e) => setDeep(["preop", "allergy", "detail"], e.target.value)}
            />
          </Field>
        )}
        {c.preop.others.on && (
          <Field label="Preop problem อื่นๆ — ระบุ" wide>
            <input
              value={c.preop.others.detail}
              onChange={(e) => setDeep(["preop", "others", "detail"], e.target.value)}
            />
          </Field>
        )}
      </Section>

      <Section title="Monitoring">
        <Field label="Special monitoring" wide>
          <input
            value={c.specialMonitoring}
            onChange={(e) => set("specialMonitoring", e.target.value)}
            placeholder="เช่น ICP, EEG, BIS, TCD, CVP…"
          />
        </Field>
        <Field label="IONM" wide>
          <div className="chips">
            <Chip on={c.ionmOn} onClick={() => set("ionmOn", !c.ionmOn)}>
              ใช้ IONM
            </Chip>
            {c.ionmOn &&
              IONM_MODALITIES.map((m) => (
                <Chip key={m} on={c.ionm[m]} onClick={() => setIn("ionm", m, !c.ionm[m])}>
                  {m}
                </Chip>
              ))}
          </div>
        </Field>
        {c.ionmOn && c.ionm["Cranial nerve"] && (
          <Field label="Cranial nerve ระบุ">
            <input
              value={c.ionmCnDetail}
              onChange={(e) => set("ionmCnDetail", e.target.value)}
              placeholder="เช่น CN VII, CN X"
            />
          </Field>
        )}
        {c.ionmOn && c.ionm.Others && (
          <Field label="IONM others ระบุ">
            <input value={c.ionmOtherDetail} onChange={(e) => set("ionmOtherDetail", e.target.value)} />
          </Field>
        )}
      </Section>

      <Section title="Anesthetic plan" hint="เลือก GA plan แล้วโซน induction / maintenance จะเปิดให้กรอก">
        <Field label="Anesthetic technique" wide>
          <div className="chips">
            {TECHNIQUES.map((t) => (
              <Chip key={t} on={c.techniques.includes(t)} onClick={() => toggleArr("techniques", t)}>
                {t}
              </Chip>
            ))}
          </div>
        </Field>
        {c.techniques.includes("IV sedation") && (
          <Field label="IV sedation — รายละเอียด" wide>
            <textarea
              rows={2}
              value={c.sedationDetail}
              onChange={(e) => set("sedationDetail", e.target.value)}
              placeholder="ยาที่ใช้ / ขนาด / ระดับ sedation / การให้ O2"
            />
          </Field>
        )}
        <Field label="GA plan" wide>
          <div className="chips">
            {GA_PLANS.map((g) => (
              <Chip key={g} on={c.gaPlan === g} onClick={() => set("gaPlan", c.gaPlan === g ? "" : g)}>
                {g}
              </Chip>
            ))}
          </div>
        </Field>
        {c.gaPlan === "Others" && (
          <Field label="ระบุ GA plan" wide>
            <input value={c.gaPlanOther} onChange={(e) => set("gaPlanOther", e.target.value)} />
          </Field>
        )}
        <Field label="RA plan" wide>
          <div className="chips">
            <Chip on={c.ra.sab} onClick={() => setIn("ra", "sab", !c.ra.sab)}>
              SAB
            </Chip>
            <Chip on={c.ra.epidural} onClick={() => setIn("ra", "epidural", !c.ra.epidural)}>
              Epidural anesthesia
            </Chip>
            <Chip on={c.ra.block} onClick={() => setIn("ra", "block", !c.ra.block)}>
              RA / block
            </Chip>
          </div>
        </Field>
        {(c.ra.sab || c.ra.epidural || c.ra.block) && (
          <>
            <Field label="ตำแหน่ง">
              <input value={c.ra.site} onChange={(e) => setIn("ra", "site", e.target.value)} />
            </Field>
            <Field label="ยาที่ใช้">
              <input value={c.ra.drugs} onChange={(e) => setIn("ra", "drugs", e.target.value)} />
            </Field>
            <Field label="Catheter" wide>
              <input
                value={c.ra.catheter}
                onChange={(e) => setIn("ra", "catheter", e.target.value)}
                placeholder="ขนาด / ความลึก / ระยะเวลาคาสาย"
              />
            </Field>
          </>
        )}
        <Field label="Special lines" wide>
          <div className="chips">
            {LINE_KEYS.map((l) => (
              <Chip key={l.key} on={c.lines[l.key].on} onClick={() => setDeep(["lines", l.key, "on"], !c.lines[l.key].on)}>
                {l.label}
              </Chip>
            ))}
          </div>
        </Field>
        {LINE_KEYS.filter((l) => c.lines[l.key].on).map((l) => (
          <Field key={l.key} label={`${l.label} — ตำแหน่ง / จำนวน / ขนาด`} wide>
            <div className="row">
              <input
                placeholder="ตำแหน่ง"
                value={c.lines[l.key].site}
                onChange={(e) => setDeep(["lines", l.key, "site"], e.target.value)}
              />
              <input
                placeholder="จำนวน"
                value={c.lines[l.key].count}
                onChange={(e) => setDeep(["lines", l.key, "count"], e.target.value)}
              />
              <input
                placeholder="ขนาด"
                value={c.lines[l.key].size}
                onChange={(e) => setDeep(["lines", l.key, "size"], e.target.value)}
              />
            </div>
          </Field>
        ))}
        <Field label="Position" wide>
          <div className="chips">
            {POSITIONS.map((p) => (
              <Chip key={p} on={c.position === p} onClick={() => set("position", c.position === p ? "" : p)}>
                {p}
              </Chip>
            ))}
          </div>
        </Field>
        {c.position === "Others" && (
          <Field label="ระบุ position" wide>
            <input value={c.positionOther} onChange={(e) => set("positionOther", e.target.value)} />
          </Field>
        )}
      </Section>

      {isGA && (
        <>
          <Section title="Induction">
            <Field label="Induction agents" wide>
              <div className="chips">
                {["Bolus", "TIVA", "Inhalation"].map((m) => (
                  <Chip key={m} on={c.ind.modes.includes(m)} onClick={() => toggleDeepArr(["ind", "modes"], m)}>
                    {m === "TIVA" ? "TIVA (TCI / infusion)" : m === "Inhalation" ? "Inhalation induction" : m}
                  </Chip>
                ))}
              </div>
            </Field>

            {c.ind.modes.includes("Bolus") && (
              <Field label="Bolus — รายละเอียด" wide>
                <input
                  value={c.ind.bolusDetail}
                  onChange={(e) => setDeep(["ind", "bolusDetail"], e.target.value)}
                  placeholder="เช่น Propofol 2 mg/kg + Fentanyl 2 mcg/kg"
                />
              </Field>
            )}

            {c.ind.modes.includes("TIVA") && (
              <>
                <Field label="รูปแบบ" wide>
                  <div className="chips">
                    {["TCI", "Infusion"].map((m) => (
                      <Chip
                        key={m}
                        on={c.ind.tivaMode === m}
                        onClick={() => setDeep(["ind", "tivaMode"], c.ind.tivaMode === m ? "" : m)}
                      >
                        {m}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <Field label="ยาที่ใช้" wide>
                  <div className="chips">
                    {IV_AGENTS.map((d) => (
                      <Chip
                        key={d.key}
                        on={c.ind.tivaDrugs[d.key].on}
                        onClick={() => setDeep(["ind", "tivaDrugs", d.key, "on"], !c.ind.tivaDrugs[d.key].on)}
                      >
                        {d.label}
                      </Chip>
                    ))}
                  </div>
                </Field>
                {IV_AGENTS.filter((d) => c.ind.tivaDrugs[d.key].on).map((d) => (
                  <Field key={d.key} label={`${d.label} — dose / target TCI / rate`} wide>
                    <input
                      value={c.ind.tivaDrugs[d.key].detail}
                      onChange={(e) => setDeep(["ind", "tivaDrugs", d.key, "detail"], e.target.value)}
                      placeholder="เช่น Ce 3.5 µg/ml หรือ 100 µg/kg/min"
                    />
                  </Field>
                ))}
              </>
            )}

            {c.ind.modes.includes("Inhalation") && (
              <>
                <Field label="ก๊าซที่ใช้" wide>
                  <div className="chips">
                    {VOLATILES.map((v) => (
                      <Chip
                        key={v.key}
                        on={c.ind.inh[v.key]}
                        onClick={() => setDeep(["ind", "inh", v.key], !c.ind.inh[v.key])}
                      >
                        {v.label}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <Field label="FiO₂">
                  <input
                    value={c.ind.inh.fio2}
                    onChange={(e) => setDeep(["ind", "inh", "fio2"], e.target.value)}
                    placeholder="เช่น 1.0"
                  />
                </Field>
              </>
            )}

            <Field label="Airway">
              <select value={c.airwayType} onChange={(e) => set("airwayType", e.target.value)}>
                <option>ETT</option>
                <option>LMA</option>
                <option>Undermask</option>
                <option>Tracheostomy</option>
                <option>Others</option>
              </select>
            </Field>
            {c.airwayType === "ETT" && (
              <>
                <Field label="ชนิด ETT" wide>
                  <div className="chips">
                    {ETT_TYPES.map((t) => (
                      <Chip key={t} on={c.ettTypes.includes(t)} onClick={() => toggleArr("ettTypes", t)}>
                        {t}
                      </Chip>
                    ))}
                  </div>
                </Field>
                {c.ettTypes.includes("Others") && (
                  <Field label="ระบุชนิด ETT">
                    <input value={c.ettOther} onChange={(e) => set("ettOther", e.target.value)} />
                  </Field>
                )}
                <Field label="ETT No.">
                  <input value={c.ettSize} onChange={(e) => set("ettSize", e.target.value)} />
                </Field>
                <Field label="Cuff">
                  <div className="row">
                    <input
                      value={c.cuff.value}
                      onChange={(e) => setDeep(["cuff", "value"], e.target.value)}
                      placeholder="จำนวน"
                    />
                    <select
                      className="unit-sel"
                      value={c.cuff.unit}
                      onChange={(e) => setDeep(["cuff", "unit"], e.target.value)}
                    >
                      <option value="ml">ml</option>
                      <option value="cmH2O">cmH₂O</option>
                    </select>
                  </div>
                </Field>
              </>
            )}
            {c.airwayType === "LMA" && (
              <>
                <Field label="LMA type">
                  <input
                    value={c.lmaType}
                    onChange={(e) => set("lmaType", e.target.value)}
                    placeholder="เช่น ProSeal, Supreme, i-gel"
                  />
                </Field>
                <Field label="LMA size">
                  <input value={c.lmaSize} onChange={(e) => set("lmaSize", e.target.value)} />
                </Field>
              </>
            )}
            {(c.airwayType === "Others" || c.airwayType === "Undermask") && (
              <Field label="รายละเอียดเพิ่มเติม" wide>
                <input value={c.airwayOther} onChange={(e) => set("airwayOther", e.target.value)} />
              </Field>
            )}
            <Field label="Laryngoscopy" wide>
              <div className="chips">
                {["DL", "VL", "Fiberoptic"].map((d) => (
                  <Chip key={d} on={c.device === d} onClick={() => set("device", c.device === d ? "" : d)}>
                    {d}
                  </Chip>
                ))}
              </div>
            </Field>
            {(c.device === "DL" || c.device === "VL") && (
              <Field label="Blade no.">
                <input value={c.bladeNo} onChange={(e) => set("bladeNo", e.target.value)} />
              </Field>
            )}
            {c.device === "Fiberoptic" && (
              <Field label="Fiberoptic no.">
                <input value={c.fiberopticNo} onChange={(e) => set("fiberopticNo", e.target.value)} />
              </Field>
            )}
            <Field label="Airway detail" wide>
              <textarea
                rows={2}
                value={c.airwayDetail}
                onChange={(e) => set("airwayDetail", e.target.value)}
                placeholder="Cormack-Lehane, จำนวนครั้งที่ใส่, positioning, ปัญหาที่เจอ…"
              />
            </Field>
          </Section>

          <Section title="Maintenance">
            <Field label="เทคนิค" wide>
              <div className="chips">
                {["TIVA", "Inhalation"].map((m) => (
                  <Chip key={m} on={c.maint.modes.includes(m)} onClick={() => toggleDeepArr(["maint", "modes"], m)}>
                    {m}
                  </Chip>
                ))}
              </div>
            </Field>

            {c.maint.modes.includes("Inhalation") && (
              <>
                <Field label="ก๊าซที่ใช้" wide>
                  <div className="chips">
                    {VOLATILES.map((v) => (
                      <Chip
                        key={v.key}
                        on={c.maint.inh[v.key]}
                        onClick={() => setDeep(["maint", "inh", v.key], !c.maint.inh[v.key])}
                      >
                        {v.label}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <Field label="MAC หรือ % ที่เปิด">
                  <input
                    value={c.maint.inh.mac}
                    onChange={(e) => setDeep(["maint", "inh", "mac"], e.target.value)}
                    placeholder="เช่น 0.8 MAC หรือ 2%"
                  />
                </Field>
                <Field label="FiO₂">
                  <input value={c.maint.inh.fio2} onChange={(e) => setDeep(["maint", "inh", "fio2"], e.target.value)} />
                </Field>
                <Field label="Total flow">
                  <input
                    value={c.maint.inh.flow}
                    onChange={(e) => setDeep(["maint", "inh", "flow"], e.target.value)}
                    placeholder="เช่น 1 L/min"
                  />
                </Field>
                <Field label="หมายเหตุ" wide>
                  <input value={c.maint.inh.note} onChange={(e) => setDeep(["maint", "inh", "note"], e.target.value)} />
                </Field>
              </>
            )}

            {c.maint.modes.includes("TIVA") && (
              <>
                <Field label="ยาที่ใช้" wide>
                  <div className="chips">
                    {IV_AGENTS.map((d) => (
                      <Chip
                        key={d.key}
                        on={c.maint.tiva.drugs[d.key].on}
                        onClick={() => setDeep(["maint", "tiva", "drugs", d.key, "on"], !c.maint.tiva.drugs[d.key].on)}
                      >
                        {d.label}
                      </Chip>
                    ))}
                  </div>
                </Field>
                {IV_AGENTS.filter((d) => c.maint.tiva.drugs[d.key].on).map((d) => (
                  <Field key={d.key} label={d.label} wide>
                    <div className="row">
                      <div className="chips">
                        {["TCI", "Infusion"].map((m) => (
                          <Chip
                            key={m}
                            on={c.maint.tiva.drugs[d.key].mode === m}
                            onClick={() =>
                              setDeep(
                                ["maint", "tiva", "drugs", d.key, "mode"],
                                c.maint.tiva.drugs[d.key].mode === m ? "" : m
                              )
                            }
                          >
                            {m}
                          </Chip>
                        ))}
                      </div>
                      <input
                        value={c.maint.tiva.drugs[d.key].value}
                        onChange={(e) => setDeep(["maint", "tiva", "drugs", d.key, "value"], e.target.value)}
                        placeholder={
                          c.maint.tiva.drugs[d.key].mode === "TCI" ? "target Ce เช่น 3 µg/ml" : "dose เช่น 6 mg/kg/hr"
                        }
                      />
                    </div>
                  </Field>
                ))}
                <Field label="หมายเหตุ" wide>
                  <input value={c.maint.tiva.note} onChange={(e) => setDeep(["maint", "tiva", "note"], e.target.value)} />
                </Field>
              </>
            )}

            <Field label="Opioid" wide>
              <div className="chips">
                {OPIOIDS.map((d) => (
                  <Chip
                    key={d.key}
                    on={c.opioids[d.key].on}
                    onClick={() => setDeep(["opioids", d.key, "on"], !c.opioids[d.key].on)}
                  >
                    {d.label}
                  </Chip>
                ))}
                <Chip
                  on={c.remifentanil.on}
                  onClick={() => setDeep(["remifentanil", "on"], !c.remifentanil.on)}
                >
                  Remifentanil
                </Chip>
              </div>
            </Field>
            {OPIOIDS.filter((d) => c.opioids[d.key].on).map((d) => (
              <Field key={d.key} label={`${d.label} — total dose`}>
                <input
                  value={c.opioids[d.key].total}
                  onChange={(e) => setDeep(["opioids", d.key, "total"], e.target.value)}
                />
              </Field>
            ))}
            {c.remifentanil.on && (
              <Field label="Remifentanil — range dose (gamma)">
                <input
                  value={c.remifentanil.range}
                  onChange={(e) => setDeep(["remifentanil", "range"], e.target.value)}
                  placeholder="เช่น 0.05–0.15 µg/kg/min"
                />
              </Field>
            )}

            <Field label="Muscle relaxant" wide>
              <div className="chips">
                {RELAXANTS.map((d) => (
                  <Chip
                    key={d.key}
                    on={c.relaxants[d.key].on}
                    onClick={() => setDeep(["relaxants", d.key, "on"], !c.relaxants[d.key].on)}
                  >
                    {d.label}
                  </Chip>
                ))}
              </div>
            </Field>
            {RELAXANTS.filter((d) => c.relaxants[d.key].on).map((d) => (
              <Field key={d.key} label={`${d.label} — dose`}>
                <input
                  value={c.relaxants[d.key].dose}
                  onChange={(e) => setDeep(["relaxants", d.key, "dose"], e.target.value)}
                />
              </Field>
            ))}
            <Field label="หมายเหตุ muscle relaxant" wide>
              <input value={c.relaxantNote} onChange={(e) => set("relaxantNote", e.target.value)} />
            </Field>
            <Field label="Reversal detail" wide>
              <input
                value={c.reversal}
                onChange={(e) => set("reversal", e.target.value)}
                placeholder="เช่น Sugammadex 2 mg/kg / Neostigmine + Atropine"
              />
            </Field>
          </Section>
        </>
      )}

      <Section title="Analgesia">
        <Field label="Intraoperative analgesia" wide>
          <div className="chips">
            <Chip on={c.analgesia.paracetamol} onClick={() => setDeep(["analgesia", "paracetamol"], !c.analgesia.paracetamol)}>
              Paracetamol
            </Chip>
            <Chip on={c.analgesia.nsaids.on} onClick={() => setDeep(["analgesia", "nsaids", "on"], !c.analgesia.nsaids.on)}>
              NSAIDs
            </Chip>
            <Chip on={c.analgesia.nefopam} onClick={() => setDeep(["analgesia", "nefopam"], !c.analgesia.nefopam)}>
              Nefopam
            </Chip>
            <Chip on={c.analgesia.ra.on} onClick={() => setDeep(["analgesia", "ra", "on"], !c.analgesia.ra.on)}>
              RA
            </Chip>
            <Chip on={c.analgesia.others.on} onClick={() => setDeep(["analgesia", "others", "on"], !c.analgesia.others.on)}>
              Others
            </Chip>
          </div>
        </Field>
        {c.analgesia.nsaids.on && (
          <Field label="NSAIDs ระบุ" wide>
            <input
              value={c.analgesia.nsaids.detail}
              onChange={(e) => setDeep(["analgesia", "nsaids", "detail"], e.target.value)}
            />
          </Field>
        )}
        {c.analgesia.ra.on && (
          <>
            <Field label="RA — ประเภท">
              <input
                value={c.analgesia.ra.type}
                onChange={(e) => setDeep(["analgesia", "ra", "type"], e.target.value)}
                placeholder="เช่น scalp block, TAP block"
              />
            </Field>
            <Field label="RA — ยาที่ใช้">
              <input
                value={c.analgesia.ra.drugs}
                onChange={(e) => setDeep(["analgesia", "ra", "drugs"], e.target.value)}
              />
            </Field>
          </>
        )}
        {c.analgesia.others.on && (
          <Field label="Others ระบุ" wide>
            <input
              value={c.analgesia.others.detail}
              onChange={(e) => setDeep(["analgesia", "others", "detail"], e.target.value)}
            />
          </Field>
        )}
        <Field label="Postop analgesia" wide>
          <div className="chips">
            <Chip on={c.analgesia.postop.ivpca} onClick={() => setDeep(["analgesia", "postop", "ivpca"], !c.analgesia.postop.ivpca)}>
              IV PCA
            </Chip>
            <Chip on={c.analgesia.postop.pcea} onClick={() => setDeep(["analgesia", "postop", "pcea"], !c.analgesia.postop.pcea)}>
              PCEA
            </Chip>
            <Chip on={c.analgesia.postop.others} onClick={() => setDeep(["analgesia", "postop", "others"], !c.analgesia.postop.others)}>
              Others
            </Chip>
          </div>
        </Field>
        {c.analgesia.postop.others && (
          <Field label="Postop analgesia — ระบุ" wide>
            <input
              value={c.analgesia.postop.othersDetail}
              onChange={(e) => setDeep(["analgesia", "postop", "othersDetail"], e.target.value)}
            />
          </Field>
        )}
      </Section>

      <Section title="ยาอื่นๆ และเป้าหมาย">
        <Field label="PONV prophylaxis" wide>
          <input value={c.ponv} onChange={(e) => set("ponv", e.target.value)} />
        </Field>
        <Field label="Special medications" wide>
          <div className="chips">
            {SPECIAL_MED_KEYS.map((m) => (
              <Chip key={m.key} on={c.meds[m.key].on} onClick={() => setDeep(["meds", m.key, "on"], !c.meds[m.key].on)}>
                {m.label}
              </Chip>
            ))}
          </div>
        </Field>
        {SPECIAL_MED_KEYS.filter((m) => c.meds[m.key].on).map((m) => (
          <Field key={m.key} label={`${m.label} — รายละเอียด`} wide>
            <input
              value={c.meds[m.key].detail}
              onChange={(e) => setDeep(["meds", m.key, "detail"], e.target.value)}
              placeholder="ชื่อยา / ขนาด / เวลาที่ให้"
            />
          </Field>
        ))}
        <Field label="Hemodynamic goal" wide>
          <input
            value={c.hemoGoal}
            onChange={(e) => set("hemoGoal", e.target.value)}
            placeholder="เช่น MAP 80-90 mmHg, CPP > 60"
          />
        </Field>
      </Section>

      <Section title={isGA ? "Extubation / End of case" : "End of case"}>
        {isGA && (
          <Field label="Airway" wide>
            <div className="chips">
              {["Extubated", "Remain intubated"].map((v) => (
                <Chip key={v} on={c.endAirway === v} onClick={() => set("endAirway", c.endAirway === v ? "" : v)}>
                  {v}
                </Chip>
              ))}
            </div>
          </Field>
        )}
        <Field label="Postop destination" wide>
          <div className="chips">
            {["PACU", "Ward", "ICU"].map((v) => (
              <Chip key={v} on={c.postop === v} onClick={() => set("postop", c.postop === v ? "" : v)}>
                {v}
              </Chip>
            ))}
          </div>
        </Field>
        {(c.postop === "ICU" || c.postop === "Ward") && (
          <Field label="ระบุหอผู้ป่วย" wide>
            <input value={c.postopDetail} onChange={(e) => set("postopDetail", e.target.value)} />
          </Field>
        )}
        <Field label="Note ส่วนตัว (เชิงวิชาการ)" wide>
          <textarea
            rows={4}
            value={c.note}
            onChange={(e) => set("note", e.target.value)}
            placeholder="สิ่งที่ได้เรียนรู้ ปัญหาที่เจอ สิ่งที่จะทำต่างออกไปครั้งหน้า…"
          />
        </Field>
      </Section>

      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onCancel}>
          ยกเลิก
        </button>
        <button className="btn btn-primary" onClick={() => onSave(c)}>
          บันทึกเคส
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Category editor                                                    */
/* ================================================================== */

function CategoryEditor({ categories, targets, onSave, onReset }) {
  const build = () =>
    categories.map((c, i) => ({ key: "r" + i + c, orig: c, name: c, target: targets[c] ?? 0 }));
  const [rows, setRows] = useState(build);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setRows(build());
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.join("|")]);

  const upd = (i, k, v) => {
    setRows((p) => p.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
    setDirty(true);
  };
  const del = (i) => {
    setRows((p) => p.filter((_, idx) => idx !== i));
    setDirty(true);
  };
  const add = () => {
    setRows((p) => [...p, { key: "new" + Date.now(), orig: null, name: "", target: 0 }]);
    setDirty(true);
  };

  return (
    <>
      <div className="cat-list">
        {rows.map((r, i) => (
          <div key={r.key} className="cat-row">
            <input
              value={r.name}
              onChange={(e) => upd(i, "name", e.target.value)}
              placeholder="ชื่อ category"
            />
            <input
              type="number"
              min="0"
              value={r.target}
              onChange={(e) => upd(i, "target", Number(e.target.value))}
              title="จำนวนขั้นต่ำ"
            />
            <button className="link danger" onClick={() => del(i)}>
              ลบ
            </button>
          </div>
        ))}
      </div>
      <div className="cat-actions">
        <button className="btn btn-ghost" onClick={add}>
          + เพิ่มแถว
        </button>
        <button className="btn btn-ghost" onClick={onReset}>
          คืนค่ารายการเริ่มต้น
        </button>
        <button className="btn btn-primary" onClick={() => onSave(rows)} disabled={!dirty}>
          บันทึกรายการ
        </button>
      </div>
      <p className="note-text">
        แก้ชื่อได้เลย เคสเก่าที่ใช้ชื่อเดิมจะถูกเปลี่ยนตามให้อัตโนมัติ ถ้าลบ category
        เคสที่บันทึกไว้แล้วยังอยู่ครบ เพียงแต่จะไม่ถูกนับในการ์ดความคืบหน้าอีก
      </p>
    </>
  );
}

/* ================================================================== */
/* Case detail                                                        */
/* ================================================================== */

function CaseDetail({ c, onEdit, onDelete, onClose }) {
  const [showName, setShowName] = useState(false);
  const entries = Object.entries(caseToRow(c)).filter(([, v]) => v !== "" && v != null);
  const name = fullName(c);
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <div>
            <h2>{c.operation || "ไม่ระบุ operation"}</h2>
            <p className="sub">
              {c.date} · HN {c.hn || "—"} · {c.service}
              {c.category ? ` · ${c.category}` : ""}
            </p>
            <p className="name-line">
              ชื่อผู้ป่วย: <span>{name ? (showName ? name : "••••••••") : "—"}</span>
              {name && (
                <button className="link" onClick={() => setShowName((v) => !v)}>
                  {showName ? "ซ่อน" : "แสดง"}
                </button>
              )}
            </p>
          </div>
          <button className="btn btn-ghost" onClick={onClose}>
            ปิด
          </button>
        </div>
        <dl className="dl">
          {entries.map(([k, v]) => (
            <div key={k} className="dl-row">
              <dt>{k}</dt>
              <dd>{String(v)}</dd>
            </div>
          ))}
        </dl>
        <div className="form-actions">
          <button className="btn btn-danger" onClick={() => onDelete(c.id)}>
            ลบเคส
          </button>
          <button className="btn btn-primary" onClick={() => onEdit(c)}>
            แก้ไข
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* App                                                                */
/* ================================================================== */

export default function App() {
  const [world, setWorld] = useState("logbook");
  const [tab, setTab] = useState("progress");
  const [cases, setCases] = useState([]);
  const [diary, setDiary] = useState([]);
  const [categories, setCategories] = useState(NEURO_CATEGORIES);
  const [targets, setTargets] = useState(() =>
    Object.fromEntries(NEURO_CATEGORIES.map((c) => [c, c === "Others" ? 0 : 5]))
  );
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [q, setQ] = useState("");
  const [fService, setFService] = useState("");
  const [fCategory, setFCategory] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [toast, setToast] = useState("");
  const [showNames, setShowNames] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    (async () => {
      const [c, d, s] = await Promise.all([
        loadKey(STORE_KEYS.cases, []),
        loadKey(STORE_KEYS.diary, []),
        loadKey(STORE_KEYS.settings, null),
      ]);
      setCases(c);
      setDiary(d);
      if (s && s.targets) setTargets((p) => ({ ...p, ...s.targets }));
      if (s && Array.isArray(s.categories) && s.categories.length) setCategories(s.categories);
      if (s && s.pin) setPin(s.pin);
      setLoading(false);
    })();
  }, []);

  const flash = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2200);
  };

  const persistCases = async (next) => {
    setCases(next);
    const ok = await saveKey(STORE_KEYS.cases, next);
    flash(ok ? "บันทึกแล้ว" : "บันทึกไม่สำเร็จ ลองอีกครั้ง");
  };
  const persistDiary = async (next) => {
    setDiary(next);
    await saveKey(STORE_KEYS.diary, next);
  };
  const persistSettings = async (nextTargets, nextPin, nextCategories) => {
    const cats = nextCategories || categories;
    setTargets(nextTargets);
    setPin(nextPin);
    setCategories(cats);
    await saveKey(STORE_KEYS.settings, { targets: nextTargets, pin: nextPin, categories: cats });
  };

  const saveCategories = async (rows) => {
    const clean = [];
    const t = {};
    const renames = [];
    rows.forEach((r) => {
      const name = r.name.trim();
      if (!name || clean.includes(name)) return;
      clean.push(name);
      t[name] = Number(r.target) || 0;
      if (r.orig && r.orig !== name) renames.push([r.orig, name]);
    });
    if (!clean.length) {
      flash("ต้องมีอย่างน้อย 1 category");
      return;
    }
    if (renames.length) {
      const map = Object.fromEntries(renames);
      const nextCases = cases.map((c) => (map[c.category] ? { ...c, category: map[c.category] } : c));
      setCases(nextCases);
      await saveKey(STORE_KEYS.cases, nextCases);
    }
    await persistSettings(t, pin, clean);
    flash("บันทึกรายการ category แล้ว");
  };

  const resetCategories = () => {
    if (!window.confirm("คืนค่ารายการเป็น 11 category เริ่มต้น (จำนวนขั้นต่ำ 5 ทุกอัน)")) return;
    persistSettings(
      Object.fromEntries(NEURO_CATEGORIES.map((c) => [c, c === "Others" ? 0 : 5])),
      pin,
      NEURO_CATEGORIES
    );
  };

  const newCase = () => {
    setEditing(emptyCase());
    setTab("new");
  };

  const saveCase = (c) => {
    const exists = cases.some((x) => x.id === c.id);
    const next = exists
      ? cases.map((x) => (x.id === c.id ? c : x))
      : [{ ...c, createdAt: new Date().toISOString() }, ...cases];
    persistCases(next);
    setEditing(null);
    setTab("cases");
  };

  const deleteCase = (id) => {
    if (!window.confirm("ลบเคสนี้ถาวรใช่ไหม")) return;
    persistCases(cases.filter((c) => c.id !== id));
    setViewing(null);
  };

  const neuro = useMemo(() => cases.filter((c) => c.service === "Neuroanesthesia"), [cases]);
  const counts = useMemo(() => {
    const m = {};
    categories.forEach((c) => (m[c] = 0));
    neuro.forEach((c) => {
      if (c.category && m[c.category] !== undefined) m[c.category] += 1;
    });
    return m;
  }, [neuro, categories]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return cases
      .filter((c) => (fService ? c.service === fService : true))
      .filter((c) => (fCategory ? c.category === fCategory : true))
      .filter((c) => (from ? c.date >= from : true))
      .filter((c) => (to ? c.date <= to : true))
      .filter((c) =>
        needle
          ? (JSON.stringify(caseToRow(c)) + fullName(c)).toLowerCase().includes(needle)
          : true
      )
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [cases, q, fService, fCategory, from, to]);

  const exportJson = (what) => {
    const payload = what === "diary" ? { diary } : { cases, targets };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${what === "diary" ? "diary" : "logbook"}-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJson = async (file) => {
    try {
      const data = JSON.parse(await file.text());
      if (Array.isArray(data.cases)) await persistCases(data.cases);
      if (Array.isArray(data.diary)) await persistDiary(data.diary);
      if (data.targets) await persistSettings({ ...targets, ...data.targets }, pin);
      flash("นำเข้าข้อมูลสำเร็จ");
    } catch (e) {
      flash("ไฟล์ไม่ถูกต้อง");
    }
  };

  const enterDiary = () => {
    setWorld("diary");
    if (!pin) setUnlocked(true);
  };
  const leaveDiary = () => {
    setWorld("logbook");
    setUnlocked(false);
  };

  /* ------------------------- diary world ------------------------- */
  if (world === "diary") {
    return (
      <div className="app world-diary">
        <style>{CSS}</style>
        {!unlocked && pin ? (
          <LockScreen pin={pin} onUnlock={() => setUnlocked(true)} onBack={leaveDiary} />
        ) : (
          <>
            <header className="top diary-top">
              <div className="brand">
                <Mascot size={76} variant="diary" />
                <div>
                  <h1>มุมส่วนตัว</h1>
                  <p>พื้นที่ปลอดภัยของเรา</p>
                </div>
              </div>
              <button className="btn btn-soft" onClick={leaveDiary}>
                ← กลับไป logbook
              </button>
            </header>
            <main>
              <DiaryWorld
                diary={diary}
                onChange={persistDiary}
                pin={pin}
                onSetPin={(p) => persistSettings(targets, p)}
                onBackup={() => exportJson("diary")}
              />
            </main>
            {toast && <div className="toast">{toast}</div>}
          </>
        )}
      </div>
    );
  }

  /* ------------------------- logbook world ------------------------ */
  return (
    <div className="app world-log">
      <style>{CSS}</style>

      <header className="top">
        <div className="brand">
          <Mascot size={82} />
          <div>
            <h1>Case Logbook</h1>
            <p className="brand-tag">Cloud of Care, Mind in Harmony</p>
          </div>
        </div>
        <nav className="tabs">
          {[
            ["progress", "ความคืบหน้า"],
            ["cases", "เคสทั้งหมด"],
            ["settings", "ตั้งค่า"],
          ].map(([k, l]) => (
            <button key={k} className={"tab" + (tab === k ? " tab-on" : "")} onClick={() => setTab(k)}>
              {l}
            </button>
          ))}
          <button className="tab tab-diary" onClick={enterDiary}>
            <span className="tab-orb" /> มุมส่วนตัว {pin ? "(ล็อกอยู่)" : ""}
          </button>
        </nav>
      </header>

      {loading ? (
        <p className="empty">กำลังโหลดข้อมูล…</p>
      ) : (
        <main>
          {tab === "progress" && (
            <>
              <div className="stats">
                <div className="stat">
                  <b>{cases.length}</b>
                  <span>เคสทั้งหมด</span>
                </div>
                <div className="stat">
                  <b>{neuro.length}</b>
                  <span>Neuroanesthesia</span>
                </div>
                <div className="stat">
                  <b>
                    {categories.filter((c) => targets[c] > 0 && counts[c] >= targets[c]).length}/
                    {categories.filter((c) => targets[c] > 0).length}
                  </b>
                  <span>category ที่ครบแล้ว</span>
                </div>
                <div className="stat">
                  <b>{cases.filter((c) => c.date.slice(0, 7) === today().slice(0, 7)).length}</b>
                  <span>เคสเดือนนี้</span>
                </div>
              </div>

              <div className="zones">
                {categories.map((cat) => {
                  const n = counts[cat];
                  const t = targets[cat] || 0;
                  const z = zoneOf(n, t);
                  const pct = t ? Math.min(100, (n / t) * 100) : n ? 100 : 0;
                  return (
                    <button
                      key={cat}
                      className={"zone z-" + z.key}
                      onClick={() => {
                        setFService("Neuroanesthesia");
                        setFCategory(cat);
                        setTab("cases");
                      }}
                    >
                      <div className="zone-t">
                        <span>{cat}</span>
                        <b>
                          {n}
                          {t ? ` / ${t}` : ""}
                        </b>
                      </div>
                      <div className="bar">
                        <i style={{ width: pct + "%" }} />
                      </div>
                      <span className="zone-s">{z.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {tab === "cases" && (
            <>
              <div className="filters">
                <input
                  className="search"
                  placeholder="ค้นหา HN, diagnosis, operation, ยา, note…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <select value={fService} onChange={(e) => setFService(e.target.value)}>
                  <option value="">ทุก service</option>
                  {SERVICES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <select value={fCategory} onChange={(e) => setFCategory(e.target.value)}>
                  <option value="">ทุก category</option>
                  {categories.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                <button className="btn btn-ghost" onClick={() => setShowNames((v) => !v)}>
                  {showNames ? "ซ่อนชื่อผู้ป่วย" : "แสดงชื่อผู้ป่วย"}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setQ("");
                    setFService("");
                    setFCategory("");
                    setFrom("");
                    setTo("");
                  }}
                >
                  ล้างตัวกรอง
                </button>
              </div>

              <p className="count-line">พบ {filtered.length} เคส</p>

              {filtered.length === 0 ? (
                <div className="empty-box">
                  <Mascot size={110} />
                  <p>ยังไม่มีเคสที่ตรงกับเงื่อนไข — กดปุ่ม + มุมขวาล่างเพื่อเพิ่มเคส</p>
                </div>
              ) : (
                <ul className="cases">
                  {filtered.map((c) => (
                    <li key={c.id}>
                      <button className="case" onClick={() => setViewing(c)}>
                        <div className="case-top">
                          <span className="date">{c.date}</span>
                          <span className="pill">{c.category || c.service}</span>
                        </div>
                        <strong>{c.operation || "—"}</strong>
                        <span className="case-sub">
                          {[
                            c.diagnosis,
                            c.hn && `HN ${c.hn}`,
                            showNames && fullName(c),
                            c.age && `${c.age} ${c.ageUnit}`,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {tab === "new" && editing && (
            <CaseForm
              key={editing.id}
              initial={editing}
              categories={categories}
              onSave={saveCase}
              onCancel={() => {
                setEditing(null);
                setTab("cases");
              }}
            />
          )}

          {tab === "settings" && (
            <>
              <Section title="Neuro category และจำนวนขั้นต่ำ" hint="ใส่ 0 = ไม่กำหนดเป้า">
                <div className="fld-wide">
                  <CategoryEditor
                    categories={categories}
                    targets={targets}
                    onSave={saveCategories}
                    onReset={resetCategories}
                  />
                </div>
              </Section>

              <Section title="ไฟล์ Excel และข้อมูลสำรอง">
                <div className="export-row">
                  <button className="btn btn-primary" onClick={() => exportExcel(cases, targets, categories)}>
                    ดาวน์โหลดไฟล์ Excel
                  </button>
                  <button className="btn btn-ghost" onClick={() => exportJson("logbook")}>
                    สำรอง logbook (.json)
                  </button>
                  <button className="btn btn-ghost" onClick={() => fileRef.current && fileRef.current.click()}>
                    กู้คืนจากไฟล์สำรอง
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/json"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files && e.target.files[0];
                      if (f) importJson(f);
                      e.target.value = "";
                    }}
                  />
                </div>
                <p className="note-text">
                  ไฟล์ Excel เก็บเฉพาะ วันที่ · HN · ชื่อ-นามสกุล · sex · age · diagnosis · operation ·
                  special monitoring · IONM โดยแยกชีตตาม neuro category และมีชีตรวมที่จัดกลุ่มไว้ให้
                  <strong> ไดอารี่ไม่ถูกรวมในไฟล์นี้ </strong>
                  รายละเอียดการดมยาส่วนที่เหลือยังอยู่ครบในแอปและค้นหาได้ ข้อมูลทั้งหมดเก็บอยู่ในแอปนี้เท่านั้น
                  ไฟล์ Excel มีชื่อผู้ป่วยอยู่ ควรเก็บไว้ในที่ปลอดภัย
                </p>
              </Section>
            </>
          )}
        </main>
      )}

      {tab !== "new" && (
        <button className="fab" onClick={newCase} title="เพิ่มเคสใหม่" aria-label="เพิ่มเคสใหม่">
          +
        </button>
      )}

      {viewing && (
        <CaseDetail
          c={viewing}
          onClose={() => setViewing(null)}
          onDelete={deleteCase}
          onEdit={(c) => {
            setEditing(c);
            setViewing(null);
            setTab("new");
          }}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* ================================================================== */
/* Lock screen                                                        */
/* ================================================================== */

function LockScreen({ pin, onUnlock, onBack }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    if (val === pin) onUnlock();
    else {
      setErr("รหัสยังไม่ตรง ลองใหม่อีกครั้งนะ");
      setVal("");
    }
  };
  return (
    <div className="lock">
      <Mascot size={150} dim variant="diary" />
      <h2>มุมส่วนตัว</h2>
      <p>ใส่รหัสเพื่อเปิดไดอารี่</p>
      <input
        className="pin-input"
        inputMode="numeric"
        maxLength={6}
        value={val}
        onChange={(e) => {
          setVal(e.target.value.replace(/\D/g, ""));
          setErr("");
        }}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="••••"
      />
      {err && <p className="err">{err}</p>}
      <div className="row lock-actions">
        <button className="btn btn-soft" onClick={onBack}>
          กลับ
        </button>
        <button className="btn btn-primary" onClick={submit}>
          เปิด
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Diary world                                                        */
/* ================================================================== */

function DiaryWorld({ diary, onChange, pin, onSetPin, onBackup }) {
  const [draft, setDraft] = useState(emptyDiary());
  const [editingId, setEditingId] = useState(null);
  const [q, setQ] = useState("");
  const [showPinBox, setShowPinBox] = useState(false);
  const [newPin, setNewPin] = useState("");

  const set = (k, v) => setDraft((p) => ({ ...p, [k]: v }));
  const toggleTag = (t) =>
    setDraft((p) => ({
      ...p,
      tags: (p.tags || []).includes(t) ? p.tags.filter((x) => x !== t) : [...(p.tags || []), t],
    }));

  const save = () => {
    if (!draft.body.trim() && !draft.title.trim()) return;
    const exists = diary.some((d) => d.id === draft.id);
    onChange(exists ? diary.map((d) => (d.id === draft.id ? draft : d)) : [draft, ...diary]);
    setDraft(emptyDiary());
    setEditingId(null);
  };
  const remove = (id) => {
    if (!window.confirm("ลบบันทึกนี้ใช่ไหม")) return;
    onChange(diary.filter((d) => d.id !== id));
  };
  const toggleDone = (id) =>
    onChange(diary.map((d) => (d.id === id ? { ...d, remindDone: !d.remindDone } : d)));

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return diary
      .filter((d) => (n ? (d.title + d.body + (d.tags || []).join("")).toLowerCase().includes(n) : true))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [diary, q]);

  const reminders = useMemo(
    () =>
      diary
        .filter((d) => d.remindOn && d.remindDate && !d.remindDone)
        .sort((a, b) => (a.remindDate > b.remindDate ? 1 : -1)),
    [diary]
  );

  const last14 = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const hit = diary.find((e) => e.date === key && e.mood);
      days.push({ key, mood: hit ? hit.mood : "", day: key.slice(8) });
    }
    return days;
  }, [diary]);

  return (
    <>
      <div className="mood-strip">
        <h3>ความรู้สึก 14 วันที่ผ่านมา</h3>
        <div className="strip-row">
          {last14.map((d) => (
            <div key={d.key} className="ms" title={d.key}>
              <Orb mood={d.mood} size={18} />
              <span className="ms-d">{Number(d.day)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="diary-form">
        <div className="row">
          <input type="date" value={draft.date} onChange={(e) => set("date", e.target.value)} />
          <input
            placeholder="หัวข้อของวันนี้"
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>

        <div className="mood-pick">
          <span className="fld-l">วันนี้ใจเป็นสีไหน</span>
          <div className="orbs">
            {MOOD_ORBS.map((m) => (
              <button
                key={m.id}
                type="button"
                className={"orb-wrap" + (draft.mood === m.id ? " picked" : "")}
                onClick={() => set("mood", draft.mood === m.id ? "" : m.id)}
              >
                <Orb mood={m.id} size={26} on={draft.mood === m.id} />
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="chips">
          {TAGS.map((t) => (
            <Chip key={t} on={(draft.tags || []).includes(t)} onClick={() => toggleTag(t)}>
              {t}
            </Chip>
          ))}
        </div>

        <textarea
          rows={6}
          placeholder="วันนี้เป็นยังไงบ้าง เขียนได้ทุกอย่างเลย…"
          value={draft.body}
          onChange={(e) => set("body", e.target.value)}
        />
        <div className="row remind-edit">
          <Chip on={draft.remindOn} onClick={() => set("remindOn", !draft.remindOn)}>
            ตั้งเตือนความจำ
          </Chip>
          {draft.remindOn && (
            <input type="date" value={draft.remindDate} onChange={(e) => set("remindDate", e.target.value)} />
          )}
          <button className="btn btn-primary" onClick={save}>
            {editingId ? "บันทึกการแก้ไข" : "เก็บไว้ในมุมนี้"}
          </button>
        </div>
      </div>

      {reminders.length > 0 && (
        <div className="remind-box">
          <h3>ยังค้างอยู่</h3>
          {reminders.slice(0, 6).map((d) => (
            <button key={d.id} className="remind-row" onClick={() => toggleDone(d.id)}>
              <span className="date">{d.remindDate}</span>
              <span>{d.title || d.body.slice(0, 60)}</span>
              <span className="tick">○</span>
            </button>
          ))}
        </div>
      )}

      <input
        className="search"
        placeholder="ค้นหาบันทึกย้อนหลัง"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {list.length === 0 ? (
        <div className="empty-box">
          <Mascot size={110} variant="diary" />
          <p>ยังไม่มีบันทึก — เขียนวันแรกได้เลยนะ</p>
        </div>
      ) : (
        <ul className="entries">
          {list.map((d) => (
            <li key={d.id} className="entry">
              <div className="entry-h">
                <span className="date">{d.date}</span>
                {d.mood && <Orb mood={d.mood} size={16} />}
              </div>
              {d.title && <strong>{d.title}</strong>}
              <p>{d.body}</p>
              {(d.tags || []).length > 0 && (
                <div className="entry-tags">
                  {d.tags.map((t) => (
                    <span key={t} className="pill">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {d.remindOn && d.remindDate && (
                <button
                  className={"remind-tag" + (d.remindDone ? " done" : "")}
                  onClick={() => toggleDone(d.id)}
                >
                  {d.remindDone ? "เสร็จแล้ว" : "เตือน " + d.remindDate}
                </button>
              )}
              <div className="entry-actions">
                <button
                  className="link"
                  onClick={() => {
                    setDraft({ tags: [], ...d });
                    setEditingId(d.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  แก้ไข
                </button>
                <button className="link danger" onClick={() => remove(d.id)}>
                  ลบ
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="diary-footer">
        <button className="btn btn-soft" onClick={() => setShowPinBox((s) => !s)}>
          {pin ? "เปลี่ยน / ปิดรหัส" : "ตั้งรหัสล็อกมุมนี้"}
        </button>
        <button className="btn btn-soft" onClick={onBackup}>
          สำรองไดอารี่ (.json)
        </button>
        {showPinBox && (
          <div className="pin-box">
            <input
              inputMode="numeric"
              maxLength={6}
              placeholder="รหัส 4 หลัก (เว้นว่าง = ไม่ล็อก)"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
            />
            <button
              className="btn btn-primary"
              onClick={() => {
                onSetPin(newPin);
                setNewPin("");
                setShowPinBox(false);
              }}
            >
              บันทึกรหัส
            </button>
            <p className="note-text">
              รหัสนี้เป็นการบังตาเบื้องต้นสำหรับเครื่องของตัวเอง ไม่ใช่การเข้ารหัสข้อมูล
            </p>
          </div>
        )}
      </div>
    </>
  );
}

/* ================================================================== */
/* Styles                                                             */
/* ================================================================== */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Noto+Sans+Thai:wght@400;500;600&display=swap');

.app{
  --ink:#6B5563; --muted:#B49AAB; --line:#F7DEE9;
  --pink:#F2A2C0; --pink-deep:#E07AA6; --pink-soft:#FDEFF5; --pink-ink:#D2628F;
  --plum:#A78BC8; --plum-soft:#F2ECFA;
  --low:#F3B98F; --met:#96CFB4; --over:#BFA3E4; --empty:#EEDFE8;
  min-height:100%; color:var(--ink);
  font-family:'Quicksand','Noto Sans Thai','Segoe UI',-apple-system,sans-serif;
  padding:22px 16px 96px; line-height:1.55;
}
.world-log{background:radial-gradient(900px 460px at 15% -10%, #FFE9F2 0%, rgba(255,233,242,0) 60%), #FDF6F9;}
.world-diary{background:radial-gradient(820px 460px at 82% -8%, #F6E6F4 0%, rgba(246,230,244,0) 62%), #F7F2FA;}
.app *{box-sizing:border-box}
h1,h2,h3{margin:0;font-weight:600}
.mascot{flex:none;user-select:none;filter:drop-shadow(0 6px 14px rgba(224,122,166,.22))}
.mascot-dim{opacity:.85}

.top{max-width:960px;margin:0 auto 20px}
.brand{display:flex;gap:14px;align-items:center;margin-bottom:16px}
.brand h1{font-size:25px;letter-spacing:-.2px;color:var(--pink-ink)}
.brand-sub{margin:2px 0 0;font-size:13px;color:var(--pink-deep);font-weight:500}
.brand-tag{margin:1px 0 0;font-size:12px;color:var(--muted);font-style:italic}
.diary-top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.diary-top .brand{margin-bottom:0}
.diary-top h1{color:#8E6DB8;font-size:22px}
.diary-top p{margin:2px 0 0;font-size:13px;color:var(--muted)}

.tabs{display:flex;gap:6px;overflow-x:auto;padding:4px 2px}
.tab{background:#fff;color:var(--muted);font-family:inherit;font-size:14px;font-weight:500;
  padding:9px 16px;border-radius:999px;cursor:pointer;white-space:nowrap;border:1px solid var(--line)}
.tab:hover{color:var(--pink-deep);border-color:var(--pink)}
.tab-on{background:var(--pink);border-color:var(--pink);color:#fff}
.tab-on:hover{color:#fff}
.tab-diary{margin-left:auto;background:var(--plum-soft);border-color:#E7DBF6;color:#7F60AE;
  display:inline-flex;align-items:center;gap:7px}
.tab-orb{width:12px;height:12px;border-radius:50%;display:inline-block;
  background:radial-gradient(circle at 32% 28%,#fff 0%,#EBE2F7 40%,#A98CD6 100%)}

main{max-width:960px;margin:0 auto}
.empty{color:var(--muted);font-size:14px;text-align:center;padding:44px 0}
.empty-box{display:grid;justify-items:center;gap:10px;padding:34px 0;text-align:center}
.empty-box p{margin:0;color:var(--muted);font-size:14px}

.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px}
.stat{background:#fff;border:1px solid var(--line);border-radius:20px;padding:14px 16px;
  box-shadow:0 6px 18px rgba(224,122,166,.07)}
.stat b{display:block;font-size:24px;font-weight:700;color:var(--pink-ink)}
.stat span{font-size:12px;color:var(--muted)}

.zones{display:grid;grid-template-columns:repeat(auto-fill,minmax(238px,1fr));gap:11px}
.zone{text-align:left;background:#fff;border:1px solid var(--line);border-left:6px solid var(--empty);
  border-radius:20px;padding:14px 16px;cursor:pointer;font-family:inherit;color:inherit;width:100%;
  box-shadow:0 6px 18px rgba(224,122,166,.07)}
.zone:hover{box-shadow:0 10px 22px rgba(224,122,166,.14)}
.zone-t{display:flex;justify-content:space-between;gap:8px;font-size:14px;align-items:baseline;font-weight:500}
.zone-t b{font-variant-numeric:tabular-nums;font-weight:700}
.bar{height:8px;border-radius:6px;background:#FBF1F6;margin:10px 0 7px;overflow:hidden}
.bar i{display:block;height:100%;border-radius:6px;background:var(--empty)}
.zone-s{font-size:12px;color:var(--muted)}
.z-low{border-left-color:var(--low)} .z-low .bar i{background:var(--low)} .z-low .zone-s{color:#D08A52}
.z-met{border-left-color:var(--met)} .z-met .bar i{background:var(--met)}
.z-met .zone-s{color:#579C7E;font-weight:600}
.z-over{border-left-color:var(--over)} .z-over .bar i{background:var(--over)}
.z-over .zone-s{color:#8A69C4;font-weight:600}

.filters{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
.search{flex:1 1 240px}
.count-line{font-size:12px;color:var(--muted);margin:0 0 10px}
.cases{list-style:none;padding:0;margin:0;display:grid;gap:9px}
.case{width:100%;text-align:left;background:#fff;border:1px solid var(--line);border-radius:18px;
  padding:14px 16px;cursor:pointer;font-family:inherit;color:inherit;box-shadow:0 5px 16px rgba(224,122,166,.06)}
.case:hover{border-color:var(--pink)}
.case-top{display:flex;gap:8px;align-items:center;margin-bottom:4px}
.case strong{display:block;font-size:15px;font-weight:600}
.case-sub{font-size:13px;color:var(--muted)}
.pill{background:var(--pink-soft);color:var(--pink-deep);font-size:11px;padding:3px 10px;border-radius:999px}
.date{color:var(--muted);font-size:12px;font-variant-numeric:tabular-nums}

.sect{background:#fff;border:1px solid var(--line);border-radius:22px;padding:18px;margin-bottom:12px;
  box-shadow:0 6px 18px rgba(224,122,166,.06)}
.sect-h{display:flex;align-items:baseline;gap:10px;margin-bottom:14px;padding-bottom:9px;
  border-bottom:1px dashed var(--line);flex-wrap:wrap}
.sect-h h3{font-size:15px;color:var(--pink-deep)}
.sect-hint{font-size:12px;color:var(--muted)}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:13px}
.fld{display:flex;flex-direction:column;gap:5px}
.fld-wide{grid-column:1/-1}
.fld-l{font-size:12px;color:var(--muted);font-weight:500}
.app input,.app select,.app textarea{
  font-family:inherit;font-size:14px;color:var(--ink);background:#FFFDFE;
  border:1px solid var(--line);border-radius:14px;padding:10px 13px;width:100%}
.app textarea{resize:vertical;line-height:1.6}
.app input:focus,.app select:focus,.app textarea:focus{
  outline:2px solid var(--pink);outline-offset:1px;border-color:var(--pink)}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.row>*{flex:1 1 110px}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{font-family:inherit;font-size:13px;padding:7px 13px;border-radius:999px;
  border:1px solid var(--line);background:#fff;color:var(--ink);cursor:pointer}
.chip:hover{border-color:var(--pink)}
.chip-on{background:var(--pink);border-color:var(--pink);color:#fff;font-weight:500}

.btn{font-family:inherit;font-size:14px;font-weight:600;padding:11px 20px;border-radius:999px;
  cursor:pointer;border:1px solid transparent}
.btn-primary{background:var(--pink);color:#fff;box-shadow:0 6px 16px rgba(224,122,166,.28)}
.btn-primary:hover{background:var(--pink-deep)}
.btn-ghost{background:#fff;border-color:var(--line);color:var(--ink)}
.btn-soft{background:var(--plum-soft);color:#7F60AE;border-color:#E7DBF6}
.btn-danger{background:#fff;border-color:#F2C6D2;color:#C0607A}
.form-actions{display:flex;justify-content:flex-end;gap:8px;margin:16px 0 34px}
.export-row{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:8px}
.note-text{grid-column:1/-1;font-size:12px;color:var(--muted);margin:8px 0 0;line-height:1.7}

.calc-box{display:flex;flex-wrap:wrap;gap:14px;align-items:center;background:var(--pink-soft);
  border:1px solid var(--line);border-radius:14px;padding:10px 14px;font-size:13px}
.calc-box b{font-size:16px;color:var(--pink-ink)}
.calc-box em{font-size:11px;color:var(--muted);font-style:normal;flex:1 1 100%}
.cat-list{display:grid;gap:8px}
.cat-row{display:grid;grid-template-columns:1fr 92px auto;gap:8px;align-items:center}
.cat-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;justify-content:flex-end}
.btn:disabled{opacity:.45;cursor:default;box-shadow:none}
.unit-sel{flex:0 0 110px}

.fab{position:fixed;right:18px;bottom:22px;width:60px;height:60px;border-radius:50%;border:none;
  background:linear-gradient(150deg,#F9BBD3,#E07AA6);color:#fff;font-size:32px;font-weight:400;
  line-height:1;cursor:pointer;box-shadow:0 10px 24px rgba(224,122,166,.42);z-index:45}
.fab:hover{background:linear-gradient(150deg,#F7A9C7,#D2628F)}

.modal-bg{position:fixed;inset:0;background:rgba(107,85,99,.4);display:flex;align-items:center;
  justify-content:center;padding:16px;z-index:50}
.modal{background:#fff;border-radius:26px;padding:22px;max-width:720px;width:100%;max-height:86vh;overflow:auto}
.modal-h{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px}
.modal-h h2{font-size:18px}
.sub{font-size:13px;color:var(--muted);margin:3px 0 0}
.name-line{font-size:13px;color:var(--muted);margin:6px 0 0;display:flex;gap:8px;align-items:center}
.name-line span{color:var(--ink);letter-spacing:.05em}
.dl{margin:0}
.dl-row{display:grid;grid-template-columns:180px 1fr;gap:10px;padding:8px 0;
  border-top:1px dashed var(--line);font-size:14px}
.dl-row dt{color:var(--muted);font-size:12px;padding-top:2px}
.dl-row dd{margin:0}

.lock{max-width:340px;margin:7vh auto;text-align:center;display:grid;gap:10px;justify-items:center}
.lock h2{font-size:20px;color:#8E6DB8}
.lock p{margin:0;font-size:13px;color:var(--muted)}
.pin-input{max-width:180px;text-align:center;letter-spacing:.4em;font-size:20px}
.lock-actions{justify-content:center;max-width:260px}
.lock-actions .btn{flex:1 1 auto}
.err{color:#C0607A;font-size:13px}

/* orbs */
.orb{display:inline-block;border-radius:50%;flex:none;
  box-shadow:inset -2px -3px 6px rgba(0,0,0,.08), 0 3px 8px rgba(150,110,170,.18)}
.orb-empty{background:#F1EAF4;box-shadow:inset 0 0 0 1px #EADFF0}
.orb-btn{cursor:pointer}
.orbs{display:flex;flex-wrap:wrap;gap:10px;margin-top:6px}
.orb-wrap{background:none;border:none;padding:5px 3px;border-radius:14px;cursor:pointer;
  display:grid;justify-items:center;gap:4px;font-family:inherit;width:60px}
.orb-wrap span{font-size:10px;color:var(--muted)}
.orb-wrap.picked{background:rgba(255,255,255,.85);box-shadow:0 4px 12px rgba(167,139,200,.18)}
.orb-wrap.picked span{color:var(--ink);font-weight:600}
.orb-on{box-shadow:inset -2px -3px 6px rgba(0,0,0,.08), 0 0 0 3px rgba(255,255,255,.9), 0 4px 12px rgba(150,110,170,.3)}

.mood-strip{background:rgba(255,255,255,.8);border:1px solid #EEE0F5;border-radius:22px;
  padding:14px 16px;margin-bottom:14px}
.mood-strip h3{font-size:13px;color:#8E6DB8;margin-bottom:10px;font-weight:600}
.strip-row{display:flex;gap:8px;overflow-x:auto;padding-bottom:2px}
.ms{display:grid;justify-items:center;gap:4px;flex:1 0 24px}
.ms-d{font-size:10px;color:var(--muted)}

.diary-form{background:rgba(255,255,255,.94);border:1px solid #EEE0F5;border-radius:26px;
  padding:18px;margin-bottom:14px;display:grid;gap:12px;box-shadow:0 8px 24px rgba(167,139,200,.12)}
.mood-pick{display:grid;gap:2px}
.remind-edit{align-items:center}
.remind-edit .btn{flex:0 0 auto;margin-left:auto}

.remind-box{background:rgba(255,255,255,.88);border:1px solid #EEE0F5;border-radius:22px;
  padding:14px 16px;margin-bottom:14px}
.remind-box h3{font-size:14px;margin-bottom:8px;color:#8E6DB8}
.remind-row{width:100%;display:flex;gap:10px;align-items:center;font-family:inherit;font-size:13px;
  text-align:left;padding:7px 0;border:none;border-top:1px dashed var(--line);background:none;
  color:inherit;cursor:pointer}
.remind-row .tick{margin-left:auto;color:var(--plum)}

.entries{list-style:none;padding:0;margin:14px 0 0;display:grid;gap:11px}
.entry{background:rgba(255,255,255,.94);border:1px solid #EEE0F5;border-radius:22px;padding:16px 18px;
  box-shadow:0 6px 18px rgba(167,139,200,.08)}
.entry-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.entry strong{display:block;font-size:15px;margin-bottom:3px}
.entry p{margin:0;font-size:14px;white-space:pre-wrap}
.entry-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
.remind-tag{margin-top:9px;font-family:inherit;font-size:12px;padding:5px 12px;border-radius:999px;
  border:1px solid #EFC3DC;background:#FDF1F8;color:#B0658E;cursor:pointer}
.remind-tag.done{border-color:var(--line);background:#F6F2F8;color:var(--muted);text-decoration:line-through}
.entry-actions{display:flex;gap:14px;margin-top:9px}
.link{background:none;border:none;padding:0;font-family:inherit;font-size:13px;color:var(--plum);cursor:pointer}
.link.danger{color:#C0607A}
.diary-footer{margin:26px 0 10px;display:flex;flex-wrap:wrap;gap:8px}
.pin-box{flex:1 1 100%;display:flex;flex-wrap:wrap;gap:8px;align-items:center;
  background:rgba(255,255,255,.92);border:1px solid #EEE0F5;border-radius:20px;padding:14px}
.pin-box input{flex:1 1 200px}

.toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#7A6172;color:#fff;
  font-size:13px;padding:10px 20px;border-radius:999px;z-index:60}

@media (max-width:640px){
  .grid{grid-template-columns:1fr}
  .stats{grid-template-columns:1fr 1fr}
  .dl-row{grid-template-columns:1fr;gap:2px}
  .modal{padding:16px;border-radius:20px}
  .tab-diary{margin-left:0}
  .brand h1{font-size:21px}
  .orb-wrap{width:64px}
}
@media (prefers-reduced-motion:reduce){.app *{transition:none!important}}
`;

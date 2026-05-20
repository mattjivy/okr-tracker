import { useState, useEffect, useRef } from "react";

const B = {
  hedera:        "#005545",
  hederaMid:     "#007a62",
  hederaLight:   "#e6f4f0",
  tradewind:     "#77BBAA",
  tradewindLight:"#d0ede7",
  kite:          "#EEFFF8",
  bluemine:      "#225588",
  bluemineLight: "#dce6f5",
  timber:        "#112222",
  timberMid:     "#2a4444",
  leather:       "#9D7050",
  leatherLight:  "#f5ece4",
  pageBg:        "#f4f8f6",
  cardBg:        "#ffffff",
  border:        "#c8ddd8",
  muted:         "#6a8e86",
  mutedLight:    "#a8c4bc",
};

const INITIAL_DATA = {
  goal: "Prepare for the next season of growth",
  leadership: [
    { id: "ceo",    role: "CEO",              focus: "Sales",         owner: "Daylen" },
    { id: "meddir", role: "Medical director", focus: "Mental health",  owner: "Amir"   },
    { id: "coo",    role: "COO",              focus: "EOS",           owner: "Matt"   },
  ],
  departments: [
    {
      id: "ivy", name: "Ivy", subtitle: "In-person model", owner: "Afton",
      items: [
        { id: 1, text: "Train/onboard Becky @ YCDF",         status: "not started" },
        { id: 2, text: "Create facility implementation plan", status: "not started" },
        { id: 3, text: "Strategic rest",                      status: "not started" },
      ],
    },
    {
      id: "aspen", name: "Aspen", subtitle: "Telehealth model", owner: "Valerie",
      items: [
        { id: 4, text: "P+Ps",           status: "not started" },
        { id: 5, text: "Stabilize team", status: "not started" },
      ],
    },
    {
      id: "bizops", name: "Business ops", subtitle: "Internal operations", owner: "Isaac",
      items: [
        { id: 6, text: "AI plan",                                           status: "not started" },
        { id: 7, text: "IT / tech resourcing",                              status: "not started" },
        { id: 8, text: "Process formalization, documentation, SOS manuals", status: "not started" },
        { id: 9, text: "Paylocity implementation",                          status: "not started" },
      ],
    },
    {
      id: "quality", name: "Quality", subtitle: "Quality assurance", owner: "Shyra",
      items: [
        { id: 10, text: "Emergency preparedness", status: "not started" },
        { id: 11, text: "Form standardization",   status: "not started" },
      ],
    },
  ],
};

const STATUS_OPTIONS = ["not started", "in progress", "on track", "at risk", "complete"];
const STATUS_COLORS = {
  "not started": "#8aada6",
  "in progress": "#225588",
  "on track":    "#007a62",
  "at risk":     "#9D7050",
  "complete":    "#005545",
};

const STORAGE_KEY = "okr_hub_v4";

async function loadData() {
  try { const r = await window.storage.get(STORAGE_KEY); return r ? JSON.parse(r.value) : null; }
  catch { return null; }
}
async function saveData(data) {
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function StatusDot({ status }) {
  return <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLORS[status], flexShrink: 0, marginTop: 4 }} />;
}

function StatusPill({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        fontSize: 10, fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
        padding: "3px 9px", borderRadius: 20,
        border: `1.5px solid ${STATUS_COLORS[status]}`,
        background: STATUS_COLORS[status] + "18", color: STATUS_COLORS[status],
        cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap",
      }}>{status}</button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 200,
          background: "#fff", border: `1px solid ${B.border}`, borderRadius: 8,
          padding: 4, minWidth: 145, boxShadow: "0 8px 24px rgba(0,40,30,0.12)",
        }}>
          {STATUS_OPTIONS.map(s => (
            <div key={s} onClick={() => { onChange(s); setOpen(false); }} style={{
              padding: "7px 10px", fontSize: 10, fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
              color: STATUS_COLORS[s], cursor: "pointer", borderRadius: 5,
              textTransform: "uppercase", letterSpacing: "0.05em",
              display: "flex", alignItems: "center", gap: 8,
            }}
              onMouseEnter={e => e.currentTarget.style.background = B.hederaLight}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_COLORS[s] }} />
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditableText({ value, onChange, style = {} }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const commit = () => { onChange(draft); setEditing(false); };
  if (editing) return (
    <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
      style={{ background: B.kite, border: `1.5px solid ${B.tradewind}`, borderRadius: 4, padding: "2px 7px", color: B.timber, outline: "none", width: "100%", fontFamily: "'Montserrat', sans-serif", fontSize: 13 }}
    />
  );
  return <span onClick={() => { setDraft(value); setEditing(true); }} style={{ cursor: "text", ...style }}>{value}</span>;
}

function Panel({ node, type, onClose, onUpdate }) {
  const [newText, setNewText] = useState("");
  const addItem = () => {
    if (!newText.trim()) return;
    onUpdate({ ...node, items: [...(node.items || []), { id: Date.now(), text: newText.trim(), status: "not started" }] });
    setNewText("");
  };
  return (
    <div style={{
      position: "fixed", top: 0, right: 0, width: 350, height: "100vh",
      background: "#fff", borderLeft: `1.5px solid ${B.border}`,
      boxShadow: "-12px 0 40px rgba(0,40,30,0.1)",
      display: "flex", flexDirection: "column", zIndex: 300,
      animation: "slideIn 0.18s ease",
    }}>
      <style>{`@keyframes slideIn { from { transform: translateX(16px); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>

      <div style={{ padding: "24px 24px 18px", borderBottom: `1px solid ${B.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: B.tradewind, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 7 }}>
            {type === "leadership" ? "Leadership" : "Department"}
          </div>
          <div style={{ fontSize: 20, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: B.timber, lineHeight: 1.2 }}>
            {node.name || node.role}
          </div>
          <div style={{ fontSize: 12, fontFamily: "'Montserrat', sans-serif", fontWeight: 600, color: B.hederaMid, marginTop: 4 }}>
            {node.subtitle || node.focus}
          </div>
          {node.owner && (
            <div style={{ fontSize: 11, fontFamily: "'Montserrat', sans-serif", color: B.muted, marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: B.leather }} />
              {node.owner}
            </div>
          )}
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: B.mutedLight, cursor: "pointer", fontSize: 22, lineHeight: 1, padding: 0, marginTop: 2 }}
          onMouseEnter={e => e.currentTarget.style.color = B.timber}
          onMouseLeave={e => e.currentTarget.style.color = B.mutedLight}
        >×</button>
      </div>

      {type === "leadership" && (
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${B.border}` }}>
          <div style={{ fontSize: 9, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: B.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Focus area</div>
          <EditableText value={node.focus} onChange={v => onUpdate({ ...node, focus: v })} style={{ fontSize: 15, color: B.hederaMid, fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }} />
        </div>
      )}

      {type === "department" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px" }}>
          <div style={{ fontSize: 9, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: B.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>Initiatives</div>
          {(node.items || []).map(item => (
            <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: `1px solid ${B.hederaLight}` }}>
              <StatusDot status={item.status} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <EditableText
                  value={item.text}
                  onChange={v => onUpdate({ ...node, items: node.items.map(i => i.id === item.id ? { ...i, text: v } : i) })}
                  style={{ fontSize: 13, color: B.timberMid, lineHeight: 1.5, display: "block", fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <StatusPill status={item.status} onChange={s => onUpdate({ ...node, items: node.items.map(i => i.id === item.id ? { ...i, status: s } : i) })} />
                <button onClick={() => onUpdate({ ...node, items: node.items.filter(i => i.id !== item.id) })}
                  style={{ background: "none", border: "none", color: B.mutedLight, cursor: "pointer", fontSize: 15, padding: 0, lineHeight: 1 }}
                  onMouseEnter={e => e.currentTarget.style.color = "#c0392b"}
                  onMouseLeave={e => e.currentTarget.style.color = B.mutedLight}
                >×</button>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <input value={newText} onChange={e => setNewText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addItem(); }}
              placeholder="Add initiative..."
              style={{ flex: 1, background: B.pageBg, border: `1.5px solid ${B.border}`, borderRadius: 6, padding: "7px 10px", color: B.timber, fontSize: 12, fontFamily: "'Montserrat', sans-serif", outline: "none" }}
            />
            <button onClick={addItem} style={{
              background: B.hedera, border: "none", borderRadius: 6, color: "#fff",
              cursor: "pointer", padding: "7px 14px", fontSize: 11,
              fontFamily: "'Montserrat', sans-serif", fontWeight: 700, letterSpacing: "0.04em",
            }}
              onMouseEnter={e => e.currentTarget.style.background = B.hederaMid}
              onMouseLeave={e => e.currentTarget.style.background = B.hedera}
            >Add</button>
          </div>
        </div>
      )}
    </div>
  );
}

const HUB = { x: 340, y: 300 };
const LEADER_POSITIONS = [
  { x: 120, y: 90 },
  { x: 340, y: 60 },
  { x: 560, y: 90 },
];
const DEPT_POSITIONS = [
  { x: 100, y: 490 },
  { x: 240, y: 530 },
  { x: 440, y: 530 },
  { x: 580, y: 490 },
];

function getStatusSummary(items) {
  if (!items || items.length === 0) return "not started";
  const c = {};
  items.forEach(i => c[i.status] = (c[i.status] || 0) + 1);
  if (c["at risk"])                   return "at risk";
  if (c["in progress"])               return "in progress";
  if (c["complete"] === items.length) return "complete";
  if (c["on track"])                  return "on track";
  return "not started";
}

export default function OKRTracker() {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    loadData().then(stored => { setData(stored || INITIAL_DATA); setLoaded(true); });
  }, []);

  useEffect(() => {
    if (!loaded || !data) return;
    const t = setTimeout(() => saveData(data).then(() => setSavedAt(new Date())), 800);
    return () => clearTimeout(t);
  }, [data, loaded]);

  if (!loaded) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: B.muted, fontFamily: "'Montserrat', sans-serif", fontSize: 13 }}>
      Loading...
    </div>
  );

  const updateLeader = (id, u) => setData(d => ({ ...d, leadership: d.leadership.map(l => l.id === id ? u : l) }));
  const updateDept = (id, u) => {
    setData(d => ({ ...d, departments: d.departments.map(dep => dep.id === id ? u : dep) }));
    if (selected?.node?.id === id) setSelected(s => ({ ...s, node: u }));
  };

  return (
    <div style={{ background: B.pageBg, minHeight: "100vh", fontFamily: "'Montserrat', sans-serif", color: B.timber, position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        button { font-family: 'Montserrat', sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: ${B.pageBg}; }
        ::-webkit-scrollbar-thumb { background: ${B.tradewindLight}; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "28px 32px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: B.tradewind, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 8 }}>
            OKR Tracker
          </div>
          <div style={{ fontSize: 22, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: B.timber, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
            "{data.goal}"
          </div>
        </div>
        {savedAt && (
          <div style={{ fontSize: 9, color: B.mutedLight, fontFamily: "'Montserrat', sans-serif", marginTop: 4 }}>
            saved {savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>

      {/* SVG */}
      <svg width="100%" viewBox="0 0 680 620" style={{ display: "block", maxHeight: 640 }}>
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke={B.tradewind} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>

        {LEADER_POSITIONS.map((pos, i) => (
          <line key={i} x1={pos.x} y1={pos.y + 32} x2={HUB.x} y2={HUB.y - 38}
            stroke={B.tradewind} strokeWidth="1.5" strokeOpacity="0.5" markerEnd="url(#arr)" />
        ))}
        {DEPT_POSITIONS.map((pos, i) => (
          <line key={i} x1={HUB.x} y1={HUB.y + 38} x2={pos.x} y2={pos.y - 28}
            stroke={B.tradewind} strokeWidth="1.5" strokeOpacity="0.5" markerEnd="url(#arr)" />
        ))}

        {/* Hub */}
        <g>
          <rect x={HUB.x - 130} y={HUB.y - 40} width={260} height={80} rx={12}
            fill={B.hedera} />
          <text x={HUB.x} y={HUB.y - 10} textAnchor="middle" fill="#ffffff" fontSize={14} fontWeight={700} fontFamily="'Playfair Display', serif">
            Prepare for next growth
          </text>
          <text x={HUB.x} y={HUB.y + 14} textAnchor="middle" fill={B.tradewindLight} fontSize={9} fontFamily="'Montserrat', sans-serif" fontWeight={700} letterSpacing="0.12em">
            COMPANY GOAL
          </text>
        </g>

        {/* Leadership nodes — white cards with strong border */}
        {data.leadership.map((person, i) => {
          const pos = LEADER_POSITIONS[i];
          const isSel = selected?.node?.id === person.id;
          return (
            <g key={person.id} style={{ cursor: "pointer" }} onClick={() => setSelected(isSel ? null : { node: person, type: "leadership" })}>
              <rect x={pos.x - 74} y={pos.y - 34} width={148} height={68} rx={9}
                fill={isSel ? B.hederaLight : B.cardBg}
                stroke={isSel ? B.hedera : B.tradewind}
                strokeWidth={isSel ? 2 : 1.5} />
              <text x={pos.x} y={pos.y - 12} textAnchor="middle" fill={B.timber} fontSize={13} fontWeight={700} fontFamily="'Montserrat', sans-serif">{person.role}</text>
              <text x={pos.x} y={pos.y + 6} textAnchor="middle" fill={B.hederaMid} fontSize={11} fontFamily="'Montserrat', sans-serif" fontWeight={600}>{person.focus}</text>
              <text x={pos.x} y={pos.y + 22} textAnchor="middle" fill={B.muted} fontSize={10} fontFamily="'Montserrat', sans-serif">{person.owner}</text>
            </g>
          );
        })}

        {/* Department nodes — white cards with strong border */}
        {data.departments.map((dept, i) => {
          const pos = DEPT_POSITIONS[i];
          const isSel = selected?.node?.id === dept.id;
          const summary = getStatusSummary(dept.items);
          const dotColor = STATUS_COLORS[summary];
          const total = dept.items?.length || 0;
          const done = dept.items?.filter(it => it.status === "complete").length || 0;
          return (
            <g key={dept.id} style={{ cursor: "pointer" }} onClick={() => setSelected(isSel ? null : { node: dept, type: "department" })}>
              <rect x={pos.x - 74} y={pos.y - 30} width={148} height={60} rx={9}
                fill={isSel ? B.hederaLight : B.cardBg}
                stroke={isSel ? B.hedera : B.tradewind}
                strokeWidth={isSel ? 2 : 1.5} />
              <text x={pos.x} y={pos.y - 10} textAnchor="middle" fill={B.timber} fontSize={13} fontWeight={700} fontFamily="'Montserrat', sans-serif">{dept.name}</text>
              <text x={pos.x} y={pos.y + 7} textAnchor="middle" fill={B.muted} fontSize={10} fontFamily="'Montserrat', sans-serif">{dept.owner}</text>
              <circle cx={pos.x - 26} cy={pos.y + 21} r={4} fill={dotColor} />
              <text x={pos.x - 8} y={pos.y + 25} textAnchor="middle" fill={B.timberMid} fontSize={10} fontFamily="'Montserrat', sans-serif" fontWeight={600}>{done}/{total}</text>
              <text x={pos.x + 20} y={pos.y + 25} textAnchor="middle" fill={B.muted} fontSize={9} fontFamily="'Montserrat', sans-serif">items</text>
            </g>
          );
        })}

        <text x={110} y={46} textAnchor="middle" fill={B.mutedLight} fontSize={8} fontFamily="'Montserrat', sans-serif" fontWeight={700} letterSpacing="0.1em">LEADERSHIP</text>
        <text x={340} y={580} textAnchor="middle" fill={B.mutedLight} fontSize={8} fontFamily="'Montserrat', sans-serif" fontWeight={700} letterSpacing="0.1em">DEPARTMENTS — CLICK TO MANAGE</text>
      </svg>

      {/* Status legend */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", padding: "0 32px 28px" }}>
        {STATUS_OPTIONS.map(s => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_COLORS[s] }} />
            <span style={{ fontSize: 9, color: B.muted, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s}</span>
          </div>
        ))}
      </div>

      {selected && (
        <>
          <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, zIndex: 250 }} />
          <Panel
            node={selected.node}
            type={selected.type}
            onClose={() => setSelected(null)}
            onUpdate={updated => {
              if (selected.type === "leadership") updateLeader(updated.id, updated);
              else updateDept(updated.id, updated);
              setSelected(s => ({ ...s, node: updated }));
            }}
          />
        </>
      )}
    </div>
  );
}

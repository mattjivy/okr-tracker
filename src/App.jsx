import { useState, useEffect, useRef } from "react";

const B = {
  hedera:        "#005545",
  hederaMid:     "#007a62",
  hederaLight:   "#e6f4f0",
  tradewind:     "#77BBAA",
  tradewindLight:"#d0ede7",
  kite:          "#EEFFF8",
  timber:        "#112222",
  timberMid:     "#2a4444",
  leather:       "#9D7050",
  pageBg:        "#f4f8f6",
  cardBg:        "#ffffff",
  border:        "#c8ddd8",
  muted:         "#6a8e86",
  mutedLight:    "#a8c4bc",
};

const STATUS_OPTIONS = ["not started", "in progress", "on track", "at risk", "complete"];
const STATUS_COLORS = {
  "not started": "#8aada6",
  "in progress": "#225588",
  "on track":    "#007a62",
  "at risk":     "#9D7050",
  "complete":    "#005545",
};

function makeObjective(text = "") {
  return { id: Date.now() + Math.random(), text, keyResults: [] };
}

function makeKR(text = "") {
  return { id: Date.now() + Math.random(), text, status: "not started" };
}

const INITIAL_DATA = {
  goal: "Prepare for the next season of growth",
  leadership: [
    { id: "ceo",    role: "CEO",              focus: "Sales",         owner: "Daylen", objectives: [] },
    { id: "meddir", role: "Medical director", focus: "Mental health",  owner: "Amir",   objectives: [] },
    { id: "coo",    role: "COO",              focus: "EOS",           owner: "Matt",   objectives: [] },
  ],
  departments: [
    {
      id: "ivy", name: "Ivy", subtitle: "In-person model", owner: "Afton",
      objectives: [
        { id: 101, text: "", keyResults: [
          { id: 1, text: "Train/onboard Becky @ YCDF",         status: "not started" },
          { id: 2, text: "Create facility implementation plan", status: "not started" },
          { id: 3, text: "Strategic rest",                      status: "not started" },
        ]},
      ],
    },
    {
      id: "aspen", name: "Aspen", subtitle: "Telehealth model", owner: "Valerie",
      objectives: [
        { id: 102, text: "", keyResults: [
          { id: 4, text: "P+Ps",           status: "not started" },
          { id: 5, text: "Stabilize team", status: "not started" },
        ]},
      ],
    },
    {
      id: "bizops", name: "Business ops", subtitle: "Internal operations", owner: "Isaac",
      objectives: [
        { id: 103, text: "", keyResults: [
          { id: 6, text: "AI plan",                                           status: "not started" },
          { id: 7, text: "IT / tech resourcing",                              status: "not started" },
          { id: 8, text: "Process formalization, documentation, SOS manuals", status: "not started" },
          { id: 9, text: "Paylocity implementation",                          status: "not started" },
        ]},
      ],
    },
    {
      id: "quality", name: "Quality", subtitle: "Quality assurance", owner: "Shyra",
      objectives: [
        { id: 104, text: "", keyResults: [
          { id: 10, text: "Emergency preparedness", status: "not started" },
          { id: 11, text: "Form standardization",   status: "not started" },
        ]},
      ],
    },
  ],
};

const STORAGE_KEY = "okr_hub_v6";

function loadData() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function getNodeSummary(objectives) {
  const allKRs = (objectives || []).flatMap(o => o.keyResults || []);
  if (!allKRs.length) return { status: "not started", done: 0, total: 0 };
  const c = {};
  allKRs.forEach(k => c[k.status] = (c[k.status] || 0) + 1);
  const status = c["at risk"] ? "at risk"
    : c["in progress"] ? "in progress"
    : c["complete"] === allKRs.length ? "complete"
    : c["on track"] ? "on track"
    : "not started";
  return { status, done: c["complete"] || 0, total: allKRs.length };
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
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        fontSize: 10, fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
        padding: "3px 9px", borderRadius: 20,
        border: `1.5px solid ${STATUS_COLORS[status]}`,
        background: STATUS_COLORS[status] + "18", color: STATUS_COLORS[status],
        cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap",
      }}>{status}</button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 300,
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

function InlineEdit({ value, onChange, placeholder, multiline }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const commit = () => { onChange(draft); setEditing(false); };
  const baseStyle = {
    background: "transparent", border: "none", outline: "none",
    width: "100%", fontFamily: "'Montserrat', sans-serif",
    fontSize: 13, color: B.timberMid, lineHeight: 1.5, padding: 0,
  };
  if (editing) {
    if (multiline) return (
      <textarea autoFocus value={draft} rows={2}
        onChange={e => setDraft(e.target.value)} onBlur={commit}
        onKeyDown={e => { if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
        placeholder={placeholder}
        style={{ ...baseStyle, resize: "vertical", background: B.kite, border: `1.5px solid ${B.tradewind}`, borderRadius: 4, padding: "4px 7px" }}
      />
    );
    return (
      <input autoFocus value={draft}
        onChange={e => setDraft(e.target.value)} onBlur={commit}
        onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
        placeholder={placeholder}
        style={{ ...baseStyle, background: B.kite, border: `1.5px solid ${B.tradewind}`, borderRadius: 4, padding: "4px 7px" }}
      />
    );
  }
  return (
    <span onClick={() => { setDraft(value); setEditing(true); }} style={{ cursor: "text", display: "block", minHeight: 20 }}>
      {value || <span style={{ color: B.mutedLight, fontStyle: "italic", fontSize: 12 }}>{placeholder}</span>}
    </span>
  );
}

function ObjectiveBlock({ obj, idx, onChange, onDelete, isOnly }) {
  const [newKR, setNewKR] = useState("");
  const krs = obj.keyResults || [];

  const addKR = () => {
    if (!newKR.trim()) return;
    onChange({ ...obj, keyResults: [...krs, makeKR(newKR.trim())] });
    setNewKR("");
  };
  const updateKR = (id, changes) => onChange({ ...obj, keyResults: krs.map(k => k.id === id ? { ...k, ...changes } : k) });
  const deleteKR = (id) => onChange({ ...obj, keyResults: krs.filter(k => k.id !== id) });

  return (
    <div style={{ marginBottom: 24, background: B.cardBg, border: `1px solid ${B.border}`, borderRadius: 10, overflow: "hidden" }}>
      {/* Objective header */}
      <div style={{ background: B.hederaLight, padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{
          fontSize: 9, fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
          color: B.hedera, textTransform: "uppercase", letterSpacing: "0.12em",
          marginTop: 3, flexShrink: 0,
        }}>O{idx + 1}</div>
        <div style={{ flex: 1 }}>
          <InlineEdit
            value={obj.text}
            onChange={v => onChange({ ...obj, text: v })}
            placeholder="Click to write objective..."
            multiline
          />
        </div>
        {!isOnly && (
          <button onClick={onDelete} style={{ background: "none", border: "none", color: B.mutedLight, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0, flexShrink: 0, marginTop: 1 }}
            onMouseEnter={e => e.currentTarget.style.color = "#c0392b"}
            onMouseLeave={e => e.currentTarget.style.color = B.mutedLight}
            title="Remove objective"
          >×</button>
        )}
      </div>

      {/* KRs */}
      <div style={{ padding: "6px 14px 10px" }}>
        <div style={{ fontSize: 9, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: B.muted, textTransform: "uppercase", letterSpacing: "0.12em", margin: "8px 0 6px" }}>
          Key results
        </div>
        {krs.map((kr, ki) => (
          <div key={kr.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 0", borderBottom: `1px solid ${B.hederaLight}` }}>
            <div style={{ fontSize: 10, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: B.mutedLight, marginTop: 2, minWidth: 18, flexShrink: 0 }}>
              {ki + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <InlineEdit
                value={kr.text}
                onChange={v => updateKR(kr.id, { text: v })}
                placeholder="Key result..."
              />
            </div>
            <StatusPill status={kr.status} onChange={s => updateKR(kr.id, { status: s })} />
            <button onClick={() => deleteKR(kr.id)}
              style={{ background: "none", border: "none", color: B.mutedLight, cursor: "pointer", fontSize: 15, padding: 0, lineHeight: 1, flexShrink: 0, marginTop: 1 }}
              onMouseEnter={e => e.currentTarget.style.color = "#c0392b"}
              onMouseLeave={e => e.currentTarget.style.color = B.mutedLight}
            >×</button>
          </div>
        ))}

        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <input value={newKR} onChange={e => setNewKR(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addKR(); }}
            placeholder="Add key result..."
            style={{ flex: 1, background: B.pageBg, border: `1.5px solid ${B.border}`, borderRadius: 5, padding: "5px 8px", color: B.timber, fontSize: 12, fontFamily: "'Montserrat', sans-serif", outline: "none" }}
          />
          <button onClick={addKR} style={{
            background: B.hedera, border: "none", borderRadius: 5, color: "#fff",
            cursor: "pointer", padding: "5px 12px", fontSize: 11,
            fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
          }}
            onMouseEnter={e => e.currentTarget.style.background = B.hederaMid}
            onMouseLeave={e => e.currentTarget.style.background = B.hedera}
          >Add</button>
        </div>
      </div>
    </div>
  );
}

function Panel({ node, type, onClose, onUpdate }) {
  const objectives = node.objectives || [];
  const label = type === "leadership" ? node.role : node.name;
  const sublabel = type === "leadership" ? node.focus : node.subtitle;
  const { status, done, total } = getNodeSummary(objectives);

  const addObjective = () => {
    if (objectives.length >= 3) return;
    onUpdate({ ...node, objectives: [...objectives, makeObjective()] });
  };
  const updateObjective = (id, updated) => onUpdate({ ...node, objectives: objectives.map(o => o.id === id ? updated : o) });
  const deleteObjective = (id) => onUpdate({ ...node, objectives: objectives.filter(o => o.id !== id) });

  return (
    <div style={{
      position: "fixed", top: 0, right: 0, width: 420, height: "100vh",
      background: B.pageBg, borderLeft: `1.5px solid ${B.border}`,
      boxShadow: "-12px 0 40px rgba(0,40,30,0.1)",
      display: "flex", flexDirection: "column", zIndex: 300,
      animation: "slideIn 0.18s ease",
    }}>
      <style>{`@keyframes slideIn { from { transform: translateX(16px); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>

      {/* Header */}
      <div style={{ padding: "22px 24px 16px", borderBottom: `1px solid ${B.border}`, flexShrink: 0, background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: B.tradewind, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 5 }}>
              {type === "leadership" ? "Leadership" : "Department"}
            </div>
            <div style={{ fontSize: 20, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: B.timber, lineHeight: 1.2 }}>{label}</div>
            <div style={{ fontSize: 12, fontFamily: "'Montserrat', sans-serif", fontWeight: 600, color: B.hederaMid, marginTop: 3 }}>{sublabel}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
              {node.owner && (
                <div style={{ fontSize: 11, fontFamily: "'Montserrat', sans-serif", color: B.muted, display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: B.leather }} />
                  {node.owner}
                </div>
              )}
              {total > 0 && (
                <div style={{ fontSize: 11, fontFamily: "'Montserrat', sans-serif", color: B.muted }}>
                  {done}/{total} KRs complete
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: B.mutedLight, cursor: "pointer", fontSize: 22, lineHeight: 1, padding: 0, flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = B.timber}
            onMouseLeave={e => e.currentTarget.style.color = B.mutedLight}
          >×</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
        {objectives.map((obj, idx) => (
          <ObjectiveBlock
            key={obj.id}
            obj={obj}
            idx={idx}
            onChange={updated => updateObjective(obj.id, updated)}
            onDelete={() => deleteObjective(obj.id)}
            isOnly={objectives.length === 1}
          />
        ))}

        {objectives.length < 3 && (
          <button onClick={addObjective} style={{
            width: "100%", padding: "10px", background: "none",
            border: `1.5px dashed ${B.border}`, borderRadius: 8,
            color: B.muted, cursor: "pointer", fontSize: 12,
            fontFamily: "'Montserrat', sans-serif", fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = B.tradewind; e.currentTarget.style.color = B.hedera; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = B.border; e.currentTarget.style.color = B.muted; }}
          >
            + Add objective {objectives.length > 0 ? `(${objectives.length}/3)` : ""}
          </button>
        )}
      </div>
    </div>
  );
}

const HUB = { x: 340, y: 300 };
const LEADER_POSITIONS = [{ x: 120, y: 90 }, { x: 340, y: 60 }, { x: 560, y: 90 }];
const DEPT_POSITIONS   = [{ x: 100, y: 490 }, { x: 240, y: 530 }, { x: 440, y: 530 }, { x: 580, y: 490 }];

export default function OKRTracker() {
  const [data, setData] = useState(() => {
    const stored = loadData();
    if (stored) {
      // migrate old data formats
      stored.departments = stored.departments.map(d => {
        if (!d.objectives) {
          const krs = d.keyResults || d.items || [];
          return { ...d, objectives: [{ id: Date.now() + Math.random(), text: d.objective || "", keyResults: krs }] };
        }
        return d;
      });
      stored.leadership = stored.leadership.map(l => {
        if (!l.objectives) {
          const krs = l.keyResults || [];
          return { ...l, objectives: krs.length ? [{ id: Date.now() + Math.random(), text: l.objective || "", keyResults: krs }] : [] };
        }
        return l;
      });
      return stored;
    }
    return INITIAL_DATA;
  });
  const [selected, setSelected] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => { saveData(data); setSavedAt(new Date()); }, [data]);

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
        button, input, textarea { font-family: 'Montserrat', sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: ${B.pageBg}; }
        ::-webkit-scrollbar-thumb { background: ${B.tradewindLight}; border-radius: 3px; }
      `}</style>

      <div style={{ padding: "28px 32px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: B.tradewind, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 8 }}>OKR Tracker</div>
          <div style={{ fontSize: 22, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: B.timber, letterSpacing: "-0.01em", lineHeight: 1.2 }}>"{data.goal}"</div>
        </div>
        {savedAt && <div style={{ fontSize: 9, color: B.mutedLight, fontFamily: "'Montserrat', sans-serif", marginTop: 4 }}>saved {savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>}
      </div>

      <svg width="100%" viewBox="0 0 680 620" style={{ display: "block", maxHeight: 640 }}>
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke={B.tradewind} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>
        {LEADER_POSITIONS.map((pos, i) => <line key={i} x1={pos.x} y1={pos.y + 36} x2={HUB.x} y2={HUB.y - 40} stroke={B.tradewind} strokeWidth="1.5" strokeOpacity="0.5" markerEnd="url(#arr)" />)}
        {DEPT_POSITIONS.map((pos, i) => <line key={i} x1={HUB.x} y1={HUB.y + 40} x2={pos.x} y2={pos.y - 32} stroke={B.tradewind} strokeWidth="1.5" strokeOpacity="0.5" markerEnd="url(#arr)" />)}

        <g>
          <rect x={HUB.x - 130} y={HUB.y - 40} width={260} height={80} rx={12} fill={B.hedera} />
          <text x={HUB.x} y={HUB.y - 10} textAnchor="middle" fill="#fff" fontSize={14} fontWeight={700} fontFamily="'Playfair Display', serif">Prepare for next growth</text>
          <text x={HUB.x} y={HUB.y + 14} textAnchor="middle" fill={B.tradewindLight} fontSize={9} fontFamily="'Montserrat', sans-serif" fontWeight={700} letterSpacing="0.12em">COMPANY GOAL</text>
        </g>

        {data.leadership.map((person, i) => {
          const pos = LEADER_POSITIONS[i];
          const isSel = selected?.node?.id === person.id;
          const { status, done, total } = getNodeSummary(person.objectives);
          return (
            <g key={person.id} style={{ cursor: "pointer" }} onClick={() => setSelected(isSel ? null : { node: person, type: "leadership" })}>
              <rect x={pos.x - 74} y={pos.y - 36} width={148} height={72} rx={9}
                fill={isSel ? B.hederaLight : B.cardBg} stroke={isSel ? B.hedera : B.tradewind} strokeWidth={isSel ? 2 : 1.5} />
              <text x={pos.x} y={pos.y - 16} textAnchor="middle" fill={B.timber} fontSize={13} fontWeight={700} fontFamily="'Montserrat', sans-serif">{person.role}</text>
              <text x={pos.x} y={pos.y} textAnchor="middle" fill={B.hederaMid} fontSize={11} fontFamily="'Montserrat', sans-serif" fontWeight={600}>{person.focus}</text>
              <text x={pos.x} y={pos.y + 14} textAnchor="middle" fill={B.muted} fontSize={9} fontFamily="'Montserrat', sans-serif">{person.owner}</text>
              {total > 0
                ? <><circle cx={pos.x - 24} cy={pos.y + 27} r={3} fill={STATUS_COLORS[status]} /><text x={pos.x - 6} y={pos.y + 31} textAnchor="middle" fill={B.timberMid} fontSize={9} fontFamily="'Montserrat', sans-serif" fontWeight={600}>{done}/{total} KRs</text></>
                : <text x={pos.x} y={pos.y + 29} textAnchor="middle" fill={B.mutedLight} fontSize={8} fontFamily="'Montserrat', sans-serif" fontStyle="italic">click to add OKRs</text>
              }
            </g>
          );
        })}

        {data.departments.map((dept, i) => {
          const pos = DEPT_POSITIONS[i];
          const isSel = selected?.node?.id === dept.id;
          const { status, done, total } = getNodeSummary(dept.objectives);
          return (
            <g key={dept.id} style={{ cursor: "pointer" }} onClick={() => setSelected(isSel ? null : { node: dept, type: "department" })}>
              <rect x={pos.x - 74} y={pos.y - 32} width={148} height={64} rx={9}
                fill={isSel ? B.hederaLight : B.cardBg} stroke={isSel ? B.hedera : B.tradewind} strokeWidth={isSel ? 2 : 1.5} />
              <text x={pos.x} y={pos.y - 12} textAnchor="middle" fill={B.timber} fontSize={13} fontWeight={700} fontFamily="'Montserrat', sans-serif">{dept.name}</text>
              <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill={B.muted} fontSize={9} fontFamily="'Montserrat', sans-serif">{dept.owner}</text>
              {total > 0
                ? <><circle cx={pos.x - 24} cy={pos.y + 19} r={3} fill={STATUS_COLORS[status]} /><text x={pos.x - 6} y={pos.y + 23} textAnchor="middle" fill={B.timberMid} fontSize={9} fontFamily="'Montserrat', sans-serif" fontWeight={600}>{done}/{total} KRs</text></>
                : <text x={pos.x} y={pos.y + 20} textAnchor="middle" fill={B.mutedLight} fontSize={8} fontFamily="'Montserrat', sans-serif" fontStyle="italic">click to add OKRs</text>
              }
            </g>
          );
        })}

        <text x={110} y={46} textAnchor="middle" fill={B.mutedLight} fontSize={8} fontFamily="'Montserrat', sans-serif" fontWeight={700} letterSpacing="0.1em">LEADERSHIP</text>
        <text x={340} y={582} textAnchor="middle" fill={B.mutedLight} fontSize={8} fontFamily="'Montserrat', sans-serif" fontWeight={700} letterSpacing="0.1em">DEPARTMENTS — CLICK TO MANAGE</text>
      </svg>

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

import { useState, useRef, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────
// SVG Icon helper
// ─────────────────────────────────────────────
const Icon = ({ d, size = 16, stroke = "currentColor", ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {Array.isArray(d) ? d.map((dd, i) => <path key={i} d={dd} />) : <path d={d} />}
  </svg>
);

const I = {
  chevronDown:  "M6 9l6 6 6-6",
  chevronRight: "M9 18l6-6-6-6",
  plus:         "M12 5v14M5 12h14",
  trash:        ["M3 6h18","M8 6V4h8v2","M19 6l-1 14H6L5 6"],
  grip:         ["M9 5h.01","M9 12h.01","M9 19h.01","M15 5h.01","M15 12h.01","M15 19h.01"],
  home:         ["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z","M9 22V12h6v10"],
  zap:          "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  search:       "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
  settings:     ["M12 20a8 8 0 100-16 8 8 0 000 16z","M12 14a2 2 0 100-4 2 2 0 000 4z"],
  layout:       "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  fileText:     ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"],
  users:        ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2","M23 21v-2a4 4 0 00-3-3.87","M16 3.13a4 4 0 010 7.75"],
  calendar:     ["M3 9h18","M8 3v6","M16 3v6","M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z"],
  check:        "M20 6L9 17l-5-5",
  download:     ["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M7 10l5 5 5-5","M12 15V3"],
  edit:         ["M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7","M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"],
  x:            "M18 6L6 18M6 6l12 12",
  barChart:     ["M12 20V10","M18 20V4","M6 20v-6"],
  tag:          ["M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z","M7 7h.01"],
  userPlus:     ["M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2","M23 21v-2a4 4 0 00-3-3.87","M16 3.13a4 4 0 010 7.75","M20 8v6","M23 11h-6"],
  mail:         ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"],
  phone:        "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
  save:         ["M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z","M17 21v-8H7v8","M7 3v5h8"],
  warning:      ["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z","M12 9v4","M12 17h.01"],
};

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const STATUS_CFG = {
  Paid:      { bg:"bg-emerald-50", text:"text-emerald-700", dot:"bg-emerald-500", bar:"bg-emerald-400" },
  Planned:   { bg:"bg-amber-50",   text:"text-amber-700",   dot:"bg-amber-400",   bar:"bg-amber-300"   },
  Pending:   { bg:"bg-sky-50",     text:"text-sky-700",     dot:"bg-sky-500",     bar:"bg-sky-400"     },
  Cancelled: { bg:"bg-red-50",     text:"text-red-600",     dot:"bg-red-400",     bar:"bg-red-300"     },
};
const STATUS_LIST = Object.keys(STATUS_CFG);

const EMOJI_OPTIONS = ["🚀","💡","🌐","🎯","⚡","🏆","🎪","🔥","💼","🌟","🎓","🛠️","📊","🎨","🤝","🏅","🎤","📱","🖥️","🧪"];

const TEAM_SEED = [
  { id:1, name:"Aarav Sharma",  role:"President",      email:"aarav@ecell.in",  phone:"+91 98765 43210", avatar:"AS", color:"bg-violet-500" },
  { id:2, name:"Priya Nair",    role:"Finance Head",   email:"priya@ecell.in",  phone:"+91 91234 56789", avatar:"PN", color:"bg-emerald-500" },
  { id:3, name:"Rohit Mehra",   role:"Events Manager", email:"rohit@ecell.in",  phone:"+91 87654 32109", avatar:"RM", color:"bg-sky-500" },
  { id:4, name:"Sneha Gupta",   role:"Design Lead",    email:"sneha@ecell.in",  phone:"+91 76543 21098", avatar:"SG", color:"bg-amber-500" },
  { id:5, name:"Karan Verma",   role:"Marketing Head", email:"karan@ecell.in",  phone:"+91 65432 10987", avatar:"KV", color:"bg-rose-500" },
];

const SCHEDULE_SEED = [
  { id:1, eventId:1, title:"Venue Visit",         date:"2025-07-10", time:"10:00", type:"Meeting",   done:true  },
  { id:2, eventId:1, title:"Sponsor Deck Review", date:"2025-07-14", time:"14:00", type:"Review",    done:true  },
  { id:3, eventId:1, title:"Budget Finalization", date:"2025-07-18", time:"11:00", type:"Finance",   done:false },
  { id:4, eventId:2, title:"Kickoff Call",        date:"2025-08-01", time:"09:00", type:"Meeting",   done:false },
  { id:5, eventId:2, title:"Mentor Outreach",     date:"2025-08-05", time:"15:00", type:"Outreach",  done:false },
  { id:6, eventId:3, title:"Idea Submission Open",date:"2025-09-01", time:"00:00", type:"Milestone", done:false },
];

const INITIAL_EVENTS = [
  { id:1, icon:"🚀", name:"Scrap 2 Scale", rows:[
    { id:1, item:"Venue Booking",    qty:1,  cost:8000,  status:"Paid",    tags:[] },
    { id:2, item:"Prizes",           qty:1,  cost:2200,  status:"Planned", tags:["1200","600","400"] },
    { id:3, item:"Refreshments",     qty:50, cost:120,   status:"Pending", tags:[] },
    { id:4, item:"Printing & Flex",  qty:5,  cost:450,   status:"Paid",    tags:[] },
    { id:5, item:"Certificates",     qty:30, cost:35,    status:"Planned", tags:[] },
    { id:6, item:"Social Media Ads", qty:1,  cost:1500,  status:"Paid",    tags:[] },
  ]},
  { id:2, icon:"🌐", name:"Startup Weekend", rows:[
    { id:1, item:"Auditorium Rent",   qty:2,  cost:12000, status:"Pending", tags:[] },
    { id:2, item:"Mentor Honorarium", qty:5,  cost:3000,  status:"Planned", tags:[] },
    { id:3, item:"Meals & Snacks",    qty:80, cost:200,   status:"Planned", tags:[] },
    { id:4, item:"Swag Kits",         qty:40, cost:350,   status:"Pending", tags:[] },
  ]},
  { id:3, icon:"💡", name:"IdeaThon 3.0", rows:[
    { id:1, item:"Setup & Infra", qty:1, cost:5000,  status:"Planned", tags:[] },
    { id:2, item:"Prize Pool",    qty:1, cost:10000, status:"Planned", tags:["5000","3000","2000"] },
  ]},
];

let _rowId = 100, _evId = 10, _schId = 20, _tmId = 10;
const mkRow = () => ({ id:++_rowId, item:"New Item", qty:1, cost:0, status:"Planned", tags:[] });
const fmt   = (n) => "₹" + Number(n).toLocaleString("en-IN");
const fmtS  = (n) => n>=100000?"₹"+(n/100000).toFixed(1)+"L":n>=1000?"₹"+(n/1000).toFixed(0)+"K":fmt(n);

// ─────────────────────────────────────────────
// Shared UI primitives
// ─────────────────────────────────────────────
function Btn({ children, onClick, variant="primary", size="md", className="" }) {
  const sz = size==="sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const v  = variant==="primary" ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
           : variant==="danger"  ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
           :                       "bg-slate-100 text-slate-700 hover:bg-slate-200";
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 font-semibold rounded-xl transition-all ${sz} ${v} ${className}`}>
      {children}
    </button>
  );
}

function Avatar({ initials, color, size="w-9 h-9" }) {
  return <div className={`${size} ${color} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>{initials}</div>;
}

function Modal({ title, subtitle, onClose, children, footer, wide=false }) {
  useEffect(() => {
    const h = (e) => e.key==="Escape" && onClose();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => e.target===e.currentTarget && onClose()}>
      <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 ${wide?"w-[600px]":"w-[440px]"} max-h-[90vh] overflow-y-auto`}
        style={{animation:"mi .18s cubic-bezier(.4,0,.2,1)"}}>
        <style>{`@keyframes mi{from{opacity:0;transform:scale(.95) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 text-lg leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 pb-6 flex gap-2 justify-end border-t border-slate-100 pt-4">{footer}</div>}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type="text", onKeyDown }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown}
      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400 transition-colors bg-white"/>
  );
}

// ─────────────────────────────────────────────
// StatusPill
// ─────────────────────────────────────────────
function StatusPill({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const cfg = STATUS_CFG[value] || STATUS_CFG.Planned;
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative inline-block">
      <button onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text} hover:opacity-80 transition-all`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>{value}
        <Icon d={I.chevronDown} size={10}/>
      </button>
      {open && (
        <div className="absolute z-50 top-8 left-0 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 min-w-[140px]">
          {STATUS_LIST.map(s => {
            const c = STATUS_CFG[s];
            return (
              <button key={s} onClick={() => { onChange(s); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left">
                <span className={`w-2 h-2 rounded-full ${c.dot}`}/>
                <span className={`text-xs font-medium ${c.text}`}>{s}</span>
                {s===value && <Icon d={I.check} size={12} className="ml-auto text-slate-400"/>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Editable cell
// ─────────────────────────────────────────────
function EditCell({ value, type="text", onChange, align="left", placeholder="" }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value);
  const commit = () => { setEditing(false); onChange(type==="number" ? parseFloat(draft)||0 : draft); };
  if (editing) return (
    <input autoFocus type={type}
      className={`w-full bg-white border border-violet-400 rounded-md px-2 py-1 text-sm outline-none text-${align}`}
      value={draft} onChange={e => setDraft(e.target.value)}
      onBlur={commit} onKeyDown={e => e.key==="Enter" && commit()}/>
  );
  return (
    <div onClick={() => { setDraft(value); setEditing(true); }}
      className={`cursor-text text-sm hover:bg-slate-100 rounded px-2 py-1 transition-colors text-${align} truncate ${value || value===0 ? "text-slate-700" : "text-slate-300"}`}>
      {value===0 && type==="number" ? "0" : value || placeholder}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tag cell
// ─────────────────────────────────────────────
function TagCell({ tags, onChange }) {
  const [editing, setEditing] = useState(false);
  const [input,   setInput]   = useState("");
  return (
    <div className="flex flex-wrap gap-1 items-center min-h-[28px]" onClick={() => setEditing(true)}>
      {tags.map((t, i) => (
        <span key={i} className="bg-violet-50 text-violet-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-violet-100 flex items-center gap-1">
          {t}
          <button onClick={(e) => { e.stopPropagation(); onChange(tags.filter((_,j)=>j!==i)); }} className="hover:text-red-500 leading-none">×</button>
        </span>
      ))}
      {editing
        ? <input autoFocus className="text-xs border-b border-violet-300 outline-none w-16 bg-transparent"
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key==="Enter" && input.trim()) { onChange([...tags, input.trim()]); setInput(""); }
              if (e.key==="Escape") { setEditing(false); setInput(""); }
            }}
            onBlur={() => { setEditing(false); setInput(""); }}/>
        : <span className="text-[10px] text-slate-300 cursor-text select-none">+ tag</span>
      }
    </div>
  );
}

// ─────────────────────────────────────────────
// Budget Table
// ─────────────────────────────────────────────
function BudgetTable({ rows, onUpdate, onDelete, onAdd }) {
  const grand = rows.reduce((s,r)=>s+r.qty*r.cost,0);
  const paid  = rows.filter(r=>r.status==="Paid").reduce((s,r)=>s+r.qty*r.cost,0);
  const upd   = (id,f,v) => onUpdate(rows.map(r => r.id===id ? {...r,[f]:v} : r));
  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header row */}
      <div className="flex items-center bg-slate-50 border-b border-slate-200 px-4 py-2">
        {[
          {l:"ITEM NAME",  f:"flex-[3]",   a:"left"},
          {l:"QTY",        f:"flex-[1]",   a:"center"},
          {l:"UNIT COST",  f:"flex-[1.5]", a:"right"},
          {l:"TOTAL",      f:"flex-[1.5]", a:"right"},
          {l:"STATUS",     f:"flex-[1.5]", a:"left"},
          {l:"BREAKDOWN",  f:"flex-[2]",   a:"left"},
          {l:"",           f:"w-10",       a:"left"},
        ].map((c,i) => (
          <div key={i} className={`${c.f} text-[10px] font-bold tracking-widest text-slate-400 uppercase ${c.a==="right"?"text-right pr-2":c.a==="center"?"text-center":"pl-2"}`}>{c.l}</div>
        ))}
      </div>

      {rows.length===0 && (
        <div className="text-center py-10 text-slate-400 text-sm">No items yet. Click <strong>+ New item</strong> to begin.</div>
      )}

      {rows.map((r,idx) => (
        <div key={r.id} className={`group flex items-center px-4 py-2.5 border-b border-slate-100 hover:bg-slate-50 transition-colors ${idx%2===0?"bg-white":"bg-slate-50/30"}`}>
          <div className="flex-[3] flex items-center gap-2 min-w-0">
            <Icon d={I.grip} size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab shrink-0"/>
            <EditCell value={r.item} onChange={v=>upd(r.id,"item",v)} placeholder="Item name…"/>
          </div>
          <div className="flex-[1] text-center">
            <EditCell value={r.qty} type="number" onChange={v=>upd(r.id,"qty",v)} align="center"/>
          </div>
          <div className="flex-[1.5]">
            <EditCell value={r.cost} type="number" onChange={v=>upd(r.id,"cost",v)} align="right"/>
          </div>
          <div className="flex-[1.5] text-right pr-2">
            <span className="text-sm font-semibold text-slate-800">{fmt(r.qty*r.cost)}</span>
          </div>
          <div className="flex-[1.5]">
            <StatusPill value={r.status} onChange={v=>upd(r.id,"status",v)}/>
          </div>
          <div className="flex-[2]">
            <TagCell tags={r.tags} onChange={v=>upd(r.id,"tags",v)}/>
          </div>
          <div className="w-10 flex justify-end">
            <button onClick={()=>onDelete(r.id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-all">
              <Icon d={I.trash} size={13}/>
            </button>
          </div>
        </div>
      ))}

      <button onClick={onAdd}
        className="w-full flex items-center gap-2 px-6 py-2.5 text-sm text-slate-400 hover:text-violet-600 hover:bg-violet-50/50 transition-all border-b border-slate-100 group">
        <Icon d={I.plus} size={14} className="group-hover:scale-110 transition-transform"/>
        <span className="font-medium">New item</span>
      </button>

      <div className="flex items-center px-4 py-3 bg-slate-50/80 gap-4 flex-wrap">
        <div className="flex-1 flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Grand Total</span>
          <span className="text-xl font-bold text-slate-900">{fmt(grand)}</span>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"/>
            <span className="text-slate-500">Paid: <strong className="text-emerald-700">{fmt(paid)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"/>
            <span className="text-slate-500">Remaining: <strong className="text-amber-700">{fmt(grand-paid)}</strong></span>
          </div>
        </div>
        <span className="text-xs text-slate-400">{rows.length} items</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────
function DashboardView({ events, onSelectEvent }) {
  const total  = events.reduce((s,e)=>s+e.rows.reduce((rs,r)=>rs+r.qty*r.cost,0),0);
  const paid   = events.reduce((s,e)=>s+e.rows.filter(r=>r.status==="Paid").reduce((rs,r)=>rs+r.qty*r.cost,0),0);
  const items  = events.reduce((s,e)=>s+e.rows.length,0);
  const pct    = total ? Math.round(paid/total*100) : 0;
  const stTotals = {};
  STATUS_LIST.forEach(s=>{stTotals[s]=0;});
  events.forEach(e=>e.rows.forEach(r=>{stTotals[r.status]=(stTotals[r.status]||0)+r.qty*r.cost;}));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">📊 Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Overview of all E-Cell event budgets</p>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[
          {label:"Total Budget", value:fmt(total), sub:`${events.length} events`, grad:"from-slate-800 to-slate-700"},
          {label:"Total Paid",   value:fmt(paid),  sub:`${pct}% of budget`,       grad:"from-emerald-500 to-teal-500"},
          {label:"Outstanding",  value:fmt(total-paid), sub:"yet to be paid",     grad:"from-amber-400 to-orange-500"},
          {label:"Budget Items", value:items,       sub:"line entries total",      grad:"from-violet-500 to-indigo-600"},
        ].map((c,i)=>(
          <div key={i} className={`rounded-2xl p-4 bg-gradient-to-br ${c.grad} text-white shadow-sm`}>
            <div className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">{c.label}</div>
            <div className="text-xl font-bold">{c.value}</div>
            <div className="text-xs text-white/60 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex justify-between text-sm mb-3">
          <span className="font-semibold text-slate-700">Overall Budget Utilisation</span>
          <span className="font-bold text-violet-600">{pct}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700" style={{width:`${pct}%`}}/>
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>{fmt(paid)} paid</span><span>{fmt(total-paid)} remaining</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Spend by Status</h3>
          <div className="space-y-3">
            {STATUS_LIST.map(s=>{
              const c=STATUS_CFG[s], val=stTotals[s]||0, p=total?Math.round(val/total*100):0;
              return (
                <div key={s}>
                  <div className="flex justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${c.dot}`}/>
                      <span className="font-medium text-slate-600">{s}</span>
                    </div>
                    <span className="font-semibold text-slate-700">{fmt(val)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div className={`h-full ${c.bar} rounded-full transition-all duration-500`} style={{width:`${p}%`}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Events at a Glance</h3>
          {events.length===0 && <p className="text-sm text-slate-400">No events created yet.</p>}
          <div className="space-y-2">
            {events.map(ev=>{
              const et=ev.rows.reduce((s,r)=>s+r.qty*r.cost,0);
              const ep=ev.rows.filter(r=>r.status==="Paid").reduce((s,r)=>s+r.qty*r.cost,0);
              const epct=et?Math.round(ep/et*100):0;
              return (
                <button key={ev.id} onClick={()=>onSelectEvent(ev.id)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-all text-left group">
                  <span className="text-xl shrink-0">{ev.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-700 truncate">{ev.name}</span>
                      <span className="text-xs text-slate-500 shrink-0 ml-2">{fmtS(et)}</span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full mt-1.5">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all" style={{width:`${epct}%`}}/>
                    </div>
                  </div>
                  <Icon d={I.chevronRight} size={12} className="text-slate-300 group-hover:text-violet-400 shrink-0"/>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Team View
// ─────────────────────────────────────────────
function TeamView() {
  const [team,    setTeam]    = useState(TEAM_SEED);
  const [showAdd, setShowAdd] = useState(false);
  const [form,    setForm]    = useState({name:"",role:"",email:"",phone:""});
  const [editId,  setEditId]  = useState(null);
  const COLORS = ["bg-violet-500","bg-emerald-500","bg-sky-500","bg-amber-500","bg-rose-500","bg-indigo-500","bg-teal-500"];

  const save = () => {
    if (!form.name.trim()) return;
    const av  = form.name.trim().split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
    if (editId) {
      setTeam(team.map(m => m.id===editId ? {...m,...form,avatar:av} : m));
      setEditId(null);
    } else {
      setTeam([...team,{id:++_tmId,...form,avatar:av,color:COLORS[team.length%COLORS.length]}]);
    }
    setForm({name:"",role:"",email:"",phone:""});
    setShowAdd(false);
  };
  const startEdit = (m) => { setForm({name:m.name,role:m.role,email:m.email,phone:m.phone}); setEditId(m.id); setShowAdd(true); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">👥 Team</h1>
          <p className="text-sm text-slate-400 mt-1">{team.length} members in E-Cell</p>
        </div>
        <Btn onClick={()=>{setForm({name:"",role:"",email:"",phone:""});setEditId(null);setShowAdd(true);}}>
          <Icon d={I.userPlus} size={14}/> Add Member
        </Btn>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {team.map(m=>(
          <div key={m.id} className="group bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-3 hover:shadow-md transition-all">
            <Avatar initials={m.avatar} color={m.color} size="w-11 h-11"/>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-800 text-sm">{m.name}</div>
              <div className="text-xs text-violet-600 font-medium">{m.role}</div>
              <div className="mt-2 space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-400"><Icon d={I.mail} size={11}/> {m.email}</div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400"><Icon d={I.phone} size={11}/> {m.phone}</div>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={()=>startEdit(m)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Icon d={I.edit} size={13}/></button>
              <button onClick={()=>setTeam(team.filter(x=>x.id!==m.id))} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Icon d={I.trash} size={13}/></button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <Modal title={editId?"Edit Member":"Add Team Member"} subtitle="Fill in member details" onClose={()=>setShowAdd(false)}
          footer={<><Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn><Btn onClick={save}><Icon d={I.save} size={13}/> Save</Btn></>}>
          <div className="space-y-3">
            {[{l:"Full Name",k:"name",ph:"e.g. Aarav Sharma"},{l:"Role",k:"role",ph:"e.g. Finance Head"},{l:"Email",k:"email",ph:"name@ecell.in"},{l:"Phone",k:"phone",ph:"+91 98765 43210"}].map(f=>(
              <Field key={f.k} label={f.l}>
                <Input value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} placeholder={f.ph} onKeyDown={e=>e.key==="Enter"&&save()}/>
              </Field>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Schedule View
// ─────────────────────────────────────────────
function ScheduleView({ events }) {
  const [schedule, setSchedule] = useState(SCHEDULE_SEED);
  const [showAdd,  setShowAdd]  = useState(false);
  const [form,     setForm]     = useState({title:"",date:"",time:"",type:"Meeting",eventId:events[0]?.id||1});
  const TYPES = ["Meeting","Review","Finance","Outreach","Milestone","Other"];
  const TYPE_COLOR = {Meeting:"bg-violet-100 text-violet-700",Review:"bg-sky-100 text-sky-700",Finance:"bg-emerald-100 text-emerald-700",Outreach:"bg-amber-100 text-amber-700",Milestone:"bg-rose-100 text-rose-700",Other:"bg-slate-100 text-slate-600"};

  const save = () => {
    if (!form.title.trim()||!form.date) return;
    setSchedule([...schedule,{id:++_schId,...form,done:false}]);
    setForm({title:"",date:"",time:"",type:"Meeting",eventId:events[0]?.id||1});
    setShowAdd(false);
  };

  const grouped   = schedule.reduce((acc,s)=>{const k=s.date||"No Date";if(!acc[k])acc[k]=[];acc[k].push(s);return acc;},{});
  const sortedD   = Object.keys(grouped).sort();
  const evName    = id => events.find(e=>e.id===id)?.name||"Unknown";
  const evIcon    = id => events.find(e=>e.id===id)?.icon||"📌";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📅 Schedule</h1>
          <p className="text-sm text-slate-400 mt-1">{schedule.filter(s=>!s.done).length} upcoming tasks</p>
        </div>
        <Btn onClick={()=>setShowAdd(true)}><Icon d={I.plus} size={14}/> Add Task</Btn>
      </div>

      {schedule.length===0 && <p className="text-sm text-slate-400">No tasks scheduled yet.</p>}

      <div className="space-y-5">
        {sortedD.map(date=>(
          <div key={date}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {new Date(date+"T12:00:00").toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}
              </span>
              <div className="h-px flex-1 bg-slate-100"/>
            </div>
            <div className="space-y-2">
              {grouped[date].map(task=>(
                <div key={task.id} className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${task.done?"bg-slate-50 border-slate-100 opacity-60":"bg-white border-slate-200 hover:shadow-sm"}`}>
                  <button onClick={()=>setSchedule(schedule.map(s=>s.id===task.id?{...s,done:!s.done}:s))}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${task.done?"bg-emerald-500 border-emerald-500":"border-slate-300 hover:border-violet-400"}`}>
                    {task.done && <Icon d={I.check} size={10} stroke="white"/>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${task.done?"line-through text-slate-400":"text-slate-800"}`}>{task.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">{evIcon(task.eventId)} {evName(task.eventId)}</span>
                      {task.time && <span className="text-xs text-slate-400">· {task.time}</span>}
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLOR[task.type]||TYPE_COLOR.Other}`}>{task.type}</span>
                  <button onClick={()=>setSchedule(schedule.filter(s=>s.id!==task.id))}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-all">
                    <Icon d={I.trash} size={12}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <Modal title="Add Task" subtitle="Schedule a new task or milestone" onClose={()=>setShowAdd(false)}
          footer={<><Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn><Btn onClick={save}><Icon d={I.plus} size={13}/> Add Task</Btn></>}>
          <div className="space-y-3">
            <Field label="Task Title">
              <Input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Budget Finalisation" onKeyDown={e=>e.key==="Enter"&&save()}/>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date"><Input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></Field>
              <Field label="Time"><Input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/></Field>
            </div>
            <Field label="Type">
              <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400 transition-colors bg-white">
                {TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Event">
              <select value={form.eventId} onChange={e=>setForm({...form,eventId:Number(e.target.value)})}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400 transition-colors bg-white">
                {events.map(ev=><option key={ev.id} value={ev.id}>{ev.icon} {ev.name}</option>)}
              </select>
            </Field>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Settings View
// ─────────────────────────────────────────────
function SettingsView({ events, onDeleteEvent, onRenameEvent }) {
  const [confirmDel, setConfirmDel] = useState(null);
  const [editingId,  setEditingId]  = useState(null);
  const [editForm,   setEditForm]   = useState({name:"",icon:""});

  const startEdit = (ev) => { setEditForm({name:ev.name,icon:ev.icon}); setEditingId(ev.id); };
  const saveEdit  = () => { if (editForm.name.trim()) onRenameEvent(editingId,editForm.name.trim(),editForm.icon); setEditingId(null); };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">⚙️ Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage events and app preferences</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">Event Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">Rename icons or delete events</p>
        </div>
        {events.length===0 && <p className="p-5 text-sm text-slate-400">No events yet.</p>}
        <div className="divide-y divide-slate-100">
          {events.map(ev=>{
            const total=ev.rows.reduce((s,r)=>s+r.qty*r.cost,0);
            return (
              <div key={ev.id} className="flex items-center gap-3 px-5 py-3 group hover:bg-slate-50 transition-colors">
                {editingId===ev.id ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex flex-wrap gap-1">
                      {EMOJI_OPTIONS.slice(0,12).map(e=>(
                        <button key={e} onClick={()=>setEditForm(f=>({...f,icon:e}))}
                          className={`text-base w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-all ${editForm.icon===e?"border-violet-400 bg-violet-50":"border-transparent hover:bg-slate-100"}`}>{e}</button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))}
                        onKeyDown={e=>e.key==="Enter"&&saveEdit()}
                        className="flex-1 border border-violet-400 rounded-lg px-2 py-1 text-sm outline-none"/>
                      <Btn size="sm" onClick={saveEdit}><Icon d={I.save} size={12}/> Save</Btn>
                      <Btn size="sm" variant="ghost" onClick={()=>setEditingId(null)}>Cancel</Btn>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text-xl">{ev.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800">{ev.name}</div>
                      <div className="text-xs text-slate-400">{ev.rows.length} items · {fmt(total)}</div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={()=>startEdit(ev)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Icon d={I.edit} size={13}/></button>
                      <button onClick={()=>setConfirmDel(ev)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Icon d={I.trash} size={13}/></button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-slate-800 mb-3">About</h2>
        <div className="space-y-2 text-sm">
          {[["App","E-Cell Budget Manager"],["Version","1.0.0"],["Events",events.length],["Total Line Items",events.reduce((s,e)=>s+e.rows.length,0)]].map(([k,v])=>(
            <div key={k} className="flex justify-between"><span className="text-slate-400">{k}</span><span className="text-slate-700 font-medium">{v}</span></div>
          ))}
        </div>
      </div>

      {confirmDel && (
        <Modal title="Delete Event" subtitle={`Delete "${confirmDel.name}"? This cannot be undone.`}
          onClose={()=>setConfirmDel(null)}
          footer={<>
            <Btn variant="ghost" onClick={()=>setConfirmDel(null)}>Cancel</Btn>
            <Btn variant="danger" onClick={()=>{onDeleteEvent(confirmDel.id);setConfirmDel(null);}}>
              <Icon d={I.trash} size={13}/> Delete Event
            </Btn>
          </>}>
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
            <Icon d={I.warning} size={20} className="text-red-500 shrink-0"/>
            <p className="text-sm text-red-700"><strong>{confirmDel.rows.length} budget items</strong> will be permanently removed.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// New Event Modal
// ─────────────────────────────────────────────
function NewEventModal({ onClose, onCreate }) {
  const [name,  setName]  = useState("");
  const [icon,  setIcon]  = useState("🚀");
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  useEffect(()=>{inputRef.current?.focus();},[]);

  const create = () => {
    if (!name.trim()) { setError("Event name is required."); return; }
    onCreate({id:++_evId,icon,name:name.trim(),rows:[]});
    onClose();
  };

  return (
    <Modal title="Create New Event" subtitle="Add a new event to track its budget" onClose={onClose}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={create}><Icon d={I.plus} size={13}/> Create Event</Btn></>}>
      <div className="space-y-4">
        <Field label="Choose Icon">
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map(e=>(
              <button key={e} onClick={()=>setIcon(e)}
                className={`text-xl w-9 h-9 rounded-xl flex items-center justify-center transition-all border-2 ${icon===e?"border-violet-400 bg-violet-50 scale-110 shadow-sm":"border-transparent hover:bg-slate-100"}`}>{e}</button>
            ))}
          </div>
        </Field>
        <Field label="Event Name">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-violet-400 focus-within:bg-white transition-all">
            <span className="text-xl shrink-0">{icon}</span>
            <input ref={inputRef} value={name} onChange={e=>{setName(e.target.value);setError("");}}
              onKeyDown={e=>e.key==="Enter"&&create()} placeholder="e.g. TechFest 2025…"
              className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder-slate-300"/>
          </div>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </Field>
        {name.trim() && (
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl p-3 border border-violet-100">
            <div className="text-[10px] text-violet-500 font-semibold uppercase tracking-wider mb-1">Preview</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{icon}</span>
              <div>
                <div className="text-sm font-bold text-slate-800">{name.trim()}</div>
                <div className="text-[10px] text-slate-400">0 items · ₹0 budget</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// CSV export
// ─────────────────────────────────────────────
function exportCSV(event) {
  const rows = [["Item","Qty","Unit Cost","Total","Status","Breakdown"]];
  event.rows.forEach(r=>rows.push([r.item,r.qty,r.cost,r.qty*r.cost,r.status,r.tags.join("|")]));
  const csv  = rows.map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
  const a    = Object.assign(document.createElement("a"),{href:URL.createObjectURL(new Blob([csv],{type:"text/csv"})),download:`${event.name}-budget.csv`});
  a.click(); URL.revokeObjectURL(a.href);
}

// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────
export default function App() {
  const [events,   setEvents]   = useState(INITIAL_EVENTS);
  const [activeId, setActiveId] = useState(1);
  const [page,     setPage]     = useState("budget");
  const [sidebar,  setSidebar]  = useState(true);
  const [expanded, setExpanded] = useState({1:true,2:true,3:true});
  const [search,   setSearch]   = useState("");
  const [showNew,  setShowNew]  = useState(false);

  const active = events.find(e=>e.id===activeId);

  const updateRows = useCallback((rows)=>setEvents(ev=>ev.map(e=>e.id===activeId?{...e,rows}:e)),[activeId]);
  const deleteRow  = useCallback((rid) =>updateRows(active?.rows.filter(r=>r.id!==rid)||[]),[active,updateRows]);
  const addRow     = useCallback(()    =>updateRows([...(active?.rows||[]),mkRow()]),[active,updateRows]);

  const createEvent = (ev) => { setEvents(p=>[...p,ev]); setActiveId(ev.id); setExpanded(p=>({...p,[ev.id]:true})); setPage("budget"); };
  const deleteEvent = (id) => {
    const rest = events.filter(e=>e.id!==id);
    setEvents(rest);
    if (activeId===id) { setActiveId(rest[0]?.id||null); }
    setPage(rest.length?"budget":"dashboard");
  };
  const renameEvent = (id,name,icon) => setEvents(ev=>ev.map(e=>e.id===id?{...e,name,icon}:e));
  const navBudget   = (id) => { setActiveId(id); setPage("budget"); };

  const filtered    = events.filter(e=>e.name.toLowerCase().includes(search.toLowerCase()));
  const grandBudget = events.reduce((s,e)=>s+e.rows.reduce((rs,r)=>rs+r.qty*r.cost,0),0);

  const NAV = [
    {id:"dashboard",icon:I.barChart, label:"Dashboard"},
    {id:"team",     icon:I.users,    label:"Team"},
    {id:"schedule", icon:I.calendar, label:"Schedule"},
    {id:"settings", icon:I.settings, label:"Settings"},
  ];

  const statusBreak = (rows) => {
    const c={};
    rows.forEach(r=>{c[r.status]=(c[r.status]||0)+1;});
    return c;
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden" style={{fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      {showNew && <NewEventModal onClose={()=>setShowNew(false)} onCreate={createEvent}/>}

      {/* SIDEBAR */}
      <aside className={`${sidebar?"w-64":"w-0"} transition-all duration-300 overflow-hidden border-r border-slate-200 flex flex-col bg-slate-50 shrink-0`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow">E</div>
            <span className="font-bold text-slate-800 text-sm">E-Cell Finance</span>
          </div>
          <div className="relative">
            <Icon d={I.search} size={13} className="absolute left-2.5 top-2 text-slate-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search events…"
              className="w-full text-xs bg-white border border-slate-200 rounded-lg pl-7 pr-3 py-1.5 outline-none focus:border-violet-400 transition-colors"/>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-3 py-2 border-b border-slate-200 space-y-0.5">
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setPage(n.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${page===n.id&&page!=="budget"?"bg-white text-violet-700 shadow-sm border border-slate-200":"text-slate-500 hover:bg-white hover:text-slate-800"}`}>
              <Icon d={n.icon} size={13}/>{n.label}
            </button>
          ))}
        </nav>

        {/* Events */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Events</span>
            <button onClick={()=>setShowNew(true)} className="text-slate-400 hover:text-violet-600 transition-colors p-0.5 rounded" title="New Event">
              <Icon d={I.plus} size={13}/>
            </button>
          </div>
          {filtered.length===0 && <p className="text-xs text-slate-400 text-center py-3">No events found</p>}
          {filtered.map(ev=>{
            const total = ev.rows.reduce((s,r)=>s+r.qty*r.cost,0);
            const sb    = statusBreak(ev.rows);
            const isAct = activeId===ev.id && page==="budget";
            return (
              <div key={ev.id} className="mb-1">
                <button onClick={()=>navBudget(ev.id)}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-xl text-left transition-all ${isAct?"bg-white shadow-sm border border-slate-200":"hover:bg-white/60"}`}>
                  <span className="text-base">{ev.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-700 truncate">{ev.name}</div>
                    <div className="text-[10px] text-slate-400">{fmt(total)}</div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();setExpanded(p=>({...p,[ev.id]:!p[ev.id]}));}}
                    className="p-0.5 hover:bg-slate-200 rounded transition-colors shrink-0">
                    <Icon d={expanded[ev.id]?I.chevronDown:I.chevronRight} size={12} className="text-slate-400"/>
                  </button>
                </button>
                {expanded[ev.id] && Object.keys(sb).length>0 && (
                  <div className="ml-4 mt-1 pl-2 border-l border-slate-200 space-y-0.5">
                    {Object.entries(sb).map(([s,c])=>{
                      const cfg=STATUS_CFG[s];
                      return (
                        <div key={s} className="flex items-center gap-1.5 py-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
                          <span className="text-[10px] text-slate-500">{s}: <strong>{c}</strong></span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200">
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl p-3">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Budget</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{fmt(grandBudget)}</div>
            <div className="text-[10px] text-slate-400">across {events.length} events</div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-12 border-b border-slate-200 flex items-center px-4 gap-3 shrink-0 bg-white">
          <button onClick={()=>setSidebar(!sidebar)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all">
            <Icon d={I.layout} size={15}/>
          </button>
          <nav className="flex items-center gap-1 text-xs text-slate-400 overflow-hidden">
            <button onClick={()=>setPage("dashboard")} className="hover:text-slate-700 transition-colors flex items-center gap-1">
              <Icon d={I.home} size={12}/> Home
            </button>
            {page==="budget" && active && <>
              <Icon d={I.chevronRight} size={10}/>
              <button onClick={()=>setPage("dashboard")} className="flex items-center gap-1 hover:text-slate-700">
                <Icon d={I.zap} size={12}/> Events
              </button>
              <Icon d={I.chevronRight} size={10}/>
              <span className="text-slate-700 font-medium truncate max-w-[160px]">{active.icon} {active.name}</span>
              <Icon d={I.chevronRight} size={10}/>
              <span className="text-slate-700 font-medium">💰 Budgeting</span>
            </>}
            {page!=="budget" && <>
              <Icon d={I.chevronRight} size={10}/>
              <span className="text-slate-700 font-medium capitalize">{page}</span>
            </>}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {page==="budget" && active && (
              <button onClick={()=>exportCSV(active)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                <Icon d={I.download} size={12}/> Export CSV
              </button>
            )}
            <button onClick={()=>setShowNew(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-sm">
              <Icon d={I.plus} size={12}/> New Event
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 max-w-6xl mx-auto w-full">

          {page==="dashboard" && <DashboardView events={events} onSelectEvent={navBudget}/>}
          {page==="team"      && <TeamView/>}
          {page==="schedule"  && <ScheduleView events={events}/>}
          {page==="settings"  && <SettingsView events={events} onDeleteEvent={deleteEvent} onRenameEvent={renameEvent}/>}

          {page==="budget" && !active && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-5xl mb-4">📭</div>
              <h2 className="text-xl font-bold text-slate-700 mb-2">No events yet</h2>
              <p className="text-sm text-slate-400 mb-4">Create your first event to start tracking its budget.</p>
              <Btn onClick={()=>setShowNew(true)}><Icon d={I.plus} size={14}/> Create Event</Btn>
            </div>
          )}

          {page==="budget" && active && (
            <>
              <div className="mb-6">
                <div className="text-5xl mb-3 select-none">{active.icon}</div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">{active.name} — Budget</h1>
                <p className="text-sm text-slate-400">Track expenses, manage vendors, and monitor spend for this event.</p>
                <div className="grid grid-cols-4 gap-3 mt-5">
                  {(()=>{
                    const rows=active.rows;
                    const total=rows.reduce((s,r)=>s+r.qty*r.cost,0);
                    const paid=rows.filter(r=>r.status==="Paid").reduce((s,r)=>s+r.qty*r.cost,0);
                    const items=rows.length;
                    const pct=total?Math.round(paid/total*100):0;
                    return [
                      {label:"Total Budget",value:fmt(total),  sub:`${items} items`,   grad:"from-slate-800 to-slate-700"},
                      {label:"Paid",        value:fmt(paid),   sub:`${pct}% settled`,  grad:"from-emerald-500 to-teal-500"},
                      {label:"Remaining",   value:fmt(total-paid),sub:"yet to pay",    light:true},
                      {label:"Line Items",  value:items,        sub:"expense entries", light:true},
                    ].map((c,i)=>(
                      <div key={i} className={`rounded-2xl p-4 ${c.light?"bg-white border border-slate-200":`bg-gradient-to-br ${c.grad} shadow-sm`}`}>
                        <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${c.light?"text-slate-400":"text-white/70"}`}>{c.label}</div>
                        <div className={`text-xl font-bold ${c.light?"text-slate-900":"text-white"}`}>{c.value}</div>
                        <div className={`text-xs mt-0.5 ${c.light?"text-slate-400":"text-white/60"}`}>{c.sub}</div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Icon d={I.fileText} size={14} className="text-slate-400"/>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Budget Database</span>
                <div className="h-px flex-1 bg-slate-100"/>
              </div>

              <BudgetTable rows={active.rows} onUpdate={updateRows} onDelete={deleteRow} onAdd={addRow}/>
              <p className="text-xs text-slate-300 mt-4 text-center">Click any cell to edit · Add tags to breakdown composite costs · Export CSV from toolbar</p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

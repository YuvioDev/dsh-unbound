function PurgeDock() {
  const t = useT();
  const st = useDock();
  const [full,setFull]=useState(false);
  const [view, setView] = useState("prompt");
  const [hostTheme, setHostTheme] = useState(detectHostTheme);
  const [width, setWidth] = useState(() => unboundClampWidth(420,window.innerWidth));
  useEffect(() => { const fit=()=>setWidth(w=>unboundClampWidth(w,window.innerWidth)); window.addEventListener("resize",fit); return()=>window.removeEventListener("resize",fit); },[]);
  const [viewport,setViewport]=useState(window.innerWidth);
  const panelWidth=unboundPanelWidth(width,viewport,st.tab === "drill",full);
  useEffect(()=>{const sync=()=>setViewport(window.innerWidth);window.addEventListener("resize",sync);return()=>window.removeEventListener("resize",sync)},[]);
  const shellRef = useRef(null);
  const focusBefore = useRef(null);
  const theme = hostTheme;
  useEffect(() => {
    const tag = document.createElement("style"); tag.dataset.unboundUi = "1";
    tag.textContent = PURGE_CSS + (__dshPurgeDrill?.CSS || "") + UNBOUND_CSS;
    document.head.append(tag);
    const sync = () => setHostTheme(detectHostTheme());
    const obs = new MutationObserver(sync);
    for (const el of [document.documentElement, document.body]) if(el) obs.observe(el, {attributes:true, attributeFilter:["data-ds-dark-theme","class","style"]});
    const mq = window.matchMedia("(prefers-color-scheme: dark)"); mq.addEventListener?.("change",sync);
    return () => { tag.remove(); obs.disconnect(); mq.removeEventListener?.("change",sync); };
  }, []);
  useEffect(() => {
    const root = document.getElementById("root");
    document.body.dataset.unboundFull = st.open && full ? "1" : "0";
    if(st.open) {
      focusBefore.current = document.activeElement;
      if(root && require("react-dom")?.createPortal) document.body.dataset.unboundOpen = "1";
      document.body.style.setProperty("--unbound-width", panelWidth + "px");
    } else { delete document.body.dataset.unboundOpen; document.body.style.removeProperty("--unbound-width"); }
    const onKey = e => { if(e.key === "Escape" && st.open && !st.authOpen) { if(full){setFull(false);return;} setDock({open:false}); focusBefore.current?.focus?.(); } };
    window.addEventListener("keydown",onKey);
    return () => { delete document.body.dataset.unboundFull; delete document.body.dataset.unboundOpen; document.body.style.removeProperty("--unbound-width"); window.removeEventListener("keydown",onKey); };
  }, [st.open,st.authOpen,panelWidth,full]);
  useEffect(() => { if(st.tab === "drill" && readDrillAuth()) __dshPurgeDrill?.setUI?.({open:true}); }, [st.tab,st.open]);
  const nav = id => { setFull(false); if(id === "drill") return requestDrill("tab"); setView(id); setDock({tab:"clean",authOpen:false,pending:"tab"}); };
  const closePanel = () => { setFull(false); setDock({open:false,authOpen:false}); focusBefore.current?.focus?.(); };
  const resize = e => {
    if(e.button !== 0)return; e.preventDefault();
    const start=e.clientX, initial=width;
    const move=ev=>setWidth(unboundClampWidth(initial+start-ev.clientX,window.innerWidth));
    const end=()=>{window.removeEventListener("mousemove",move);window.removeEventListener("mouseup",end)};
    window.addEventListener("mousemove",move);window.addEventListener("mouseup",end);
  };
  const active=st.tab === "drill" ? "drill" : view;
  const content=h("aside", {ref:shellRef,className:"dshp-dock unbound-shell", "aria-label":"DSH Unbound", "data-theme":theme, "data-open":st.open?"1":"0", "data-full":full?"1":"0","data-view":active,style:{width:panelWidth+"px"}},
    h("header",{className:"unbound-top"},h("button",{type:"button",className:"unbound-brand","aria-label":"关闭 DSH Unbound",onClick:closePanel},"DSH Unbound")),
    h("nav",{className:"unbound-nav","aria-label":"插件导航"},[["prompt","提示词"],["maintenance","设置"],["drill","演练"]].map(([id,label])=>h("button",{key:id,type:"button","aria-current":active===id?"page":undefined,className:active===id?"is-active":"",onClick:()=>nav(id)},label))),
    h("div",{className:"dshp-dock-body unbound-body"},
      h("div",{className:"dshp-root", "data-theme":theme,hidden:st.tab==="drill"},
        h("div",{hidden:!["prompt","maintenance"].includes(view)},h(PurgifySection,{view})),
        null),
      st.tab==="drill" && readDrillAuth() ? h(react.Fragment,null,h("div",{className:"unbound-drill-tools"},h("button",{className:"dshp-btn",onClick:()=>setFull(x=>!x)},full?"退出全屏":"全屏演练")),h(__dshPurgeDrill.Panel,{embedded:true})) : null),
    h("div",{className:"unbound-resize",hidden:full || st.tab === "drill",role:"separator","aria-label":"调整面板宽度","aria-orientation":"vertical","aria-valuemin":360,"aria-valuemax":unboundClampWidth(760,window.innerWidth),"aria-valuenow":width,tabIndex:0,onMouseDown:resize,onKeyDown:e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();setWidth(w=>unboundClampWidth(w+(e.key==="ArrowLeft"?20:-20),window.innerWidth))}}}));
  const gate=st.authOpen?h(AuthGate,{pending:st.pending}):null;
  try { const rd=require("react-dom");if(rd?.createPortal)return h(react.Fragment,null,rd.createPortal(content,document.body),gate?rd.createPortal(gate,document.body):null); } catch {}
  return h(react.Fragment,null,content,gate);
}
function PurgeLauncher() {
  const [hasAnchor,setHasAnchor]=useState(false);
  const st=useDock();
  useEffect(()=>{const sync=()=>setHasAnchor(Boolean(document.querySelector('.dshp-tab-chip button,.dshp-hero-chip button')));sync();const obs=new MutationObserver(sync);obs.observe(document.body,{childList:true,subtree:true});return()=>obs.disconnect()},[]);
  return hasAnchor?null:h("button",{className:"unbound-fallback",type:"button","aria-expanded":st.open,onClick:()=>toggleDock()},"Unbound");
}

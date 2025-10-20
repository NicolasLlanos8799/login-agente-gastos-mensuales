// ===== Config =====
const TWILIO_SANDBOX_NUMBER = "+14155238886";     // número global del sandbox
const TWILIO_JOIN_CODE     = "join having-crowd"; // tu código específico del sandbox
const WEBHOOK_PING_URL     = "";                  // opcional: "https://tu-n8n.com/webhook/finbot-join-click"

// ===== Helpers =====
const $ = (q)=>document.querySelector(q);
const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);

// Pinta textos
$("#num").textContent   = TWILIO_SANDBOX_NUMBER;
$("#join").textContent  = TWILIO_JOIN_CODE;
$("#join2").textContent = TWILIO_JOIN_CODE;

// Links click-to-chat
const waBase   = `https://wa.me/${TWILIO_SANDBOX_NUMBER.replace(/\D/g,'')}`;
const linkJoin = `${waBase}?text=${encodeURIComponent(TWILIO_JOIN_CODE)}`;
const linkHola = `${waBase}?text=${encodeURIComponent("hola")}`;

// Estado / toasts
function setStateWait(){
  const st = $("#state");
  st.textContent = "Esperando tu mensaje de 'hola'…";
  st.classList.remove("warn"); st.classList.add("tag");
}
async function toast(text){
  const el = document.createElement("div");
  el.textContent = text;
  el.style.position="fixed"; el.style.bottom="18px"; el.style.right="18px";
  el.style.background="#19c37d"; el.style.color="#0b1020"; el.style.padding="10px 14px";
  el.style.borderRadius="12px"; el.style.boxShadow="0 6px 22px rgba(0,0,0,.35)";
  el.style.fontWeight="600"; el.style.zIndex="9999";
  document.body.appendChild(el); setTimeout(()=>el.remove(),1200);
}
const copy = async (txt)=>{ try{ await navigator.clipboard.writeText(txt); toast("¡Copiado!"); }catch(_){} };

// Copiar
$("#copyNum")?.addEventListener("click", ()=>copy(TWILIO_SANDBOX_NUMBER));
$("#copyJoin")?.addEventListener("click", ()=>copy(TWILIO_JOIN_CODE));

// Ping opcional
async function ping(eventName){
  if (!WEBHOOK_PING_URL) return;
  try{
    await fetch(WEBHOOK_PING_URL, {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ event:eventName, ts:new Date().toISOString(), ua:navigator.userAgent })
    });
  }catch(_){}
}

// Mostrar QR en desktop (para abrir join)
(function renderQR(){
  if(!isMobile){
    const qrUrl = "https://chart.googleapis.com/chart?cht=qr&chs=240x240&chl="+encodeURIComponent(linkJoin);
    const img = $("#qrImg");
    if(img){ img.src = qrUrl; img.classList.remove("hidden"); }
  } else {
    $("#qrBlock")?.classList.add("hidden");
  }
})();

// Paso 1: JOIN
const btnJoin  = $("#btnJoin");
const btnHola  = $("#btnHola");
const hintHola = $("#hintHola");
const sticky   = $("#stickyHola");

function showHolaCTA(){
  btnHola?.classList.remove("hidden");
  btnHola?.removeAttribute("disabled");
  hintHola?.classList.remove("hidden");
  sticky?.classList.remove("hidden");
}
btnJoin?.addEventListener("click", async ()=>{
  await ping("click_join");
  window.open(linkJoin, "_blank", "noopener,noreferrer");
  setStateWait();
  // Habilita el paso 2 de inmediato y también por timeout de seguridad
  showHolaCTA();
});
setTimeout(showHolaCTA, 10000); // Por si el usuario vuelve sin hacer click en el 1)

$("#openBtnSticky")?.addEventListener("click", async ()=>{
  await ping("click_hola_sticky");
  window.open(linkHola, "_blank", "noopener,noreferrer");
});

// Paso 2: HOLA
btnHola?.addEventListener("click", async ()=>{
  await ping("click_hola");
  window.open(linkHola, "_blank", "noopener,noreferrer");
});

// ===== Modo claro/oscuro =====
const themeToggle = $("#themeToggle");
function currentTheme(){
  return document.documentElement.getAttribute("data-theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark":"light");
}
function setTheme(mode){
  document.documentElement.setAttribute("data-theme", mode);
  themeToggle.textContent = mode === "dark" ? "☀" : "☾";
  localStorage.setItem("theme", mode);
}
setTheme(localStorage.getItem("theme") || currentTheme());
themeToggle?.addEventListener("click", ()=> setTheme(currentTheme()==="dark" ? "light":"dark"));

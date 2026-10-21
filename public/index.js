"use strict";
const form = document.getElementById("sj-form");
const address = document.getElementById("sj-address");
const searchEngine = document.getElementById("sj-search-engine");
const error = document.getElementById("sj-error");
const errorCode = document.getElementById("sj-error-code");
const { ScramjetController } = $scramjetLoadController();
const scramjet = new ScramjetController({
  files: { wasm: "/scram/scramjet.wasm.wasm", all: "/scram/scramjet.all.js", sync: "/scram/scramjet.sync.js" },
});
scramjet.init();
const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try { await registerSW(); } catch (err) {
    error.textContent = "Failed to register service worker.";
    errorCode.textContent = err.toString();
    throw err;
  }
  const url = search(address.value, searchEngine.value);
  let wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
  if ((await connection.getTransport()) !== "/libcurl/index.mjs") {
    await connection.setTransport("/libcurl/index.mjs", [{ websocket: wispUrl }]);
  }
  const frame = scramjet.createFrame();
  frame.frame.id = "sj-frame";
  document.body.innerHTML = "";
  const bar = document.createElement("div");
  bar.style.cssText = "position:fixed;top:0;left:0;right:0;height:46px;background:#161b22;display:flex;align-items:center;gap:8px;padding:0 10px;border-bottom:1px solid #30363d;z-index:2147483647;font-family:consolas,monospace";
  bar.innerHTML = '<button onclick="history.back()" style="background:#0d0f12;border:1px solid #30363d;color:#c9d1d9;border-radius:8px;height:32px;width:32px;cursor:pointer">&#8592;</button><button onclick="history.forward()" style="background:#0d0f12;border:1px solid #30363d;color:#c9d1d9;border-radius:8px;height:32px;width:32px;cursor:pointer">&#8594;</button><button onclick="location.href=\'/\'" style="background:#0d0f12;border:1px solid #30363d;color:#c9d1d9;border-radius:8px;height:32px;width:32px;cursor:pointer">&#8962;</button><span style="color:#fff;font-weight:700;letter-spacing:2px;margin:0 6px">nest</span><input id=nb value="'+url.replace(/"/g,'&quot;')+'" style="flex:1;background:#0d0f12;border:1px solid #30363d;border-radius:16px;color:#c9d1d9;padding:7px 14px;font:13px consolas,monospace"><button onclick="var v=document.getElementById(\'nb\').value.trim();if(!v)return;var t=/^https?:\/\//i.test(v)?v:(v.indexOf(\'.\')>-1&&!/\s/.test(v)?\'https://\'+v:null);location.href=\'/\'+(t?\'?q=\'+encodeURIComponent(t):\'?q=\'+encodeURIComponent(v))" style="background:#238636;border:0;color:#fff;border-radius:8px;height:32px;padding:0 14px;cursor:pointer">go</button>';
  document.body.appendChild(bar);
  frame.frame.style.cssText = "position:fixed;top:46px;left:0;right:0;bottom:0;width:100vw;height:calc(100dvh - 46px);border:0";
  document.body.appendChild(frame.frame);
  frame.go(url);
});

// bapi.runtime.sendMessage({type: "open-tab", url: bapi.runtime.getURL("/html/ok.html")})
const bapi = typeof browser == "undefined" ? chrome : browser;
bapi.tabs.create({
    url: bapi.runtime.getURL("index.html")
})
window.close()
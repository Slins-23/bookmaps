import{d as g,i as u,u as c,_,o as n,c as i,a as t,b as h,F as y,r as f,n as M,t as m,w as v,v as S,e as p,f as L,p as H,g as k,h as T,j as C}from"./index.5721b27d.js";function b(e){if(e.streetview.google.id!="none"){let o=150,l=150,a;return e.streetview.google.id.length<30?a=`https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=${e.streetview.google.id}&cb_client=search.revgeo_and_fetch.gps&w=${o}&h=${l}&yaw=${e.streetview.google.yaw}&pitch=${e.streetview.google.thumbnail_pitch}&thumbfov=${Math.round(parseFloat(e.streetview.google.fov)).toString()}`:a=`https://lh5.googleusercontent.com/p/${e.streetview.google.id}=w${o}-h${l}-k-no-pi${e.streetview.google.thumbnail_pitch}-ya${e.streetview.google.yaw}-ro-0-fo${Math.round(parseFloat(e.streetview.google.fov)).toString()}`,`background-image: url("${a}");`}}const O=g({name:"CardGrid",data(){return{mouseOver:!1,idxOver:0}},methods:{toSvg:u,get_image_url:b},setup(){return{store:c()}},async created(){if(!this.store.bookmarks_loaded)try{await this.store.loadBookmarks()}catch(e){alert(`Error loading bookmarks: ${e}`)}}}),I={id:"wrapper"},B={id:"grid"},N={key:0},G=["onClick","onMouseenter","onMouseleave"],E={style:{color:"red"}},F=["onClick","innerHTML"];function V(e,o,l,a,$,w){return n(),i("div",I,[t("div",B,[e.store.loading_bookmarks?(n(),i("h1",N,"Loading...")):h("",!0),(n(!0),i(y,null,f(e.store.sorted_bookmarks,(r,s)=>(n(),i("div",{class:"card",onClick:d=>e.store.nextLevel(r),onMouseenter:d=>{e.mouseOver=!0,e.idxOver=s},onMouseleave:d=>{e.mouseOver=!1,e.idxOver=s},style:M(e.store.level==e.store.levels[e.store.levels.length-1]?e.get_image_url(r):"")},[t("h3",E,m(r.location[e.store.level]==""||r.location[e.store.level]==null?"Unknown":r.location[e.store.level]),1),e.mouseOver&&e.idxOver==s?(n(),i("div",{key:0,class:"delete",style:{"z-index":"999999"},onClick:d=>e.store.removeBookmark(d,r),innerHTML:e.toSvg("delete",{width:20,height:20,color:"black"})},null,8,F)):h("",!0)],44,G))),256))])])}var j=_(O,[["render",V],["__scopeId","data-v-61c0b761"]]);const A=g({name:"Home",setup(){console.log("got setup");const e=c();return console.log(`levelText: ${e.levelText}
level: ${e.level}
sorted_bookmarks: ${JSON.stringify(e.sorted_bookmarks)}
shown_bookmarks: ${JSON.stringify(e.shown_bookmarks)}
unknown_shown: ${e.unknown_shown}`),{store:e}},methods:{toSvg:u,goHome(){for(;this.store.level!=this.store.levels[0];)this.store.previousLevel()}},data(){return{}},components:{CardGrid:j},async created(){try{await this.store.load_key(),console.log(`Loaded API key: ${JSON.stringify(this.store.api_key)}`)}catch(e){alert(`Error loading API key: ${e}`)}console.log("got created")},mounted(){console.log("got mounted")}}),J=e=>(H("data-v-12ca21bd"),e=e(),k(),e),z={class:"wrapper"},D={class:"bar-wrapper"},P=["innerHTML"],U={class:"search-bar"},q=["innerHTML"],K={class:"last",style:{display:"flex","align-items":"flex-end"}},Q=["innerHTML"],R=J(()=>t("div",{style:{"margin-right":"10px"}},null,-1)),W=["innerHTML"],X={class:"divider",style:{display:"flex","justify-content":"center"}},Y={style:{width:"33px",height:"33px","margin-top":"10px","margin-left":"10px","margin-right":"auto",display:"flex"}},Z=["innerHTML"],x=["innerHTML"],ee={style:{"margin-right":"auto",color:"red"}};function oe(e,o,l,a,$,w){const r=T("CardGrid");return n(),i("div",z,[t("div",D,[t("div",{onClick:o[0]||(o[0]=s=>e.store.toggleAddModal()),class:"add btn",innerHTML:e.toSvg("bookmark",{width:43,height:43})},null,8,P),t("div",U,[t("div",{style:{"margin-left":"5px","justify-self":"flex-start"},innerHTML:e.toSvg("search",{"stroke-width":1,color:"lightgrey"})},null,8,q),v(t("input",{"onUpdate:modelValue":o[1]||(o[1]=s=>e.store.search=s),type:"text",id:"search-text"},null,512),[[S,e.store.search]])]),t("div",K,[t("div",{onClick:o[2]||(o[2]=s=>e.store.toggleExportModal()),class:"exp btn",innerHTML:e.toSvg("download",{width:43,height:43})},null,8,Q),R,t("div",{onClick:o[3]||(o[3]=s=>e.store.toggleImportModal()),class:"imp btn",innerHTML:e.toSvg("file-plus",{width:43,height:43})},null,8,W)])]),t("div",X,[t("div",Y,[v(t("div",{onClick:o[4]||(o[4]=(...s)=>e.store.previousLevel&&e.store.previousLevel(...s)),class:"return",innerHTML:e.toSvg("corner-up-left")},null,8,Z),[[p,e.store.level!=e.store.levels[0]]]),v(t("div",{onClick:o[5]||(o[5]=(...s)=>e.goHome&&e.goHome(...s)),class:"home",innerHTML:e.toSvg("home")},null,8,x),[[p,e.store.level!=e.store.levels[0]]])]),t("h1",ee,m(e.store.levelText),1)]),L(r)])}var te=_(A,[["render",oe],["__scopeId","data-v-12ca21bd"]]);const re=g({setup(e){return(o,l)=>(n(),C(te))}});export{re as default};
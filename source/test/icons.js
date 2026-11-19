const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{const dir=process.argv[2];const svg=fs.readFileSync(path.join(dir,'icon.svg'),'utf8');const b=await chromium.launch();
for(const [n,sz,pad] of [['icon-192.png',192,0],['icon-512.png',512,0],['icon-maskable-512.png',512,1]]){
 const p=await b.newPage({viewport:{width:sz,height:sz},deviceScaleFactor:1});
 const inner=pad?`<div style="width:100%;height:100%;background:#2f4fd8;display:flex;align-items:center;justify-content:center"><div style="width:80%;height:80%">${svg}</div></div>`:svg;
 await p.setContent(`<html><body style="margin:0">${inner}<style>svg{width:100%;height:100%;display:block}</style></body></html>`);
 await p.screenshot({path:path.join(dir,'dist',n)});await p.close()}
await b.close()})();

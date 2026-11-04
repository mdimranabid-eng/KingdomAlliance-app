import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
const root=path.resolve('dist');
const server=http.createServer((req,res)=>{
 let target=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
 if(!target.startsWith(root)||!fs.existsSync(target)||fs.statSync(target).isDirectory())target=path.join(root,'index.html');
 const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
 res.setHeader('Content-Type',mime[path.extname(target)]||'application/octet-stream');fs.createReadStream(target).pipe(res);
});
await new Promise(r=>server.listen(8191,'127.0.0.1',r));
let browser;
try{
 browser=await puppeteer.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--disable-background-networking']});
 const page=await browser.newPage();
 await page.setViewport({width:440,height:780,deviceScaleFactor:1,isMobile:true,hasTouch:true});
 await page.setRequestInterception(true);
 page.on('request',req=>{if(req.url().startsWith('http://127.0.0.1:8191')||req.url().startsWith('data:'))req.continue();else req.abort();});
 await page.goto('http://127.0.0.1:8191/',{waitUntil:'networkidle0'});
 const report=await page.evaluate(()=>[...document.querySelectorAll('main > section')].map(s=>{
 const bounds=s.getBoundingClientRect();const children=[...s.children].filter(x=>getComputedStyle(x).position!=='absolute').map(x=>x.getBoundingClientRect());
 return {heading:s.querySelector('h2')?.textContent||'Hero',height:bounds.height,clipped:children.some(r=>r.top<bounds.top-1||r.bottom>bounds.bottom+1)};
 }));
 fs.mkdirSync('tmp/mobile-audit',{recursive:true});
 fs.writeFileSync('tmp/mobile-audit/before.json',JSON.stringify(report,null,2));console.log(report);
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}

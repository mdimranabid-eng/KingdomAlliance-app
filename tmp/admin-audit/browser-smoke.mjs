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
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setRequestInterception(true);
 page.on('request',req=>{if(req.url().startsWith('http://127.0.0.1:8191')||req.url().startsWith('data:'))req.continue();else req.abort();});
 await page.goto('http://127.0.0.1:8191/admin/login',{waitUntil:'networkidle0'});
 const initial=await page.evaluate(()=>({heading:document.querySelector('h1')?.textContent,inputs:[...document.querySelectorAll('input')].map(x=>x.type),buttons:[...document.querySelectorAll('button')].map(x=>x.textContent.trim())}));
 await page.screenshot({path:'tmp/admin-audit/login.png',fullPage:true});
 const routes=['/admin','/admin/approvals','/admin/photos','/admin/users','/admin/rejected','/admin/church-info','/admin/settings','/admin/announcements','/admin/help'];
 const results=[];
 for(const route of routes){await page.goto('http://127.0.0.1:8191'+route,{waitUntil:'networkidle0'});results.push({route,redirectedToLogin:page.url().endsWith('/admin/login')});}
 const report={initial,routes:results,errors};fs.writeFileSync('tmp/admin-audit/browser-results.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}

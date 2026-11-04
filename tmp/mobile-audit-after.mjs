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
 const reports=[];
 for(const [width,height] of [[440,956],[440,780],[390,664],[956,440],[1440,900]]){
  await page.setViewport({width,height,deviceScaleFactor:1,isMobile:width<1024,hasTouch:width<1024});
  await page.goto('http://127.0.0.1:8191/',{waitUntil:'networkidle0'});
  const report=await page.evaluate(()=>{
   const root=document.querySelector('.landing-page');
   return {horizontalOverflow:document.documentElement.scrollWidth>innerWidth,sections:[...document.querySelectorAll('main > section')].map(s=>{
    const bounds=s.getBoundingClientRect();const children=[...s.children].filter(x=>getComputedStyle(x).position!=='absolute').map(x=>x.getBoundingClientRect());
    return {heading:s.querySelector('h2')?.textContent||'Hero',height:bounds.height,clipped:children.some(r=>r.top<bounds.top-1||r.bottom>bounds.bottom+1)};
   })};
  });
  if(report.horizontalOverflow||report.sections.some(s=>s.clipped))throw Error(JSON.stringify({width,height,...report}));
  if(width<768){
   await page.click('[aria-label="Toggle menu"]');
   await new Promise(r=>setTimeout(r,650));
   const links=await page.$$('a[href="/#benefits"]');await links[links.length-1].click();
   await new Promise(r=>setTimeout(r,650));
   const top=await page.$eval('#benefits',e=>e.getBoundingClientRect().top);
   if(top<63||top>66)throw Error(`Anchor obscured: ${top}`);
   await page.screenshot({path:`tmp/mobile-audit/benefits-${width}-${height}.png`,fullPage:false});
  }
  // Scroll every section into view so entrance animations settle before visual capture.
  for(const section of await page.$$('main > section')){
   await section.evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));
   await new Promise(r=>setTimeout(r,550));
  }
  reports.push({width,height,...report});
 }
 fs.writeFileSync('tmp/mobile-audit/after.json',JSON.stringify({reports,errors},null,2));
 if(errors.length)throw Error(errors.join('\n'));
 console.log(JSON.stringify({viewports:reports.length,clippedSections:0,horizontalOverflow:false,errors},null,2));
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}

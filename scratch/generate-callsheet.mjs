// Kingdom Alliance — promo call-sheet PDFs. Run: node scratch/generate-callsheet.mjs
// Produces TWO files so neither overwrites the other:
//   KA-Promo-CallSheet-OptionA.pdf     (chosen final — 7-shot Option A script)
//   KA-Promo-CallSheet-Storyboard.pdf  (full 12-shot storyboard version)
import { jsPDF } from 'jspdf';
import { fileURLToPath } from 'url';
import fs from 'fs';
const N=[10,20,40],G=[201,168,76],IV=[248,244,234],IV2=[241,235,222],GR=[110,120,135],GL=[225,220,210],INK=[25,30,40],W=[255,255,255];
const PW=297,PH=210,M=12,CW=PW-M*2;
const COLS=[['#',9],['Time',16],['Dur',10],['Visual / Action',72],['Voiceover',66],['On-screen',40],['Notes',48]];
const colX=i=>M+COLS.slice(0,i).reduce((a,c)=>a+c[1],0);

// ── Option A — chosen final (7 shots) ──
const SH_A=[
['1','0:00-0:08','8s','Warm cinematic shot — sunrise, an open Bible, a couple\'s hands together. Soft, reverent, golden-hour feel.','"Finding a godly life partner shouldn\'t feel like a gamble."','(none)','Establishes tone. Golden hour. Shallow DOF.'],
['2','0:08-0:16','8s','Logo reveal over the navy-and-gold brand mark (KingdomCrossIcon). Hold on the wordmark.','"Welcome to Kingdom Alliance — a faith-first Christian matrimony platform, built on biblical values."','KINGDOM ALLIANCE','Exact brand mark. Navy #0a1428 + Gold #C9A84C.'],
['3','0:16-0:24','8s','Screen recording: onboarding wizard — denomination, church, family, partner preferences. Steps advancing.','"Create a profile that reflects your faith journey, your church, and what you\'re truly praying for."','Faith-First Profiles','Denomination + church = differentiator.'],
['4','0:24-0:32','8s','Screen recording: admin approval queue + photo moderation. Approve action; photo review.','"Every profile and photo is personally reviewed by our team — no catfish, no scammers, just genuine believers."','Admin-Verified · 100% Real','Answers the #1 trust objection.'],
['5','0:32-0:42','10s','Screen recording: blurred photos -> accept interest -> photos unblur -> chat opens.','"Send interests, shortlist favourites, and start meaningful conversations in a secure, private space."','Secure · Private','The unblur is the visual hero.'],
['6','0:42-0:50','8s','Screen recording: privacy toggles, discreet block, biodata PDF with digital signature (gold PDF417 barcode).','"Your privacy is protected — photos blur until you\'re ready. And your biodata is digitally signed for trust."','Photo Privacy · Digitally Signed','Combine privacy toggles + PDF signature panel.'],
['7','0:50-0:60','10s','Closing — couple smiling, brand mark, website URL. Soft resolve.','"Free forever. Faith at the centre. Kingdom Alliance — thekingdomalliances.com."','Free Forever · Rooted in Faith · thekingdomalliances.com','End on URL (the CTA). Hold logo 2s.'],
];

// ── Full Storyboard version (12 shots) ──
const SH_B=[
['1','0:00-0:04','4s','Slow push-in on open Bible, wooden table, warm morning light; hand turns page; dust motes. Macro, shallow DOF.','"Finding a godly life partner shouldn\'t feel like a gamble."','(none)','Golden hour. Reverent, premium tone.'],
['2','0:04-0:08','4s','Navy bg. Gold cross/wordmark animates in (KingdomCrossIcon). Subtitle fades.','"Welcome to Kingdom Alliance — a Christian matrimony platform, rooted in faith and values."','KINGDOM ALLIANCE · Rooted in Faith & Values','Exact brand mark. Gold on navy.'],
['3','0:08-0:12','4s','Screen cap: landing page rotating Bible verse (Prov 18:22 -> Song 8:6). Ivory gradient.','"Because marriage is a covenant — not a swipe."','Proverbs 18:22','Real UI, no mockup.'],
['4','0:12-0:17','5s','Screen cap: onboarding multi-step form — denomination, church, partner prefs. Step 1->2->3.','"Create a profile that reflects your faith, your church, and what you\'re truly praying for."','Faith-First Profiles','Denomination+church = differentiator.'],
['5','0:17-0:22','5s','Screen cap: /admin/approvals — pending card -> green Approve -> Approved.','"Every profile personally reviewed — no catfish, no scammers, just genuine believers."','Admin-Verified · 100% Real','Answers trust objection.'],
['6','0:22-0:27','5s','Screen cap: blurred profile photo (BlurablePhoto). Accept Interest -> photo unblurs.','"Your photos blur until you\'re ready. You control who sees you."','Photo Privacy by Default','The unblur is the hero.'],
['7','0:27-0:32','5s','Screen cap: /matches grid -> click Shortlist -> /shortlist shows saved profile.','"Shortlist your favourites. Send up to five interests a day — quality over quantity."','5 Interests/Day · Intentional','5/day is a selling point.'],
['8','0:32-0:37','5s','Screen cap: /messages — thread opens, message typed & sent real-time.','"When interest is accepted, start meaningful conversations in a secure space."','Secure Messaging · Mutual Consent','Chat opens only after acceptance.'],
['9','0:37-0:43','6s','Screen cap: biodata PDF opens — hero cover + gold hairline; scroll to signature panel w/ gold PDF417 barcode.','"On completion, you receive a digitally-signed biodata document — confidential and verifiable."','Digital Biodata · Digitally Signed','Unique feature. Give it airtime.'],
['10','0:43-0:48','5s','Screen cap: privacy toggles + discreet block (clicked, no notification).','"Block anyone silently. Decline without a notification. Your data is never shared or sold."','Discreet Blocking · Never Sold','Three toggles, keep snappy.'],
['11','0:48-0:53','5s','Clean navy. Gold text types: "100% Free. Always." Sub-points fade in.','"Free forever — because this is a ministry, not a marketplace."','100% Free · Always','Emotional climax. Music swells.'],
['12','0:53-0:60','7s','Slow push-in on couple\'s hands (matches Shot 1). Brand mark + URL resolves.','"Kingdom Alliance — thekingdomalliances.com. Where faith meets forever."','KINGDOM ALLIANCE · thekingdomalliances.com','End on URL (CTA). Hold 2s.'],
];
function wrap(doc,t,w,sz,f){doc.setFont('helvetica',f||'normal');doc.setFontSize(sz);return doc.splitTextToSize(String(t),w)||[];}
function hdr(doc,p,tp,label){doc.setFillColor(...N);doc.rect(0,0,PW,22,'F');doc.setFillColor(...G);doc.rect(0,22,PW,0.8,'F');doc.setFont('times','bold');doc.setFontSize(15);doc.setTextColor(...W);doc.text('KINGDOM ALLIANCE',M,11);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...G);doc.text(`PRODUCTION CALL SHEET · ${label}`,M,17);doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(...W);doc.text(`Page ${p} of ${tp}`,PW-M,11,{align:'right'});doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(220,220,220);doc.text(`16:9 + 9:16 cut | v1.0 | ${new Date().toLocaleDateString('en-GB')}`,PW-M,17,{align:'right'});}
function ftr(doc){doc.setDrawColor(...GL);doc.setLineWidth(0.3);doc.line(M,PH-10,PW-M,PH-10);doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(...GR);doc.text('Kingdom Alliance — Christian Matrimony · thekingdomalliances.com',M,PH-5.5);doc.text('Confidential · For production use',PW-M,PH-5.5,{align:'right'});}
const FS=7.2,Y0=27,MAXY=PH-14;
function tblHead(doc,y){doc.setFillColor(...N);doc.rect(M,y,CW,8,'F');COLS.forEach((c,i)=>{doc.setFont('helvetica','bold');doc.setFontSize(7.5);doc.setTextColor(...G);doc.text(c[0].toUpperCase(),colX(i)+2,y+5.4);});return y+8;}
const PN=[['Brand palette','Navy #0a1428 · Gold #C9A84C · Ivory #F8F4EA'],['Wordmark font','Times (serif). Body: Helvetica.'],['Voiceover tone','Warm, calm, assured — not salesy. ~0.5s silence between sentences.'],['Music','Soft piano + strings; gentle build; resolve soft at end.'],['Screen captures','Crisp 1080p+. Use real product UI, no mockups.'],['Vertical 9:16','Shoot natively vertical where possible. Crop recordings to centre.'],['90s extension','Add: testimonials, church directory, denomination chips, dashboard.']];
function build(shots,label,outFile){
  const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
  let y=Y0,pg=1;hdr(doc,pg,1,label);ftr(doc);y=tblHead(doc,y);
  shots.forEach((s,idx)=>{
    const cells=[wrap(doc,s[0],COLS[0][1]-3,FS+1,'bold'),wrap(doc,s[1],COLS[1][1]-3,FS,'bold'),wrap(doc,s[2],COLS[2][1]-3,FS,'bold'),wrap(doc,s[3],COLS[3][1]-4,FS),wrap(doc,s[4],COLS[4][1]-4,FS),wrap(doc,s[5],COLS[5][1]-4,FS,'bold'),wrap(doc,s[6],COLS[6][1]-4,FS-0.6,'italic')];
    const ml=Math.max(...cells.map(a=>a.length));const rh=Math.max(11,ml*3.0+3);
    if(y+rh>MAXY){doc.addPage();pg++;hdr(doc,pg,1,label);ftr(doc);y=Y0;y=tblHead(doc,y);}
    doc.setFillColor(...(idx%2?IV2:IV));doc.rect(M,y,CW,rh,'F');
    cells.forEach((ln,i)=>{const x=colX(i)+2,ly=y+2.2;if(i===0){doc.setFont('helvetica','bold');doc.setFontSize(FS+1);doc.setTextColor(...N);}else if(i===1||i===2){doc.setFont('helvetica','bold');doc.setFontSize(FS);doc.setTextColor(...[30,45,70]);}else if(i===5){doc.setFont('helvetica','bold');doc.setFontSize(FS-0.2);doc.setTextColor(...G);}else if(i===6){doc.setFont('helvetica','italic');doc.setFontSize(FS-0.6);doc.setTextColor(...GR);}else{doc.setFont('helvetica','normal');doc.setFontSize(FS);doc.setTextColor(...INK);}doc.text(ln,x,ly);});
    doc.setDrawColor(...GL);doc.setLineWidth(0.2);doc.line(M,y+rh,M+CW,y+rh);y+=rh+1;
  });
  if(y+46>MAXY){doc.addPage();pg++;hdr(doc,pg,1,label);ftr(doc);y=Y0;}else y+=8;
  doc.setFont('times','bold');doc.setFontSize(13);doc.setTextColor(...N);doc.text('Production Notes',M,y);doc.setDrawColor(...G);doc.setLineWidth(0.6);doc.line(M,y+2,M+36,y+2);y+=8;
  PN.forEach(([k,v])=>{doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(...N);doc.text(k,M,y);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...INK);const vl=wrap(doc,v,CW-40,8);doc.text(vl,M+40,y);y+=Math.max(6,vl.length*3.6+1.5);});
  const tp=doc.getNumberOfPages();
  for(let p=1;p<=tp;p++){doc.setPage(p);doc.setFillColor(...N);doc.rect(PW-32,3,28,9,'F');doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(...W);doc.text(`Page ${p} of ${tp}`,PW-M,11,{align:'right'});}
  const out=fileURLToPath(new URL('./'+outFile,import.meta.url));
  fs.writeFileSync(out,Buffer.from(doc.output('arraybuffer')));
  console.log('Written:',out,`(${(fs.statSync(out).size/1024).toFixed(1)} KB)`,tp,'pages');
}
build(SH_A,'Option A · 60-Second Script (Final)','KA-Promo-CallSheet-OptionA.pdf');
build(SH_B,'Full Storyboard · 60-Second','KA-Promo-CallSheet-Storyboard.pdf');

function buildHooks(outFile){
  const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
  let pg=1;hdr(doc,pg,1,'Option C · Hooks / First 5 Seconds (Scroll-Stopper)');ftr(doc);
  let y=Y0+6;
  doc.setFont('times','italic');doc.setFontSize(12);doc.setTextColor(...GR);
  doc.text('Pick one. Land it hard in the first 5 seconds to stop the scroll.',M,y);
  y+=10;
  const hooks=[
    ['1','"Most dating apps forgot about faith. We didn\'t."','Direct contrast. Bold, slightly provocative. Best for broad reach.'],
    ['2','"What if your life partner was one prayer away?"','Invitational, hopeful. Best for emotionally-led cuts.'],
    ['3','"Christian matrimony — finally done with intention."','Positions the category. Best for differentiation-led cuts.'],
    ['4','"He who finds a wife finds a good thing. Let\'s find yours."','Scriptural, warm. Best for faith-community audiences.'],
  ];
  hooks.forEach((h,i)=>{
    const ch=34;
    if(y+ch>MAXY){doc.addPage();pg++;hdr(doc,pg,1,'Option C · Hooks / First 5 Seconds (Scroll-Stopper)');ftr(doc);y=Y0+6;}
    doc.setFillColor(...(i%2?IV2:IV));doc.roundedRect(M,y,CW,ch,3,3,'F');
    doc.setFillColor(...G);doc.rect(M,y,1.6,ch,'F');
    doc.setFont('times','bold');doc.setFontSize(20);doc.setTextColor(...N);
    doc.text(h[0],M+8,y+14);
    doc.setFont('times','italic');doc.setFontSize(16);doc.setTextColor(...INK);
    doc.text(h[1],M+18,y+14);
    doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...GR);
    const nl=wrap(doc,h[2],CW-30,8);
    doc.text(nl,M+18,y+22);
    y+=ch+4;
  });
  // usage note
  y+=4;
  doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(...N);
  doc.text('How to use',M,y);doc.setDrawColor(...G);doc.setLineWidth(0.5);doc.line(M,y+2,M+24,y+2);y+=7;
  const usage=[['Replace Shot 1 VO','Swap the opening line of Option A with your chosen hook. Keep the cinematic visual.'],['A/B test','Produce two 15s teasers — one bold (Hook 1), one warm (Hook 4) — and run both.'],['Pair with Hook 4','Hook 4 pairs naturally with the rotating Bible verse (Shot 3 of the storyboard).']];
  usage.forEach(([k,v])=>{doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(...N);doc.text(k,M,y);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...INK);const vl=wrap(doc,v,CW-40,8);doc.text(vl,M+40,y);y+=Math.max(6,vl.length*3.6+1.5);});
  const tp=doc.getNumberOfPages();
  for(let p=1;p<=tp;p++){doc.setPage(p);doc.setFillColor(...N);doc.rect(PW-32,3,28,9,'F');doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(...W);doc.text(`Page ${p} of ${tp}`,PW-M,11,{align:'right'});}
  const out=fileURLToPath(new URL('./'+outFile,import.meta.url));
  fs.writeFileSync(out,Buffer.from(doc.output('arraybuffer')));
  console.log('Written:',out,`(${(fs.statSync(out).size/1024).toFixed(1)} KB)`,tp,'pages');
}
buildHooks('KA-Promo-CallSheet-Hooks.pdf');



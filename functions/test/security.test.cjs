const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');
const { createEmailHandlers, sendOnboardingEmail } = require('../lib/secureEmail');
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8189') throw Error('Use only the local emulator on 127.0.0.1:8189.');
const project = 'demo-ka-security';
admin.initializeApp({ projectId: project });
const db = admin.firestore();
after(() => admin.app().delete());
function token(uid, elevated) {
  const payload={sub:uid,user_id:uid,email:`${uid}@example.com`,admin:!!elevated,aud:project,
    iss:`https://securetoken.google.com/${project}`,iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600,
    firebase:{sign_in_provider:'password',identities:{},...(elevated?{sign_in_second_factor:'totp'}:{})}};
  return `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.`;
}
function field(v) {
  if(typeof v==='boolean')return {booleanValue:v};
  if(typeof v==='number')return {integerValue:String(v)};
  if(typeof v==='string')return {stringValue:v};
  if(v?.toDate)return {timestampValue:v.toDate().toISOString()};
  if(Array.isArray(v))return {arrayValue:{values:v.map(field)}};
  return {mapValue:{fields:Object.fromEntries(Object.entries(v).map(([k,x])=>[k,field(x)]))}};
}
async function write(path,data,uid,elevated=false,create=false) {
  const root=`projects/${project}/databases/(default)/documents`;
  const response=await fetch(`http://127.0.0.1:8189/v1/${root}:commit`,{method:'POST',
    headers:{'Content-Type':'application/json',Authorization:`Bearer ${token(uid,elevated)}`},
    body:JSON.stringify({writes:[{update:{name:`${root}/${path}`,fields:Object.fromEntries(Object.entries(data).map(([k,v])=>[k,field(v)]))},
      ...(create?{currentDocument:{exists:false},updateTransforms:[{fieldPath:'createdAt',setToServerValue:'REQUEST_TIME'}]}:{})}]})});
  return {status:response.status,body:await response.text()};
}
async function call(handler,body,uid) {
  let status=200,result;
  await handler({method:'POST',body,headers:uid?{authorization:`Bearer ${uid}`} : {}},
    {status(v){status=v;return this;},json(v){result=v;return this;}});
  return {status,result};
}
function fixture(extra={}) {
  const messages=[];
  return {messages,db,auth:{verifyIdToken:async uid=>{if(!['owner','other','admin'].includes(uid))throw Error('invalid');return {uid,admin:uid==='admin',firebase:uid==='admin'?{sign_in_second_factor:'totp'}:{}};},
    getUser:async uid=>({uid,email:`${uid}@example.com`,customClaims:{admin:uid==='admin'}})},
    pdf:async()=>Buffer.from('%PDF-test'),send:async(...args)=>{messages.push(args);return true;},...extra};
}
async function profile(uid,extra={}) {
  await db.collection('users').doc(uid).set({uid,email:`${uid}@example.com`,age:25,
    createdAt:admin.firestore.Timestamp.now(),onboardingComplete:true,...extra});
}
test('profile creation blocks approval, admin and delivery flag injection',async()=>{
  for(const [i,extra] of [{isApproved:true},{role:'admin'},{isAdmin:true},{approvalStatus:'approved'},
    {isBanned:true},{photoApproved:true},{onboardingEmailSent:true},{email:'victim@example.com'}].entries()) {
    const uid=`attacker${i}`;const result=await write(`users/${uid}`,{uid,email:`${uid}@example.com`,...extra},uid,false,true);
    assert.equal(result.status,403,result.body);
  }
  await db.collection('users').doc('newmember').delete();
  const result=await write('users/newmember',{uid:'newmember',email:'newmember@example.com',age:25,onboardingComplete:true,
    role:'user',isBanned:false,isSuspended:false,approvalStatus:'pending',photoUrl:'',photoStatus:'pending'},'newmember',false,true);
  assert.equal(result.status,200,result.body);
});
test('draft completion and ordinary edits work; approval, delivery flags and identity stay locked',async()=>{
  await profile('draftmember',{onboardingComplete:false,age:0,approvalStatus:'incomplete',role:'user'});
  const data={...(await db.collection('users').doc('draftmember').get()).data(),age:25,gender:'female',onboardingComplete:true,approvalStatus:'pending'};
  let result=await write('users/draftmember',data,'draftmember');assert.equal(result.status,200,result.body);
  result=await write('users/draftmember',{...data,aboutMe:'Updated'},'draftmember');assert.equal(result.status,200,result.body);
  for(const extra of [{isApproved:true},{approvalStatus:'approved'},{onboardingEmailSent:false},{onboardingComplete:false},{gender:'male'}]) {
    result=await write('users/draftmember',{...data,...extra},'draftmember');assert.equal(result.status,403,result.body);
  }
});
test('church records require admin and email delivery records deny client writes',async()=>{
  await db.collection('admins').doc('admin').set({emailVerified:true});
  let result=await write('churches/testchurch',{churchName:'Changed'},'owner');assert.equal(result.status,403,result.body);
  result=await write('churches/testchurch',{churchName:'Approved'},'admin',true);assert.equal(result.status,200,result.body);
  result=await write('churches/testchurch',{churchName:'Tampered'},'other');assert.equal(result.status,403,result.body);
  result=await write('email_deliveries/onboarding_owner',{sent:true},'owner');assert.equal(result.status,403,result.body);
});
test('interest participants cannot rewrite recipients',async()=>{
  const data={fromId:'owner',toId:'other',status:'pending',createdAt:admin.firestore.Timestamp.now()};
  await db.collection('interests').doc('immutable').set(data);
  const result=await write('interests/immutable',{...data,toId:'victim',status:'accepted'},'other');assert.equal(result.status,403,result.body);
});
test('email handlers block anonymous, cross-account and arbitrary template requests',async()=>{
  const deps=fixture(),handlers=createEmailHandlers(deps);
  assert.equal((await call(handlers.onboarding,{uid:'owner'})).status,401);
  assert.equal((await call(handlers.onboarding,{uid:'owner'},'other')).status,403);
  for(const type of ['otp','profile_approved','<p>Injected</p>'])
    assert.equal((await call(handlers.notification,{type,interestId:'fake'},'owner')).status,400);
  assert.equal((await call(handlers.notification,{type:'connection_request',interestId:'missing'},'owner')).status,403);
  assert.equal(deps.messages.length,0);
});
test('concurrent onboarding requests send one PDF with server BCC; owner and admin can retry safely',async()=>{
  await db.collection('email_deliveries').doc('onboarding_owner').delete();await profile('owner');
  let release;const gate=new Promise(resolve=>release=resolve);
  const deps=fixture({send:async(...args)=>{deps.messages.push(args);await gate;return true;}}),handlers=createEmailHandlers(deps);
  const first=sendOnboardingEmail('owner',deps);
  while(!deps.messages.length)await new Promise(resolve=>setTimeout(resolve,10));
  assert.equal((await call(handlers.onboarding,{uid:'owner'},'owner')).status,409);
  release();await first;
  assert.equal((await call(handlers.onboarding,{uid:'owner',bccEmail:'attacker@example.com'},'admin')).status,200);
  assert.equal(deps.messages.length,1);
  const msg=deps.messages[0];assert.equal(msg[0],'owner@example.com');assert.equal(msg[2],'onboarding_complete');
  assert.match(msg[5],/^data:application\/pdf;base64,/);assert.match(msg[6],/\.pdf$/);
  assert.equal(msg[7],process.env.ONBOARDING_BCC_EMAILS||'themaster@thekingdomalliances.com');
  assert.equal((await db.collection('users').doc('owner').get()).data().onboardingEmailSent,true);
});
test('incomplete and mismatched profiles cannot send; SMTP failure permits a retry',async()=>{
  const deps=fixture();await profile('incomplete',{onboardingComplete:false});
  await assert.rejects(sendOnboardingEmail('incomplete',deps),/not complete/);
  await profile('mismatch',{email:'attacker@example.com'});await assert.rejects(sendOnboardingEmail('mismatch',deps),/does not match/);
  await profile('retry');await db.collection('email_deliveries').doc('onboarding_retry').delete();
  await assert.rejects(sendOnboardingEmail('retry',fixture({send:async()=>{throw Error('SMTP failed');}})),/SMTP failed/);
  await sendOnboardingEmail('retry',deps);assert.equal(deps.messages.length,1);
});
test('connection email derives recipient and sender from database and sends once',async()=>{
  await profile('owner',{isApproved:true,name:'Member'});
  await db.collection('interests').doc('valid').set({fromId:'owner',toId:'other',status:'pending'});
  await db.collection('email_deliveries').doc('connection_request_valid').delete();
  await db.collection('email_delivery_limits').doc('connection_request_other').delete();
  await db.collection('email_delivery_limits').doc('connection_accepted_owner').delete();
  const deps=fixture(),handlers=createEmailHandlers(deps);
  assert.equal((await call(handlers.notification,{type:'connection_request',interestId:'valid'},'other')).status,403);
  const payload={type:'connection_request',interestId:'valid',to_email:'attacker@example.com',bccEmail:'attacker@example.com',senderName:'Admin',attachmentBase64:'injected'};
  assert.equal((await call(handlers.notification,payload,'owner')).status,200);
  assert.equal((await call(handlers.notification,payload,'owner')).status,200);
  assert.equal(deps.messages.length,1);assert.equal(deps.messages[0][0],'other@example.com');
  assert.equal(deps.messages[0][4],'Member');assert.equal(deps.messages[0].length,5);
  await db.collection('interests').doc('valid').update({status:'accepted'});await profile('other',{isApproved:true});
  await db.collection('email_deliveries').doc('connection_accepted_valid').delete();
  assert.equal((await call(handlers.notification,{type:'connection_accepted',interestId:'valid'},'other')).status,200);
  assert.equal(deps.messages[1][0],'owner@example.com');
});

test('creation and draft-completion triggers call shared delivery; later edits do not',async()=>{
  const secure=require('../lib/secureEmail'),saved=secure.sendOnboardingEmail,calls=[];
  secure.sendOnboardingEmail=async uid=>{calls.push(uid);return true;};
  try {
    const triggers=require('../lib/onboardingEmailTrigger');
    await triggers.onOnboardingComplete.run({params:{userId:'created'},data:{data:()=>({onboardingComplete:true})}});
    await triggers.onOnboardingUpdated.run({params:{userId:'updated'},data:{before:{data:()=>({onboardingComplete:false})},after:{data:()=>({onboardingComplete:true})}}});
    await triggers.onOnboardingUpdated.run({params:{userId:'edit'},data:{before:{data:()=>({onboardingComplete:true})},after:{data:()=>({onboardingComplete:true})}}});
    assert.deepEqual(calls,['created','updated']);
  } finally {secure.sendOnboardingEmail=saved;}
});

test('backend church sync creates a directory entry and preserves existing details',async()=>{
  const {syncProfileChurch}=require('../lib/onboardingEmailTrigger');
  const after={onboardingComplete:true,churchName:'Backend Test Church',churchCity:'Test City',churchArea:'',pastorName:'Pastor',pastorNumber:'123'};
  const id='backend_test_church||test_city||||pastor||123';
  await db.collection('churches').doc(id).delete();
  const event=uid=>({params:{userId:uid},data:{before:{data:()=>undefined},after:{data:()=>after}}});
  await syncProfileChurch.run(event('owner'));
  await db.collection('churches').doc(id).update({pastorName:'Admin verified name'});
  await syncProfileChurch.run(event('other'));
  const data=(await db.collection('churches').doc(id).get()).data();
  assert.equal(data.pastorName,'Admin verified name');assert.deepEqual(data.members,['owner','other']);
});

test('real biodata generator still produces PDF with declaration, barcode and full terms',async()=>{
  const {generateBiodataPdf}=require('../lib/biodataPdf');
  const pdf=await generateBiodataPdf({name:'Test Member',profileId:'KA-TEST',mobileNumber:'123',citizenship:'Test'});
  assert.equal(pdf.subarray(0,5).toString(),'%PDF-');
  const text=pdf.toString('latin1');
  assert.ok((text.match(/\/Type \/Page\b/g)||[]).length>=4);
  assert.match(text,/MEMBER NAME/);assert.match(text,/PROFILE REFERENCE/);
  assert.match(text,/Terms & conditions/);assert.match(text,/\/Subtype \/Image/);
});


test('notification recipient rate limit cannot be bypassed using a different interest ID',async()=>{
  await profile('owner',{isApproved:true});
  await db.collection('email_delivery_limits').doc('connection_request_other').set({startedAt:Date.now(),count:8});
  await db.collection('interests').doc('limited').set({fromId:'owner',toId:'other',status:'pending'});
  await db.collection('email_deliveries').doc('connection_request_limited').delete();
  const deps=fixture(),handler=createEmailHandlers(deps).notification;
  assert.equal((await call(handler,{type:'connection_request',interestId:'limited'},'owner')).status,429);
  assert.equal(deps.messages.length,0);
});


test('pending deletion hides profiles and blocks direct profile changes',async()=>{
 const uid='pending_rules';await profile(uid,{isApproved:true,deletionStatus:'pending_deletion'});
 const data=(await db.collection('users').doc(uid).get()).data();
 const result=await write(`users/${uid}`,{...data,aboutMe:'Bypass recovery screen'},uid);
 assert.equal(result.status,403,result.body);
});

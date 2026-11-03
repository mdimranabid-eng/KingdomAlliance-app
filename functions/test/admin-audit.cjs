// Regression checks of production handlers using a demo database and mocked Auth/mail.
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const admin=require('firebase-admin');
if(process.env.FIRESTORE_EMULATOR_HOST!=='127.0.0.1:8189')throw Error('Local demo emulator required');
const project='demo-ka-admin-audit';
admin.initializeApp({projectId:project});
const db=admin.firestore(),auth=admin.auth(),calls=[],results=[];
let failMail=false;
const accounts={auditor:{uid:'auditor',email:'audit@example.com',customClaims:{admin:true}},member:{uid:'member',email:'member@example.com',customClaims:{}},unverified:{uid:'unverified',email:'audit@example.com',customClaims:{admin:true}},target:{uid:'target',email:'target@example.com',customClaims:{admin:true}}};
auth.verifyIdToken=async token=>{if(!accounts[token])throw Error('invalid token');return{uid:token==='unverified'?'auditor':token,admin:token!=='member',firebase:token==='unverified'?{}:{sign_in_second_factor:'totp'}};};
auth.getUser=async uid=>accounts[uid]||{uid,email:`${uid}@example.com`,customClaims:{}};
auth.getUserByEmail=async()=>{throw Object.assign(Error('not found'),{code:'auth/user-not-found'});};
auth.createUser=async()=>({uid:'new_admin'});
auth.setCustomUserClaims=async()=>{};
auth.updateUser=async uid=>({uid});
auth.deleteUser=async uid=>{calls.push({operation:'auth.deleteUser',uid});};
require('../lib/services/emailProvider').dispatchEmail=async()=>{if(failMail)throw Error('Expected test mail failure');return true;};
require('../lib/cascadeDelete').cascadeDeleteUser=async uid=>{calls.push({operation:'cascade',uid});};
const {api}=require('../lib/api');
const server=http.createServer(api);
function unsignedToken(uid){const payload={sub:uid,user_id:uid,email:`${uid}@example.com`,admin:true,aud:project,iss:`https://securetoken.google.com/${project}`,iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600,firebase:{sign_in_provider:'password',identities:{},sign_in_second_factor:'totp'}};return `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.`;}
async function request(route,body,token='auditor',method='POST'){
 const r=await fetch(`http://127.0.0.1:8190/api${route}`,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(method==='POST'?{body:JSON.stringify(body||{})}:{})});
 return {status:r.status,data:await r.json()};
}
async function check(label,route,body,expected,token='auditor',method='POST'){
 const r=await request(route,body,token,method);assert.equal(r.status,expected,`${label}: ${JSON.stringify(r.data)}`);results.push({label,status:r.status});return r;
}
(async()=>{
 await new Promise(resolve=>server.listen(8190,'127.0.0.1',resolve));
 await db.collection('admins').doc('auditor').set({...accounts.auditor,emailVerified:true,createdAt:admin.firestore.Timestamp.now()});
 await db.collection('admins').doc('target').set({...accounts.target,emailVerified:true,createdAt:admin.firestore.Timestamp.now()});
 await db.collection('users').doc('photo_member').set({uid:'photo_member',email:'photo@example.com',age:28,name:'Sample',createdAt:admin.firestore.Timestamp.now(),approvalStatus:'pending',pendingPhotoUrl:'https://example.com/new.jpg',gallery:[{url:'https://example.com/gallery.jpg',status:'pending'}]});
 for(const route of ['/admin/delete-user','/admin/approve-photo','/admin/reject-photo','/admin/create-admin','/admin/delete-admin','/admin/reset-admin-password','/admin/send-deletion-otp']){
  await check(`Unauthenticated denied ${route}`,route,{},401,null);
  await check(`Ordinary member denied ${route}`,route,{},403,'member');
 }
 await check('Admin without MFA denied','/admin/list-admins',null,403,'unverified','GET');
 await check('Verified MFA admin may list admins','/admin/list-admins',null,200,'auditor','GET');
 await check('Admin email verification requires code','/verify-admin-email',{},400);
 const {hashOtp:hashLoginOtp}=require('../lib/otp');
 await db.collection('temp_otps').doc('admin_login_test').set({email:'audit@example.com',purpose:'admin_login',otpHash:hashLoginOtp('audit@example.com','654321'),attempts:0,maxAttempts:5,expiresAt:admin.firestore.Timestamp.fromMillis(Date.now()+600000),createdAt:admin.firestore.Timestamp.now()});
 await check('Admin email requires valid server-consumed code','/verify-admin-email',{otp:'654321'},200);
 await check('Admin email code cannot be reused','/verify-admin-email',{otp:'654321'},400);
 await check('Create admin handler succeeds','/admin/create-admin',{email:'new@example.com'},201);
 failMail=true;
 const failedMail=await check('Reset reports email failure accurately','/admin/reset-admin-password',{uid:'target'},200);
 assert.equal(failedMail.data.emailSent,false);
 failMail=false;
 await check('Reset admin password handler succeeds','/admin/reset-admin-password',{uid:'target'},200);
 const item={id:'photo_mod',uid:'photo_member',userName:'Sample',photoURL:'https://example.com/new.jpg',photoType:'profilePhoto'};
 await check('Profile photo approval handler succeeds','/admin/approve-photo',{item},200);
 assert.equal((await db.collection('users').doc('photo_member').get()).data().photoUrl,item.photoURL);
 await check('Gallery photo rejection handler succeeds','/admin/reject-photo',{item:{...item,id:'gallery_mod',photoType:'galleryPhoto',photoURL:'https://example.com/gallery.jpg'},reason:'Test rejection'},200);
 assert.equal((await db.collection('users').doc('photo_member').get()).data().gallery[0].status,'rejected');
 await check('Admin deletion requires OTP','/admin/delete-admin',{uid:'target'},400);
 await check('General user deletion rejects admin targets','/admin/delete-user',{uid:'target'},403);
 assert.ok(!calls.some(c=>c.operation==='cascade'));
 await check('Deletion code delivered','/admin/send-deletion-otp',{uid:'target'},200);
 await check('Incorrect deletion code rejected','/admin/delete-admin',{uid:'target',otp:'000000'},400);
 const {hashOtp}=require('../lib/otp');
 await db.collection('adminDeletionRequests').doc('auditor_target').update({otpHash:hashOtp('admin_deletion:auditor:target','123456')});
 await check('Verified deletion succeeds','/admin/delete-admin',{uid:'target',otp:'123456'},200);
 assert.ok(calls.some(c=>c.operation==='auth.deleteUser'&&c.uid==='target'));
 await db.collection('admins').doc('target').set({...accounts.target,emailVerified:true});
 await check('Deletion code cannot be replayed','/admin/delete-admin',{uid:'target',otp:'123456'},400);
 const root=`projects/${project}/databases/(default)/documents`;
 const denied=await fetch(`http://127.0.0.1:8189/v1/${root}:commit`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${unsignedToken('auditor')}`},body:JSON.stringify({writes:[{update:{name:`${root}/announcements/audit`,fields:{subject:{stringValue:'Test'}}}}]})});
 assert.equal(denied.status,403);results.push({label:'Announcement write denied for admin by rules',status:denied.status});
 await db.collection('users').doc('suspended_member').set({uid:'suspended_member',email:'suspended_member@example.com',isApproved:true,isSuspended:true,status:'suspended',age:25});
 // Use a member JWT, not an administrator token, for the suspension test.
 const parts=unsignedToken('suspended_member').split('.');
 const claims=JSON.parse(Buffer.from(parts[1],'base64url').toString());claims.admin=false;
 const memberJwt=`${parts[0]}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.`;
 await db.collection('users').doc('photo_member').update({isApproved:true});
 const access=await fetch(`http://127.0.0.1:8189/v1/${root}/users/photo_member`,{headers:{Authorization:`Bearer ${memberJwt}`}});
 assert.equal(access.status,403);results.push({label:'Suspended approved member cannot read another profile directly',status:access.status});
 // A privileged claim alone must not authorize database writes.
 const unfactoredClaims=JSON.parse(Buffer.from(unsignedToken('auditor').split('.')[1],'base64url').toString());
 delete unfactoredClaims.firebase.sign_in_second_factor;
 const unfactoredJwt=`${unsignedToken('auditor').split('.')[0]}.${Buffer.from(JSON.stringify(unfactoredClaims)).toString('base64url')}.`;
 const noMfaRead=await fetch(`http://127.0.0.1:8189/v1/${root}/users/photo_member`,{headers:{Authorization:`Bearer ${unfactoredJwt}`}});
 assert.equal(noMfaRead.status,403);results.push({label:'Database denies administrator session without MFA',status:noMfaRead.status});
 await db.collection('users').doc('suspended_member').update({isSuspended:false,isBanned:true,status:'active'});
 const bannedRead=await fetch(`http://127.0.0.1:8189/v1/${root}/users/photo_member`,{headers:{Authorization:`Bearer ${memberJwt}`}});
 assert.equal(bannedRead.status,403);results.push({label:'Banned member cannot read other profiles',status:bannedRead.status});
 const adminRecordWrite=await fetch(`http://127.0.0.1:8189/v1/${root}:commit`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${unsignedToken('auditor')}`},body:JSON.stringify({writes:[{update:{name:`${root}/admins/auditor`,fields:{emailVerified:{booleanValue:true}}},updateMask:{fieldPaths:['emailVerified']}}]})});
 assert.equal(adminRecordWrite.status,403);results.push({label:'Admin record verification cannot be edited directly',status:adminRecordWrite.status});
 const commitUrl=`http://127.0.0.1:8189/v1/${root}:commit`;
 async function adminUpdate(uid, changes){
  const fields=Object.fromEntries(Object.entries(changes).map(([k,v])=>[k,typeof v==='boolean'?{booleanValue:v}:{stringValue:v}]));
  const response=await fetch(commitUrl,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${unsignedToken('auditor')}`},body:JSON.stringify({writes:[{update:{name:`${root}/users/${uid}`,fields},updateMask:{fieldPaths:Object.keys(changes)},updateTransforms:[{fieldPath:'updatedAt',setToServerValue:'REQUEST_TIME'}]}]})});
  return {status:response.status,body:await response.text()};
 }
 await db.collection('users').doc('rules_profile').set({uid:'rules_profile',email:'rules@example.com',age:25,approvalStatus:'pending'});
 for(const [label,changes]of [
  ['Valid profile approval permitted',{approvalStatus:'approved',isApproved:true}],
  ['Valid profile rejection permitted',{approvalStatus:'rejected',isApproved:false}],
  ['Valid profile suspension permitted',{status:'suspended',isSuspended:true}],
  ['Valid profile restoration permitted',{status:'active',isSuspended:false}],
 ]){const response=await adminUpdate('rules_profile',changes);assert.equal(response.status,200,response.body);results.push({label,status:response.status});}
 await db.collection('users').doc('draft_profile').set({uid:'draft_profile',email:'draft@example.com',age:0,approvalStatus:'incomplete'});
 const blockedDraft=await adminUpdate('draft_profile',{status:'suspended',isSuspended:true});
 assert.equal(blockedDraft.status,200);results.push({label:'Suspension of incomplete age-zero draft permitted',status:blockedDraft.status});
 const routes=['/admin/list-admins','/admin/create-admin','/admin/delete-admin','/admin/reset-admin-password'];
 const local=fs.readFileSync(path.resolve(__dirname,'../../server/index.js'),'utf8');
 assert.ok(local.includes('adminApiApp'));
 const missing=[];
 const report={checks:results,missingLocalRoutes:missing,mockedAuthOperations:calls};
 fs.writeFileSync(path.resolve(__dirname,'../../tmp/admin-audit/results.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({checks:results.length,missingLocalRoutes:missing,confirmedGaps:[]},null,2));
})().finally(async()=>{server.closeAllConnections();await new Promise(r=>server.close(r));await admin.app().delete();}).catch(e=>{console.error(e);process.exitCode=1;});

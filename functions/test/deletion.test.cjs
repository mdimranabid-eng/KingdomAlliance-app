const {test,after}=require('node:test');
const assert=require('node:assert/strict');
const admin=require('firebase-admin');
if(process.env.FIRESTORE_EMULATOR_HOST!=='127.0.0.1:8189')throw Error('Use only the isolated local emulator.');
process.env.OTP_HASH_SALT='local-test-only-deletion-salt';
admin.initializeApp({projectId:'demo-ka-security'});
const db=admin.firestore();
after(()=>admin.app().delete());
const {createDeletionHandlers,DELETION_GRACE_MS}=require('../lib/accountDeletion');
const otp=require('../lib/otp');
const {cascadeDeleteUser}=require('../lib/cascadeDelete');
const {runDeletionSchedule}=require('../lib/deletionScheduler');
const owner='delete_test_member';
function deps(extra={}){
 const messages=[];
 return {db,messages,auth:{verifyIdToken:async token=>{if(token!=='valid')throw Error('invalid');return{uid:owner};},
 getUser:async uid=>({uid,email:`${uid}@example.com`})},send:async(...args)=>{messages.push(args);return true;},...extra};
}
async function invoke(fn,body={},token='valid'){
 let status=200,data;
 await fn({body,headers:token?{authorization:`Bearer ${token}`}:{},method:'POST'},
 {status(v){status=v;return this;},json(v){data=v;return this;}});
 return {status,data};
}
async function profile(uid=owner,extra={}){await db.collection('users').doc(uid).set({uid,email:`${uid}@example.com`,...extra});}
async function code(value='123456',extra={}){
 const ref=db.collection('temp_otps').doc('delete_test_otp');
 await ref.set({email:`${owner}@example.com`,purpose:'delete_account',otpHash:otp.hashOtp(`${owner}@example.com`,value),
 attempts:0,createdAt:admin.firestore.Timestamp.now(),expiresAt:admin.firestore.Timestamp.fromMillis(Date.now()+600000),...extra});
 return ref;
}

test('deletion requires authentication and server-side OTP; invalid attempts are recorded',async()=>{
 await profile();const fixture=deps(),handler=createDeletionHandlers(fixture).deleteAccount;
 assert.equal((await invoke(handler,{},null)).status,401);
 assert.equal((await invoke(handler)).status,400);
 const ref=await code();assert.equal((await invoke(handler,{otp:'999999'})).status,400);
 assert.equal((await ref.get()).data().attempts,1);
 assert.equal((await db.collection('users').doc(owner).get()).data().deletionStatus,undefined);
 assert.equal(fixture.messages.length,0);
});
test('expired and exhausted codes cannot schedule deletion',async()=>{
 await profile();const handler=createDeletionHandlers(deps()).deleteAccount;
 await code('123456',{expiresAt:admin.firestore.Timestamp.fromMillis(Date.now()-1)});
 assert.equal((await invoke(handler,{otp:'123456'})).status,400);
 await code('123456',{attempts:5});assert.equal((await invoke(handler,{otp:'123456'})).status,400);
});
test('valid code schedules seven days; repeat request does not extend deadline or repeat email',async()=>{
 await profile();const ref=await code(),fixture=deps(),handler=createDeletionHandlers(fixture).deleteAccount;
 const start=Date.now(),first=await invoke(handler,{otp:'123456'});
 assert.equal(first.status,200);assert.ok(first.data.scheduledDeletionAt>=start+DELETION_GRACE_MS);
 assert.equal((await ref.get()).exists,false);
 const repeat=await invoke(handler,{});assert.equal(repeat.status,200);
 assert.equal(repeat.data.scheduledDeletionAt,first.data.scheduledDeletionAt);assert.equal(fixture.messages.length,1);
 assert.equal(fixture.messages[0][0],`${owner}@example.com`);
});
test('reactivation works before deadline; expired and in-progress accounts cannot reactivate',async()=>{
 const fixture=deps(),handlers=createDeletionHandlers(fixture);
 assert.equal((await invoke(handlers.reactivateAccount)).status,200);
 assert.equal((await db.collection('users').doc(owner).get()).data().deletionStatus,undefined);
 // A consumed code cannot be used to schedule a new request.
 assert.equal((await invoke(handlers.deleteAccount,{otp:'123456'})).status,400);
 for(const [status,at]of[['pending_deletion',Date.now()-1],['deleting',Date.now()+60000]]){
  await profile(owner,{deletionStatus:status,scheduledDeletionAt:admin.firestore.Timestamp.fromMillis(at)});
  assert.equal((await invoke(handlers.reactivateAccount)).status,409);
 }
});
test('deletion OTP requests require account ownership, skip captcha only for authenticated self-service',async()=>{
 await assert.rejects(otp.requestOtp.run({data:{email:`${owner}@example.com`,purpose:'delete_account'}}),/sign in/);
 const auth=admin.auth(),original=auth.getUser;
 const provider=require('../lib/services/emailProvider'),originalSend=provider.dispatchEmail;
 auth.getUser=async uid=>({uid,email:`${uid}@example.com`});
 provider.dispatchEmail=async()=>true;
 process.env.TURNSTILE_SECRET_KEY='test-secret-that-must-not-be-used-for-self-service';
 try{
  await assert.rejects(otp.requestOtp.run({auth:{uid:owner},data:{email:'other@example.com',purpose:'delete_account'}}),/own member/);
  for (const collection of ['temp_otps', 'email_log']) {
    const existing = await db.collection(collection).where('email', '==', `${owner}@example.com`).get();
    await Promise.all(existing.docs.map(doc => doc.ref.delete()));
  }
  await otp.requestOtp.run({auth:{uid:owner},data:{email:`${owner}@example.com`,purpose:'delete_account'}});
  const snap=await db.collection('temp_otps').where('email','==',`${owner}@example.com`).get();assert.equal(snap.size,1);
  await assert.rejects(otp.verifyOtp.run({data:{email:`${owner}@example.com`,code:'123456',purpose:'delete_account'}}),/deletion endpoint/);
 }finally{auth.getUser=original;provider.dispatchEmail=originalSend;delete process.env.TURNSTILE_SECRET_KEY;}
});
test('cleanup failure retains retry marker; retry removes chats even after interest records were removed',async()=>{
 const uid='cleanup_test_member';await profile(uid,{deletionStatus:'pending_deletion',scheduledDeletionAt:admin.firestore.Timestamp.fromMillis(Date.now()-1)});
 await db.collection('interests').doc('cleanup_interest').set({fromId:uid,toId:'other'});
 const chat=`${uid}_other`;await db.doc(`chats/${chat}/messages/test`).set({senderId:uid,receiverId:'other',text:'test'});
 await db.collection('notifications').doc('cleanup_notification').set({userId:uid});
 await db.collection('profileViews').doc('cleanup_view').set({viewerId:uid});
 await db.collection('churches').doc('cleanup_church').set({members:[uid,'other']});
 let fail=true;const removed=[];
 const fixture={db,auth:{deleteUser:async()=>{}},bucket:{deleteFiles:async()=>{if(fail)throw Error('Storage unavailable');}},
 realtime:{ref:path=>({remove:async()=>{removed.push(path);},get:async()=>({forEach:()=>{}}),update:async()=>{}})}};
 await assert.rejects(cascadeDeleteUser(uid,()=>{},fixture),/Storage unavailable/);
 assert.equal((await db.collection('users').doc(uid).get()).data().deletionStatus,'deleting');
 assert.equal((await db.collection('interests').doc('cleanup_interest').get()).exists,false);
 assert.equal((await db.doc(`chats/${chat}/messages/test`).get()).exists,false);
 fail=false;await cascadeDeleteUser(uid,()=>{},fixture);
 assert.equal((await db.collection('users').doc(uid).get()).exists,false);
 assert.deepEqual((await db.collection('churches').doc('cleanup_church').get()).data().members,['other']);
 assert.deepEqual(removed,[`status/${uid}`]);
});
test('scheduler retries cleanup and sends completion only after success; reminder is in final 24h',async()=>{
 // Remove other pending records used by preceding tests.
 await db.collection('users').doc(owner).delete();
 const now=Date.now(),timestamp=at=>admin.firestore.Timestamp.fromMillis(at);
 await profile('scheduler_due',{deletionStatus:'pending_deletion',scheduledDeletionAt:timestamp(now-1000)});
 await profile('scheduler_tomorrow',{deletionStatus:'pending_deletion',scheduledDeletionAt:timestamp(now+12*3600000)});
 await profile('scheduler_nextweek',{deletionStatus:'pending_deletion',scheduledDeletionAt:timestamp(now+6*24*3600000)});
 const messages=[];let fail=true,calls=0;
 const fixture={db,now,send:async(...args)=>{messages.push(args);return true;},cleanup:async uid=>{
  calls++;if(fail)throw Error('Expected transient failure');await db.collection('users').doc(uid).delete();
 }};
 await runDeletionSchedule(fixture);
 assert.equal((await db.collection('users').doc('scheduler_due').get()).data().deletionStatus,'deleting');
 assert.equal(messages.filter(m=>m[2]==='account_deleted').length,0);
 assert.equal(messages.filter(m=>m[2]==='account_deletion_reminder').length,1);
 assert.equal(messages[0][0],'scheduler_tomorrow@example.com');
 fail=false;await runDeletionSchedule(fixture);assert.equal(calls,2);
 assert.equal(messages.filter(m=>m[2]==='account_deleted').length,1);
 assert.equal(messages.filter(m=>m[2]==='account_deletion_reminder').length,1);
});


test('concurrent valid requests consume one code, schedule once and ignore a supplied victim UID',async()=>{
 await profile();await code();await profile('victim');
 const fixture=deps(),handler=createDeletionHandlers(fixture).deleteAccount;
 const results=await Promise.all([invoke(handler,{otp:'123456',uid:'victim'}),invoke(handler,{otp:'123456'})]);
 assert.deepEqual(results.map(r=>r.status),[200,200]);
 assert.equal(results[0].data.scheduledDeletionAt,results[1].data.scheduledDeletionAt);
 assert.equal(fixture.messages.length,1);
 assert.equal((await db.collection('users').doc('victim').get()).data().deletionStatus,undefined);
});

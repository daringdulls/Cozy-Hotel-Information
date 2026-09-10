// Verifies hosted authentication and an unchanged-content save. Credentials stay in ignored temporary files.
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const assert=require('node:assert/strict');
const deployment=process.argv[2];
if(!deployment || !process.env.ADMIN_PASSWORD)throw new Error('Supply the preview URL and ADMIN_PASSWORD.');
const cli=path.join(process.env.APPDATA,'npm/node_modules/vercel/dist/vc.js');
const files=['.env.check-login.json','.env.check-cookie','.env.check-content.json','.env.check-response.json'];
function request(route,opts=[]){
 execFileSync(process.execPath,[cli,'curl',route,'--deployment',deployment,'--','--silent','--show-error','--output',files[3],...opts],{stdio:'pipe',timeout:60000});
 return JSON.parse(fs.readFileSync(files[3],'utf8'));
}
try {
 const current=request('/api/content?scope=cozy-nest');assert.equal(current.hasDatabase,true,'Database unavailable');
 fs.writeFileSync(files[0],JSON.stringify({password:process.env.ADMIN_PASSWORD}));
 const login=request('/api/login',['--request','POST','--header','Content-Type: application/json','--data-binary','@'+files[0],'--cookie-jar',files[1]]);assert.equal(login.ok,true,'Login failed: '+(login.error || 'unknown'));
 const session=request('/api/session',['--cookie',files[1]]);assert.equal(session.authenticated,true,'Session cookie was not accepted');
 fs.writeFileSync(files[2],JSON.stringify({scope:'cozy-nest',data:current.data}));
 const save=request('/api/content',['--request','PUT','--header','Content-Type: application/json','--data-binary','@'+files[2],'--cookie',files[1]]);assert.equal(save.ok,true,'Save failed: '+(save.error || 'unknown'));
 const saved=request('/api/content?scope=cozy-nest');assert.equal(saved.source,'database');assert.deepEqual(saved.data,current.data);
 const logout=request('/api/logout',['--request','POST','--cookie',files[1],'--cookie-jar',files[1]]);assert.equal(logout.ok,true);
 const after=request('/api/session',['--cookie',files[1]]);assert.equal(after.authenticated,false);
 console.log('PASS: hosted database read, admin login, authenticated session, unchanged-content save, persistent readback, logout.');
}catch(err){console.error('Hosted check failed: '+err.message.split('\n')[0]);process.exitCode=1;}
finally{for(const file of files)if(fs.existsSync(file))fs.unlinkSync(file);}

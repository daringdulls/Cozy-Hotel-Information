const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const base = process.env.TEST_URL || 'http://127.0.0.1:4173';
assert.ok(['localhost','127.0.0.1'].includes(new URL(base).hostname),'Browser write tests must target a local file-storage preview.');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const context=await browser.newContext({viewport:{width:1280,height:1000}});
 const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const seed=path.join(root,'data/content/cozy-nest.json'), original=fs.readFileSync(seed);
 try {
  const storage=await (await context.request.get(base+'/api/content?scope=cozy-nest')).json();assert.equal(storage.hasDatabase,false,'Use local file storage for browser write tests.');
  let r=await context.request.put(base+'/api/content',{data:{scope:'cozy-nest',data:{}}});assert.equal(r.status(),401);
  r=await context.request.get(base+'/.env.local');assert.equal(r.status(),404);
  for(const slug of ['cozy-nest','cozy-roots','cozy-arts']) {
   await page.goto(base+'/'+slug+'.html');await page.waitForLoadState('networkidle');
   assert.equal(await page.locator('.guide-quickmenu a').count(),10);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.locator('.guide-quickmenu a[href="#diving"]').click();assert.equal(await page.locator('#activities').getAttribute('open'),'');
   await page.locator('.guide-menu-button').click();assert.equal(await page.locator('#guest-menu').isVisible(),true);
   await page.keyboard.press('Escape');assert.equal(await page.locator('#guest-menu').isVisible(),false);
   await page.goto(base+'/'+slug+'.html');await page.waitForLoadState('networkidle');
   if(slug==='cozy-nest') {
    await page.setViewportSize({width:1900,height:1000});
    assert.ok((await page.locator('main.guide-width').boundingBox()).width>=1600,'Desktop guide should use the available width');
    assert.equal(await page.locator('.gallery-photo').count(),4);
    await page.locator('.gallery-photo').first().click();
    assert.equal(await page.locator('.gallery-dialog').evaluate(d=>d.open),true);
    assert.equal(await page.locator('.gallery-count').textContent(),'1 / 4');
    await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('.gallery-count').textContent(),'4 / 4');
    await page.keyboard.press('ArrowRight');assert.equal(await page.locator('.gallery-count').textContent(),'1 / 4');
    await page.keyboard.press('Escape');assert.equal(await page.locator('.gallery-dialog').evaluate(d=>d.open),false);
    assert.equal(await page.locator('.gallery-photo').first().evaluate(e=>e===document.activeElement),true);
    await page.locator('#money-time summary').click();assert.ok((await page.locator('[data-field="guestInfo.localTime"]').textContent()).includes('GMT+5'));
    await page.locator('#money-time summary').click();
    fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});
    await page.screenshot({path:path.join(root,'artifacts/guest-desktop.png'),fullPage:true});
    console.log('Photo results:',await page.locator('main img,.hero-photo').evaluateAll(imgs=>imgs.map(x=>({photo:x.dataset.photo||x.dataset.propertyPhoto,loaded:x.complete&&x.naturalWidth>0}))));
   }
   await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   if(slug==='cozy-nest')await page.screenshot({path:path.join(root,'artifacts/guest-mobile.png'),fullPage:true});
   await page.setViewportSize({width:320,height:740});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.setViewportSize({width:768,height:1024});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.setViewportSize({width:1280,height:1000});
  }
  await page.goto(base+'/index.html');await page.waitForLoadState('networkidle');assert.equal(await page.locator('.prop-card').count(),3);
  await page.goto(base+'/admin.html');await page.waitForLoadState('networkidle');
  await page.locator('#password').fill('wrong');await page.locator('#login-form button').click();await page.waitForFunction(()=>document.querySelector('#login-error').textContent.includes('Incorrect'));
  await page.locator('#password').fill(process.env.ADMIN_PASSWORD||'cozy-preview-only');await page.locator('#login-form button').click();
  await page.locator('[data-save="cozy-nest"]').waitFor({state:'attached'});await page.locator('.tab-btn[data-scope="cozy-nest"]').click();
  await page.locator('#cozy-nest-intro-title').fill('Cozy upload test');
  await page.locator('#cozy-nest-gallery-caption1').fill('Gallery upload check');
  await page.locator('#cozy-nest-guestInfo-laundry').fill('Ask reception for laundry assistance.');
  await page.locator('#cozy-nest-photos-gallery1-file').setInputFiles(path.join(root,'assets/images/cozy-nest-primary-logo.png'));
  await page.waitForFunction(()=>document.querySelector('#cozy-nest-photos-gallery1').value.startsWith('data:image/'));
  await page.locator('#cozy-nest-photos-hero-file').setInputFiles(path.join(root,'artifacts/guest-mobile.png'));
  await page.waitForFunction(()=>document.querySelector('#cozy-nest-photos-hero').value.startsWith('data:image/'));
  await page.locator('[data-save="cozy-nest"]').click();await page.waitForFunction(()=>document.querySelector('[data-status="cozy-nest"]').textContent.startsWith('Saved.'));
  await page.screenshot({path:path.join(root,'artifacts/admin-desktop.png'),fullPage:true});
  r=await context.request.get(base+'/api/content?scope=cozy-nest');let saved=await r.json();assert.equal(saved.data.intro.title,'Cozy upload test');assert.ok(saved.data.photos.hero.startsWith('data:image/webp;base64,'));
  await page.goto(base+'/cozy-nest.html');await page.waitForLoadState('networkidle');assert.equal(await page.locator('h1 [data-field="intro.title"]').textContent(),'Cozy upload test');assert.ok((await page.locator('.hero-photo').getAttribute('src')).startsWith('data:image/webp;base64,'));
  assert.equal(await page.locator('[data-field="gallery.caption1"]').textContent(),'Gallery upload check');
  assert.ok((await page.locator('[data-photo="gallery1"]').getAttribute('src')).startsWith('data:image/webp;base64,'));
  assert.equal(await page.locator('[data-field="guestInfo.laundry"]').textContent(),'Ask reception for laundry assistance.');
  r=await context.request.put(base+'/api/content',{data:{scope:'cozy-nest',data:{menuUrl:'javascript:alert(1)'}}});assert.equal(r.status(),400);
  r=await context.request.post(base+'/api/logout');assert.equal(r.status(),200);
  r=await context.request.put(base+'/api/content',{data:{scope:'cozy-nest',data:{}}});assert.equal(r.status(),401);
  assert.deepEqual(errors,[]);console.log('PASS: three hotel guides, desktop/mobile, disclosure navigation, menu keyboard controls, hub, authentication, upload, persistence, live overlay, URL validation, logout.');
 } finally {fs.writeFileSync(seed,original);await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

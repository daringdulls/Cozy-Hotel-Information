(function () {
  var cache = {}, dirty = new Set();
  var scopes = ['site', 'cozy-nest', 'cozy-roots', 'cozy-arts'];
  var titles = {site:'Our hotels page & contacts','cozy-nest':'Cozy Nest','cozy-roots':'Cozy Roots','cozy-arts':'Cozy Art'};
  var groups = {homepage:'Our hotels page — welcome text',reviews:'Guest review links',intro:'Welcome & about your hotel',hours:'Hotel hours',dining:'Restaurant',diving:'Diving',wifi:'Guest Wi-Fi',phones:'Contact numbers',notices:'Guest notices',explore:'Island highlights',photos:'Photo library',gallery:'Gallery title & captions',guestInfo:'Practical guest information',details:'More guest information'};
  function label(key) { return key.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/_/g,' ').replace(/\b\w/g,function (s) { return s.toUpperCase(); }); }
  function api(url, opts) { return fetch(url,Object.assign({credentials:'same-origin'},opts)).then(async function (r) { var body = await r.json(); if (!r.ok) throw new Error(body.error || 'Request failed. Try again.'); return body; }); }
  function el(tag, cls, text) { var node=document.createElement(tag); if(cls) node.className=cls; if(text!==undefined)node.textContent=text; return node; }
  function set(obj,path,value) { var keys=path.split('.'), leaf=keys.pop(); keys.forEach(function(k) { obj=obj[k]||(obj[k]={}); }); obj[leaf]=value; }
  function status(scope,message,error) { var node=document.querySelector('[data-status="'+scope+'"]'); if(node){node.textContent=message; node.className='status-msg '+(error?'err':'ok');} }
  function photoPreview(field,input,value) {
    var image=field.querySelector('img');
    if (!image) {image=el('img','admin-photo'); image.alt='Photo preview'; field.prepend(image);}
    image.src=value || ''; image.hidden=!value;
    image.onerror=function(){image.hidden=true;};input.value=value || '';
  }
  async function preparePhoto(file, limit) {
    limit = limit || 220000;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG or WebP photo.');
    if(file.size>20000000) throw new Error('Choose a photo smaller than 20 MB.');
    var bitmap=await createImageBitmap(file), scale=Math.min(1,1400/Math.max(bitmap.width,bitmap.height));
    var canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
    var quality=.85,result;
    do {result=canvas.toDataURL('image/webp',quality);quality-=.1;} while(result.length>limit && quality>.25);
    if(result.length>limit) {
      var small=document.createElement('canvas');small.width=Math.round(canvas.width*.7);small.height=Math.round(canvas.height*.7);small.getContext('2d').drawImage(canvas,0,0,small.width,small.height);result=small.toDataURL('image/webp',.65);
    }
    if(result.length>limit) throw new Error('This photo has too much detail. Choose a smaller image.');return result;
  }
  function makeField(scope,path,value) {
    var field=el('div','field'),id=scope+'-'+path.replaceAll('.','-');
    var fieldLabel=path.startsWith('details.') ? label(path.split('.')[1].replace(/_\d+$/, ''))+' — '+value.slice(0,65)+(value.length>65?'…':'') : label(path.split('.').pop());
    if(scope==='site'&&path.startsWith('photos.'))fieldLabel=({'photos.logo':'Our hotels page — header & footer logo','photos.hero':'Our hotels page — large hero image','photos.nestCard':'Cozy Nest card image','photos.rootsCard':'Cozy Roots card image','photos.artCard':'Cozy Art card image'})[path]||fieldLabel;
    if(path==='menuUrl')fieldLabel='Cozy Deck — public menu link';
    if(path==='roomServiceUrl')fieldLabel='Cozy Deck — room service ordering link';
    if(path==='reviews.googleUrl')fieldLabel='Google review link';
    if(path==='reviews.tripadvisorUrl')fieldLabel='Tripadvisor review link';
    var caption=el('label','',fieldLabel);caption.htmlFor=id;field.append(caption);
    var photo=path.startsWith('photos.'),long=path.startsWith('guestInfo.')||value.length>100 || /description|welcome|about|notices|details/.test(path);
    var input=el(long&&!photo?'textarea':'input');input.id=id;input.dataset.path=path;input.value=value;
    if(input.tagName==='TEXTAREA')input.rows=3;
    if(path.startsWith('reviews.')){input.placeholder='Paste the property review link (https://...)';}
    if(photo){input.type='text';input.placeholder='Paste an image URL or upload a photo';input.className='photo-url';}
    input.addEventListener('input',function(){dirty.add(scope);if(photo)photoPreview(field,input,input.value);});field.append(input);
    if(photo){
      photoPreview(field,input,value);
      var upload=el('input');upload.type='file';upload.accept='image/jpeg,image/png,image/webp';upload.id=id+'-file';upload.className='photo-file';
      var uploadLabel=el('label','upload-label','Choose photo');uploadLabel.htmlFor=upload.id;
      var note=el('p','photo-help',path.startsWith('photos.gallery')?'Optional gallery photo. Leave blank to use the corresponding hotel photo.':'JPG, PNG or WebP · automatically resized');
      upload.addEventListener('change',async function(){if(!upload.files[0])return;note.textContent='Preparing photo…';var save=document.querySelector('[data-save="'+scope+'"]');save.disabled=true;try{var data=await preparePhoto(upload.files[0],path.startsWith('photos.gallery')?150000:220000);photoPreview(field,input,data);dirty.add(scope);note.textContent='Photo ready. Save changes to publish it.';}catch(e){note.textContent=e.message;}finally{save.disabled=false;upload.value='';}});
      var reset=el('button','photo-reset',path.startsWith('photos.gallery')?'Use existing hotel photo':'Use default photo');reset.type='button';reset.addEventListener('click',function(){photoPreview(field,input,'');dirty.add(scope);note.textContent='Default photo will appear after saving.';});field.append(uploadLabel,upload,reset,note);
    }return field;
  }
  function render(scope,data){
    var panel=document.querySelector('[data-panel="'+scope+'"]');panel.replaceChildren();
    var heading=el('div','editor-title');heading.append(el('h2','',titles[scope]));
    if(scope!=='site'){var preview=el('a','btn btn-outline-dark btn-sm','Open guest guide ↗');preview.href=scope+'.html';preview.target='_blank';preview.rel='noopener';heading.append(preview);}panel.append(heading);
    if(scope==='site')panel.append(el('p','editor-intro','Edit the Our hotels landing page here. In Photo library, Logo controls the header and footer logo; Hero controls the large welcome photo. The three card image fields change the hotel pictures on this page only. Leave them blank to use each hotel’s About photo.'));
    if(scope==='site'){var reviewHelp=el('div','editor-group');reviewHelp.append(el('h2','','Google & Tripadvisor reviews'),el('p','editor-intro','Choose a property to edit its review links.'));['cozy-nest','cozy-roots','cozy-arts'].forEach(function(slug){var jump=el('button','btn btn-outline-dark btn-sm',titles[slug]+' reviews');jump.type='button';jump.addEventListener('click',function(){document.querySelector('[data-scope="'+slug+'"]').click();document.querySelector('[data-panel="'+slug+'"]').scrollIntoView({block:'start'});});reviewHelp.append(jump);});panel.append(reviewHelp);}
    if(scope!=='site')panel.append(el('p','editor-intro','Update your guest guide below. Save changes when you are ready for guests to see them.'));
    if(scope==='cozy-roots')panel.append(el('p','editor-intro','Meals are served at Cozy Deck Restaurant, shared with Cozy Nest. Edit its hours, menu link and dining photo in the Cozy Nest tab; both guides use those settings.'));
    var entries=Object.entries(data);
    if(scope!=='site'){entries=entries.filter(function(pair){return pair[0]!=='reviews';});entries.unshift(['reviews',Object.assign({googleUrl:'',tripadvisorUrl:''},data.reviews||{})]);}
    entries.forEach(function(pair){var key=pair[0],value=pair[1];if(['cozy-roots','cozy-arts'].includes(scope)&&['dining','menuUrl'].includes(key))return;if(typeof value==='string'){panel.append(makeField(scope,key,value));return;}
      var group=el('details','editor-group');group.open=key!=='details';group.append(el('summary','',groups[key]||label(key)));
      if(key==='phones')group.append(el('p','editor-intro',scope==='site'?'Shared phone and WhatsApp contacts used throughout the guides.':'These phone and WhatsApp numbers apply everywhere in this property guide. Leave blank to use shared contacts.'));
      if(key==='gallery')group.append(el('p','editor-intro','Captions 1–4 match gallery photos 1–4 from left to right. Update the caption when replacing its photo.'));
      if(key==='reviews')group.append(el('p','editor-intro','Paste the Google review and Tripadvisor links for this property. Each button appears on the guest guide after its link is saved. Leave a link blank to hide that option.'));
      if(key==='photos')group.append(el('p','editor-intro','Replace the sample images with your own property photos. Uploaded photos are saved with your hotel information.'));
      var grid=el('div',key==='photos'?'photo-grid':'editor-fields');Object.entries(value).forEach(function(entry){if(scope==='cozy-roots'&&((key==='photos'&&entry[0]==='dining')||(key==='details'&&(entry[0].startsWith('dining_')||entry[0]==='facilities_4'))))return;if(scope==='cozy-arts'&&((key==='photos'&&entry[0]==='dining')||(key==='details'&&(entry[0].startsWith('dining_')||['facilities_3','facilities_4'].includes(entry[0])))))return;if(typeof entry[1]==='string')grid.append(makeField(scope,key+'.'+entry[0],entry[1]));});group.append(grid);panel.append(group);
    });
    var row=el('div','save-row'),button=el('button','btn btn-primary','Save changes'),message=el('span','status-msg');button.dataset.save=scope;message.dataset.status=scope;message.setAttribute('role','status');
    button.addEventListener('click',async function(){var updated=JSON.parse(JSON.stringify(cache[scope]));panel.querySelectorAll('[data-path]').forEach(function(input){set(updated,input.dataset.path,input.value);});button.disabled=true;status(scope,'Saving…');try{await api('/api/content',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({scope:scope,data:updated})});cache[scope]=updated;dirty.delete(scope);status(scope,'Saved. Your guest guide is up to date.');}catch(e){status(scope,e.message,true);}finally{button.disabled=false;}});row.append(button,message);panel.append(row);
  }
  async function showApp(){
    document.getElementById('login-view').hidden=true;document.getElementById('app-view').hidden=false;
    await Promise.all(scopes.map(async function(scope){try{var result=await api('/api/content?scope='+scope);cache[scope]=result.data;render(scope,result.data);if(scope==='site'){var badge=document.getElementById('db-badge');badge.textContent=result.hasDatabase?'Database connected':(location.hostname==='localhost'||location.hostname==='127.0.0.1'?'Local file storage':'Database setup required');badge.className='db-badge '+(result.hasDatabase?'on':'off');}}catch(e){var panel=document.querySelector('[data-panel="'+scope+'"]');panel.replaceChildren(el('p','error-msg','Could not load '+titles[scope]+'. '+e.message));var retry=el('button','btn btn-outline-dark','Try again');retry.onclick=showApp;panel.append(retry);}}));
  }
  document.querySelectorAll('.tab-btn').forEach(function(button){button.addEventListener('click',function(){document.querySelectorAll('.tab-btn').forEach(function(b){b.classList.toggle('active',b===button);});document.querySelectorAll('.panel').forEach(function(p){p.classList.toggle('active',p.dataset.panel===button.dataset.scope);});});});
  document.getElementById('login-form').addEventListener('submit',async function(event){event.preventDefault();var error=document.getElementById('login-error'),button=event.target.querySelector('button');button.disabled=true;error.textContent='';try{await api('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:document.getElementById('password').value})});document.getElementById('password').value='';await showApp();}catch(e){error.textContent=e.message;}finally{button.disabled=false;}});
  document.getElementById('logout-btn').addEventListener('click',async function(){if(dirty.size&&!confirm('You have unsaved changes. Sign out anyway?'))return;try{await api('/api/logout',{method:'POST'});location.reload();}catch(e){document.getElementById('db-badge').textContent=e.message;}});
  window.addEventListener('beforeunload',function(e){if(dirty.size){e.preventDefault();e.returnValue='';}});
  api('/api/session').then(function(res){if(res.authenticated)showApp();}).catch(function(){document.getElementById('login-error').textContent='The editor cannot connect. Please refresh and try again.';});
})();

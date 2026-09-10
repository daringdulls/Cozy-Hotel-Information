const {test}=require('node:test');
const assert=require('node:assert/strict');
const {validateContent}=require('../lib/validateContent');
const {mergeContent}=require('../lib/db');
test('saved content survives new design defaults, including intentionally empty fields',()=>{
 assert.deepEqual(mergeContent({intro:{title:'New',about:'Default'},photos:{hero:'sample'}},{intro:{title:'Custom'},photos:{hero:''}}),{intro:{title:'Custom',about:'Default'},photos:{hero:''}});
});
test('reject unsafe links, SVG uploads, oversized data, and prototype keys',()=>{
 for(const data of [{menuUrl:'javascript:alert(1)'},{photos:{hero:'data:image/svg+xml;base64,PHN2Zz4='}},JSON.parse('{"__proto__":{"polluted":"yes"}}'),{intro:{title:'a'.repeat(12001)}},{photos:{hero:'data:image/webp;base64,'+'a'.repeat(420001)}}])assert.ok(validateContent(data));
 assert.equal(validateContent({intro:{title:'Cozy Nest'},photos:{hero:'data:image/webp;base64,UklGRg=='},menuUrl:'https://example.com/menu.pdf'}),null);
 assert.equal({}.polluted,undefined);
});
test('Neon array results are merged with current defaults',async()=>{
 const Module=require('node:module');const original=Module._load;const oldUrl=process.env.DATABASE_URL;
 const dbPath=require.resolve('../lib/db');delete require.cache[dbPath];
 process.env.DATABASE_URL='postgresql://test:test@localhost/test';
 Module._load=function(name,...args){if(name==='@neondatabase/serverless')return {neon:()=>async strings=>String(strings).includes('SELECT')?[{data:{intro:{title:'Saved hotel'}},updated_at:'2026-09-10'}]:[]};return original.call(this,name,...args);};
 try {const {getContent}=require('../lib/db');const result=await getContent('cozy-nest');assert.equal(result.data.intro.title,'Saved hotel');assert.ok(result.data.photos.hero);assert.equal(result.source,'database');}
 finally {Module._load=original;if(oldUrl===undefined)delete process.env.DATABASE_URL;else process.env.DATABASE_URL=oldUrl;delete require.cache[dbPath];}
});

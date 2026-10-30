import ts from 'typescript';import fs from 'node:fs';import assert from 'node:assert/strict';
const code=ts.transpile(fs.readFileSync('app/api/orcamento/route.ts','utf8'),{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext});const {POST}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
let calls=[];globalThis.fetch=async(url,options)=>{calls.push({url,options});return Response.json(url.includes('upload')?{url:'https://example.test/photo.jpg'}:{ok:true})};
function req(values={},file){let f=new FormData();for(const [k,v] of Object.entries({Nome:'Teste local',Email:'teste@example.test',Telefone:'31999999999',Ambiente:'Cozinhas',Mensagem:'Teste isolado sem envio externo.',...values}))f.set(k,v);if(file)f.set('anexos',file);return new Request('http://localhost/api/orcamento',{method:'POST',headers:{origin:'http://localhost'},body:f})}
assert.equal((await POST(req())).status,200);assert.equal(calls.length,1);assert.match(JSON.parse(calls[0].options.body).Mensagem,/Cozinhas/);calls=[];
assert.equal((await POST(req({Email:'inválido'}))).status,400);assert.equal(calls.length,0);
assert.equal((await POST(req({},new File(['fake'],'bad.exe',{type:'application/octet-stream'})))).status,400);
assert.equal((await POST(req({},new File(['test'],'foto.jpg',{type:'image/jpeg'})))).status,200);assert.equal(calls.length,2);assert.equal(JSON.parse(calls[1].options.body).fileUrls.length,1);
globalThis.fetch=async()=>new Response('',{status:500});assert.equal((await POST(req())).status,502);
console.log('5 cenários passaram: envio simulado, campos inválidos, tipo de arquivo, anexos e falha do serviço. Nenhuma mensagem real enviada.');

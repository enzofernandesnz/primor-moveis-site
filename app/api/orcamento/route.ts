export async function POST(request:Request){
 const fail=(error:string,status=400)=>Response.json({error},{status});
 try{
  if(request.headers.get('origin')!==new URL(request.url).origin)return fail('Origem inválida.',403);
  if(Number(request.headers.get('content-length'))>11*1024*1024)return fail('O limite total é de 10 MB.',413);
  const form=await request.formData();if(form.get('website'))return fail('Solicitação inválida.');
  const fields=Object.fromEntries(['Nome','Email','Telefone','Ambiente','Mensagem'].map(k=>[k,String(form.get(k)||'').trim()]));
  if(Object.values(fields).some(v=>!v)||fields.Nome.length>120||fields.Email.length>180||fields.Mensagem.length<10||fields.Mensagem.length>5000||!/^\S+@\S+\.\S+$/.test(fields.Email)||!/^\+?[\d() .-]{10,20}$/.test(fields.Telefone))return fail('Confira os dados obrigatórios do formulário.');
  const files=form.getAll('anexos').filter(f=>f instanceof File&&f.size>0) as File[];
  if(files.length>5||files.reduce((n,f)=>n+f.size,0)>10*1024*1024)return fail('Selecione até 5 arquivos e 10 MB no total.',413);
  if(files.some(f=>!['image/jpeg','image/png','image/webp','application/pdf'].includes(f.type)))return fail('Use arquivos JPG, PNG, WebP ou PDF.');
  const fileUrls:string[]=[];
  for(const file of files){const res=await fetch('https://primormoveis.com.br/api/upload?filename='+encodeURIComponent(file.name),{method:'POST',headers:{'Content-Type':file.type},body:file,signal:AbortSignal.timeout(30000)});if(!res.ok)return fail('Não foi possível enviar um dos anexos. Tente novamente ou use o WhatsApp.',502);const payload=await res.json() as {url?:string};if(!payload.url)return fail('O serviço de anexos não confirmou o recebimento.',502);fileUrls.push(payload.url)}
  const res=await fetch('https://primormoveis.com.br/api/send-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({Nome:fields.Nome,Email:fields.Email,Telefone:fields.Telefone,Mensagem:'Ambiente: '+fields.Ambiente+'\n\n'+fields.Mensagem,fileUrls}),signal:AbortSignal.timeout(30000)});
  if(!res.ok)return fail('O serviço de contato não confirmou o envio. Tente novamente ou converse pelo WhatsApp.',502);
  return Response.json({ok:true});
 }catch{return fail('Não foi possível concluir o envio. Confira sua conexão e tente novamente ou use o WhatsApp.',502)}
}

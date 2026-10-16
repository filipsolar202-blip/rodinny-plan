import {readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist/docs',{recursive:true});
for(const f of ['index.html','Fustat-OFL.txt','dotaznik.html'])await cp(f,'dist/'+f);
await cp('src','dist/src',{recursive:true});await cp('docs/METODIKA.md','dist/docs/METODIKA.md');await writeFile('dist/.nojekyll','');
const read=f=>readFile(f,'utf8');
const css=await read('src/style.css')+'\n'+await read('src/questionnaire.css')+'\n/*'+await read('Fustat-OFL.txt')+'*/';
const js=(await read('src/intake-contract.js')).replace(/^export /gm,'')+'\n'+(await read('src/questionnaire.js')).replace(/^import .*?;\n/gm,'');
const html=(await read('dotaznik.html')).replace(/<link[^>]+>/g,'').replace('</head>','<style>'+css+'</style></head>').replace(/<script[^>]+><\/script>/,'<script type="module">'+js.replace(/<\/script/gi,'<\\/script')+'</script>');
await writeFile('dist/dotaznik-samostatny.html',html);

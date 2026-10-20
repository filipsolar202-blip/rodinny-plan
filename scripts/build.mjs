import {readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist/docs',{recursive:true});
for(const f of ['index.html','Fustat-OFL.txt','dotaznik.html'])await cp(f,'dist/'+f);
await cp('src','dist/src',{recursive:true});await cp('docs/METODIKA.md','dist/docs/METODIKA.md');await writeFile('dist/.nojekyll','');
const read=f=>readFile(f,'utf8');
const css=await read('src/style.css')+'\n'+await read('src/questionnaire.css')+'\n/*'+await read('Fustat-OFL.txt')+'*/';
const js=(await read('src/brand-assets.js')).replace(/^export /gm,'')+'\n'+(await read('src/plan-data.js')).replace(/^export /gm,'')+'\n'+(await read('src/intake-contract.js')).replace(/^import .*?;\n/gm,'').replace(/^export /gm,'')+'\n'+(await read('src/questionnaire.js')).replace(/^import .*?;\n/gm,'');
const html=(await read('dotaznik.html')).replace(/<link[^>]+>/g,'').replace('</head>','<style>'+css+'</style></head>').replace(/<script[^>]+><\/script>/,'<script type="module">'+js.replace(/<\/script/gi,'<\\/script')+'</script>');
await writeFile('dist/dotaznik-samostatny.html',html);
// Version the complete module graph and report styles so browser/CDN caches cannot mix releases.
const {createHash}=await import('node:crypto');
const {readdir}=await import('node:fs/promises');
const sourceFiles=(await readdir('src')).filter(f=>/\.(js|css)$/.test(f)).sort();
const hash=createHash('sha256');for(const f of sourceFiles)hash.update(await read('src/'+f));
const version='assets/'+hash.digest('hex').slice(0,12);
await mkdir('dist/'+version,{recursive:true});await cp('src','dist/'+version+'/src',{recursive:true});
for(const f of ['index.html','dotaznik.html'])await writeFile('dist/'+f,(await read(f)).replaceAll('./src/','./'+version+'/src/'));
const appPath='dist/'+version+'/src/app.js';await writeFile(appPath,(await read(appPath)).replaceAll("'./src/","'./"+version+"/src/"));

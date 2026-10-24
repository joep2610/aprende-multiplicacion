const fs=require('fs'), vm=require('vm'), assert=require('assert');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const elements=new Map();
function element(){const classes=new Set();return {children:[],dataset:{},style:{},textContent:'',value:'',disabled:false,classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x)},setAttribute(){},appendChild(x){this.children.push(x)},add(x){this.children.push(x)},click(){if(!this.disabled)this.onclick?.()},set innerHTML(s){this.html=s;this.children=[]},get innerHTML(){return this.html||''}}}
for(const m of html.matchAll(/id="([^"]+)"/g)){assert(!elements.has(m[1]),'ID duplicado');elements.set(m[1],element())}
const context=vm.createContext({document:{body:element(),getElementById:id=>elements.get(id),createElement:element,querySelectorAll:s=>elements.get(s.split(' ')[0].slice(1)).children},window:{},localStorage:{getItem:()=>null,setItem(){}},Option:function(text,value){this.text=text;this.value=value},console});
vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],context);
const run=s=>vm.runInContext(s,context);
assert.equal(elements.get('equation').textContent,'6 × 4 = 24');
assert.equal((elements.get('groups').innerHTML.match(/⭐/g)||[]).length,24);
elements.get('chooseLearn').click();assert.equal(run('mode'),'learn');
elements.get('prevFactor').click();assert.equal(run('factor'),3);
elements.get('advanceFactor').click();assert.equal(run('factor'),4);
elements.get('choosePlay').click();assert.equal(run('deck.length'),12);
function answer(right){const expected=run('table*factor');const b=elements.get('answers').children.find(b=>(Number(b.textContent)===expected)===right);b.click()}
answer(false);assert.equal(run('mistakes'),1);assert.equal(run('stars'),0);assert(run('solved'));assert(elements.get('feedback').textContent.includes(String(run('table*factor'))));
elements.get('answers').children[0].click();assert.equal(run('mistakes'),1);
elements.get('nextQuestion').click();answer(true);assert.equal(run('stars'),1);
elements.get('tables').children[1].click();assert.equal(run('stars'),0);assert.equal(run('mistakes'),0);assert.equal(run('table'),2);
elements.set('again',element());
for(let i=0;i<12;i++){answer(true);elements.get('nextQuestion').click()}
assert.equal(run('stars'),12);assert(elements.get('finish').innerHTML.includes('Respuestas incorrectas: 0'));
elements.get('again').click();assert.equal(run('stars'),0);assert.equal(run('index'),0);
elements.get('homeButton').click();assert(elements.get('game').classList.contains('hidden'));
assert(fs.existsSync(__dirname+'/assets/isla-amy.png'));
console.log('OK: inicio, modos, 24 estrellas, multiplicadores, errores, aciertos, cambio de tabla, 12 preguntas y reinicio.');

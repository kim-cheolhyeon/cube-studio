const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
for(const [folder,variable] of [['beginner','beginnerCaseLibrary'],['f2l','f2lCaseLibrary'],['oll2','oll2CaseLibrary'],['pll2','pll2CaseLibrary'],['oll','ollCaseLibrary'],['pll','pllCaseLibrary']]){
 const source=path.join(root,'data',folder,'cases.json');
 const data=JSON.parse(fs.readFileSync(source,'utf8').replace(/^\uFEFF/,''));
 if(data.formatVersion!==3||!Array.isArray(data.cases))throw Error('Invalid case library: '+folder);
 fs.writeFileSync(path.join(root,'data',folder,'cases.bundle.js'),'const '+variable+' = '+JSON.stringify(data)+';\n','utf8');
 console.log('Updated '+folder+' bundle: '+data.cases.length+' cases');
}

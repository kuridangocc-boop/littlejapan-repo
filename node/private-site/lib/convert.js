const { exec }=require('child_process');
const fs=require('fs');
const path=require('path');

async function convertPPTXToHTML(sourcePath,destDir){
fs.mkdirSync(destDir,{recursive:true});
const tmpdir=destDir+'/_tmp'; fs.mkdirSync(tmpdir,{recursive:true});
const cmd=`libreoffice --headless --convert-to html "${sourcePath}" --outdir "${tmpdir}"`;
await new Promise((resolve,reject)=>{exec(cmd,{maxBuffer:1024*1024*50},(err,stdout,stderr)=> err?reject(stderr):resolve(stdout))});
const files=fs.readdirSync(tmpdir); const htmlFile=files.find(f=>f.toLowerCase().endsWith('.html'));
if(!htmlFile) throw new Error('Conversion failed');
fs.renameSync(path.join(tmpdir,htmlFile),path.join(destDir,'index.html'));
for(const f of files){if(f!==htmlFile) fs.renameSync(path.join(tmpdir,f),path.join(destDir,f));}
fs.rmdirSync(tmpdir,{recursive:true});
}

module.exports={convertPPTXToHTML};

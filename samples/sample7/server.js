process.env.UV_THREADPOOL_SIZE=1;
const fs = require('fs');
const crypto = require('crypto');

const d=Date.now();
fs.readFile('./server.js',()=>{console.log("1:",Date.now()-d)});
crypto.pbkdf2("a","b",100000,512,'sha512',()=>{console.log('pbkdf2',Date.now()-d)});
crypto.pbkdf2("a","b",100000,512,'sha512',()=>{console.log('pbkdf2',Date.now()-d)});
crypto.pbkdf2("a","b",100000,512,'sha512',()=>{console.log('pbkdf2',Date.now()-d)});
crypto.pbkdf2("a","b",100000,512,'sha512',()=>{console.log('pbkdf2',Date.now()-d)});
console.log("before event loop")
//fs.readFile('./index.js',()=>{console.log("2:",Date.now()-d)});
//setTimeout(()=>{console.log("timeout",Date.now()-d)},1000);

function delay(m){
    const t=Date.now();
    while(Date.now()-t<m*1000){}
}
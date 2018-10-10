
const cluster = require('cluster');

console.log(cluster.isMaster);

function delay(m){
    const t=Date.now();
    while(Date.now()-t<m*1000){}
}

setTimeout(()=>console.log('timeout!!'),0);
setImmediate(()=>console.log('setImmediate!!'));
delay(1);
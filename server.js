const express=require('express');    // to create server
const socketIO=require('socket.io');     // to create socket
const http=require('http');             
const os = require('os');               // os module to get os details
const osUtils = require('os-utils');
const nodeOsUtils = require('node-os-utils');
const checkDiskSpace = require('check-disk-space');     //disk module to get disk details
//const cors = require('cors');

const port=3000; 
var app=express(); 
let server = http.createServer(app);
//app.use(cors());
app.use(express.json());
var io=socketIO(server); 

//app.use(express.static(__dirname));

// app.get('/', function(req, res) {
//     res.send("<h1>Server Monitoring Tool</h1>");
// });

let userCount = 0;

// make connection with user from server side 
io.on('connection', async (socket)=>{ 
console.log('\nNew user connected');
++userCount; 

socket.emit('getPort', port);

socket.emit('getIpAddress', os.networkInterfaces()['Wi-Fi'][3].address);

server.bytesReceived = 0;
server.bytesSent = 0;
var units = ['B', 'kB', 'MB', 'GB'];
function simplifiedUnits(input) {
 var unit = units[0];
 var i = 0;
 while (input > 1024 && ++i) {
 unit = units[i];
 input /= 1024;
 }
 return Math.round(input) + ' ' + unit;
}
var time = process.hrtime();
var diff = process.hrtime(time)[0] + process.hrtime(time)[1] / 1000000000;
var bpsSent = Math.round(server.bytesSent / diff) || 0;
var bpsReceived = Math.round(server.bytesReceived / diff) || 0;

const bandwidth = {
    upTime : process.uptime(),
    bytesReceived : simplifiedUnits(server.bytesReceived),
    bpsReceived : simplifiedUnits(bpsReceived),
    bytesSent : simplifiedUnits(server.bytesSent),
    bpsSent : simplifiedUnits(bpsSent)
};

socket.emit('getBandwidth', bandwidth);
//console.log(io.sockets.adapter.rooms);

socket.emit('connectedHosts', userCount);

socket.on('ping', () => {
    socket.emit('pong');
});

// socket.on('avgPing', () => {
//     console.log('avgPing()');
//     socket.emit('avgPong');
// });

// osUtils.cpuUsage(function(v1){
//     osUtils.cpuFree(function(v2){
//         const cpuUsage = {
//             model: os.cpus()[0].model,
//             cores: osUtils.cpuCount(),
//             cpuUsagePerc : v1,
//             cpuFreePerc : v2,
//             totalMemory : osUtils.totalmem(),
//             freeMemory : osUtils.freemem(),
//             freeMemPerc : osUtils.freememPercentage()
//         };
    
//         socket.emit('getCpuUsage', cpuUsage);
//     })
    
// });

const cpuUsage = {
    model: os.cpus()[0].model,
    cores: osUtils.cpuCount(),
    cpuUsagePerc : await nodeOsUtils.cpu.usage(),
    cpuFreePerc : await nodeOsUtils.cpu.free()
};
socket.emit('getCpuUsage', cpuUsage);

const memoryUsage = await nodeOsUtils.mem.info();
socket.emit('getMemoryUsage', memoryUsage);

const diskUsage = await checkDiskSpace('C:');
const diskStats = {
    diskPath: diskUsage.diskPath,
    freeDisc: simplifiedUnits(diskUsage.free),
    totalDisc: simplifiedUnits(diskUsage.size)
}
socket.emit('getDiskUsage', diskStats);

// when server disconnects from user 
socket.on('disconnect', ()=>{ 
    console.log('\ndisconnected from user'); 
    --userCount;
}); 
}); 

server.listen(port, () => {
    console.log("\nListening on port 3000...");
});
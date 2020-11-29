const io = require('socket.io-client');

const socket = io.connect('http://localhost:3000');

//socket.emit('createMessage', "Message from client");

socket.on('connect', () => {
    console.log("\nConnected to server...");
});

socket.on('getPort', (data) => {
    console.log("\nPort : ",data);
});

socket.on('getIpAddress', (data) => {
    console.log("\nIP Address : ",data);
});

socket.on('getBandwidth', (data) => {
    console.log('\nBandwidth : ');
    console.log("\t Uptime : ", data.upTime);
    console.log('\t In: %s (%s/s)', data.bytesReceived, data.bpsReceived);
    console.log('\t Out: %s (%s/s)', data.bytesSent, data.bpsSent);
});

socket.on('connectedHosts', (data) => {
    console.log("\nTotal Clients connected : ", data);
})

let startTime;
setTimeout(function() {
    startTime = Date.now();
    socket.emit('ping');
  }, 4000);

socket.on('pong', () => {
    console.log("\nServer Latency : ", Date.now()-startTime , "ms");
})

socket.on('getCpuUsage', (data) => {
    console.log("\nCpu Stats : ",data);
});

socket.on('getMemoryUsage', (data) => {
    console.log("\nMemory Stats : ",data);
});

socket.on('getDiskUsage', (data) => {
    console.log("\nDisk Stats : ",data);
});

socket.on('disconnect', () => {
    console.log('\nDisconnected from server');

});
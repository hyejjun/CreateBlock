// npm install ws
const WebSocket = require('ws')
const wsPORT = process.env.WS_PORT || 7001

// 전역변수 
let sockets = []
function getSockets(){return sockets}
// 배열에 담긴 사람이 누군지 list 를 보기 위해서 만든 함수   


// 최초의 접속
function wsInit(){
    const server = new WebSocket.Server({port:wsPORT})
    /*
        server 내가 받은 소켓
        server.on('특정메시지',()=>{console.log('hu')})
        특정메시지가 떨어지면 콜백함수를 실행하겠다
        connetion 이 완료가 되었으면 뒤의 함수를 실행하겠다
    */
    server.on("connection",(ws)=>{
        console.log(ws);
        init(ws)
    })
}

function init(ws){
    sockets.push(ws)
}

function write(ws,message){
    we.send(JSON.stringify(message))
}

function broadcast(message){
    sockets.forEach(socket=>{
        write(socket,message)   //나 자신에게 메시지를 보내겠다
    })
}

function connectionToPeers(newPeers){
    newPeers.forEach(peer=>{
        // 접속만 하면 된다 - string type으로 주소값이 들어갈 것이다.
        // 주소값 : ws://localhost:7001 - 통신 규약이 달라서 http 가 아니라 ws 로 온다
        const ws = new WebSocket(peer)  // 얘는 도메인 주소까지 받아서 처리, 웹소켓 자체를 실행 아까 Server 까지 실행한거랑은 다르다.
        ws.on('open',()=>{init(ws)})       // 접속 한 뒤 한번 열어, 그게 완료가 되면 전역변수에다가 추가
        ws.on("error",()=>{console.log('connection failed');})               // error 가 나는 경우 처리
    })
}

module.exports={
    wsInit,
    getSockets,
    broadcast,
    connectionToPeers
}
//ws
const WebSocket = require('ws')

let sockets = []    // 접속한 사람들 중 특정 사람에게만 내용을 전달하고 싶어서 이렇게 따로 뺌

function wsInit() {
    const server = new WebSocket.Server({ port: 6005 })
    server.on("connection", (ws) => { 
        init(ws)
    })
}

function init(ws){
    sockets.push(ws)
    initMessageHandeler(ws)
    initErrorHandeler(ws)
}

function initErrorHandeler(ws){
    ws.on("close",()=>{CloseConnection(ws)})
    ws.on("error",()=>{CloseConnection(ws)})
}

function CloseConnection(ws){
    console.log(`Connection cloese ${ws.url}`);
    sockets.splice(sockets.indexOf(ws),1) 
}

const MessageAction = {
    QUERY_LAST : 0,
    QUERY_ALL : 1,
    RESPONSE_BLOCK : 2
}

function initMessageHandeler(ws){
    ws.on('message', (data)=>{      // message 관련 함수만 따로 관리
        const message = JSON.parse(data)

        switch(message.type){
            case MessageAction.QUERY_LAST:
                console.log(message.data);
                console.log("msg를 출력한다");
            break;
            case MessageAction.QUERY_ALL:
                console.log(message.data);
                console.log("data를 출력한다");
            break;

            case MessageAction.RESPONSE_BLOCK:
                handleBlockResponse()   // 코드 칠 양이 많아서 따로 뺐다.
            break;
        }
    })
}

wsInit()


function handleBlockResponse(){

}

module.exports = {
    wsInit,
}
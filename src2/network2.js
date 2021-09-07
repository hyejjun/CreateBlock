const WebSocket = require('ws')

const ws = new WebSocket('ws://localhost:6005')        //network 6005 번으로 접속해야함


ws.on('open',()=>{
    //type 0
    write(ws,queryBlockMsg())
    
    //type 1
    write(ws,queryAllMsg())
})
const MessageAction = {
    QUERY_LAST : 0,
    QUERY_ALL : 1,
    RESPONSE_BLOCK : 2
}
function queryBlockMsg(){
    return{
        type : MessageAction.QUERY_LAST,
        data : null,
    }
}
function queryAllMsg(){
    return{
        type : MessageAction.QUERY_ALL,
        data : null,
    }
}

function write(ws, message){
    ws.send(JSON.stringify(message))
}

ws.on('error',()=>{
    console.log('error 발생');
})

ws.on('message',(message)=>{
    console.log(`received : ${message}`);
})



// npm install ws
const WebSocket = require('ws')
const wsPORT = process.env.WS_PORT || 6005
const bc = require('./block0902')

// 전역변수 
let sockets = []
function getSockets() { return sockets }
// 배열에 담긴 사람이 누군지 list 를 보기 위해서 만든 함수   


//0906
const MessageAction = {
    QUERY_LAST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCK: 2,
}

// reducer를 만들겁니다
function initMessageHandeler(ws) {
    // 실행할 소켓쪽 - 서버쪽 내용을 보면 됨 - ws 를 주는곳은 init 부분
    ws.on("message", data => {      // data라는 변수는 on 이라는 애가 만들어준것이다.
        const message = JSON.parse(data)
        switch (message.type) {
            case MessageAction.QUERY_LAST:      // 마지막 블럭만 만들어서 보내줌
                write(ws,responseLastMsg())
                break;
            case MessageAction.QUERY_ALL:       // 전체 블럭을 만들어서 보내줌
                write(ws,responseBlockMsg())
                break;
            case MessageAction.RESPONSE_BLOCK:      // 이걸로 던져줌
                handleBlockResponse(message)
                break;
        }
    })
}

function queryAllMsg(){
    return {
        type : MessageAction.QUERY_ALL,
        data: null
    }
}

function queryBlockMsg(){
    return {
        type : MessageAction.QUERY_LAST,
        data: null
    }
}

function responseLastMsg(){
    return {
        type : MessageAction.RESPONSE_BLOCK,   // 응답을 block으로 해준다는.. type을 반대로 돌릴것이다.
        data : JSON.stringify([bc.getLastBlock()]) // 마지막 블럭을 어떻게 가져와야 할까?? block0902 에서 가져옴
    }
}

function responseBlockMsg(){
    return {
        type : MessageAction.RESPONSE_BLOCK, 
        data : JSON.stringify(bc.getBlocks())      // 리턴값이 배열로옴 - 블럭을 담고 있는 모든 거를 리턴
    }
}

function handleBlockResponse(message){
    const receivedBlocks = JSON.parse(message.data)     // 받은 블록 / message 에서 data라는 속성값만 필요함
    const lastBlockReceived = receivedBlocks[receivedBlocks.length-1] // 받은 블록의 마지막 블럭을 선택한다. 얘는 객체
    const lastBlockHeld =  bc.getLastBlock()        // 가지고 있는 블럭의 마지막

    if(lastBlockReceived.header.index > lastBlockHeld.header.index){
        console.log(
            "블럭의 갯수 \n" +
            `내가 받은 블록의 index 값 ${lastBlockReceived.header.index} \n` +
            `내가 가지고 있는 블록의 index 값 ${lastBlockHeld.header.index} \n`
        )
        // 연결점이 어느정도인가? - 내가 갖고 있는 헤더에서 SHA256으로 암호화한 값과 블럭의 이전해쉬값이 동일하다면?
        // 헤더만 갖고 SHA256 으로 한거 crateHash() 이 함수를 ..
        if(bc.createHash(lastBlockHeld) === lastBlockReceived.header.previousHash){
            // 같은 경우에는 마지막에 추가만 해주면 된다. addBlock 함수를 쓰면 된다.
            console.log(`마지막 하나만 비어있는 경우, 하나만 추가합니다.`)
            if(bc.addBlock(lastBlockReceived)){
                // 넣어주고. 다른 사람도 검증 할 수 있도록 보내줘야 한다.
                broadcast(responseLastMsg())
            }
        } else if (receivedBlocks.length === 1) {
            console.log(`peer 로 부터 블록을 연결해야 합니다.`)
            // 이때는 내가 갖고 있는 블럭 전체를 보내줘서 바꿔 끼울 수 있도록 한다.
            broadcast(queryAllMsg())
        } else {
            // 이미 여기 큰 if 문에 들어왔으면 수정을 해야 하는 상황 내거가 최신화가 안되어있다는.
            console.log(`블럭 최신화를 진행합니다`)
            // 여기서 부턴 블럭을 최신화하는 코드를 또 작성해야 한다.
            bc.replaceBlock(receivedBlocks)     // 전체 배열을 보낸다.
        }

    } else {
        console.log('블럭이 이미 최신화 되어 있습니다');
    }
}

function initErrorHandeler(ws){
    ws.on("close",()=>{closeConnection(ws)})       // 서버 종료
    ws.on("error",()=>{closeConnection(ws)})       
}

function closeConnection(ws){
    console.log(`Connection close ${ws.url}`)
    sockets.slice(sockets.indexOf(ws),1)    
}

// 최초의 접속
function wsInit() {
    const server = new WebSocket.Server({ port: wsPORT })       // server
    /*
        server 내가 받은 소켓
        server.on('특정메시지',()=>{console.log('hu')})
        특정메시지가 떨어지면 콜백함수를 실행하겠다
        connetion 이 완료가 되었으면 뒤의 함수를 실행하겠다
    */
    server.on("connection", (ws) => {
        console.log(ws);
        init(ws)    // 소켓 키 값
    })
}

function init(ws) {
    sockets.push(ws)
    initMessageHandeler(ws)
    initErrorHandeler(ws)
    //ws.send(JSON.stringify({type:MessageAction.QUERY_LAST,data:null}))
    write(ws, queryBlockMsg()) // 위에랑 똑같은 코드
}
// 내가 어디에 보낼건지에 대한 소켓 키 값, 내가 보낼 메시지값(객체)
function write(ws, message) {
    ws.send(JSON.stringify(message))
    // 내용을 보내는데 message 라고 받은 객체를 string 형태로 바꿔서 보낼 것
}
// ws 소켓 키값이 존재하지 않음... 내가 연결된 애들을 forEach 돌려서 ..? 내가 갖고 있는거를 나랑 연결된 모두에게 보낸다
function broadcast(message) {
    sockets.forEach(socket => {
        write(socket, message)   //나 자신에게 메시지를 보내겠다
    })
}

function connectionToPeers(newPeers) {
    newPeers.forEach(peer => {
        // 접속만 하면 된다 - string type으로 주소값이 들어갈 것이다.
        // 주소값 : ws://localhost:7001 - 통신 규약이 달라서 http 가 아니라 ws 로 온다
        const ws = new WebSocket(peer)  // 얘는 도메인 주소까지 받아서 처리, 웹소켓 자체를 실행 아까 Server 까지 실행한거랑은 다르다.
        ws.on('open', () => { init(ws) })       // 접속 한 뒤 한번 열어, 그게 완료가 되면 전역변수에다가 추가
        ws.on("error", () => { console.log('connection failed'); })               // error 가 나는 경우 처리
    })
}

module.exports = {
    wsInit,
    getSockets,
    broadcast,
    connectionToPeers,
    responseLastMsg
}
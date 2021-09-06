const express = require('express')
const app = express()
const port = process.env.PORT || 3001
const bodyParser = require('body-parser')
const bc = require('./block0902')
const ws = require('./network')

app.use(bodyParser.json())

app.get('/blocks',(req,res)=>{
    res.send(bc.getBlocks())
})

app.get('/version',(req,res)=>{
    res.send(bc.getVersion())
})

// 이 함수의 목적 : Blocks 배열에 우리가 만든 객체를 추가하는것
app.post('/mineBlock',(req,res)=>{
    const data = req.body.data      // 배열형태의 data를 받아오고
    const result = bc.mineBlock(data)   // 그러면 {} 또는 false 값이 반환될 것이다.
    if(result == null){
        //res.send(`mineBlock failed`)
        res.status(400).send(`블럭 추가에 오류가 발생됨`)
    }else{
        res.send(result)
    }
})

// peer -> 현재 가지고 있는 소켓리스트 getSockets   GET
app.get('/peers',(req,res)=>{
    res.send(ws.getSockets().map(socket=>{
        return `${socket._socket.remoteAddress} : ${socket._socket.remotePort}`;
    }))       // 배열을 return 받음 -> 다시 배열로 반환을 해줌
})

// addPeers -> 내가 보낼 주소값에 소켓을 생성하는 작업 connectToPeers   POST
// connectiontoPeers 를 받으려면 배열로 선언이 되어야함
// data 형식은 json 형태 
app.post('/addPeers',(req,res)=>{
    const peers = req.body.peers // || [] 이거까지 써주면 예외처리까지 하는거임
    ws.connectionToPeers(peers)
    res.send('success')
})


// 프로세스 종료하기
app.get('/stop',(req,res)=>{
    res.send('server stop')
    process.exit(0)
})


ws.wsInit()     // server 열리면 웹소켓 서버도 열리는것
app.listen(port,()=>{
    console.log(`server open ${port}`);
})
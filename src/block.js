const fs = require('fs')        // file system library 가져오고
const merkle = require('merkle')
const CryptoJs = require('crypto-js')
const SHA256 = require('crypto-js/sha256')


// const tree = merkle("sha256").sync(['aaaa'])
// tree.root() 

// 헤더 만들기
class BlockHeader {
    constructor(version, index, previousHash, time, merkleRoot) {
        this.version = version      //  1 new 생성자를 통해서 this.version 은 {version:1} 이렇게 된다
        this.index = index          // 2 {version:1, index : 2}
        this.previousHash = previousHash
        this.time = time
        this.merkleRoot = merkleRoot
    }
}

class Block {
    constructor(header, body) {
        this.header = header,       //BlockHeader 에서 만든값을 넣겠다. 객체 안에 객체가 들어가게 된다.
            this.body = body
    }
}

let Blocks = [createGenesisBlock()]

function getBlocks() {
    // 나중에 쓸거임 
    return Blocks
}


function getLastBlock() {
    return Blocks[Blocks.length - 1]    // 배열의 마지막 원소를 가져옴   
}

function getLastIndex() {
    let { index } = getLastBlock().header
    // console.log("이전 idx ====",index);
    return index
}

function getLastHash() {
    let { version, index, previousHash, time, merkleRoot } = getLastBlock().header
    let blockString = version + index + previousHash + time + merkleRoot
    let nextHash = SHA256(blockString).toString()
    return nextHash
}

function createGenesisBlock() {
    // 1. header 만들기 - 5개의 인자값을 만들어야 한다.
    const version = getVersion()    // 1.0.0
    const index = 0                 // 제네시스는 0 으로
    const time = getCurrentTime()   // 함수로 만들어 놓은것 가져옴
    const previousHash = '0'.repeat(64)    // 이전 해쉬값 근데 제네시스는 이전이 없다 sha256으로 넣어줘야하는데 만들 데이터가 없다.. -0을 64번 넣어줘야 한다

    const body = ['hello block']
    const tree = merkle('sha256').sync(body)              // merleRoot 는 body 에 있는 내용이 필요하다. - 그래서 body 먼저 선언해줌
    const root = tree.root() || '0'.repeat(64)            // 만약 body 내용이 없다면 0 을 64 번

    const header = new BlockHeader(version, index, previousHash, time, root)
    return new Block(header, body)
}
// const block = createGenesisBlock()

function addBlock() {
    // 우선 class 사용 new header -> new block (header, body) 를 해야겠군
    const version = getVersion()
    const index = getLastIndex() + 1
    const time = getCurrentTime()
    const previousHash = getLastHash()

    const body = ['next block']
    const tree = merkle('sha256').sync(body)
    const root = tree.root() || '0'.repeat(64)

    const header = new BlockHeader(version, index, previousHash, time, root)
    Blocks.push(new Block(header, body))
}
addBlock()      // 이게 계속 추가 되는..
addBlock()

function getVersion() {
    const { version } = JSON.parse(fs.readFileSync("../package.json"))
    return version
}

function getCurrentTime() {
    return Math.ceil(new Date().getTime() / 1000)
}

console.log(Blocks);


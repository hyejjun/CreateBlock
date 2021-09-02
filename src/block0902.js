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



function createGenesisBlock() {
    const version = getVersion()    
    const index = 0                 
    const time = getCurrentTime()  
    const previousHash = '0'.repeat(64)   

    const body = ['hello block']
    const tree = merkle('sha256').sync(body)             
    const root = tree.root() || '0'.repeat(64)            

    const header = new BlockHeader(version, index, previousHash, time, root)
    return new Block(header, body)
}

// 다음 블럭의 header 와 body를 만들어주는 함수
function nextBlock(data){
    // header
    const prevBlock = getLastBlock()    // 맨 마지막 블럭의 정보를 가져옴
    const version = getVersion()
    const index = prevBlock.header.index+1
    const previousHash = createHash(prevBlock)
    const time = getCurrentTime()

    const merkleTree = merkle("sha256").sync(data)
    const merkleRoot = merkleTree.root() || '0'.repeat(64)

    const header = new BlockHeader(version, index, previousHash, time, merkleRoot)
    return new Block(header, data)
}

function createHash(block){
    const {
        version,
        index,
        previousHash,
        time,
        merkleRoot
    } = block.header 
    const blockString = version + index + previousHash + time + merkleRoot
    const Hash = CryptoJs.SHA256(blockString).toString()
    return Hash
}

// Blocks 에 push 하는 녀석
// 다음 블럭을 생성할 형태는 다른 곳에 만들거임
function addBlock(data) {
    const newBlock = nextBlock(data)
    if(isVaildNewBlock(newBlock, getLastBlock())){
        Blocks.push(newBlock)
        return true;    // 함수를 여기서 끝나게 하고
    } return false;     // 함수를 종료시켜라
    
}

addBlock(['hello1'])
addBlock(['hello2'])
addBlock(['hello3'])

/* etc */

function isVaildNewBlock(currentBlock, previousBlock){
    isVaildType(currentBlock)
    return true
}

function isVaildType(block){
    console.log(typeof(block.header.version))           // string
    console.log(typeof(block.header.index))             // number
    console.log(typeof(block.header.previousHash))      // string
    console.log(typeof(block.header.time))              // number
    console.log(typeof(block.header.merkleRoot))        // string
    console.log('-----------------------');

}


function getVersion() {
    const { version } = JSON.parse(fs.readFileSync("../package.json"))
    return version
}

function getCurrentTime() {
    return Math.ceil(new Date().getTime() / 1000)
}

//console.log(Blocks);


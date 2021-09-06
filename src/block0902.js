const fs = require('fs')        // file system library 가져오고
const merkle = require('merkle')
const CryptoJs = require('crypto-js')
const SHA256 = require('crypto-js/sha256')
const random = require('random')


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
    return Blocks   // 배열로 리턴됨
}


function getLastBlock() {
    return Blocks[Blocks.length - 1]    // 배열의 마지막 원소를 가져옴   
}



function createGenesisBlock() {
    const version = "1.0.0"
    const index = 0
    const time = 1630907567
    const previousHash = '0'.repeat(64)

    const body = ['hello block']
    const tree = merkle('sha256').sync(body)
    const root = tree.root() || '0'.repeat(64)

    const header = new BlockHeader(version, index, previousHash, time, root)
    return new Block(header, body)
}

// 다음 블럭의 header 와 body를 만들어주는 함수
function nextBlock(data) {
    // header
    const prevBlock = getLastBlock()    // 맨 마지막 블럭의 정보를 가져옴
    const version = getVersion()
    const index = prevBlock.header.index + 1
    const previousHash = createHash(prevBlock)
    const time = getCurrentTime()

    const merkleTree = merkle("sha256").sync(data)
    const merkleRoot = merkleTree.root() || '0'.repeat(64)

    const header = new BlockHeader(version, index, previousHash, time, merkleRoot)
    return new Block(header, data)
}

function createHash(block) {
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

// Blocks 에 push 하는 녀석 - 여기서 검증함
// 다음 블럭을 생성할 형태는 다른 곳에 만들거임
function addBlock(newBlock) {
    // 앞으로 추가할 데이터를 검증하는 곳
    if (isVaildNewBlock(newBlock, getLastBlock())) {
        Blocks.push(newBlock)
        return true;    // 검증 성공
    } return false;     // 함수를 종료시켜라

}

function mineBlock(blockData){
    const newBlock = nextBlock(blockData)        //새로운 객체를 가진, Object Block {header, body}
    // 블럭을 만들려면 전역배열에다 넣어줘야함. 검증은 addBlock 이 대신해줄것
    // addBlock 도 매개변수 받는걸로 nextBlock을 쓴다.
    // 그래서 addBlock 은 newBlock을 받아서 하는거로 바꿔준다
    if(addBlock(newBlock)){
        // 모든 peer 에게 블록이 추가 되었으니 마지막거를 확인하라고 broadcast로 날려줘야 한다
        const nw = require('./network')
        nw.broadcast(nw.responseLastMsg())
        return newBlock
    }else{
        return null
    }
}

/* etc */

function isVaildNewBlock(currentBlock, previousBlock) {
    // currentBlock 에 대한 header, body, DataType 을 확인
    if (!isVaildType(currentBlock)) {
        console.log(`invaild block structure ${JSON.stringify(currentBlock)}`);
        return false    // 이 조건이 걸리면 함수 종료 - 그래서 else if 안쓰고 if 문으로 쭉 쭉 써도 된다.
    }

    // index 값이 유효한지 체크한다. - 만들 블럭에서 -1을 하면 이전 블럭 index 와 같아야함
    // 이전 블럭에서 +1 을 하면 만들 블럭 index 랑 같아야 함
    if (previousBlock.header.index + 1 !== currentBlock.header.index) {
        console.log(`invaild index`);
        return false
    }

    // previousHash 체크
    if (createHash(previousBlock) !== currentBlock.header.previousHash) {
        console.log(`invalid previousBlock`);
        return false
    }

    // Body Check - body 가 비어있는 경우
    if (currentBlock.body.length === 0) {
        console.log(`invalid body`);
        return false
    }
    // merkel root 가 같지 않은 경우
    if (merkle("sha256").sync(currentBlock.body).root() !== currentBlock.header.merkleRoot) {
        console.log(`invalid merkelRoot`);
        return false
    }

    return true
}

function isVaildType(block) {
    return (
        typeof (block.header.version) === "string" &&           // string
        typeof (block.header.index) === "number" &&            // number
        typeof (block.header.previousHash) === "string" &&     // string
        typeof (block.header.time) === "number" &&             // number
        typeof (block.header.merkleRoot) === "string" &&       // string
        typeof (block.body) === "object"                    // object
    )
}

function replaceBlock(newBlocks) {
    /*
        1. newBlocks 내용을 검증해야 한다. - 가져다 쓰면 된다. isVaildBlock
        2. 검증을 한번만 하지 않는다. 렌덤하게 한번만 할 수 있고, 두번 혹은 세번을 할 수 있게 한다.
        3. 검증이 끝나면 Blocks = newBlocks 로 바꿔주고
        4. 그 다음에 여기서 broadcast 한다.
    */
    // 이걸 하는 이유 : 내가 받은 블럭이 더 최신이라서
    // 이중으로 체크해준다 내가 받은 블럭이 더 길이가 긴지 (더 최신인지)
    if (isVaildBlock(newBlocks) && newBlocks.length > Blocks.length && random.boolean()) {
        // 여기가 3번
        console.log(`Blocks 배열을 newBlocks 로 교체합니다`)
        // 여기가 4번
        // block.js 에서 broadcast 사용할 수 있나? - 사용가능!
        // network.js 에서 broadcast를 모듈화 했냐는것? - 했음..
        const nw = require('./network')
        Blocks = newBlocks
        nw.broadcast(nw.responseLastMsg())
    } else {
        console.log(`메시지로부터 받은 블록배열이 맞지 않습니다`)
        // 여기까지 1, 2번을 한것.
    }
}

function getVersion() {
    const { version } = JSON.parse(fs.readFileSync("../package.json"))
    return version
}

function getCurrentTime() {
    return Math.ceil(new Date().getTime() / 1000)
}




/* 전체 배열 검증 */
function isVaildBlock(Blocks) {
    // 제네시스 블럭이 유효한지?
    if (JSON.stringify(Blocks[0]) !== JSON.stringify(createGenesisBlock())) {
        console.log(`GenensisBlock error`)
        return false
    }

    // Blocks 총 3개 있는데
    // 1부터 3까지 반복 - 총 두번이 도는 for 문 - 첫번째는 검사하지 않기 위해 i=1 부터
    let tempBlocks = [Blocks[0]]
    for (let i = 1; i < Blocks.length; i++) {
        if (isVaildNewBlock(Blocks[i], tempBlocks[i - 1])) {
            tempBlocks.push(Blocks[i])
        } else {
            return false
        }
    }
    return true
}

// console.log(Blocks);


module.exports = {
    getBlocks,
    getLastBlock,
    addBlock,
    getVersion,
    mineBlock,
    createHash,
    replaceBlock
}

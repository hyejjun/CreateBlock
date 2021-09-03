const fs = require('fs')
const merkle = require('merkle')
const CryptoJs = require('crypto-js')

class BlockHeader {
    constructor(version, index, previousHash, time, merkelRoot) {
        this.version = version
        this.index = index
        this.previousHash = previousHash
        this.time = time
        this.merkelRoot = merkelRoot
    }
}

class Block {
    constructor(header, body) {
        this.header = header,
            this.body = body
    }
}


function getLastBlock() {
    return Blocks[Blocks.length - 1]
}

let Blocks = [createGenesisBlock()]

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

function addBlock(data) {
    const newBlock = nextBlock(data)
    if (isVaildNewBlock(newBlock, getLastBlock())) {
        Blocks.push(newBlock)
        return true;    // 함수를 여기서 끝나게 하고
    } return false;     // 함수를 종료시켜라

}

addBlock(['hello1'])
addBlock(['hello2'])
addBlock(['hello3'])

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


function isVaildBlock(Blocks){
    if (JSON.stringify(Blocks[0]) !== JSON.stringify(createGenesisBlock())) {
        console.log(`GenensisBlock error`)
        return false
    }


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


function getVersion() {
    const { version } = JSON.parse(fs.readFileSync("../package.json"))
    return version
}

function getCurrentTime() {
    return Math.ceil(new Date().getTime() / 1000)
}




console.log(Blocks);
const fs = require('fs')
const ecdsa = require('elliptic')
const ec = ecdsa.ec("secp256k1")

const privateKeyLocation = "wallet/"+(process.env.PRIVATE_KEY || "default")
const privateFile = `${privateKeyLocation}/private_key`

// key 생성하는 함수
function generatorPrivateKey() {
    const KeyPair = ec.genKeyPair()
    const privateKey = KeyPair.getPrivate()
    return privateKey.toString(16).toUpperCase()
}

// console.log(generatorPrivateKey());

function initWallet() {
    if (!fs.existsSync("wallet/")) {     // 값이 true 여야 if 문이 실행되니까 앞에 ! 붙여줌
        fs.mkdirSync("wallet/")     // 폴더를 생성해준다.
    }

    if(!fs.existsSync(privateKeyLocation)){
        fs.mkdirSync(privateKeyLocation)
    }

    // 파일이 있는가 없는가를 체크해봐야함
    if(!fs.existsSync(privateFile)){
        // 디렉토리를 만드는게 아니라서 mkdirSync 가 필요없음
        console.log(`주소값 키값을 생성중입니다...`);
        const newPrivateKey = generatorPrivateKey()     //key 를 생성해서 변수에 담음
        
        // 파일 생성
        fs.writeFileSync(privateFile,newPrivateKey)
        // 첫번째 인자값은 경로+파일명, 두번째 인자값은 파일 내용들

        console.log(`개인 키 생성이 완료되었습니다`);
    }    
}
initWallet()

// 저 파일을 읽어서 출력하는 함수
function getPrivateFromWallet(){
    // 파일을 읽어서 가져와서 buffer 에 넣을거임
    const buffer = fs.readFileSync(privateFile)
    // 첫번째 인자값은 경로+파일명
    //console.log(buffer.toString());    // 알 수 없는 Buffer ~ 형태로 가져옴
    return buffer.toString()
}

function getPublicFromWallet(){
    const privateKey = getPrivateFromWallet()   // 일단 비밀키를 가져오고
    const key = ec.keyFromPrivate(privateKey,"hex")
    return key.getPublic().encode("hex") 
}

module.exports = {
    initWallet,
    getPublicFromWallet,
}
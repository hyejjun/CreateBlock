/*
npm install merkletreejs
npm install crypto-js
npm install merkle
*/

const {MerkleTree} = require('merkletreejs')
const SHA256 = require('crypto-js/sha256')


// 얘네를 담아서 암호화 시킬거다.
const testSet = ['a','b','c'].map(v=>SHA256(v))
const tree = new MerkleTree(testSet,SHA256)       // class 라서 new 써줌 (객체로 만들어줌) |  배열, 암호화할 내용들

const root = tree.getRoot()

const testRoot = 'a'    // a 가 root 인지 알아보기 위해서 비교해보자
const leaf = SHA256(testRoot)       // a 를 SHA256 한 값
const proof = tree.getProof(leaf)   // tree 안에서 이 값이 있는지 없는지 찾아준다
console.log(tree.verify(proof, leaf, root));      // root 랑 비교했는데 이게 같으냐   

//console.log(tree.toString());
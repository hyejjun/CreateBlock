const CryptoJs = require('crypto-js')


let a = "0000helloworld!"

// 첫글자 4개가 0000 이 맞냐? - 어떻게 검증해야 할까?
// js string 관련 문법중에 startsWith 이 있음

console.log(a.startsWith("0000"));      // true 가 나온다.
console.log(a.startsWith("0001"));      // false 가 나온다.

/*
    Hash -> SHA256 을 쓸거임
    helloworld 를 암호화 할거임
*/

console.log(CryptoJs.SHA256(a).toString().toUpperCase());   // 소문자에서 대문자까지 바꿔줌

// HASH 값 기준으로 돌릴거임.. 저 반복문

// 내가 첫글자가 0이 4개가 되었을 때 블럭을 생성할 수 있도록 작업할것이다.

/*
1. 현재 hash 값의 결과물은 몇진수일까?? 16진수이다.
2. 16진수와 2진수는 밀접한 관계 (변환이 쉬움)

내 결과물 -> SHA256 으로 변환 (16진수) -> 2진수로 변경할 것이다.
첫글자 16진수 1일때 2진수가 무엇이냐? 이런식으로 16개의 case 를 구해서
SHA256의 hash 값을 2진수로 바꾸는 작업을 할 것이다.
0~F (16진수) -> 2진수 0000 0001 0010 0100 0101 0110 0111 1000 1001 1010 1011 1100 1101 1111 ... 


a의 hash 값은
1314042ECF8C8A7702AABA1C82D560B5A262FF3E922BB117FA81F2B002FC37B9
0001 0100 
이런식으로 가게 됨
첫글자 2진수로 만들었을 때, 2개가 0이다 하면 0과 1
1개가 0이다 하면, 0~7까지

*/

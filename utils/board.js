export default function createBasicBoard() {
let board = [];
    for (let row = 0; row < 10; row++) {
      let col = []
        for (let j = 0; j < 10; j++) {
        col.push('0')
        }
        board.push(col)
  }
  return board;
}
console.log(JSON.stringify(createBasicBoard()).replaceAll(",[", ",\n["));


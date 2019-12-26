
var totalSeconds = 0; //시간 잴 때 도저히 global 아니고서야는 어떻게 바꿀지 감이 오지 않았습니다..ㅠㅠ
//얘를 global로 안해주면 clearInterval에서 계속 오류가 나서,,,restart해도 시간이 refresh되지않는 문제점 ㅠ

const init = () =>{
    createBoard();
    mineNumConstraint();
    plantMines();
    countNeighborMines();
    document.getElementById("mineRemaining").innerHTML= getMines();
    document.addEventListener('click', leftClick);
    document.addEventListener('submit', onChangeForm);
    document.addEventListener('reset',onReset);
    document.addEventListener('contextmenu',rightClick);
    document.getElementById("minutes").innerHTML='00';
    document.getElementById("seconds").innerHTML='00';
    setInterval(setTime, 1000);
    
}

const restart=()=>{
    createBoard();
    mineNumConstraint();
    plantMines();
    countNeighborMines();
    document.getElementById("mineRemaining").innerHTML= getMines();
    document.addEventListener('click', leftClick);
    document.addEventListener('submit', onChangeForm);
    document.addEventListener('reset',onReset);
    document.addEventListener('contextmenu',rightClick);
    totalSeconds=0;
    document.getElementById("minutes").innerHTML='00';
    document.getElementById("seconds").innerHTML='00';
    clearInterval();
}

const onReset=(evt)=>{
    evt.preventDefault()
    restart();
}
const onChangeForm=(evt)=> {
    evt.preventDefault()
    restart();
}

const setTime=()=>{
    ++totalSeconds;
    document.getElementById("seconds").innerHTML = pad(totalSeconds % 60);
    document.getElementById("minutes").innerHTML = pad(parseInt(totalSeconds / 60));
}

function pad(val) {
    var valString = val + "";
    if (valString.length < 2) {
      return "0" + valString;
    } else {
      return valString;
    }
}




//Form에서 사용자 input: row, column, #of mines 받아오기 
const getRows =()=>{
    return document.querySelector('#rows-input').value;
}

const getColumns=()=>{
    return document.querySelector('#columns-input').value;
}  

const getMines =() =>{
    return document.querySelector('#mines-input').value;
}


//사용자 input 받아올때마다 지뢰의 최대 개수 제한 걸어주기
const mineNumConstraint=()=>{
    const numMines= document.querySelector('#mines-input');
    numMines.addEventListener('change',(event) => {
        numMines.value=Math.min(numMines.value, getRows() * getColumns());
    });    
}

//시용자 input 값 토대로 board 만들어주기
const createBoard = () => {
    const gameBoard= document.querySelector('#game-board');
    gameBoard.innerHTML = "";

    for (let r = 0; r < getRows(); r++) {
        const rows = document.createElement('div');
        rows.className = 'row';
        for (let c= 0; c< getColumns(); c++) {
            const cells = document.createElement('div');
            cells.className = 'cell';
            cells.id = 'cell' + String(r) + String(c);
            rows.appendChild(cells);
        }
        gameBoard.appendChild(rows);
    }
    
}

// cell을 random하게 불러와서 지뢰를 assign 해주는 부분
const plantMines=() =>{
    const totalMines = getMines();
    var arr = [];
    let i = 0;
    while (i < totalMines) {
        const rdnum = Math.floor(Math.random() * getRows() * getColumns()) + 0
        if (arr.includes(rdnum)) continue
        else arr.push(rdnum)
        i += 1;
    }
    //console.log(arr)
    document.querySelectorAll('.cell').forEach((c, i) => {
        if ( arr.includes(i) ) {
            c.dataset.mine = true;
            //c.style.background= "black";
        }

    })   
}

const getCell=(id)=> {
    return document.getElementById(id)
}
// input cell과 인접한 cell들의 id를 갖고와서 array 형태로 반환
const getNeighbors =(r, c) => {
    
    const result = [];
   
    if (r > 0) result.push(`cell${r - 1}${c}`);
    if (r < getRows() - 1) result.push(`cell${r + 1}${c}`);
    if (c > 0) result.push(`cell${r}${c - 1}`);
    if (c < getColumns() - 1) result.push(`cell${r}${c+1}`);

    if (r > 0 && c > 0) result.push(`cell${r - 1}${c - 1}`);
    if (r > 0 && c < getColumns() - 1) result.push(`cell${r - 1}${c+ 1}`);
    if (r < getRows() - 1 && c < getColumns() - 1) result.push(`cell${r + 1}${c + 1}`);
    if (r < getRows() - 1 && c > 0) result.push(`cell${r + 1}${c - 1}`);
    return result;
}

//주위에 있는 지뢰의 개수를 세고 표시해주는 함수 
const countNeighborMines=()=>{

    for (let r = 0; r < getRows(); r++) {
      for (let c = 0; c < getColumns(); c++) {
        const cells = getCell('cell' + r + c);
        if (cells.dataset.mine) continue;
        const mines = getNeighbors(r, c).map(getCell).filter(edge => edge.dataset.mine).length;
        cells.dataset.number = mines;
        if (mines === 0) { continue; }
      }
    }
}

//덩어리로 지뢰가 없는 부분을 open하는 method
const open=(id)=>{
    const idList = [id];
    if (getCell(id).dataset.number!=='0') {
        openMarker(id);
        return;
    }
    if (getCell(id).dataset.number==='0'){
        while (idList.length) {
            const curr = idList.pop();
            openMarker(curr);
            if (getCell(curr).dataset.number !== '0' ) continue;
            idList.push(...getNeighbors(...curr.substring(4).split('').map(Number)) //cell[id][id]에서 cell지우기
            .filter(id => !getCell(id).dataset.opened));
        }
    }
}
const openMarker=(id) => {
    const cells = getCell(id);
    cells.dataset.opened = true;
    cells.classList.add('opened');
    if (cells.dataset.number!=='0') {
        cells.textContent = String(cells.dataset.number); 
    }
       
}
//지뢰가 아닌 부분이 open이 끝나면 이기는 것을 불러주기 위한 함수 
const openFinished=() => {
    return [].filter.call(document.querySelectorAll('.cell:not([data-opened])'),cell => !cell.getAttribute('data-mine')).length === 0
}

//깃발달기 함수
const addFlag=(id)=>{
    const curr = getCell(id)
    var remaining= document.getElementById("mineRemaining").innerHTML;
    if (curr.dataset.opened) {
      return
    }
    curr.classList.toggle('flagged')
    if(curr.dataset.flag) {
        curr.removeAttribute('data-flag')
        ++remaining;
    } 
    else{
        curr.dataset.flag = true;
        --remaining;
    }
    document.getElementById("mineRemaining").innerHTML= remaining;
}

////클릭관련 함수들/////
const leftClick =(event) =>{
    var source = event.target;
    id=source.id;    
    const curr = getCell(id);
    if (!source.className.includes('cell')) { //cell 이 아닌 거를 눌렀을때 error 방지용.
        return
    }
    if (curr.dataset.mine) {
        lose(id);
        return
    }
    if (curr.dataset.flag || curr.dataset.opened) {
      return
    }

    open(id);
    if (!openFinished()) {
      return;
    }
    win();
}
const rightClick=(event)=>{
    var source = event.target;
    id=source.id; 
    addFlag(id);
}

//win, lose 함수들

const win=()=> {
    alert("이기셨어요~ ");
    restart();
}
const lose=(id)=>{
    getCell(id).classList.add('active-mine')
    alert("지뢰 밟음! Game Over!");
    restart();
}




init(); 

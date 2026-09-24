import {useRef, useState} from 'react';
import "./tiles.css"

type coordinate = [number, number];
function Square({ value, offsets, onSquareClick } : {value : number, offsets: coordinate, onSquareClick : any}) {
    return (
        <>
            <button
                className={"square"}
                onClick={onSquareClick}
                style={{
                    transform: `translate(${offsets[0]}px, ${offsets[1]}px)`,
                }}
            >
                <span>{value}</span>
            </button>
        </>
    )
}

function estimate(array: Array<number>) {
    let res = 0;
    for (let i = 0; i < array.length; i++) {
        if (array[i] === 16) {
            continue;
        }
        let goalX = array[i] % 4;
        let goalY = Math.trunc(array[i] / 4);
        let curX = (i+1) % 4;
        let curY = Math.trunc((i+1) / 4);
        res += Math.abs(goalX - curX) + Math.abs(goalY - curY);
    }
    return res;
}
// https://www.sciencedirect.com/science/article/pii/0004370285900840
// IDA star
// g: cost so far to reach a node
// h: estimated cost to reach goal state
// Manhattan distance heuristic: grid unit between current tile position and goal position
// 1 index, empty slot at 16
function solve(array : Array<number>, emptySlot : number) {
    const startPoint = array.slice();
    startPoint.push(16);
    [startPoint[emptySlot-1], startPoint[15]] = [startPoint[15], startPoint[emptySlot-1]];
    const goalPoint = Array(16).fill(0).map<number>((_, i) => {return i+1;})
    let k = 0;
    let moves = Array<number>();
    let threshold = estimate(startPoint);
    while(k<17) {
        k++;
        console.log(k, threshold);
        const excess = DFS(startPoint, moves, threshold, 0, emptySlot, 0, goalPoint, Number.POSITIVE_INFINITY)!;
        if (excess !== Number.POSITIVE_INFINITY) {
            threshold += excess;
        }
        if (excess === -1) {
            console.log(moves);
            return moves;
        }
    }
}

function DFS(array : Array<number>, moves : Array<number>, threshold: number, g: number, es: number, it: number, goal : Array<number>, excess : number): number {
    let furtherCost = estimate(array);
    if (furtherCost === 0) {
        // goal state
        return -1;
    }
    let newCost = g + furtherCost;
    if (newCost > threshold) {
        excess = Math.min(excess, newCost - threshold);
        return excess;
    }

    // right: 0, left: 1, down: 2, up : 3
    let options = [];
    if (es % 4 === 0) {
        options = [es-1, -1, es-4,es+4];
    } else if (es % 4 === 1) {
        options = [-1, es+1,es-4,es+4];
    } else {
        options = [es-1, es+1,es-4,es+4];
    }

    if (moves[moves.length - 1] === 0) { // moved right
        options[1] = -1;
    } else if (moves[moves.length - 1] === 1) {
        options[0] = -1;
    } else if (moves[moves.length - 1] === 2) {
        options[3] = -1;
    } else if (moves[moves.length - 1] === 3) {
        options[2] = -1;
    }


    for (let i = 0; i < options.length; i++) {
        let opt = options[i];
        if (opt >= 1 && opt <= 16) {
            [array[es-1], array[opt-1]] = [array[opt-1], array[es-1]];
            moves.push(i);
            const excessRet = DFS(array, moves, threshold, g+1, opt, it+1, goal, excess);
            if (excessRet === -1) {
                return excessRet;
            }
            excess = Math.min(excess, excessRet);
            [array[es-1], array[opt-1]] = [array[opt-1], array[es-1]];
            moves.pop();
        }
    }
    return excess;
}



// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
// Fisher–Yates (aka Knuth) Shuffle
function shuffle(array : Array<number>) {
    let currentIndex = array.length;
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

//https://mathworld.wolfram.com/15Puzzle.html
function solubilityQ(array : Array<number>, e : number) {
    let N = 0;
    for (let i = 0; i < array.length; i++) {
        let val = array[i];
        for (let j = i; j < array.length; j++) {
            if (array[j] < val) {
                N++;
            }
        }
    }
    return !((N+e) % 2);
}
function Board() {
    const boardSize = 4;
    const numberOfTiles = boardSize * boardSize - 1;
    const e = boardSize;
    const [board, setBoard] = useState(Array(numberOfTiles).fill(0)); // 0-indexed
    const [offsetArray, setOffsetArray] = useState(Array(numberOfTiles).fill([0,0])); // 0-indexed
    const emptySlot = useRef(boardSize * boardSize);
    const positions = useRef(Array(numberOfTiles).fill(0));
    const [status, setStatus] = useState("IN PROGRESS");
    const [moves, setMoves] = useState(0);

    function populateBoard() {
        let newBoard = Array(numberOfTiles).fill(0).map<number>((_, i) => {return i+1;});
        shuffle(newBoard);
        while (!solubilityQ(newBoard, e)) {
            shuffle(newBoard);
        }
        setBoard(newBoard);
        positions.current = Array(numberOfTiles).fill(0).map<number>((_, i) => {
            return i+1;
        }); // 0-indexed
        const newOffsetArray = Array(numberOfTiles).fill(0).map((_, i) => [(i%boardSize)*100, Math.trunc(i/boardSize)*100]) // 0-indexed
        setOffsetArray(newOffsetArray);
        emptySlot.current = boardSize * boardSize;
        setStatus("IN PROGRESS");
        setMoves(0);
    }
    function solveBoard() {
        let es = emptySlot.current;
        emptySlot.current = -1;
        solve(board.slice(), es);
    }

    function handleClick(i: number) {
        if (emptySlot.current - positions.current[i] === 1 && emptySlot.current % boardSize != 1) {
            // empty is on the right
            const newOffsetArray = offsetArray.slice();
            newOffsetArray[i] = [newOffsetArray[i][0]+100, newOffsetArray[i][1]];
            setOffsetArray(newOffsetArray);
            const newPositions = positions.current.slice();
            let tmp = newPositions[i];
            newPositions[i] = emptySlot.current;
            positions.current = newPositions;
            emptySlot.current = tmp;
            setMoves(moves+1);
        } else if (emptySlot.current - positions.current[i] === -1 && emptySlot.current % boardSize != 0) {
            // left
            const newOffsetArray = offsetArray.slice();
            newOffsetArray[i] = [newOffsetArray[i][0]-100, newOffsetArray[i][1]];
            setOffsetArray(newOffsetArray);
            const newPositions = positions.current.slice();
            let tmp = newPositions[i];
            newPositions[i] = emptySlot.current;
            positions.current = newPositions;
            emptySlot.current = tmp;
            setMoves(moves+1);
        } else if (emptySlot.current - positions.current[i] === boardSize) {
            const newOffsetArray = offsetArray.slice();
            newOffsetArray[i] = [newOffsetArray[i][0], newOffsetArray[i][1]+100];
            setOffsetArray(newOffsetArray);
            const newPositions = positions.current.slice();
            let tmp = newPositions[i];
            newPositions[i] = emptySlot.current;
            positions.current = newPositions;
            emptySlot.current = tmp;
            setMoves(moves+1);
        } else if (emptySlot.current - positions.current[i] === -boardSize) {
            const newOffsetArray = offsetArray.slice();
            newOffsetArray[i] = [newOffsetArray[i][0], newOffsetArray[i][1]-100];
            setOffsetArray(newOffsetArray);
            const newPositions = positions.current.slice();
            let tmp = newPositions[i];
            newPositions[i] = emptySlot.current;
            positions.current = newPositions;
            emptySlot.current = tmp;
            setMoves(moves+1);
        } else {
            return;
        }

        if (emptySlot.current === boardSize * boardSize) {
            for (let i = 0; i < board.length; i++) {
                console.log(board[i], positions.current[i]);
                if (board[i] !== positions.current[i]) {
                    return;
                }
            }
        } else {
            return;
        }
        // won
        setStatus("COMPLETED");
        emptySlot.current = -1;
    }
    return (
        <>
            <div className={"container"}>
                <span>{status}: {moves}</span>
                <button className={"controls"} onClick={populateBoard}>Populate</button>
                <button className={"controls"} onClick={solveBoard}>IDA &#42;</button>
                <div className={"board"}>
                    {Array(numberOfTiles).fill(0).map((_,index) =>
                        <Square
                            value={board[index]}
                            offsets={offsetArray[index]}
                            onSquareClick={() => handleClick(index)}
                        />
                    )}
                </div>
            </div>
        </>
    )
}

export default function Tiles() {
    return (
        <>
            <header>
                <h1>Tiles</h1>
            </header>
            <main>
                <section>
                    <Board />
                </section>
            </main>
            <footer>
                <ul>
                    <li><a href={"https://mathworld.wolfram.com/15Puzzle.html"} target={"_blank"}>Wolfram MathWorld</a></li>
                </ul>
            </footer>
        </>
    )
}
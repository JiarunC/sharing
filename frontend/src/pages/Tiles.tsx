/*
 * tiles.tsx
 * page for tiles (fifteen puzzle)
 * connects to backend binary p15solver
 * adapted from React tutorial tic-tac-toe
 *
 * arrays are 0 indexed
 * references to slot such as emptySlot are 1 indexed
 * has goal state 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0
 * 0 is empty slot
 * backend has goal state 0,1-15
 * invert board before posting to backend
 * invert after receiving solution
 * has animate solution function
 *
 * manually written with debugging help from Gemini
 */

import {useRef, useState} from 'react';
import "./tiles.css"
import {toast} from "react-toastify";

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
    const [board, setBoard] = useState(Array(numberOfTiles).fill(0));
    const [offsetArray, setOffsetArray] = useState(Array(numberOfTiles).fill([0,0]));
    const emptySlot = useRef(boardSize * boardSize);
    const positions = useRef(Array(numberOfTiles).fill(0));
    const [status, setStatus] = useState("Moves");
    const [moves, setMoves] = useState(0);
    const [lock, setLock] = useState(false);
    const pdbInitialized = useRef(false);

    function populateBoard() {
        let newBoard = Array(numberOfTiles).fill(0).map<number>((_, i) => {return i+1;});
        shuffle(newBoard);
        while (!solubilityQ(newBoard, e)) {
            shuffle(newBoard);
        }
        setBoard(newBoard);
        positions.current = Array(numberOfTiles).fill(0).map<number>((_, i) => {
            return i+1;
        });
        const newOffsetArray = Array(numberOfTiles).fill(0).map((_, i) => [(i%boardSize)*100, Math.trunc(i/boardSize)*100]) // 0-indexed
        setOffsetArray(newOffsetArray);
        emptySlot.current = boardSize * boardSize;
        setStatus("Moves");
        setMoves(0);
        setLock(false);
    }

    async function get_solution(invertedBoard : Array<number>) {
        const url = "/api/p15solver";
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    board : invertedBoard,
                })
            });
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const result = await response.json();
            return result.solution;
        } catch (error : any) {
            console.error(error.message);
            return null;
        }
    }

    async function solveBoard() {
        if (emptySlot.current === -1) {
            return;
        }

        if (lock) return;
        setLock(true);

        if (!pdbInitialized.current) {
            setStatus("Initializing solver");
            toast('Solver needs to be initialized. This could take a while. However, subsequent solves are instant.');
        }

        let offsetArrayCopy = structuredClone(offsetArray);
        let es = emptySlot.current;
        emptySlot.current = -1;

        let invertedBoard = new Array<number>(16).fill(0);

        for (let i = 0; i < board.length; i++) {
            invertedBoard[positions.current[i]-1] = board[i];
        }

        invertedBoard = invertedBoard.toReversed();
        for (let i = invertedBoard.length - 1; i >= 0; i--) {
            if (invertedBoard[i] === 0) {
                continue;
            }
            invertedBoard[i] = 15 - invertedBoard[i] + 1;
        }
        let solution = await get_solution(invertedBoard);

        if (!solution) {
            setStatus("Error encountered");
            setLock(false);
            return;
        }

        pdbInitialized.current = true;
        setStatus("Solving");
        let directions: Array<any> = [];
        for (let i = 0; i < solution.length; i++) {
            if (solution[i] === 'r') {
                directions.push('l');
            } else if (solution[i] === 'l') {
                directions.push('r');
            } else if (solution[i] === 'u') {
                directions.push('d');
            } else if (solution[i] === 'd') {
                directions.push('u');
            }
        }

        for (let direction of directions) {
            let i = -1;
            let x = -1;
            let y = -1;
            if (direction === 'r') {
                i = es-1;
                x = 100;
                y = 0;
            } else if (direction === 'l') {
                i = es+1;
                x = -100;
                y = 0;
            } else if (direction === 'd') {
                i = es-4;
                x = 0;
                y = 100;
            } else if (direction === 'u') {
                i = es+4;
                x = 0;
                y = -100;
            }
            console.log(direction, i);
            const targetIndex = positions.current.indexOf(i);
            const newOffsetArray = offsetArrayCopy.slice();
            newOffsetArray[targetIndex] = [newOffsetArray[targetIndex][0]+x, newOffsetArray[targetIndex][1]+y];
            setOffsetArray(newOffsetArray);
            offsetArrayCopy = newOffsetArray;

            const newPositions = positions.current.slice();
            let tmp = newPositions[targetIndex];
            newPositions[targetIndex] = es;
            positions.current = newPositions;
            es = tmp;
            await new Promise(resolve => {setTimeout(resolve, 300)});
        }
        setStatus("Solved");
        setLock(false);
    }

    function move(i : number, x: number, y:number) {
        const newOffsetArray = offsetArray.slice();
        newOffsetArray[i] = [newOffsetArray[i][0]+x, newOffsetArray[i][1]+y];
        setOffsetArray(newOffsetArray);
        const newPositions = positions.current.slice();
        let tmp = newPositions[i];
        newPositions[i] = emptySlot.current;
        positions.current = newPositions;
        emptySlot.current = tmp;
        setMoves(moves+1);
    }

    function handleClick(i: number) {
        if (emptySlot.current - positions.current[i] === 1 && emptySlot.current % boardSize != 1) {
            move(i, 100, 0);
        } else if (emptySlot.current - positions.current[i] === -1 && emptySlot.current % boardSize != 0) {
            move(i, -100, 0);
        } else if (emptySlot.current - positions.current[i] === boardSize) {
            move(i, 0, 100);
        } else if (emptySlot.current - positions.current[i] === -boardSize) {
            move(i, 0, -100);
        } else {
            return;
        }

        if (emptySlot.current === boardSize * boardSize) {
            for (let i = 0; i < board.length; i++) {
                if (board[i] !== positions.current[i]) {
                    return;
                }
            }
        } else {
            return;
        }
        // won
        setStatus("Completed");
        emptySlot.current = -1;
    }
    return (
        <>
            <div className={"container"}>
                <span className={"status-tag"}>{status}: {moves}</span>
                <button className={"controls"} onClick={populateBoard} disabled={lock}>Populate</button>
                <button className={"controls"} onClick={solveBoard} disabled={lock}>Solve</button>
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
                    <li><a href={"https://doi.org/10.1016/0004-3702(85)90084-0"} target={"_blank"}>Depth-first iterative-deepening</a></li>
                    <li><a href={"https://doi.org/10.1016/S0004-3702(01)00092-3"} target={"_blank"}>Disjoint pattern database heuristics</a></li>
                </ul>
            </footer>
        </>
    )
}
import {useRef, useState} from 'react';
import "./tiles.css"

type coordinate = [number, number];
function Square({ value, position, offsets, onSquareClick } : {value : number, position : number, offsets: coordinate, onSquareClick : any}) {
    return (
        <>
            <button
                className={"square"}
                onClick={onSquareClick}
                style={{
                    transform: `translate(${offsets[0]}px, ${offsets[1]}px)`,
                }}
            >
                {value} - { position }
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
function Board() {
    const boardSize = 4;
    const numberOfTiles = boardSize * boardSize - 1;
    // const e = boardSize;
    const [board, setBoard] = useState(Array(numberOfTiles).fill(0)); // 0-indexed
    const [offsetArray, setOffsetArray] = useState(Array(numberOfTiles).fill([0,0])); // 0-indexed
    const emptySlot = useRef(boardSize * boardSize);
    const positions = useRef(Array(numberOfTiles).fill(0));

    function populateBoard() {
        let newBoard = Array(numberOfTiles).fill(0).map<number>((_, i) => {return i+1;});
        shuffle(newBoard);
        setBoard(newBoard);
        positions.current = Array(numberOfTiles).fill(0).map<number>((_, i) => {
            return i+1;
        }); // 0-indexed
        console.log(positions.current);
        const newOffsetArray = Array(numberOfTiles).fill(0).map((_, i) => [(i%boardSize)*100, Math.trunc(i/boardSize)*100]) // 0-indexed
        setOffsetArray(newOffsetArray);
        emptySlot.current = boardSize * boardSize;
    }

    function clearBoard() {

    }

    function handleClick(i: number) {
        if (emptySlot.current - positions.current[i] === 1) {
            // empty is on the right
            const newOffsetArray = offsetArray.slice();
            newOffsetArray[i] = [newOffsetArray[i][0]+100, newOffsetArray[i][1]];
            setOffsetArray(newOffsetArray);
            const newPositions = positions.current.slice();
            let tmp = newPositions[i];
            newPositions[i] = emptySlot.current;
            positions.current = newPositions;
            emptySlot.current = tmp;
        } else if (emptySlot.current - positions.current[i] === -1) {
            // left
            const newOffsetArray = offsetArray.slice();
            newOffsetArray[i] = [newOffsetArray[i][0]-100, newOffsetArray[i][1]];
            setOffsetArray(newOffsetArray);
            const newPositions = positions.current.slice();
            let tmp = newPositions[i];
            newPositions[i] = emptySlot.current;
            positions.current = newPositions;
            emptySlot.current = tmp;
        } else if (emptySlot.current - positions.current[i] === boardSize) {
            const newOffsetArray = offsetArray.slice();
            newOffsetArray[i] = [newOffsetArray[i][0], newOffsetArray[i][1]+100];
            setOffsetArray(newOffsetArray);
            const newPositions = positions.current.slice();
            let tmp = newPositions[i];
            newPositions[i] = emptySlot.current;
            positions.current = newPositions;
            emptySlot.current = tmp;
        } else if (emptySlot.current - positions.current[i] === -boardSize) {
            const newOffsetArray = offsetArray.slice();
            newOffsetArray[i] = [newOffsetArray[i][0], newOffsetArray[i][1]-100];
            setOffsetArray(newOffsetArray);
            const newPositions = positions.current.slice();
            let tmp = newPositions[i];
            newPositions[i] = emptySlot.current;
            positions.current = newPositions;
            emptySlot.current = tmp;
        }
    }
    return (
        <>
            <div>
                <button className={"controls"} onClick={populateBoard}>Populate - {emptySlot.current}</button>
                <button className={"controls"} onClick={clearBoard}>Clear</button>
                <div className={"board"}>
                    {Array(numberOfTiles).fill(0).map((_,index) =>
                        <Square
                            value={board[index]}
                            position={positions.current[index]}
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
                    <div className={"container"}>
                        <Board />
                    </div>
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
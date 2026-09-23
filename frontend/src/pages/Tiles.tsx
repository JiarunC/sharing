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
function Board() {
    const [board, setBoard] = useState(Array(8).fill(0));
    const [offsetArray, setOffsetArray] = useState(Array(8).fill([0,0]))
    const emptySlot = useRef(9);

    const positions = useRef(Array(8).fill(0));

    function populateBoard() {
        const newBoard = [3,1,4,5,8,2,7,6];
        setBoard(newBoard);
        const newOffsetArray = Array(8).fill(0).map((_, i) => [i*100 % 300, Math.trunc(i/3)*100])
        console.log(newOffsetArray);
        setOffsetArray(newOffsetArray);
        positions.current = [1,2,3,4,5,6,7,8];
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
        } else if (emptySlot.current - positions.current[i] === 3) {
            const newOffsetArray = offsetArray.slice();
            newOffsetArray[i] = [newOffsetArray[i][0], newOffsetArray[i][1]+100];
            setOffsetArray(newOffsetArray);
            const newPositions = positions.current.slice();
            let tmp = newPositions[i];
            newPositions[i] = emptySlot.current;
            positions.current = newPositions;
            emptySlot.current = tmp;
        } else if (emptySlot.current - positions.current[i] === -3) {
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
                    {Array(8).fill(0).map((_,index) =>
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
                        <div className={"tile"}>
                            <Board />
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
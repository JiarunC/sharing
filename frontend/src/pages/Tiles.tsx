import {useRef, useState} from 'react';
import "./tiles.css"

type coordinate = [number, number];
function Square({ value, offsets, onSquareClick } : {value: number, offsets: coordinate, onSquareClick : any}) {
    return (
        <>
            <button
                className={"square"}
                onClick={onSquareClick}
                style={{
                    transform: `translate(${offsets[0]}px, ${offsets[1]}px)`,
                }}
            >
                {value}-{offsets}
            </button>
        </>
    )
}
function Board() {
    const [board, setBoard] = useState(Array(8).fill(0));
    const [offsetArray, setOffsetArray] = useState(Array(8).fill([0,0]))
    const emptySlot = useRef(8);

    function populateBoard() {

    }

    function clearBoard() {

    }

    function handleClick(i: number) {
        const newBoard = board.slice();
        newBoard[i] += 1;
        setBoard(newBoard);
        const newOffsetArray = offsetArray.slice();
        newOffsetArray[i] = [newOffsetArray[i][0]+100, newOffsetArray[i][1]+100];
        setOffsetArray(newOffsetArray);
    }
    return (
        <>
            <div className="board">
                <button onClick={populateBoard}>Populate</button>
                <button onClick={clearBoard}>Clear</button>
                <div>
                    {Array(8).fill(0).map((_,index) =>
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
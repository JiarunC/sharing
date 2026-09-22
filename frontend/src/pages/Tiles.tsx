import { useState } from 'react';
import { useRef } from 'react';
import "./tiles.css"

type coordinate = [number, number];
function Square({ value, offsets, onSquareClick }) {
    return (
        <>
            <button
                className={"square"}
                onClick={onSquareClick}
                style={{
                    transform: `translate(${offsets[offsets[0]]}px, ${offsets[1]}px)`,
                }}
            >
                {value}
            </button>
        </>
    )
}
function Board() {
    let board = useRef(Array(8).fill(0));
    let offsetArray = useRef(Array(8).fill([0,0]));

    function populateBoard() {

    }

    function clearBoard() {

    }

    function handleClick(i) {
        const newBoard = board.current.slice();
        newBoard[i] += 1;
        board.current = newBoard;
        const newOffsetArray = offsetArray.current.slice();
        newOffsetArray[i] = [100,100];
        offsetArray.current = newOffsetArray;
    }

    return (
        <>
            <div className="board">
                <button onClick={populateBoard}>Populate</button>
                <button onClick={clearBoard}>Clear</button>
                <div>
                    <Square
                        value={board.current[0]}
                        offsets={offsetArray.current[0]}
                        onSquareClick={() => handleClick(0)}
                    />
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
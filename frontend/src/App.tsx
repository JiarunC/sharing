/*
 * App.tsx
 * front page with description of site
 */


import {NavLink} from "react-router"

import './App.css'

function App() {

    return (
        <>
            <header>
                <h1>My Projects</h1>
            </header>
            <main>
                <section className={"overview"}>
                    <p>This is a testing ground and showcase for my personal projects.</p>
                    <p>Some are more polished; others are proof of concept experiments.</p>
                    <p>It's an ongoing collection.</p>
                </section>
                <section>
                    <nav>
                        <ul>
                            <li>
                                <NavLink to="/tiles" end>
                                    Tiles
                                </NavLink>
                            </li>
                        </ul>
                    </nav>
                </section>
            </main>
            <footer>
                <ul>
                    <li><p>Jiarun Chen (David)</p></li>
                    <li><p>I'm a senior studying CS & Math at Washington University in St. Louis.</p></li>
                    <li><p>The project files are public and mostly manually typed.</p></li>
                    <li><a href="https://github.com/JiarunC" target="_blank">GitHub</a></li>
                </ul>
            </footer>
        </>
    )
}

export default App

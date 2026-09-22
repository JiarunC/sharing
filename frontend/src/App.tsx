import { NavLink } from "react-router"

import './App.css'

function App() {

  return (
    <>
      <header>
        <h1>Showcase</h1>
        <h2>Under Construction</h2>
      </header>
      <main>
        <nav>
          <ul>
            <li>
                <NavLink to="/tiles" end>
                    Tiles
                </NavLink>
            </li>
          </ul>
        </nav>
      </main>
    </>
  )
}

export default App

import { Link } from 'react-router-dom';
import reactLogo from './assets/react.svg'
import ZeldaLogo from './assets/images/sheikah.png'

import './App.css'

function App() {

  return (
    <>
      <div>
          <img src={ZeldaLogo} className="logo" alt="Vite logo" />
          <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Breath of the Wild</h1>
      <div className="card">
        <Link to="/map">
          <button>
            Start!
          </button>
        </Link>
      </div>
    </>
  )
}

export default App

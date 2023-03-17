import { ToastContainer } from 'react-toastify'
import Game from '../pages/Game'
import 'react-toastify/dist/ReactToastify.css'
import styles from './App.module.scss'

function App() {
  return (
    <div className={styles.app}>
      <Game />
      <ToastContainer
        position="bottom-left"
        autoClose={4000}
        hideProgressBar={false}
        closeOnClick={true}
        pauseOnHover={true}
        draggable={true}
        theme="light"
      />
    </div>
  )
}

export default App

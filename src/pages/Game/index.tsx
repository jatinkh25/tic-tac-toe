import { BigNumber, ethers } from 'ethers'
import { ChangeEvent, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Board, Layout } from '../../components'
import { CONTRACT_ADDRESS, ENTRY_FEES } from '../../utils/constants'
import { contractABI } from '../../utils/data/abiData'
import { convertHexadecimalToNumber } from '../../utils/functions'
import styles from './Game.module.scss'

declare global {
  interface Window {
    ethereum?: any
  }
}

function Game() {
  const [contract, setContract] = useState<ethers.Contract>()
  const [gameId, setGameId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [joinerGameIdInput, setJoinerGameIdInput] = useState<number | null>(null)
  const [viewerGameIdInput, setViewerGameIdInput] = useState<number | null>(null)
  const [playerName, setPlayerName] = useState<string>('')
  const [isOtherPlayerEntered, setIsOtherPlayerEntered] = useState(true)

  useEffect(() => {
    // Resetting state variables if previously exist
    resetGame()

    const connectWallet = async () => {
      if (window.ethereum == null) return

      const { ethereum } = window

      // If user hasn't install Metamask
      if (ethereum == null) {
        toast.info('Please install Metamask to use this application')
        return
      }

      const contractAddress = CONTRACT_ADDRESS

      try {
        setIsLoading(true)

        await ethereum.request({ method: 'eth_requestAccounts' })

        // Creating a Web3 provider instance
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()

        // Creating a Contract instance
        const contract = new ethers.Contract(contractAddress, contractABI, signer)

        setContract(contract)
        setIsLoading(false)
      } catch (err: any) {
        toast.error(err.reason)
        setIsLoading(false)
      }
    }

    connectWallet()
  }, [window.ethereum])

  // Function to start a new game
  const handleStartGame = async () => {
    if (contract == null) return

    try {
      setIsLoading(true)

      // Calling startGame function of the smart contract
      const transaction = await contract.startGame({ value: ENTRY_FEES })

      // Waiting for the transaction to be mined
      const receipt = await transaction.wait()

      // Finding the GameStarted event to get the gameId of the game
      const event = receipt.events.find((e: any) => e.event === 'GameStarted')

      // Converting from hexadecimal to number
      const gameId = convertHexadecimalToNumber(event.args[0])
      setGameId(gameId)

      // The user who created the game is assigned name as Player-1
      setPlayerName('Player-1')

      setIsLoading(false)

      toast.info(`Share Game ID ${gameId} with other player to continue the game`)
      toast.info('You can cancel the game untill the other player enters the game', {
        delay: 4000
      })

      // Checking if other player has entered the game for the game to be started
      checkIfOtherPlayerEntered(gameId)
    } catch (err: any) {
      toast.error(err.reason)
      setIsLoading(false)
    }
  }

  const handleJoinGame = async () => {
    if (contract == null) return

    try {
      setIsLoading(true)

      // Calling joinGame function of the smart contract
      const transaction = await contract.joinGame(joinerGameIdInput, { value: ENTRY_FEES })

      // Waiting for the transaction to be mined
      const receipt = await transaction.wait()

      // Checking for JoinedGame event for getting the gameId
      const event = receipt.events.find((e: any) => e.event === 'JoinedGame')

      // Converting hexadecimal gameId value to number
      const gameId = convertHexadecimalToNumber(event.args[0])
      setGameId(gameId)

      /**
       * The user who successfully joins a game by clicking the join button
       *  is assigned name Player-2
       */
      setPlayerName('Player-2')

      setIsLoading(false)
      setIsOtherPlayerEntered(true)

      toast.success('Congratulations, Player-1 is already here. Lets start!')
    } catch (err: any) {
      setIsLoading(false)
      toast.error(err.reason)
    }
  }

  // Resetting the game
  const resetGame = () => {
    setGameId(null)
    setJoinerGameIdInput(null)
    setIsOtherPlayerEntered(false)
    setPlayerName('')
  }

  const handleJoinerGameIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    setJoinerGameIdInput(parseInt(event.target.value))
  }

  const handleViewerGameIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    setViewerGameIdInput(parseInt(event.target.value))
  }

  const checkIfOtherPlayerEntered = (gameId: number) => {
    // Null checks
    if (contract == null || gameId == null) return

    const joinGameListener = (eventGameId: BigNumber) => {
      // Ignoring the events that doesn't belongs to our game
      if (convertHexadecimalToNumber(eventGameId) !== gameId) return

      setIsOtherPlayerEntered(true)
      toast.success('Congratulations, Player-2 has entered the game. Lets start!')

      // Unsubscribing to the JoinedGame event once the other player enters the game
      contract.off('JoinedGame', joinGameListener)
    }

    // Subscribing to the JoinedGame event for checking other player entry
    contract.on('JoinedGame', joinGameListener)
  }

  // Function for cancelling the game before Player-2 enters the game
  const handleCancelGame = async () => {
    // Null check
    if (contract == null) return

    try {
      // Calling cancelGame function of the smart contract
      const transaction = await contract.cancelGame(gameId)

      // Waiting for the transaction to be mined
      await transaction.wait()

      // Resetting the game in case of successfull cancellation
      resetGame()
    } catch (err: any) {
      toast.error(err.reason)
    }
  }

  const isOnlyPlayerOneExists = () => {
    return gameId != null && isOtherPlayerEntered === false
  }

  const isGameStarted = () => {
    if (gameId != null && isOtherPlayerEntered) return true
    return false
  }

  const startNewGame = () => {
    resetGame()
    handleStartGame()
  }

  const handleViewGame = async () => {
    // Null checks
    if (contract == null) return

    try {
      const game = await contract.games(viewerGameIdInput)
      const senderAddresss = window.ethereum.selectedAddress.toLowerCase()

      if (
        senderAddresss !== game.playerOne.toLowerCase() &&
        senderAddresss !== game.playerTwo.toLowerCase()
      ) {
        toast.error("You aren't one of the players of this game")
        return
      }

      setGameId(game.gameId)
      setIsOtherPlayerEntered(game.isStarted)

      if (senderAddresss === game.playerOne.toLowerCase()) {
        setPlayerName('Player-1')
      } else {
        setPlayerName('Player-2')
      }
    } catch (err: any) {
      toast.error(err.reason)
    }
  }

  return (
    <Layout isLoading={isLoading}>
      <div className={styles.game}>
        <div className={styles.btns_container}>
          <button
            onClick={handleStartGame}
            className={styles.btn}
            disabled={isGameStarted() || isLoading}>
            Start Game
          </button>
          <p>Or</p>
          <div className={styles.input_container}>
            <input
              type="text"
              placeholder="Enter Game Id to join"
              onChange={handleJoinerGameIdChange}
            />
            <button
              onClick={handleJoinGame}
              className={styles.btn}
              disabled={isGameStarted() || isLoading}>
              Join Game
            </button>
          </div>
          <div className={styles.horizontal_divider} />
          <div className={styles.input_container}>
            <input
              type="text"
              placeholder="Enter Game Id to view"
              onChange={handleViewerGameIdChange}
            />
            <button className={styles.btn} onClick={handleViewGame} disabled={isLoading}>
              View Game
            </button>
          </div>

          {isOnlyPlayerOneExists() && (
            <button className={styles.btn} onClick={handleCancelGame}>
              Cancel Game
            </button>
          )}
        </div>

        {gameId != null && (
          <div className={styles.game_info_container}>
            <span>{`Your Name : ${playerName}`}</span>
            <span>{`Game ID : ${gameId}`}</span>
          </div>
        )}

        {isGameStarted() && (
          <Board
            contract={contract}
            gameId={gameId}
            yourName={playerName}
            startNewGame={startNewGame}
          />
        )}
      </div>
    </Layout>
  )
}

export default Game

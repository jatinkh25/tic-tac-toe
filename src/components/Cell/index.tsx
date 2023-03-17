import { CellProps } from '../../utils/types'
import styles from './Cell.module.scss'

function Cell({ value, isDisabled, onCellClick }: CellProps) {
  return (
    <button className={styles.square} onClick={onCellClick} disabled={isDisabled}>
      {value === 1 && 'X'}
      {value === 2 && 'O'}
    </button>
  )
}

export default Cell

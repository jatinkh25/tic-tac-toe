import { ethers } from 'ethers'
import React from 'react'

export interface CellProps {
  value: number
  isDisabled: boolean
  onCellClick: () => void
}

export interface ContractInfo {
  contract: ethers.Contract | undefined
}

export interface BoardProps {
  contract: ethers.Contract | undefined
  gameId: number | null
  yourName: string
  startNewGame: () => void
}

export interface LayoutProps {
  isLoading: boolean
  children: React.ReactNode
}

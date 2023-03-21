import { BigNumber } from 'ethers'

export const convertHexadecimalToNumber = ({ _hex }: BigNumber) => {
  return parseInt(_hex)
}

export const getSessionStorageItem = (key: string) => {
  return sessionStorage.getItem(key)
}

export const setSessionStorageItem = (key: string, value: string) => {
  sessionStorage.setItem(key, value)
}

export const clearSessionStorage = () => {
  sessionStorage.clear()
}

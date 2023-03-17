import { BigNumber } from 'ethers'

export const convertHexadecimalToNumber = ({ _hex }: BigNumber) => {
  return parseInt(_hex)
}

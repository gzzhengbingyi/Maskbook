import type { Token, EthereumTokenType } from '../types'
import { useAccount } from './useAccount'
import { useERC20TokenContract } from './useERC20TokenContract'

export function useTokenBalance(type: EthereumTokenType, address: string, token: Token) {
    const account = useAccount()
    const erc20Contract = useERC20TokenContract(address)
}
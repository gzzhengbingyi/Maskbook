import type { ChainId, Token } from '../../../web3/types'

// uniswap helpers
export * from './uniswap'

export function createToken(chainId: ChainId, address: string, decimals: number, name: string, symbol: string) {
    return {
        chainId,
        address,
        decimals,
        name,
        symbol,
    } as Token
}

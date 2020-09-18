import { useMemo, useEffect } from 'react'
import { useAsync } from 'react-use'
import { Pair as UniswapPair, Token as UniswapToken, Pair, TokenAmount } from '@uniswap/sdk'
import { useChainId } from '../../../web3/hooks/useChainId'
import { usePairContract } from '../contracts/usePairContract'
import { useConstant } from '../../../web3/hooks/useConstant'

function resolvePairResult<T>(result: PromiseSettledResult<T>, fallback: T) {
    return result.status === 'fulfilled' ? result.value : fallback
}

export enum PairState {
    NOT_EXISTS,
    EXISTS,
    INVALID,
}

export type TokenPair = [UniswapToken, UniswapToken]

export function useUniswapPairs(tokens: readonly TokenPair[]) {
    const pairAddresses = useMemo(
        () =>
            tokens.map(([tokenA, tokenB]) => {
                return tokenA && tokenB && !tokenA.equals(tokenB) ? UniswapPair.getAddress(tokenA, tokenB) : undefined
            }),
        [tokens],
    )

    // this initial address is fake we use the real address in the call() method
    const ETH_ADDRESS = useConstant('ETH_ADDRESS')
    const pairContract = usePairContract(ETH_ADDRESS)

    // get reserves for each pair
    const { value: results = [] } = useAsync(async () => {
        if (!pairContract) return []
        return Promise.allSettled(
            pairAddresses.map((address) =>
                pairContract.methods.getReserves().call({
                    // the real contract address
                    to: address,
                }),
            ),
        )
    }, [pairAddresses.join()])

    return useMemo(() => {
        if (tokens.length !== results.length) return []
        return results.map((x, i) => {
            const tokenA = tokens[i][0]
            const tokenB = tokens[i][1]
            const reserves = resolvePairResult(x, undefined)
            if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
            if (!reserves) return [PairState.NOT_EXISTS, null]
            const { 0: reserve0, 1: reserve1 } = reserves
            const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
            return [
                PairState.EXISTS,
                new Pair(new TokenAmount(token0, reserve0.toString()), new TokenAmount(token1, reserve1.toString())),
            ]
        })
    }, [results, tokens])
}

// export function usePair(tokenA: UniswapToken, tokenB: UniswapToken) {
//     return useUniswapPairs([[tokenA, tokenB]])[0]
// }
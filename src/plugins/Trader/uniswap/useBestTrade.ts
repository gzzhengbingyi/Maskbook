import type { Token } from '../../../web3/types'
import { useAllCommonPairs } from './useAllCommonPairs'
import { useMemo } from 'react'
import { Trade } from '@uniswap/sdk'
import { toUniswapToken, toUniswapCurrencyAmount } from '../helpers'
import { useChainId } from '../../../web3/hooks/useChainId'
import BigNumber from 'bignumber.js'

export enum TradeStrategy {
    ExactIn,
    ExactOut,
}

export function useBestTrade(
    amount: string,
    strategy: TradeStrategy = TradeStrategy.ExactIn,
    inputToken?: Token,
    outputToken?: Token,
) {
    const isExactIn = strategy === TradeStrategy.ExactIn
    const bestTradeExactIn = useBestTradeExactIn(
        amount,
        isExactIn ? inputToken : undefined,
        isExactIn ? outputToken : undefined,
    )
    const bestTradeExactOut = useBestTradeExactOut(
        amount,
        isExactIn ? undefined : inputToken,
        isExactIn ? undefined : outputToken,
    )
    // TODO:
    // maybe we should support v1Trade in the future
    return {
        v2Trade: isExactIn ? bestTradeExactIn : bestTradeExactOut,
    }
}

export function useBestTradeExactIn(amount: string, inputToken: Token | undefined, outputToken: Token | undefined) {
    const chainId = useChainId()
    const allPairs = useAllCommonPairs(inputToken, outputToken)
    return useMemo(() => {
        if (new BigNumber(amount).isGreaterThan('0') && inputToken && outputToken && allPairs.length > 0)
            return (
                Trade.bestTradeExactIn(
                    allPairs,
                    toUniswapCurrencyAmount(chainId, inputToken, amount),
                    toUniswapToken(chainId, outputToken),
                    {
                        maxHops: 3,
                        maxNumResults: 1,
                    },
                )[0] ?? null
            )
        return null
    }, [allPairs, amount, inputToken, outputToken])
}

export function useBestTradeExactOut(amount: string, inputToken: Token | undefined, outputToken: Token | undefined) {
    const chainId = useChainId()
    const allPairs = useAllCommonPairs(inputToken, outputToken)
    return useMemo(() => {
        if (new BigNumber(amount).isGreaterThan('0') && inputToken && outputToken && allPairs.length > 0)
            return (
                Trade.bestTradeExactOut(
                    allPairs,
                    toUniswapToken(chainId, inputToken),
                    toUniswapCurrencyAmount(chainId, outputToken, amount),
                    {
                        maxHops: 3,
                        maxNumResults: 1,
                    },
                )[0] ?? null
            )
        return null
    }, [allPairs, amount, inputToken, outputToken])
}

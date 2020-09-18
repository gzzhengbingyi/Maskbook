import React, { useState, useCallback } from 'react'
import type { Token } from '../../../web3/types'
import { UniswapTradeSummary, UniswapTradeSummaryProps } from './UniswapTradeSummary'
import { UniswapTradeForm, UniswapTradeFormProps } from './UniswapTradeForm'
import { TradeStrategy, useBestTrade } from '../uniswap/useBestTrade'

export interface UniswapTradeProps {
    reversed: boolean
    inputToken: Token
    outputToken: Token
    UniswapTradeFormProps?: Partial<UniswapTradeFormProps>
    UniswapTradeSummaryProps?: Partial<UniswapTradeSummaryProps>
}

export function UniswapTrade(props: UniswapTradeProps) {
    const { inputToken, outputToken, reversed } = props

    const [tradeStrategy, setTradeStrategy] = useState(TradeStrategy.ExactIn)
    const [inputAmount, setInputAmount] = useState('0')
    const [outputAmount, setOutputAmount] = useState('0')

    const onInputAmountChange = useCallback(
        (amount: string) => {
            setInputAmount(amount)
            setOutputAmount('0')
            setTradeStrategy(reversed ? TradeStrategy.ExactOut : TradeStrategy.ExactIn)
        },
        [reversed, inputAmount],
    )
    const onOutputAmountChange = useCallback(
        (amount: string) => {
            setOutputAmount(amount)
            setInputAmount('0')
            setTradeStrategy(reversed ? TradeStrategy.ExactIn : TradeStrategy.ExactOut)
        },
        [reversed, outputAmount],
    )

    const trade = useBestTrade(
        !reversed ? inputToken : outputToken,
        !reversed ? outputToken : inputToken,
        (tradeStrategy === TradeStrategy.ExactIn) === !reversed ? inputAmount : outputAmount,
        tradeStrategy,
    )
    const estimatedInputAmount =
        tradeStrategy === TradeStrategy.ExactOut ? trade.v2Trade?.inputAmount.raw.toString() ?? '' : ''
    const estimatedOutputAmount =
        tradeStrategy === TradeStrategy.ExactIn ? trade.v2Trade?.outputAmount.raw.toString() ?? '' : ''

    console.log({
        tradeStrategy,
        estimatedInputAmount,
        estimatedOutputAmount,
    })

    return (
        <>
            <UniswapTradeForm
                reversed={reversed}
                inputToken={inputToken}
                outputToken={outputToken}
                inputAmount={(reversed ? estimatedOutputAmount : estimatedInputAmount) || inputAmount}
                outputAmount={(reversed ? estimatedInputAmount : estimatedOutputAmount) || outputAmount}
                onAmountInChange={onInputAmountChange}
                onAmountOutChange={onOutputAmountChange}
                {...props.UniswapTradeFormProps}
            />
            <UniswapTradeSummary
                reversed={reversed}
                trade={trade.v2Trade}
                inputToken={inputToken}
                outputToken={outputToken}
                {...props.UniswapTradeSummaryProps}
            />
        </>
    )
}

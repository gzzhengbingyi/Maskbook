import React, { useState, useCallback } from 'react'
import { makeStyles, Theme, createStyles, CircularProgress } from '@material-ui/core'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { MessageCenter, MaskbookWalletMessages } from '../../Wallet/messages'
import { useToken } from '../../../web3/hooks/useToken'
import { Token, EthereumTokenType } from '../../../web3/types'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useConstant } from '../../../web3/hooks/useConstant'
import { UniswapTrade } from './UniswapTrade'

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        root: {
            display: 'flex',
            flexDirection: 'column',
            minHeight: 266,
            position: 'relative',
        },
        progress: {
            bottom: theme.spacing(1),
            right: theme.spacing(1),
            position: 'absolute',
        },
    })
})

export interface UniswapTraderProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    address: string
    name: string
    symbol: string
}

export function UniswapTrader(props: UniswapTraderProps) {
    const ETH_ADDRESS = useConstant('ETH_ADDRESS')

    const { address, name, symbol } = props
    const classes = useStylesExtends(useStyles(), props)

    //#region get token info from chain
    const [reversed, setReversed] = useState(false)

    const [inputTokenAddress, setInputTokenAddress] = useState(ETH_ADDRESS)
    const [outputTokenAddress, setOutputTokenAddress] = useState(address === ETH_ADDRESS ? '' : address) // KANA for rinkeby testnet only

    const isEtherInputToken = inputTokenAddress === ETH_ADDRESS
    const isEtherOutputToken = outputTokenAddress === ETH_ADDRESS

    const { value: inputToken, loading: loadingInputToken, error: errorInputToken } = useToken(
        isEtherInputToken ? EthereumTokenType.Ether : EthereumTokenType.ERC20,
        {
            address: isEtherInputToken ? ETH_ADDRESS : inputTokenAddress,
        },
    )
    const { value: outputToken, loading: loadingOutputToken, error: errorOutputToken } = useToken(
        isEtherOutputToken ? EthereumTokenType.Ether : EthereumTokenType.ERC20,
        {
            address: isEtherOutputToken ? ETH_ADDRESS : outputTokenAddress,
            name,
            symbol,
        },
    )
    //#endregion

    //#region select token
    const [focusedTokenAddress, setFocusedTokenAddress] = useState<string>('')

    // select token in the remote controlled dialog
    const [, setOpen] = useRemoteControlledDialog<MaskbookWalletMessages, 'selectERC20TokenDialogUpdated'>(
        MessageCenter,
        'selectERC20TokenDialogUpdated',
        useCallback(
            (ev: MaskbookWalletMessages['selectERC20TokenDialogUpdated']) => {
                if (ev.open) return
                const { address = '' } = ev.token ?? {}
                if (!address) return
                inputTokenAddress === focusedTokenAddress
                    ? setInputTokenAddress(address)
                    : setOutputTokenAddress(address)
            },
            [inputTokenAddress, focusedTokenAddress],
        ),
    )

    // open select token dialog
    const onTokenChipClick = useCallback(
        (token: Token) => {
            setFocusedTokenAddress(token?.address ?? '')
            setOpen({
                open: true,
                address: token?.address,
                excludeTokens: [inputTokenAddress, outputTokenAddress].filter(Boolean),
            })
        },
        [setOpen, inputTokenAddress, outputTokenAddress],
    )
    //#endregion

    console.log('DEBUG: fetching tokens')
    console.log({
        inputToken,
        outputToken,
    })

    return (
        <div className={classes.root}>
            <UniswapTrade
                reversed={reversed}
                inputToken={inputToken}
                outputToken={outputToken}
                UniswapTradeFormProps={{
                    onReverseClick: () => setReversed((x) => !x),
                    onTokenChipClick,
                }}
            />
            {loadingInputToken || loadingOutputToken ? (
                <CircularProgress className={classes.progress} size={15} />
            ) : null}
        </div>
    )
}

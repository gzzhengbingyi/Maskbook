import React, { useCallback } from 'react'
import classNames from 'classnames'
import { noop } from 'lodash-es'
import { makeStyles, Theme, createStyles, Typography } from '@material-ui/core'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { TokenAmountPanel } from './TokenAmountPanel'
import BigNumber from 'bignumber.js'
import type { Token } from '../../../web3/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { MaskbookWalletMessages, MessageCenter } from '../../Wallet/messages'

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        form: {
            width: 350,
            margin: `${theme.spacing(2)}px auto`,
        },
        section: {
            textAlign: 'center',
            margin: `${theme.spacing(1)}px auto`,
        },
        divider: {
            marginTop: theme.spacing(-0.5),
            marginBottom: theme.spacing(-1),
        },
        icon: {
            cursor: 'pointer',
        },
        submit: {
            marginTop: theme.spacing(2),
            paddingTop: 12,
            paddingBottom: 12,
        },
    })
})

export interface UniswapTradeFormProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    reversed: boolean
    inputToken?: Token
    outputToken?: Token
    inputAmount: string
    outputAmount: string
    onAmountInChange: (amount: string) => void
    onAmountOutChange: (amount: string) => void
    onReverseClick?: () => void
    onTokenChipClick?: (token: Token) => void
}

export function UniswapTradeForm(props: UniswapTradeFormProps) {
    const classes = useStylesExtends(useStyles(), props)

    const {
        reversed,
        inputToken,
        outputToken,
        inputAmount,
        outputAmount,
        onAmountInChange,
        onAmountOutChange,
        onReverseClick = noop,
        onTokenChipClick = noop,
    } = props

    const account = useAccount()

    const tradeAmountA = new BigNumber(inputAmount)
    const tradeAmountB = new BigNumber(outputAmount)

    const balanceA = new BigNumber('0')
    const balanceB = new BigNumber('0')

    //#region remote controll select provider dialog
    const [, setOpen] = useRemoteControlledDialog<MaskbookWalletMessages, 'selectProviderDialogUpdated'>(
        MessageCenter,
        'selectProviderDialogUpdated',
    )
    //#endregion

    const onSubmit = useCallback(() => {
        if (!account) {
            setOpen({
                open: true,
            })
            return
        }
    }, [])

    const sections = [
        {
            key: 'input',
            children: (
                <TokenAmountPanel
                    label={reversed ? 'To' : 'From'}
                    token={inputToken}
                    amount={inputAmount}
                    onAmountChange={onAmountInChange}
                    MaxChipProps={{ style: { display: reversed ? 'none' : 'flex' } }}
                    TextFieldProps={{
                        disabled: !inputToken,
                    }}
                    SelectTokenChip={{
                        loading: false,
                        ChipProps: {
                            onClick: () => onTokenChipClick(inputToken),
                        },
                    }}
                />
            ),
        },
        {
            key: 'divider',
            children: (
                <Typography color="primary">
                    <ArrowDownwardIcon className={classes.icon} onClick={onReverseClick} />
                </Typography>
            ),
        },
        {
            key: 'output',
            children: (
                <TokenAmountPanel
                    label={reversed ? 'From' : 'To'}
                    token={outputToken}
                    amount={outputAmount}
                    onAmountChange={onAmountOutChange}
                    MaxChipProps={{ style: { display: reversed ? 'flex' : 'none' } }}
                    TextFieldProps={{
                        disabled: !outputToken,
                    }}
                    SelectTokenChip={{
                        loading: false,
                        ChipProps: {
                            onClick: () => onTokenChipClick(outputToken),
                        },
                    }}
                />
            ),
        },
    ] as {
        key: 'input' | 'output' | 'divider'
        children?: React.ReactNode
    }[]

    return (
        <form className={classes.form} noValidate autoComplete="off">
            {sections
                .sort(() => (reversed ? -1 : 1))
                .map(({ key, children }) => (
                    <div className={classNames(classes.section, key === 'divider' ? classes.divider : '')} key={key}>
                        {children}
                    </div>
                ))}
            <div className={classes.section}>
                <ActionButton
                    className={classes.submit}
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={
                        !!account &&
                        (!inputToken?.address ||
                            !outputToken?.address ||
                            tradeAmountA.isZero() ||
                            tradeAmountB.isZero() ||
                            tradeAmountA.isGreaterThan(balanceA) ||
                            tradeAmountB.isGreaterThan(balanceB))
                    }
                    onClick={onSubmit}>
                    {(() => {
                        if (!account) return 'Connect a Wallet'
                        if (tradeAmountA.isZero() || tradeAmountB.isZero()) return 'Enter an amount'
                        if (!inputToken || !outputToken) {
                            if (!reversed && tradeAmountA.isPositive()) return 'Select a token'
                            if (reversed && tradeAmountB.isPositive()) return 'Select a token'
                        }
                        if (balanceA.isLessThan(tradeAmountA)) return `Insufficient ${inputToken?.symbol} balance`
                        if (balanceB.isLessThan(tradeAmountB)) return `Insufficient ${outputToken?.symbol} balance`
                        return 'Swap'
                    })()}
                </ActionButton>
            </div>
        </form>
    )
}

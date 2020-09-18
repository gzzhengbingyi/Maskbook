import React from 'react'
import {
    makeStyles,
    Theme,
    createStyles,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Typography,
} from '@material-ui/core'
import { Trade, TradeType } from '@uniswap/sdk'
import { useComputedTrade } from '../uniswap/useComputedTrade'
import BigNumber from 'bignumber.js'
import type { Token } from '../../../web3/types'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: 350,
            margin: theme.spacing(0, 'auto', 2),
        },

        list: {},
        item: {
            paddingTop: 0,
            paddingBottom: 0,
        },
        title: {
            fontSize: 12,
            color: theme.palette.text.secondary,
        },
        content: {
            fontSize: 12,
            color: theme.palette.text.secondary,
        },
    }),
)

export interface UniswapTradeSummaryProps {
    trade: Trade | null
    reversed: boolean
    inputToken: Token
    outputToken: Token
}

export function UniswapTradeSummary(props: UniswapTradeSummaryProps) {
    const { trade, reversed, inputToken, outputToken } = props
    const classes = useStyles()

    const computedTrade = useComputedTrade(trade)

    if (!trade) return null
    if (!computedTrade) return null

    const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
    const sortedTokens = [inputToken, outputToken].sort(() => (reversed ? -1 : 1))

    const records = [
        trade.outputAmount.greaterThan('0')
            ? {
                  title: 'Price',
                  children: (
                      <Typography className={classes.title}>
                          {trade.inputAmount.divide(trade.outputAmount).toSignificant(6)} {sortedTokens[0].symbol}{' '}
                          {' per '}
                          {sortedTokens[1].symbol}
                      </Typography>
                  ),
              }
            : null,
        isExactIn
            ? {
                  title: 'Minimum received',
                  children: (
                      <Typography className={classes.title}>
                          {computedTrade.minimumReceived?.toSignificant(4)} {sortedTokens[0].symbol}
                      </Typography>
                  ),
              }
            : null,
        !isExactIn
            ? {
                  title: 'Maximum sold',
                  children: (
                      <Typography className={classes.title}>
                          {computedTrade.maximumSold?.toSignificant(4)} {sortedTokens[1].symbol}
                      </Typography>
                  ),
              }
            : null,
        {
            title: 'Price Impact',
            children: <Typography className={classes.title}>{computedTrade.priceImpact?.toFixed(2)}%</Typography>,
        },
        {
            title: 'Liquidity Provider Fee',
            children: (
                <Typography className={classes.title}>
                    {computedTrade.fee?.toSignificant(6)} {sortedTokens[0].symbol}
                </Typography>
            ),
        },
    ] as {
        title: string
        tip?: string
        children?: React.ReactNode
    }[]
    return (
        <Paper className={classes.root} variant="outlined">
            <List className={classes.list} component="ul">
                {records.filter(Boolean).map((record) => (
                    <ListItem className={classes.item} key={record.title}>
                        <ListItemText primaryTypographyProps={{ className: classes.title }} primary={record.title} />
                        <ListItemSecondaryAction className={classes.content}>{record.children}</ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
        </Paper>
    )
}

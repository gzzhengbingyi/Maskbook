import React from 'react'
import type { Trade } from '@uniswap/sdk'
import { Box, Breadcrumbs, Typography, makeStyles, createStyles, Theme, Paper } from '@material-ui/core'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import { TokenIcon } from '../../../extension/options-page/DashboardComponents/TokenIcon'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            boxSizing: 'border-box',
            width: 320,
            padding: theme.spacing(1.5, 2),
            margin: theme.spacing(0, 'auto', 2),
        },
        list: {
            alignItems: 'end',
            justifyContent: 'center',
        },
        item: {
            display: 'flex',
        },
        name: {
            fontSize: 12,
            marginLeft: theme.spacing(1),
        },
    }),
)

export interface UniswapTradeRouteProps {
    trade: Trade | null
}

export function UniswapTradeRoute(props: UniswapTradeRouteProps) {
    const classes = useStyles()

    const path = props.trade?.route.path
    if (!path || path.length <= 2) return null
    return (
        <Paper className={classes.root} variant="outlined">
            <Breadcrumbs
                classes={{ ol: classes.list, li: classes.item }}
                separator={<NavigateNextIcon fontSize="small" />}>
                {path.map((token, i) => (
                    <Box display="inline-flex" alignItems="center">
                        <TokenIcon address={token.address} name={token.name} />
                        <Typography className={classes.name}>{token.symbol ?? token.name}</Typography>
                    </Box>
                ))}
            </Breadcrumbs>
        </Paper>
    )
}

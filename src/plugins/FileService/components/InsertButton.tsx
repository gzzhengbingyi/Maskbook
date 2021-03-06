import { ButtonBase, makeStyles } from '@material-ui/core'
import React from 'react'

const useStyles = makeStyles({
    root: {
        background: '#2CA4EF',
        borderRadius: 26,
        marginTop: 24,
        fontSize: 16,
        lineHeight: 2.5,
        paddingLeft: 35,
        paddingRight: 35,
        color: '#fff',
    },
    disabled: {
        background: '#9ED2F7',
    },
})

interface Props {
    onClick?(): void
    disabled?: boolean
}

export const InsertButton: React.FC<Props> = ({ onClick, disabled, children }) => {
    const classes = useStyles()
    return <ButtonBase classes={classes} onClick={onClick} disabled={disabled} children={children} />
}

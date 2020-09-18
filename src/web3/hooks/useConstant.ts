import { useMemo } from 'react'
import { ChainId } from '../types'
import { CONSTANTS, getConstant, getAllConstants } from '../constants'
import { useChainId } from './useChainId'

export function useConstant(key: keyof typeof CONSTANTS) {
    const chainId = useChainId()
    return useMemo(() => getConstant(key, chainId), [chainId])
}

export function useAllConstants() {
    const chainId = useChainId()
    return useMemo(() => getAllConstants(chainId), [chainId])
}

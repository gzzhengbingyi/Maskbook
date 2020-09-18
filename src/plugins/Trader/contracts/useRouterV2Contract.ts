import type { AbiItem } from 'web3-utils'
import RouterV2ABI from '../../../contracts/uniswap-v2-router/RouterV2.json'
import type { RouterV2 } from '../../../contracts/uniswap-v2-router/RouterV2'
import { useContract } from '../../../web3/hooks/useContract'

export function useRouterV2Contract(address: string) {
    return useContract<RouterV2>(address, RouterV2ABI as AbiItem[]) as RouterV2
}

import { useAsync } from 'react-use'
import { useAccount } from './useAccount'
import { useERC20TokenContract } from './useContract'
import { Token, EthereumTokenType } from '../types'

function resolveSettleResult<T>(result: PromiseSettledResult<T>, fallback: T) {
    return result.status === 'fulfilled' ? result.value : fallback
}

export function useToken(type: EthereumTokenType, address: string) {
    const account = useAccount()
    const erc20Contract = useERC20TokenContract(address)

    return useAsync(async () => {
        if (!account) return null
        if (!address) return null

        // Ether
        if (type === EthereumTokenType.Ether) {
            return {
                address,
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
            } as Token
        }

        // ERC20
        if (type === EthereumTokenType.ERC20) {
            if (!erc20Contract) return null
            const [name, symbol, decimals] = await Promise.allSettled([
                erc20Contract.methods.name().call(),
                erc20Contract.methods.symbol().call(),
                erc20Contract.methods.decimals().call(),
            ])
            return {
                address,
                name: resolveSettleResult(name, ''),
                symbol: resolveSettleResult(symbol, ''),
                decimals: Number.parseInt(resolveSettleResult(decimals, '0')),
            } as Token
        }

        // TODO:
        // ERC721
        return null
    }, [account, type, address])
}

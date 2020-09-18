import { useAsync } from 'react-use'
import { useERC20TokenContract } from './useERC20TokenContract'
import { Token, EthereumTokenType } from '../types'
import { useChainId } from './useChainId'

function resolveSettleResult<T>(result: PromiseSettledResult<T>, fallback: T) {
    return result.status === 'fulfilled' ? result.value : fallback
}

export function useToken(type: EthereumTokenType, token: PartialRequired<Token, 'address'>) {
    const chainId = useChainId()
    const erc20Contract = useERC20TokenContract(token.address)

    return useAsync(async () => {
        if (!token.address) return

        // Ether
        if (type === EthereumTokenType.Ether)
            return {
                address: token.address,
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
            } as Token

        // ERC20
        if (type === EthereumTokenType.ERC20) {
            if (!erc20Contract) return
            const [name_, symbol_, decimals_] = await Promise.allSettled([
                erc20Contract.methods.name().call(),
                erc20Contract.methods.symbol().call(),
                erc20Contract.methods.decimals().call(),
            ])
            return {
                chainId: token.chainId ?? chainId,
                address: token.address,
                name: resolveSettleResult(name_, token.name ?? ''),
                symbol: resolveSettleResult(symbol_, token.symbol ?? ''),
                decimals: Number.parseInt(resolveSettleResult(decimals_, String(token.decimals ?? 0))),
            } as Token
        }

        // TODO:
        // ERC721
        return
    }, [chainId, type, token.address, erc20Contract])
}

import { useAsync } from 'react-use'
import { useAccount } from './useAccount'
import { useERC20TokenContract } from './useContract'
import { Token, EthereumTokenType } from '../types'

function resolveSettleResult<T>(result: PromiseSettledResult<T>, fallback: T) {
    return result.status === 'fulfilled' ? result.value : fallback
}

export function useToken(type: EthereumTokenType, token: Partial<Token> & { address: string }) {
    const account = useAccount()
    const erc20Contract = useERC20TokenContract(token.address)

    return useAsync(async () => {
        if (!account) return
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
                address: token.address,
                name: resolveSettleResult(name_, token.name ?? ''),
                symbol: resolveSettleResult(symbol_, token.symbol ?? ''),
                decimals: Number.parseInt(resolveSettleResult(decimals_, String(token.decimals ?? 0))),
            } as Token
        }

        // TODO:
        // ERC721
        return
    }, [account, type, token.address])
}

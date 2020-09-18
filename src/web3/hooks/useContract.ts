import { useMemo } from 'react'
import { EthereumAddress } from 'wallet.ts'
import type { Contract } from 'web3-eth-contract'
import type { TransactionConfig } from 'web3-core'
import type { AbiItem, AbiOutput } from 'web3-utils'
import Services from '../../extension/service'
import { useAccount } from './useAccount'
import { web3 } from '../web3'
import { iteratorToPromiEvent } from '../../utils/promiEvent'

const decodeHexString = (outputs: AbiOutput[], hex: string) => {
    if (outputs.length === 1) return web3.eth.abi.decodeParameter(outputs[0].type, hex)
    if (outputs.length > 1)
        return web3.eth.abi.decodeParameters(
            outputs.map((x) => x.type),
            hex,
        )
    return
}

/**
 * Create a contract which will forward its all transactions to the
 * EthereumService in the background page and automaticallly decoding the result
 * @param address
 * @param ABI
 */
export function useContract<T extends Contract>(address: string, ABI: AbiItem[]) {
    const account = useAccount()
    return useMemo(() => {
        // no a valid contract address
        if (!EthereumAddress.isValid(address)) return null

        const contract = new web3.eth.Contract(ABI, address) as T

        return Object.assign(contract, {
            methods: new Proxy(contract.methods, {
                get(target, name) {
                    const method = Reflect.get(target, name)
                    const methodABI = contract.options.jsonInterface.find(
                        (x) => x.type === 'function' && x.name === name,
                    )
                    return (...args: any[]) => {
                        const cached = method(...args)
                        return {
                            async call(config: TransactionConfig) {
                                const result = await Services.Ethereum.callTransaction(account, {
                                    to: contract.options.address,
                                    data: cached.encodeABI(),
                                    ...config,
                                })

                                console.log('DEBUG: call')
                                console.log({
                                    name,
                                    config,
                                    result,
                                })

                                return decodeHexString(methodABI ? methodABI.outputs ?? [] : [], result)
                            },
                            send(config: TransactionConfig) {
                                if (!account) throw new Error('cannot find account')
                                console.log('DEUBG: send tx')
                                console.log({
                                    account,
                                    name,
                                    config,
                                })
                                return iteratorToPromiEvent(
                                    Services.Ethereum.sendTransaction(account, {
                                        to: contract.options.address,
                                        data: cached.encodeABI(),
                                        ...config,
                                    }),
                                )
                            },
                        }
                    }
                },
            }),
        }) as T
    }, [address, account, ABI])
}

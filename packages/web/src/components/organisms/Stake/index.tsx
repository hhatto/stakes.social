import React, { useCallback, useState, useEffect, ChangeEvent } from 'react'
import { useProvider } from 'src/fixtures/wallet/hooks'
import { balanceOf } from 'src/fixtures/dev-kit/client'
import { useStake, useAPY } from 'src/fixtures/dev-kit/hooks'
import { toNaturalNumber, whenDefined, whenDefinedAll } from 'src/fixtures/utility'
import { TransactForm } from 'src/components/molecules/TransactForm'

interface Props {
  className?: string
  title?: string
  propertyAddress: string
}

export const Stake = ({ className, title, propertyAddress }: Props) => {
  const [stakeAmount, setStakeAmount] = useState<string>('')
  const [estimatedStakingAPY, setEstimatedStakingAPY] = useState<string>('')
  const { web3, accountAddress } = useProvider()
  const { stake } = useStake()
  const { apy } = useAPY()
  const stakeFor = useCallback(
    (amount: string) => {
      stake(propertyAddress, amount)
    },
    [stake, propertyAddress]
  )
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStakeAmount(event.target.value)
  }
  const onClickMax = () =>
    whenDefinedAll([web3, accountAddress], ([libWeb3, account]) =>
      balanceOf(libWeb3, account)
        .then(async x => toNaturalNumber(x))
        .then(x => setStakeAmount(x.toFixed()))
    )

  useEffect(() => {
    const estimate = whenDefined(apy, x => x.times(stakeAmount || 0).div(100))
    setEstimatedStakingAPY(estimate ? estimate.dp(5).toFixed() : '0')
  }, [apy, stakeAmount, setEstimatedStakingAPY])

  return (
    <TransactForm
      className={className}
      title={title}
      id="stake"
      enterButton="Stake"
      value={stakeAmount}
      onChange={onChange}
      onSearch={stakeFor}
      suffix="DEV"
      onClickMax={onClickMax}
      estimateTitle="Estimated Annual Reward"
      estimatedValue={<p>{estimatedStakingAPY || 0} DEV</p>}
    ></TransactForm>
  )
}
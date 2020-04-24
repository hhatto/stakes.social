import React, { useMemo } from 'react'
import Link from 'next/link'
import { Card, Row, Col, Statistic } from 'antd'
import { useGetTotalRewardsAmount, useAssetStrength } from 'src/fixtures/dev-kit/hooks'
import { truncate } from 'src/fixtures/utility/string'
import { useGetPropertyAuthenticationQuery } from '@dev/graphql'
import { CircleGraph } from 'src/components/atoms/CircleGraph'

interface Props {
  propertyAddress: string
}

const AssetStrengthBase = ({ assetStrength }: { assetStrength: number }) => (
  <div>
    <span>{Math.floor(assetStrength * 100)}% of total market</span>
    <div style={{ padding: '14px 0 14px 32px' }}>
      <CircleGraph size={81} percentage={assetStrength} />
    </div>
  </div>
)

const AssetStrength = ({ metrics, market }: { metrics: string; market: string }) => {
  const { assetStrength: maybeAssetStrength } = useAssetStrength(metrics, market)
  const assetStrength = useMemo(() => maybeAssetStrength || 0, [maybeAssetStrength])
  return <AssetStrengthBase assetStrength={assetStrength} />
}

const AssetStrengthWithoutData = () => {
  return <AssetStrengthBase assetStrength={0} />
}

export const PropertyCard = ({ propertyAddress }: Props) => {
  const { totalRewardsAmount } = useGetTotalRewardsAmount(propertyAddress)
  const { data } = useGetPropertyAuthenticationQuery({ variables: { propertyAddress } })
  const includeAssets = useMemo(
    () => data && truncate(data.property_authentication.map(e => e.authentication_id).join(', '), 17),
    [data]
  )
  const metrics = useMemo(() => data?.property_authentication[0]?.metrics, [data])
  const market = useMemo(() => data?.property_authentication[0]?.market, [data])
  const averageInterestRate = 0.15

  return (
    <Link href={'/[propertyAddress]'} as={`/${propertyAddress}`}>
      <Card style={{ margin: '0 0 54px 0', maxWidth: '1048px', maxHeight: '174px' }}>
        <Row>
          <Col span={12}>
            <div>{propertyAddress}</div>
            <div style={{ fontSize: '36px', lineHeight: '48px', margin: '36px 0 48px 0' }}>{includeAssets}</div>
          </Col>
          <Col span={4}>
            <Statistic
              title="Total Rewards"
              value={totalRewardsAmount && totalRewardsAmount.dp(1).toNumber()}
              valueStyle={{ fontSize: '36px', lineHeight: '48px', margin: '36px 0 0 0' }}
              suffix="DEV"
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="Ararage Interest Rate"
              value={averageInterestRate * 100}
              valueStyle={{ fontSize: '36px', lineHeight: '48px', margin: '36px 0 48px 0' }}
              suffix="%"
            />
          </Col>
          <Col span={4}>
            {metrics && market ? <AssetStrength metrics={metrics} market={market} /> : <AssetStrengthWithoutData />}
          </Col>
        </Row>
      </Card>
    </Link>
  )
}
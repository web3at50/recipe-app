import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'PlateWise - AI Recipe Manager for UK Cooks'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          backgroundImage: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            padding: '80px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: '#1f2937',
              textAlign: 'center',
            }}
          >
            PlateWise
          </div>
          <div
            style={{
              fontSize: 36,
              color: '#4b5563',
              textAlign: 'center',
              maxWidth: '800px',
            }}
          >
            AI Recipe Manager for UK Cooks
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#f97316',
              fontWeight: 'bold',
              marginTop: '16px',
            }}
          >
            £9.99 Lifetime • No Subscription
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

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
          background: 'linear-gradient(135deg, #fff5eb 0%, #ffedd5 50%, #fed7aa 100%)',
          position: 'relative',
        }}
      >
        {/* Decorative circles in background */}
        <div
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(249, 115, 22, 0.1)',
            top: '-100px',
            right: '-100px',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(251, 146, 60, 0.08)',
            bottom: '-80px',
            left: '-80px',
            display: 'flex',
          }}
        />

        {/* Main content container */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            padding: '60px 80px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left side - Branding */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '40px',
              width: '35%',
            }}
          >
            {/* Logo placeholder - simplified visual */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(249, 115, 22, 0.3)',
                  fontSize: '48px',
                }}
              >
                🍳
              </div>
            </div>

            {/* Feature icons */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '24px',
                }}
              >
                <span style={{ fontSize: '32px' }}>✨</span>
                <span style={{ color: '#78716c', fontWeight: 500 }}>AI Powered</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '24px',
                }}
              >
                <span style={{ fontSize: '32px' }}>🇬🇧</span>
                <span style={{ color: '#78716c', fontWeight: 500 }}>UK Focused</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '24px',
                }}
              >
                <span style={{ fontSize: '32px' }}>⚡</span>
                <span style={{ color: '#78716c', fontWeight: 500 }}>30 Seconds</span>
              </div>
            </div>
          </div>

          {/* Right side - Main message */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              width: '60%',
              backgroundColor: 'white',
              padding: '50px',
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(249, 115, 22, 0.1)',
            }}
          >
            {/* Brand name */}
            <div
              style={{
                fontSize: '64px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
                backgroundClip: 'text',
                color: 'transparent',
                display: 'flex',
                letterSpacing: '-0.02em',
              }}
            >
              PlateWise
            </div>

            {/* Tagline */}
            <div
              style={{
                fontSize: '32px',
                color: '#292524',
                fontWeight: 600,
                lineHeight: 1.3,
                display: 'flex',
              }}
            >
              AI Recipe Manager for UK Cooks
            </div>

            {/* Divider */}
            <div
              style={{
                height: '2px',
                background: 'linear-gradient(90deg, #f97316 0%, transparent 100%)',
                width: '100%',
                display: 'flex',
              }}
            />

            {/* Pricing */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#f97316',
                  display: 'flex',
                }}
              >
                £9.99 Lifetime
              </div>
              <div
                style={{
                  fontSize: '24px',
                  color: '#78716c',
                  display: 'flex',
                }}
              >
                No Subscription • 40 Free Recipes
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

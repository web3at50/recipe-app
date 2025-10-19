import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'PlateWise - AI Recipe Manager for UK Cooks'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

/**
 * VARIATION 3: "BOLD PRICING HERO" - CUSTOM VERSION
 *
 * Visual Description:
 * - Clean pricing message: "£9.99 No Subscription"
 * - Top: PlateWise logo (PW in circles) + wordmark with orange P/W
 * - Center: Simple, positive pricing without comparison
 * - Bottom: Key value props in badge style
 * - High-contrast orange and white color scheme
 * - Gradient background: cream to orange
 *
 * Custom Changes:
 * - Real PW logo styling (not emoji)
 * - PlateWise wordmark with orange P and W
 * - Simplified pricing: "£9.99 No Subscription" (no comparison)
 * - Clean, positive messaging
 *
 * Design Goal: Value-focused, professional, scroll-stopping
 * Best For: Performance marketing, paid social ads, clear value proposition
 */

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
          background: 'linear-gradient(160deg, #FAEBD7 0%, #FFE4C4 30%, #FFB366 100%)',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            top: '-200px',
            left: '-200px',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'rgba(247, 147, 30, 0.15)',
            bottom: '-150px',
            right: '-150px',
            display: 'flex',
          }}
        />

        {/* Logo + Wordmark at top */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          {/* PW Logo - stylized with concentric circles */}
          <div
            style={{
              position: 'relative',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Outer orange circle */}
            <div
              style={{
                position: 'absolute',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: '4px solid #F7931E',
                display: 'flex',
              }}
            />
            {/* Inner gray circle */}
            <div
              style={{
                position: 'absolute',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: '3px solid rgba(180, 180, 180, 0.4)',
                display: 'flex',
              }}
            />
            {/* White background */}
            <div
              style={{
                position: 'absolute',
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(247, 147, 30, 0.3)',
              }}
            >
              {/* PW text */}
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  display: 'flex',
                  letterSpacing: '-0.05em',
                }}
              >
                PW
              </div>
            </div>
          </div>

          {/* PlateWise wordmark with orange P and W */}
          <div
            style={{
              fontSize: '56px',
              fontWeight: 700,
              display: 'flex',
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              letterSpacing: '-0.02em',
            }}
          >
            <span style={{ color: '#F7931E' }}>P</span>
            <span style={{ color: 'white' }}>late</span>
            <span style={{ color: '#F7931E' }}>W</span>
            <span style={{ color: 'white' }}>ise</span>
          </div>
        </div>

        {/* Main pricing hero container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            padding: '60px 80px',
            borderRadius: '32px',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.2)',
            border: '4px solid #F7931E',
            gap: '32px',
            maxWidth: '1000px',
          }}
        >
          {/* Hero pricing - simplified */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                fontSize: '80px',
                fontWeight: 700,
                color: '#4CAF50',
                display: 'flex',
                lineHeight: 1,
              }}
            >
              £9.99
            </div>
            <div
              style={{
                fontSize: '42px',
                fontWeight: 600,
                color: '#1A1A1A',
                display: 'flex',
                lineHeight: 1,
              }}
            >
              No Subscription
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: '3px',
              background: '#F7931E',
              width: '60%',
              display: 'flex',
            }}
          />

          {/* Subtitle */}
          <div
            style={{
              fontSize: '32px',
              color: '#1A1A1A',
              fontWeight: 600,
              textAlign: 'center',
              display: 'flex',
            }}
          >
            AI Recipe Manager for UK Cooks
          </div>

          {/* Value prop badges */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#F7931E',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '100px',
                fontSize: '22px',
                fontWeight: 600,
              }}
            >
              <span>🇬🇧</span>
              <span>British Measurements</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#F7931E',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '100px',
                fontSize: '22px',
                fontWeight: 600,
              }}
            >
              <span>⚡</span>
              <span>30 Seconds</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '100px',
                fontSize: '22px',
                fontWeight: 600,
              }}
            >
              <span>✓</span>
              <span>40 Free Recipes</span>
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

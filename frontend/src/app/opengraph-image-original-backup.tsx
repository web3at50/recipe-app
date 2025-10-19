import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'PlateWise - AI Recipe Manager for UK Cooks'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

/**
 * VARIATION 3: "BOLD PRICING HERO"
 *
 * Visual Description:
 * - Pricing-first approach with large, attention-grabbing comparison
 * - Top: PlateWise logo and wordmark
 * - Center: Massive "£9.99 Once. Not £84/Year." hero text
 * - Visual strikethrough on £84/Year for emphasis
 * - Bottom: Key value props in badge style
 * - High-contrast orange and white color scheme
 * - Gradient background: cream to orange
 *
 * Design Goal: Value-conscious, direct response, scroll-stopping
 * Best For: Performance marketing, paid social ads, price-sensitive audience
 * Text Coverage: ~25% (maximum allowed, but highly impactful)
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
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(247, 147, 30, 0.3)',
              fontSize: '42px',
            }}
          >
            🍳
          </div>
          <div
            style={{
              fontSize: '56px',
              fontWeight: 700,
              color: 'white',
              display: 'flex',
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              letterSpacing: '-0.02em',
            }}
          >
            PlateWise
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
          {/* Hero pricing comparison */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                fontSize: '72px',
                fontWeight: 700,
                color: '#4CAF50',
                display: 'flex',
                lineHeight: 1,
              }}
            >
              £9.99 Once.
            </div>
            <div
              style={{
                fontSize: '52px',
                fontWeight: 700,
                color: '#737373',
                display: 'flex',
                position: 'relative',
                lineHeight: 1,
              }}
            >
              <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>Not £84/Year.</span>
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

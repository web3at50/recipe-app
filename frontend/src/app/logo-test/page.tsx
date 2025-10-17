import Image from "next/image"

export default function LogoTestPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Logo Style Comparison</h1>
          <p className="text-muted-foreground">
            Compare different logo styling options - Pick your favorite!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Option 1: Colored Border/Ring */}
          <div className="border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Option 1: Colored Border</h3>
            <div className="bg-muted rounded-lg p-4 flex items-center gap-3">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="PlateWise Logo"
                  width={40}
                  height={40}
                  className="rounded-full ring-2 ring-orange-500 ring-offset-2 ring-offset-background"
                />
              </div>
              <span className="text-2xl font-bold">Plate Wise</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Colored ring around logo for emphasis
            </p>
          </div>

          {/* Option 2: P & W in Color */}
          <div className="border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Option 2: Accent Letters</h3>
            <div className="bg-muted rounded-lg p-4 flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="PlateWise Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-2xl font-bold">
                <span className="text-orange-500">P</span>late{" "}
                <span className="text-orange-500">W</span>ise
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              P & W in accent color (orange)
            </p>
          </div>

          {/* Option 3: Gradient Text */}
          <div className="border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Option 3: Gradient Text</h3>
            <div className="bg-muted rounded-lg p-4 flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="PlateWise Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
                Plate Wise
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Gradient effect on text
            </p>
          </div>

          {/* Option 4: Logo Glow/Shadow */}
          <div className="border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Option 4: Logo Glow</h3>
            <div className="bg-muted rounded-lg p-4 flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="PlateWise Logo"
                width={40}
                height={40}
                className="rounded-full shadow-lg shadow-orange-500/50"
              />
              <span className="text-2xl font-bold">Plate Wise</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Glowing shadow around logo
            </p>
          </div>

          {/* Option 5: Current Simple */}
          <div className="border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Option 5: Current (Simple)</h3>
            <div className="bg-muted rounded-lg p-4 flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="PlateWise Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-2xl font-bold">Plate Wise</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Current simple version
            </p>
          </div>

          {/* Option 6: Combo - Border + Accent Letters */}
          <div className="border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Option 6: Combo Style</h3>
            <div className="bg-muted rounded-lg p-4 flex items-center gap-3">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="PlateWise Logo"
                  width={40}
                  height={40}
                  className="rounded-full ring-2 ring-orange-500 ring-offset-2 ring-offset-background"
                />
              </div>
              <span className="text-2xl font-bold">
                <span className="text-orange-500">P</span>late{" "}
                <span className="text-orange-500">W</span>ise
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Border + accent letters combined
            </p>
          </div>

        </div>

        {/* Dark Mode Preview Section */}
        <div className="space-y-4 pt-8 border-t">
          <h2 className="text-2xl font-bold">Dark Mode Preview</h2>
          <p className="text-muted-foreground">How each option looks in dark mode:</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Dark Mode Option 1 */}
            <div className="bg-black rounded-lg p-4 space-y-3">
              <p className="text-white text-sm font-medium">Option 1</p>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Image
                    src="/logo.png"
                    alt="PlateWise Logo"
                    width={40}
                    height={40}
                    className="rounded-full ring-2 ring-orange-500 ring-offset-2 ring-offset-black"
                  />
                </div>
                <span className="text-2xl font-bold text-white">Plate Wise</span>
              </div>
            </div>

            {/* Dark Mode Option 2 */}
            <div className="bg-black rounded-lg p-4 space-y-3">
              <p className="text-white text-sm font-medium">Option 2</p>
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="PlateWise Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="text-2xl font-bold text-white">
                  <span className="text-orange-500">P</span>late{" "}
                  <span className="text-orange-500">W</span>ise
                </span>
              </div>
            </div>

            {/* Dark Mode Option 3 */}
            <div className="bg-black rounded-lg p-4 space-y-3">
              <p className="text-white text-sm font-medium">Option 3</p>
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="PlateWise Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
                  Plate Wise
                </span>
              </div>
            </div>

            {/* Dark Mode Option 4 */}
            <div className="bg-black rounded-lg p-4 space-y-3">
              <p className="text-white text-sm font-medium">Option 4</p>
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="PlateWise Logo"
                  width={40}
                  height={40}
                  className="rounded-full shadow-lg shadow-orange-500/50"
                />
                <span className="text-2xl font-bold text-white">Plate Wise</span>
              </div>
            </div>

            {/* Dark Mode Option 5 */}
            <div className="bg-black rounded-lg p-4 space-y-3">
              <p className="text-white text-sm font-medium">Option 5</p>
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="PlateWise Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="text-2xl font-bold text-white">Plate Wise</span>
              </div>
            </div>

            {/* Dark Mode Option 6 */}
            <div className="bg-black rounded-lg p-4 space-y-3">
              <p className="text-white text-sm font-medium">Option 6</p>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Image
                    src="/logo.png"
                    alt="PlateWise Logo"
                    width={40}
                    height={40}
                    className="rounded-full ring-2 ring-orange-500 ring-offset-2 ring-offset-black"
                  />
                </div>
                <span className="text-2xl font-bold text-white">
                  <span className="text-orange-500">P</span>late{" "}
                  <span className="text-orange-500">W</span>ise
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center space-y-2">
          <p className="font-semibold">Pick Your Favorite!</p>
          <p className="text-sm text-muted-foreground">
            Let me know which option you prefer (1-6) and I&apos;ll apply it to the header
          </p>
        </div>
      </div>
    </div>
  )
}

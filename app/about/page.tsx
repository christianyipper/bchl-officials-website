export default function About() {
  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-[zuume] text-8xl font-bold italic text-white mb-8">
            About
          </h1>

          <div className="bg-bchl-navy p-8 rounded-lg mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              The BCHL Officials tracking platform is dedicated to providing transparent and comprehensive
              statistics for all officiating staff working in the British Columbia Hockey League.
            </p>
            <p className="text-gray-400 leading-relaxed">
              We track game assignments, performance metrics, and career progression to support the
              development and recognition of our dedicated officials.
            </p>
          </div>

          <div className="bg-bchl-navy p-8 rounded-lg mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">What We Track</h2>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                <span>Game assignments for both referees and linespersons</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                <span>Career statistics and game history</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                <span>Season-by-season performance data</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                <span>Official advancement to professional leagues (AHL, ECHL, PWHL)</span>
              </li>
            </ul>
          </div>

          <div className="bg-bchl-navy p-8 rounded-lg">
            <h2 className="text-3xl font-bold text-white mb-4">The Original 57</h2>
            <p className="text-gray-400 leading-relaxed">
              We recognize and honor "The Original 57" - the officials who have been with the BCHL
              since the beginning of our tracking system. These dedicated individuals form the
              foundation of BCHL officiating excellence.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

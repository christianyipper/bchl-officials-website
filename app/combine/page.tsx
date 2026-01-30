export default function Combine() {
  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-[zuume] text-8xl font-bold italic text-white mb-8">
            Combine
          </h1>

          <div className="bg-bchl-navy p-8 rounded-lg mb-8 text-center">
            <div className="text-6xl mb-4">🏒</div>
            <h2 className="text-3xl font-bold text-white mb-4">Coming Soon</h2>
            <p className="text-gray-400 leading-relaxed">
              The Officials Combine section is currently under development. Check back soon for
              performance metrics, assessment results, and combine statistics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-bchl-navy p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-3">Planned Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span>Skating assessments</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span>Rule knowledge testing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span>Physical fitness metrics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span>On-ice performance evaluations</span>
                </li>
              </ul>
            </div>

            <div className="bg-bchl-navy p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-3">Assessment Areas</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span>Speed and agility</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span>Positioning and awareness</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span>Communication skills</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span>Decision making under pressure</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

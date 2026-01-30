export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="font-[zuume] text-9xl font-bold italic text-white mb-4">
            BCHL Officials
          </h1>
          <p className="text-2xl text-gray-400 font-bold uppercase tracking-wider">
            Tracking Excellence on the Ice
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-20">
          <div className="bg-bchl-navy p-8 rounded-lg hover:bg-orange-600 transition-colors duration-300 group cursor-pointer">
            <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-white">
              Officiating Team
            </h2>
            <p className="text-gray-400 group-hover:text-white">
              Browse our roster of BCHL officials and track their game statistics throughout the season.
            </p>
          </div>

          <div className="bg-bchl-navy p-8 rounded-lg hover:bg-orange-600 transition-colors duration-300 group cursor-pointer">
            <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-white">
              Combine Results
            </h2>
            <p className="text-gray-400 group-hover:text-white">
              View performance metrics and results from the officials combine assessments.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-bchl-navy p-8 rounded-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">About This Project</h3>
            <p className="text-gray-400 leading-relaxed">
              This platform provides comprehensive tracking and statistics for BCHL officiating staff.
              Monitor game assignments, performance metrics, and career progression of our dedicated officials.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

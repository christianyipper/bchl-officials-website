export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="font-[zuume] text-8xl font-bold italic text-white">
            BCHL Officiating
          </h1>
          <p className=" text-white font-bold uppercase tracking-wider">
            Tracking Excellence on the Ice
          </p>
        </div>
        <div className="flex flex-row gap-4">
          <a href="/team" className="px-4 py-2 font-black uppercase text-sm transition-colors duration-300
          bg-white text-black hover:bg-orange-600 hover:text-white
          ">Learn More</a>
          <a href="/team" className="px-4 py-2 font-black uppercase text-sm transition-colors duration-300
          bg-transparent text-white border-2 border-white hover:bg-orange-600 hover:border-orange-600
          ">Our Team</a>
        </div>
      </div>
    </main>
  )
}

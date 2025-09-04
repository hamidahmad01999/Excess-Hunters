import React from 'react'
import WelcomeBanner from './WelcomeBanner'
import HomeSections from './HomeSections'

function Home() {
  return (
    <div>
        <div className="bg-gray-50 min-h-screen">
              <WelcomeBanner />
              <HomeSections/>
        </div>
    </div>
  )
}

export default Home
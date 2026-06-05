import Header from '../components/Header.jsx'
import Hero from '../components/Hero.jsx'
import TechStrip from '../components/TechStrip.jsx'
import Software from '../components/Software.jsx'
import SDK from '../components/SDK.jsx'
import Hardware from '../components/Hardware.jsx'
import Manifesto from '../components/Manifesto.jsx'
import Stats from '../components/Stats.jsx'
import Community from '../components/Community.jsx'
import GetInTouch from '../components/GetInTouch.jsx'
import Footer from '../components/Footer.jsx'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TechStrip />
        <Software />
        <SDK />
        <Hardware />
        <Manifesto />
        <Stats />
        <Community />
        <GetInTouch />
      </main>
      <Footer />
    </>
  )
}

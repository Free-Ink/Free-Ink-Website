import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import TechStrip from './components/TechStrip.jsx'
import Software from './components/Software.jsx'
import Hardware from './components/Hardware.jsx'
import Manifesto from './components/Manifesto.jsx'
import Stats from './components/Stats.jsx'
import Community from './components/Community.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <div className="isolate min-h-dvh bg-stone-50 text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-100">
      <Header />
      <main>
        <Hero />
        <TechStrip />
        <Software />
        <Hardware />
        <Manifesto />
        <Stats />
        <Community />
      </main>
      <Footer />
    </div>
  )
}

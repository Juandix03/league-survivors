import { useCallback, useState } from 'react'
import './App.css'
import { ChampionRoster } from './components/ChampionRoster'
import { GameCanvas } from './components/GameCanvas'
import { getSelectedChampion } from './game/meta/championUnlock'

type AppScreen = 'roster' | 'run'

function App() {
  const [screen, setScreen] = useState<AppScreen>('roster')
  const [runKey, setRunKey] = useState(0)
  const [runChampionId, setRunChampionId] = useState(getSelectedChampion)

  const startRun = useCallback(() => {
    setRunChampionId(getSelectedChampion())
    setRunKey((k) => k + 1)
    setScreen('run')
  }, [])

  const backToRoster = useCallback(() => {
    setScreen('roster')
  }, [])

  const retryRun = useCallback(() => {
    setRunChampionId(getSelectedChampion())
    setRunKey((k) => k + 1)
  }, [])

  return (
    <div className={`app-root${screen === 'run' ? ' app-root--run' : ''}`}>
      {screen === 'roster' ? (
        <header className="top-bar">
          <p className="kicker">Bullet heaven</p>
          <h1>LEAGUE SURVIVORS</h1>
        </header>
      ) : null}

      {screen === 'roster' ? <ChampionRoster onStartRun={startRun} /> : null}

      {screen === 'run' ? (
        <GameCanvas
          key={runKey}
          championId={runChampionId}
          onBackToRoster={backToRoster}
          onRetry={retryRun}
        />
      ) : null}
    </div>
  )
}

export default App

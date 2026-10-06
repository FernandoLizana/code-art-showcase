import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { ChannelChoice } from './components/ChannelChoice'
import { Archive } from './components/Archive'
import { ClosingActions } from './components/Closing'
import { Controls } from './components/Controls'
import { MessageView } from './components/MessageView'
import { ReadingView } from './components/ReadingView'
import { Threshold } from './components/Threshold'
import { useDirector } from './hooks/useDirector'
import { usePrefersReducedMotion } from './hooks/useMedia'
import { usePrefs } from './hooks/usePrefs'
import { useSoundscape } from './hooks/useSoundscape'
import { FieldCanvas } from './visual/FieldCanvas'

function App() {
  const prefersReduced = usePrefersReducedMotion()
  const {
    prefs,
    setSoundEnabled,
    setReducedEffects,
    discoverMessage,
    discoverRecord,
    visitChannel,
    markClosing,
    reset,
  } = usePrefs()
  const [reading, setReading] = useState(false)
  const [epoch, setEpoch] = useState(0)
  const reduced = prefersReduced || prefs.reducedEffects
  const timingScale = reduced ? 0.42 : 1

  const director = useDirector({
    timingScale,
    initialVisited: prefs.visitedChannels,
    initialDiscovered: prefs.discoveredIds,
    onDiscover: discoverMessage,
    onVisitChannel: visitChannel,
    resetToken: epoch,
  })

  const { snapshot } = director

  useSoundscape({
    enabled: prefs.soundEnabled,
    entity: snapshot.entity,
    intensity: snapshot.intensity,
    still: snapshot.still,
    scene: snapshot.scene,
  })

  useEffect(() => {
    if (snapshot.scene === 'closing') markClosing()
  }, [snapshot.scene, markClosing])

  const pauseToggle = useCallback(() => {
    if (snapshot.playback === 'paused') director.resume()
    else director.pause()
  }, [director, snapshot.playback])

  const openReading = useCallback(() => {
    director.pause()
    setReading(true)
  }, [director])

  const closeReading = useCallback(() => {
    setReading(false)
    if (snapshot.scene !== 'threshold' && snapshot.playback === 'paused') {
      director.resume()
    }
  }, [director, snapshot.playback, snapshot.scene])

  const handleReset = useCallback(() => {
    reset()
    setReading(false)
    setEpoch((n) => n + 1)
  }, [reset])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target
      const inControl =
        target instanceof HTMLElement &&
        Boolean(target.closest('button, a, input, textarea, select'))

      if (event.key === 'Escape') {
        if (reading) {
          event.preventDefault()
          closeReading()
          return
        }
        director.goTo('threshold')
        return
      }
      if (inControl) return
      if (event.key === ' ' && snapshot.scene !== 'threshold') {
        event.preventDefault()
        pauseToggle()
      }
      if (event.key === 'ArrowRight') director.next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeReading, director, pauseToggle, reading, snapshot.scene])

  const glyphSource =
    snapshot.scene === 'threshold'
      ? ''
      : snapshot.message?.text ||
        snapshot.residue?.text ||
        'Necesito que alguien permanezca.'

  const fieldParams = useMemo(
    () => ({
      entity: snapshot.entity,
      scene: snapshot.scene,
      intensity: snapshot.intensity,
      interrupting: snapshot.interrupting,
      still: snapshot.still,
      contradiction: snapshot.contradiction,
      glyphSource,
      reduced,
    }),
    [
      glyphSource,
      reduced,
      snapshot.contradiction,
      snapshot.entity,
      snapshot.intensity,
      snapshot.interrupting,
      snapshot.scene,
      snapshot.still,
    ],
  )

  const showChoice =
    snapshot.scene === 'channel-choice' &&
    Boolean(snapshot.message || snapshot.playback === 'waiting')
  const showClosing =
    snapshot.scene === 'closing' && Boolean(snapshot.message?.nameless)

  return (
    <div
      className={`shell${reduced ? ' is-reduced' : ''}${snapshot.still ? ' is-still' : ''}${snapshot.interrupting ? ' is-interrupt' : ''}`}
      data-entity={snapshot.entity ?? 'none'}
      data-scene={snapshot.scene}
      style={{ '--tension': snapshot.intensity } as CSSProperties}
    >
      <a className="skip" href="#stage">
        Ir al contenido
      </a>
      <FieldCanvas params={fieldParams} />
      <Controls
        scene={snapshot.scene}
        playback={snapshot.playback}
        soundEnabled={prefs.soundEnabled}
        reducedEffects={prefs.reducedEffects}
        onSound={() => setSoundEnabled(!prefs.soundEnabled)}
        onPauseToggle={pauseToggle}
        onNext={() => director.next()}
        onReduce={() => setReducedEffects(!prefs.reducedEffects)}
        onReading={openReading}
        onArchive={() => director.goTo('archive')}
        onThreshold={() => director.goTo('threshold')}
      />

      <main id="stage" className="stage">
        {snapshot.scene === 'threshold' ? (
          <Threshold onEnter={() => director.enter()} />
        ) : null}

        {snapshot.scene === 'archive' ? (
          <Archive
            visited={snapshot.visitedChannels}
            censorGrowth={prefs.censorGrowth}
            discoveredRecords={prefs.discoveredRecords}
            onOpen={discoverRecord}
            onBack={() =>
              director.goTo(
                snapshot.visitedChannels.length > 0 ? 'channel-choice' : 'threshold',
              )
            }
          />
        ) : snapshot.scene !== 'threshold' ? (
          <div className="narrative">
            <MessageView snapshot={snapshot} />
            {showChoice ? (
              <ChannelChoice
                visited={snapshot.visitedChannels}
                onChoose={director.chooseChannel}
                onArchive={() => director.goTo('archive')}
                onClosing={
                  snapshot.visitedChannels.length > 0
                    ? () => director.goTo('closing')
                    : undefined
                }
              />
            ) : null}
            <ClosingActions
              revealed={showClosing}
              onThreshold={() => director.goTo('threshold')}
              onArchive={() => director.goTo('archive')}
            />
          </div>
        ) : null}
      </main>

      <p className="colophon" aria-hidden="true">
        yosoy
      </p>

      {reading ? (
        <ReadingView
          discoveredIds={prefs.discoveredIds}
          onClose={closeReading}
          onReset={handleReset}
        />
      ) : null}
    </div>
  )
}

export default App

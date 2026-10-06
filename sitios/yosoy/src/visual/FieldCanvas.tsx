import { useEffect, useRef } from 'react'
import type { FieldParams } from './fieldRenderer'
import { FieldRenderer } from './fieldRenderer'

export function FieldCanvas({ params }: { params: FieldParams }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<FieldRenderer | null>(null)
  const paramsRef = useRef(params)

  useEffect(() => {
    paramsRef.current = params
    rendererRef.current?.setParams(params)
  }, [params])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const renderer = new FieldRenderer(canvas, paramsRef.current)
    rendererRef.current = renderer
    renderer.start()
    return () => {
      renderer.dispose()
      rendererRef.current = null
    }
  }, [])

  return <canvas ref={canvasRef} className="field" aria-hidden="true" />
}

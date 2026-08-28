import {
  useEffect,
  useState,
} from 'react'

type Halo = {
  id: number
  x: number
  y: number
}

function ClickHalo() {
  const [
    halos,
    setHalos,
  ] = useState<Halo[]>([])

  useEffect(() => {
    let nextId = 0

    function handlePointerDown(
      event: PointerEvent
    ) {
      const id = nextId++

      const halo: Halo = {
        id,
        x: event.clientX,
        y: event.clientY,
      }

      setHalos(
        (current) => [
          ...current,
          halo,
        ]
      )

      window.setTimeout(() => {
        setHalos(
          (current) =>
            current.filter(
              (item) =>
                item.id !== id
            )
        )
      }, 650)
    }

    window.addEventListener(
      'pointerdown',
      handlePointerDown,
      {
        passive: true,
      }
    )

    return () => {
      window.removeEventListener(
        'pointerdown',
        handlePointerDown
      )
    }
  }, [])

  return (
    <div
      className="click-halo-layer"
      aria-hidden="true"
    >
      {halos.map(
        (halo) => (
          <span
            key={halo.id}
            className="click-halo"
            style={{
              left: halo.x,
              top: halo.y,
            }}
          />
        )
      )}
    </div>
  )
}

export default ClickHalo
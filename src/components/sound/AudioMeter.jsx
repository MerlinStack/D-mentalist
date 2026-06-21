const BAR_COUNT = 20

function barColor(index, level) {
  const zone = index / BAR_COUNT

  // Idle / very quiet — all dim grey
  if (level < 10) {
    return { r: 100, g: 116, b: 139, a: 0.25 }
  }

  // Low — left bars blue-grey
  if (level < 35) {
    const fade = Math.max(0.2, 1 - Math.abs(zone - 0.25) * 1.5)
    return { r: 59, g: 130, b: 246, a: fade * 0.6 }
  }

  // Medium — centre bars blue
  if (level < 65) {
    if (zone < 0.65) {
      return { r: 59, g: 130, b: 246, a: 0.7 }
    }
    return { r: 59, g: 130, b: 246, a: 0.35 }
  }

  // High / clipping — right bars red
  if (zone > 0.7) {
    const intensity = Math.min((level - 65) / 35, 1)
    return { r: 239, g: 68 + Math.round((1 - intensity) * 60), b: 68, a: 0.5 + intensity * 0.3 }
  }
  return { r: 59, g: 130, b: 246, a: 0.55 }
}

export default function AudioMeter({ level }) {
  return (
    <div className="flex items-end justify-center gap-[3px] h-14">
      {Array.from({ length: BAR_COUNT }, (_, i) => {
        const peak = Math.max(
          0.04,
          (level / 100) * (0.35 + 0.65 * (1 - Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2)))
        )
        const c = barColor(i, level)
        return (
          <div
            key={i}
            className="w-2 rounded-sm transition-all duration-[60ms]"
            style={{
              height: `${peak * 100}%`,
              backgroundColor: `rgba(${c.r},${c.g},${c.b},${c.a})`,
            }}
          />
        )
      })}
    </div>
  )
}

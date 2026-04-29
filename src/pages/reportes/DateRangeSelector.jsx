import { Calendar } from 'lucide-react'

const PRESETS = [
  { label: 'Hoy',           dias: 0 },
  { label: 'Últimos 7 días', dias: 7 },
  { label: 'Últimos 30 días', dias: 30 },
  { label: 'Últimos 90 días', dias: 90 },
]

const toIso = (d) => d.toISOString().split('T')[0]

export default function DateRangeSelector({ desde, hasta, onChange }) {
  const setPreset = (dias) => {
    const hastaD = new Date()
    const desdeD = new Date()
    desdeD.setDate(desdeD.getDate() - dias)
    onChange({ desde: toIso(desdeD), hasta: toIso(hastaD) })
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <Calendar size={14} style={{ color: '#6366f1' }} />
        <input
          type="date"
          value={desde}
          onChange={e => onChange({ desde: e.target.value, hasta })}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
        <span className="text-gray-400">→</span>
        <input
          type="date"
          value={hasta}
          onChange={e => onChange({ desde, hasta: e.target.value })}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
      </div>

      <div className="flex gap-1 flex-wrap">
        {PRESETS.map(p => (
          <button key={p.label}
            onClick={() => setPreset(p.dias)}
            className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-slate-400 text-gray-600 transition-colors">
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
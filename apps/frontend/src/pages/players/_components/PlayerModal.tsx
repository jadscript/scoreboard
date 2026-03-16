import { useState } from 'react'
import type { Gender } from '@scoreboard/core/domain/player.entity'
import type { PlayerDto, PlayerFormData } from '../usePlayers'

interface Props {
  editTarget: PlayerDto | null
  onClose: () => void
  onSave: (form: PlayerFormData, id?: string) => Promise<void>
}

const EMPTY_FORM: PlayerFormData = { name: '', email: '', gender: 'male', whatsapp: '', photoUrl: '' }

export function PlayerModal({ editTarget, onClose, onSave }: Props) {
  const [form, setForm] = useState<PlayerFormData>(
    editTarget
      ? {
          name: editTarget.name,
          email: editTarget.email,
          gender: editTarget.gender,
          whatsapp: editTarget.whatsapp,
          photoUrl: editTarget.photoUrl ?? '',
        }
      : EMPTY_FORM,
  )
  const [saving, setSaving] = useState(false)

  function set<K extends keyof PlayerFormData>(key: K, value: PlayerFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(form, editTarget?.id)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-50">
            {editTarget ? 'Editar player' : 'Novo player'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Nome</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="João Silva"
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-sm outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">E-mail</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="jogador@exemplo.com"
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-sm outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">WhatsApp</label>
            <input
              type="tel"
              required
              value={form.whatsapp}
              onChange={(e) => set('whatsapp', e.target.value)}
              placeholder="+55 11 99999-0000"
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-sm outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300">Gênero</label>
            <div className="flex gap-3">
              {(['male', 'female'] as Gender[]).map((g) => (
                <label
                  key={g}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border cursor-pointer text-sm font-medium transition-colors select-none
                    ${form.gender === g
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={() => set('gender', g)}
                    className="sr-only"
                  />
                  {g === 'male' ? 'Masculino' : 'Feminino'}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">
              URL da foto{' '}
              <span className="text-slate-500 font-normal">(opcional)</span>
            </label>
            <input
              type="url"
              value={form.photoUrl}
              onChange={(e) => set('photoUrl', e.target.value)}
              placeholder="https://cdn.exemplo.com/foto.jpg"
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-sm outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando…' : editTarget ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

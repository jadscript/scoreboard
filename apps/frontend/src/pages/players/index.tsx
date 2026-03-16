import { useState } from 'react'
import { usePlayers } from './usePlayers'
import type { PlayerDto, PlayerFormData } from './usePlayers'
import { PlayerList } from './_components/PlayerList'
import { PlayerModal } from './_components/PlayerModal'
import { ConfirmDeleteModal } from './_components/ConfirmDeleteModal'

export function PlayersPage() {
  const { players, loading, create, update, remove } = usePlayers()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<PlayerDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PlayerDto | null>(null)

  function openCreate() {
    setEditTarget(null)
    setModalOpen(true)
  }

  function openEdit(player: PlayerDto) {
    setEditTarget(player)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditTarget(null)
  }

  function requestDelete(player: PlayerDto) {
    setDeleteTarget(player)
  }

  function cancelDelete() {
    setDeleteTarget(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    await remove(deleteTarget.id)
    setDeleteTarget(null)
  }

  async function handleSave(form: PlayerFormData, id?: string) {
    if (id) {
      await update(id, form)
    } else {
      await create(form)
    }
    closeModal()
  }

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-50">Players</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {loading
                ? 'Carregando…'
                : `${players.length} jogador${players.length !== 1 ? 'es' : ''} cadastrado${players.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={openCreate}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Novo player
          </button>
        </div>

        {loading ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center py-16">
            <p className="text-slate-500 text-sm">Carregando players…</p>
          </div>
        ) : (
          <PlayerList
            players={players}
            onEdit={openEdit}
            onDelete={requestDelete}
            onCreateFirst={openCreate}
          />
        )}
      </div>

      {modalOpen && (
        <PlayerModal editTarget={editTarget} onClose={closeModal} onSave={handleSave} />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          playerName={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  )
}

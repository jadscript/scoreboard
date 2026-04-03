export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-none p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-bold text-slate-50">Scoreboard</h1>
          <p className="text-sm text-slate-400">Faça login para continuar</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-sm font-medium text-slate-300">
              Usuário
            </label>
            <input
              id="username"
              type="text"
              placeholder="Digite seu usuário"
              className="bg-slate-900 border border-slate-700 rounded-none px-3 py-2.5 text-slate-100 text-sm outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-slate-300">
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              className="bg-slate-900 border border-slate-700 rounded-none px-3 py-2.5 text-slate-100 text-sm outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
            />
          </div>

          <button
            type="submit"
            className="mt-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-none py-2.5 transition-colors cursor-pointer"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}

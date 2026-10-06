import { useEffect, useMemo, useState } from 'react'

type Product = {
  id: number
  name: string
  category: string
  price: number
  color: string
  icon: string
  tone: string
}

type CartItem = Product & { quantity: number }
type ButtonState = 'idle' | 'adding' | 'added'

const products: Product[] = [
  { id: 1, name: 'Mochila Atlas', category: 'Acessórios', price: 249.9, color: 'Caramelo', icon: '◈', tone: 'from-orange-100 to-amber-200' },
  { id: 2, name: 'Garrafa Térmica', category: 'Casa & bem-estar', price: 139.9, color: 'Verde sálvia', icon: '◉', tone: 'from-emerald-100 to-teal-200' },
  { id: 3, name: 'Fone Arc', category: 'Tecnologia', price: 319.9, color: 'Areia', icon: '◒', tone: 'from-slate-100 to-slate-300' },
  { id: 4, name: 'Caderno Daily', category: 'Papelaria', price: 79.9, color: 'Lavanda', icon: '▤', tone: 'from-violet-100 to-purple-200' },
]

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function ShoppingBagIcon({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 8.5h12l1 11H5l1-11Z" /><path strokeLinecap="round" d="M9 9V6a3 3 0 0 1 6 0v3" /></svg>
}

function PlusIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
}

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
}

function App() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [buttonStates, setButtonStates] = useState<Record<number, ButtonState>>({})
  const [toastVisible, setToastVisible] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [cartPulse, setCartPulse] = useState(0)

  const itemCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart])
  const cartTotal = useMemo(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart])

  useEffect(() => {
    if (!toastVisible) return
    const timeout = window.setTimeout(() => setToastVisible(false), 3800)
    return () => window.clearTimeout(timeout)
  }, [toastVisible])

  function addToCart(product: Product) {
    if (buttonStates[product.id] === 'adding') return

    setButtonStates((current) => ({ ...current, [product.id]: 'adding' }))

    window.setTimeout(() => {
      setCart((current) => {
        const existing = current.find((item) => item.id === product.id)
        if (existing) return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        return [...current, { ...product, quantity: 1 }]
      })
      setButtonStates((current) => ({ ...current, [product.id]: 'added' }))
      setToastVisible(true)
      setDrawerOpen(true)
      setCartPulse((current) => current + 1)

      window.setTimeout(() => {
        setButtonStates((current) => ({ ...current, [product.id]: 'idle' }))
      }, 2000)
    }, 500)
  }

  function changeQuantity(id: number, amount: number) {
    setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0))
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#inicio" className="flex items-center gap-2.5" aria-label="Nordly início">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-lg font-black text-white">N</span>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">nordly<span className="text-orange-500">.</span></span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-500 md:flex">
            <a href="#colecao" className="transition hover:text-slate-900">Coleção</a>
            <a href="#destaques" className="transition hover:text-slate-900">Destaques</a>
            <a href="#sobre" className="transition hover:text-slate-900">Sobre nós</a>
          </nav>
          <button onClick={() => setDrawerOpen(true)} className="group relative flex items-center gap-2 rounded-full p-2.5 text-slate-700 transition hover:bg-orange-50 hover:text-orange-600" aria-label={`Abrir carrinho com ${itemCount} itens`}>
            <span key={cartPulse} className={cartPulse ? 'cart-bounce block' : 'block'}><ShoppingBagIcon className="h-6 w-6" /></span>
            <span className="hidden text-sm font-bold sm:block">Carrinho</span>
            {itemCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-extrabold text-white shadow-lg shadow-orange-500/30">{itemCount}</span>}
          </button>
        </div>
      </header>

      <main id="inicio">
        <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-14 pt-14 sm:px-8 md:grid-cols-[1.05fr_.95fr] md:items-center md:pb-20 md:pt-20">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-700"><span className="h-2 w-2 rounded-full bg-orange-500" /> Nova coleção 2024</div>
            <h1 className="max-w-2xl text-5xl font-black leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-7xl">Pequenas escolhas.<br /><span className="text-orange-500">Grandes momentos.</span></h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-500 sm:text-lg">Produtos pensados para deixar sua rotina mais leve, bonita e cheia de intenção.</p>
            <a href="#colecao" className="mt-8 inline-flex items-center gap-3 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-orange-600">Explorar coleção <span aria-hidden="true">→</span></a>
          </div>
          <div className="relative flex min-h-[330px] items-center justify-center overflow-hidden rounded-[2rem] bg-orange-100 p-8 sm:min-h-[420px]">
            <div className="absolute -right-14 -top-14 h-52 w-52 rounded-full bg-orange-200/70" />
            <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-amber-200/60" />
            <div className="relative flex h-56 w-56 rotate-[-7deg] items-center justify-center rounded-[3.5rem] bg-gradient-to-br from-orange-300 via-orange-400 to-amber-500 shadow-2xl shadow-orange-700/25 sm:h-72 sm:w-72"><span className="text-8xl text-white/80 sm:text-9xl">◈</span><span className="absolute bottom-8 rounded-full bg-white/80 px-4 py-1 text-xs font-black uppercase tracking-widest text-orange-700">nordly</span></div>
            <div className="absolute bottom-7 left-7 rounded-2xl bg-white/90 px-4 py-3 shadow-xl backdrop-blur"><p className="text-xs font-bold text-slate-400">Escolha da semana</p><p className="mt-1 text-sm font-extrabold text-slate-800">Mochila Atlas</p></div>
          </div>
        </section>

        <section id="colecao" className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
          <div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-500">Feito para você</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Nossos favoritos</h2></div><span className="hidden text-sm text-slate-400 sm:block">{products.length} produtos selecionados</span></div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
              const status = buttonStates[product.id] || 'idle'
              return <article key={product.id} className="group rounded-3xl bg-white p-3 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className={`relative flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${product.tone}`}><span className="text-8xl text-white/70 drop-shadow-sm transition duration-500 group-hover:scale-110">{product.icon}</span><span className="absolute left-3 top-3 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Novo</span></div>
                <div className="px-2 pb-2 pt-4"><p className="text-xs font-semibold text-slate-400">{product.category}</p><h3 className="mt-1 text-lg font-extrabold text-slate-900">{product.name}</h3><p className="mt-1 text-xs text-slate-400">{product.color}</p><div className="mt-5 flex items-center justify-between gap-3"><span className="text-lg font-black text-slate-900">{currency.format(product.price)}</span><button disabled={status === 'adding'} onClick={() => addToCart(product)} className={`flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-extrabold transition-all duration-200 ${status === 'added' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : status === 'adding' ? 'cursor-wait bg-orange-100 text-orange-600' : 'bg-slate-900 text-white hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-500/20'}`}><span>{status === 'adding' ? <Spinner /> : status === 'added' ? '✓' : <PlusIcon />}</span>{status === 'adding' ? 'Adicionando...' : status === 'added' ? 'Adicionado!' : 'Adicionar'}</button></div></div>
              </article>
            })}
          </div>
        </section>
      </main>

      {toastVisible && <div className="toast-in fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl bg-slate-900 p-4 text-white shadow-2xl shadow-slate-900/30"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-lg">✓</span><div className="min-w-0 flex-1"><p className="text-sm font-bold">Produto adicionado ao carrinho!</p><p className="mt-0.5 text-xs text-slate-400">Sua seleção está esperando por você.</p></div><button onClick={() => { setDrawerOpen(true); setToastVisible(false) }} className="shrink-0 rounded-lg px-2 py-1 text-xs font-extrabold text-orange-300 transition hover:bg-white/10 hover:text-orange-200">Ver Carrinho</button><button onClick={() => setToastVisible(false)} className="self-start text-slate-500 transition hover:text-white" aria-label="Fechar notificação">×</button></div>}

      {drawerOpen && <div className="fixed inset-0 z-40"><button className="absolute inset-0 h-full w-full cursor-default bg-slate-950/40 backdrop-blur-[2px]" onClick={() => setDrawerOpen(false)} aria-label="Fechar carrinho" /><aside className="drawer-in absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><div><h2 className="text-xl font-black text-slate-900">Seu carrinho</h2><p className="mt-1 text-xs text-slate-400">{itemCount} {itemCount === 1 ? 'item selecionado' : 'itens selecionados'}</p></div><button onClick={() => setDrawerOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500 transition hover:bg-orange-100 hover:text-orange-600" aria-label="Fechar">×</button></div><div className="flex-1 overflow-y-auto px-6 py-5">{cart.length === 0 ? <div className="flex h-full flex-col items-center justify-center text-center"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500"><ShoppingBagIcon className="h-8 w-8" /></div><h3 className="mt-5 font-extrabold text-slate-800">Seu carrinho está vazio</h3><p className="mt-2 max-w-[220px] text-sm leading-6 text-slate-400">Adicione seus favoritos para vê-los aqui.</p></div> : <div className="space-y-4">{cart.map((item) => <div key={item.id} className="flex gap-3 rounded-2xl bg-slate-50 p-3"><div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.tone} text-3xl text-white/80`}>{item.icon}</div><div className="min-w-0 flex-1"><p className="font-extrabold text-slate-800">{item.name}</p><p className="mt-1 text-sm font-bold text-slate-500">{currency.format(item.price)}</p><div className="mt-2 flex items-center gap-2"><button onClick={() => changeQuantity(item.id, -1)} className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm">−</button><span className="w-4 text-center text-xs font-bold">{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)} className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm">+</button></div></div></div>)}</div>}</div><div className="border-t border-slate-100 px-6 py-6"><div className="mb-4 flex items-center justify-between"><span className="text-sm text-slate-500">Total</span><strong className="text-2xl font-black text-slate-900">{currency.format(cartTotal)}</strong></div><button disabled={!cart.length} className="w-full rounded-xl bg-slate-900 py-4 text-sm font-extrabold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-slate-200">Ir para o Checkout <span className="ml-1">→</span></button></div></aside></div>}
    </div>
  )
}

export default App
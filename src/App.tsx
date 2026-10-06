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
type DeliveryOption = 'delivery' | 'pickup'

const products: Product[] = [
  { id: 1, name: 'Mochila Atlas', category: 'Acessórios', price: 249.9, color: 'Caramelo', icon: '◈', tone: 'from-orange-100 to-amber-200' },
  { id: 2, name: 'Garrafa Térmica', category: 'Casa & bem-estar', price: 139.9, color: 'Verde sálvia', icon: '◉', tone: 'from-emerald-100 to-teal-200' },
  { id: 3, name: 'Fone Arc', category: 'Tecnologia', price: 319.9, color: 'Areia', icon: '◒', tone: 'from-slate-100 to-slate-300' },
  { id: 4, name: 'Caderno Daily', category: 'Papelaria', price: 79.9, color: 'Lavanda', icon: '▤', tone: 'from-violet-100 to-purple-200' },
]

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const freeShippingGoal = 315

function ShoppingBagIcon({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 8.5h12l1 11H5l1-11Z" /><path strokeLinecap="round" d="M9 9V6a3 3 0 0 1 6 0v3" /></svg>
}

function TruckIcon({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /></svg>
}

function StoreIcon({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4 10v9h16v-9M3 10l2-5h14l2 5M3 10a3 3 0 0 0 5 0 3 3 0 0 0 5 0 3 3 0 0 0 5 0 3 3 0 0 0 3 0" /><path strokeLinecap="round" d="M9 19v-5h6v5" /></svg>
}

function LockIcon({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" /><path strokeLinecap="round" d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
}

function ChevronIcon({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" /></svg>
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
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [cartPulse, setCartPulse] = useState(0)
  const [delivery, setDelivery] = useState<DeliveryOption>('delivery')

  const itemCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart])
  const cartTotal = useMemo(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart])
  const shippingProgress = Math.min(100, (cartTotal / freeShippingGoal) * 100)
  const shippingRemaining = Math.max(0, freeShippingGoal - cartTotal)
  const shippingCost = delivery === 'delivery' && shippingRemaining > 0 ? 14.9 : 0
  const orderTotal = cartTotal + shippingCost

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
      window.setTimeout(() => setButtonStates((current) => ({ ...current, [product.id]: 'idle' })), 2000)
    }, 500)
  }

  function changeQuantity(id: number, amount: number) {
    setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0))
  }

  function openCheckout() {
    if (!cart.length) return
    setDrawerOpen(false)
    setCheckoutOpen(true)
    setSummaryOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const floatingInput = 'peer h-14 w-full rounded-lg border border-slate-200 bg-white px-4 pt-5 text-sm text-slate-900 outline-none transition placeholder:text-transparent focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
  const floatingLabel = 'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 transition-all peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-orange-600 peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-bold'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <button onClick={() => setCheckoutOpen(false)} className="flex items-center gap-2.5" aria-label="Nordly início"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-lg font-black text-white">N</span><span className="text-xl font-extrabold tracking-tight text-slate-900">nordly<span className="text-orange-500">.</span></span></button>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-500 md:flex"><a href="#colecao" className="transition hover:text-slate-900">Coleção</a><a href="#destaques" className="transition hover:text-slate-900">Destaques</a><a href="#sobre" className="transition hover:text-slate-900">Sobre nós</a></nav>
          <button onClick={() => setDrawerOpen(true)} className="group relative flex items-center gap-2 rounded-full p-2.5 text-slate-700 transition hover:bg-orange-50 hover:text-orange-600" aria-label={`Abrir carrinho com ${itemCount} itens`}><span key={cartPulse} className={cartPulse ? 'cart-bounce block' : 'block'}><ShoppingBagIcon className="h-6 w-6" /></span><span className="hidden text-sm font-bold sm:block">Carrinho</span>{itemCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-extrabold text-white shadow-lg shadow-orange-500/30">{itemCount}</span>}</button>
        </div>
      </header>

      {!checkoutOpen ? <main id="inicio"><section className="mx-auto grid max-w-7xl gap-10 px-5 pb-14 pt-14 sm:px-8 md:grid-cols-[1.05fr_.95fr] md:items-center md:pb-20 md:pt-20"><div><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-700"><span className="h-2 w-2 rounded-full bg-orange-500" /> Nova coleção 2024</div><h1 className="max-w-2xl text-5xl font-black leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-7xl">Pequenas escolhas.<br /><span className="text-orange-500">Grandes momentos.</span></h1><p className="mt-6 max-w-lg text-base leading-7 text-slate-500 sm:text-lg">Produtos pensados para deixar sua rotina mais leve, bonita e cheia de intenção.</p><a href="#colecao" className="mt-8 inline-flex items-center gap-3 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-orange-600">Explorar coleção <span aria-hidden="true">→</span></a></div><div className="relative flex min-h-[330px] items-center justify-center overflow-hidden rounded-[2rem] bg-orange-100 p-8 sm:min-h-[420px]"><div className="absolute -right-14 -top-14 h-52 w-52 rounded-full bg-orange-200/70" /><div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-amber-200/60" /><div className="relative flex h-56 w-56 rotate-[-7deg] items-center justify-center rounded-[3.5rem] bg-gradient-to-br from-orange-300 via-orange-400 to-amber-500 shadow-2xl shadow-orange-700/25 sm:h-72 sm:w-72"><span className="text-8xl text-white/80 sm:text-9xl">◈</span><span className="absolute bottom-8 rounded-full bg-white/80 px-4 py-1 text-xs font-black uppercase tracking-widest text-orange-700">nordly</span></div><div className="absolute bottom-7 left-7 rounded-2xl bg-white/90 px-4 py-3 shadow-xl backdrop-blur"><p className="text-xs font-bold text-slate-400">Escolha da semana</p><p className="mt-1 text-sm font-extrabold text-slate-800">Mochila Atlas</p></div></div></section><section id="colecao" className="mx-auto max-w-7xl px-5 pb-24 sm:px-8"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-500">Feito para você</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Nossos favoritos</h2></div><span className="hidden text-sm text-slate-400 sm:block">{products.length} produtos selecionados</span></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => { const status = buttonStates[product.id] || 'idle'; return <article key={product.id} className="group rounded-3xl bg-white p-3 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-xl"><div className={`relative flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${product.tone}`}><span className="text-8xl text-white/70 drop-shadow-sm transition duration-500 group-hover:scale-110">{product.icon}</span><span className="absolute left-3 top-3 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Novo</span></div><div className="px-2 pb-2 pt-4"><p className="text-xs font-semibold text-slate-400">{product.category}</p><h3 className="mt-1 text-lg font-extrabold text-slate-900">{product.name}</h3><p className="mt-1 text-xs text-slate-400">{product.color}</p><div className="mt-5 flex items-center justify-between gap-3"><span className="text-lg font-black text-slate-900">{currency.format(product.price)}</span><button disabled={status === 'adding'} onClick={() => addToCart(product)} className={`flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-extrabold transition-all duration-200 ${status === 'added' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : status === 'adding' ? 'cursor-wait bg-orange-100 text-orange-600' : 'bg-slate-900 text-white hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-500/20'}`}><span>{status === 'adding' ? <Spinner /> : status === 'added' ? '✓' : <PlusIcon />}</span>{status === 'adding' ? 'Adicionando...' : status === 'added' ? 'Adicionado!' : 'Adicionar'}</button></div></div></article> })}</div></section></main> : <main className="mx-auto max-w-7xl px-5 pb-32 pt-7 sm:px-8 sm:pb-16 sm:pt-10"><div className="mb-7"><button onClick={() => setCheckoutOpen(false)} className="mb-5 text-sm font-bold text-slate-500 transition hover:text-orange-600">← Voltar para a loja</button><p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-500">Checkout seguro</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Finalize seu pedido</h1><p className="mt-2 text-sm text-slate-500">Falta pouco para receber seus produtos favoritos.</p></div><div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:hidden"><button onClick={() => setSummaryOpen(!summaryOpen)} className="flex w-full items-center justify-between p-4 text-left"><span><span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Resumo do pedido</span><span className="mt-1 block text-xl font-black text-slate-900">{currency.format(orderTotal)}</span></span><span className="flex items-center gap-2 text-sm font-bold text-orange-600">{summaryOpen ? 'Ocultar' : 'Ver detalhes do pedido'}<ChevronIcon className={`h-4 w-4 transition ${summaryOpen ? 'rotate-180' : ''}`} /></span></button>{summaryOpen && <div className="border-t border-slate-100 px-4 pb-4 pt-2">{cart.map((item) => <div key={item.id} className="flex justify-between py-2 text-sm"><span className="text-slate-500">{item.quantity}x {item.name}</span><strong>{currency.format(item.price * item.quantity)}</strong></div>)}<div className="mt-2 flex justify-between border-t border-slate-100 pt-3 text-sm"><span className="text-slate-500">Frete</span><strong>{shippingCost ? currency.format(shippingCost) : 'Grátis'}</strong></div></div>}</div><div className="grid gap-6 lg:grid-cols-[1fr_390px] lg:items-start"><section className="space-y-5"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="mb-6"><h2 className="text-xl font-black text-slate-900">Seus dados</h2><p className="mt-1 text-sm text-slate-500">Preencha os dados para entrega do pedido.</p></div><div className="grid gap-4 sm:grid-cols-2"><label className="relative block"><input className={floatingInput} placeholder="Nome completo" /><span className={floatingLabel}>Nome completo</span></label><label className="relative block"><input className={floatingInput} type="email" placeholder="E-mail" /><span className={floatingLabel}>E-mail</span></label><label className="relative block"><input className={floatingInput} placeholder="CPF" /><span className={floatingLabel}>CPF</span></label><label className="relative block"><input className={floatingInput} placeholder="Telefone" /><span className={floatingLabel}>Telefone</span></label></div></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="mb-6"><h2 className="text-xl font-black text-slate-900">Como deseja receber?</h2><p className="mt-1 text-sm text-slate-500">Escolha a opção mais conveniente para você.</p></div><div className="grid gap-3 sm:grid-cols-2"><button onClick={() => setDelivery('delivery')} className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition ${delivery === 'delivery' ? 'border-orange-500 bg-orange-50/70' : 'border-slate-200 bg-white hover:border-orange-200'}`}><TruckIcon className={`mt-0.5 h-6 w-6 shrink-0 ${delivery === 'delivery' ? 'text-orange-600' : 'text-slate-400'}`} /><span><strong className="block text-sm font-extrabold">Entrega em Jequié</strong><small className="mt-1 block text-xs text-slate-500">Receba no endereço informado</small></span><span className={`ml-auto mt-1 h-4 w-4 rounded-full border-4 ${delivery === 'delivery' ? 'border-orange-500' : 'border-slate-300'}`} /></button><button onClick={() => setDelivery('pickup')} className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition ${delivery === 'pickup' ? 'border-orange-500 bg-orange-50/70' : 'border-slate-200 bg-white hover:border-orange-200'}`}><StoreIcon className={`mt-0.5 h-6 w-6 shrink-0 ${delivery === 'pickup' ? 'text-orange-600' : 'text-slate-400'}`} /><span><strong className="block text-sm font-extrabold">Retirar na farmácia</strong><small className="mt-1 block text-xs text-slate-500">Retire quando for conveniente</small></span><span className={`ml-auto mt-1 h-4 w-4 rounded-full border-4 ${delivery === 'pickup' ? 'border-orange-500' : 'border-slate-300'}`} /></button></div>{delivery === 'delivery' && <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="relative block sm:col-span-2"><input className={floatingInput} placeholder="Endereço" /><span className={floatingLabel}>Endereço</span></label><label className="relative block"><input className={floatingInput} placeholder="Número" /><span className={floatingLabel}>Número</span></label><label className="relative block"><input className={floatingInput} placeholder="CEP" /><span className={floatingLabel}>CEP</span></label></div>}</div></section><aside className="hidden lg:block"><OrderSummary cart={cart} cartTotal={cartTotal} shippingCost={shippingCost} orderTotal={orderTotal} shippingProgress={shippingProgress} shippingRemaining={shippingRemaining} openCheckout={openCheckout} /></aside></div></main>}

      {toastVisible && <div className="toast-in fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl bg-slate-900 p-4 text-white shadow-2xl shadow-slate-900/30"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-lg">✓</span><div className="min-w-0 flex-1"><p className="text-sm font-bold">Produto adicionado ao carrinho!</p><p className="mt-0.5 text-xs text-slate-400">Sua seleção está esperando por você.</p></div><button onClick={() => { setDrawerOpen(true); setToastVisible(false) }} className="shrink-0 rounded-lg px-2 py-1 text-xs font-extrabold text-orange-300 transition hover:bg-white/10 hover:text-orange-200">Ver Carrinho</button><button onClick={() => setToastVisible(false)} className="self-start text-slate-500 transition hover:text-white" aria-label="Fechar notificação">×</button></div>}

      {checkoutOpen && cart.length > 0 && <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur sm:hidden"><div className="mx-auto flex max-w-xl items-center justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total</p><strong className="text-lg font-black text-slate-900">{currency.format(orderTotal)}</strong></div><button className="flex-1 rounded-xl bg-orange-500 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600">Ir para pagamento <span className="ml-1">→</span></button></div></div>}

      {drawerOpen && <div className="fixed inset-0 z-40"><button className="absolute inset-0 h-full w-full cursor-default bg-slate-950/40 backdrop-blur-[2px]" onClick={() => setDrawerOpen(false)} aria-label="Fechar carrinho" /><aside className="drawer-in absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><div><h2 className="text-xl font-black text-slate-900">Seu carrinho</h2><p className="mt-1 text-xs text-slate-400">{itemCount} {itemCount === 1 ? 'item selecionado' : 'itens selecionados'}</p></div><button onClick={() => setDrawerOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500 transition hover:bg-orange-100 hover:text-orange-600" aria-label="Fechar">×</button></div><div className="flex-1 overflow-y-auto px-6 py-5">{cart.length === 0 ? <div className="flex h-full flex-col items-center justify-center text-center"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500"><ShoppingBagIcon className="h-8 w-8" /></div><h3 className="mt-5 font-extrabold text-slate-800">Seu carrinho está vazio</h3><p className="mt-2 max-w-[220px] text-sm leading-6 text-slate-400">Adicione seus favoritos para vê-los aqui.</p></div> : <><div className="mb-6 rounded-xl bg-orange-50 p-4"><div className="flex items-center justify-between gap-3"><p className="text-xs font-bold text-orange-800">{shippingRemaining > 0 ? `Faltam ${currency.format(shippingRemaining)} para frete grátis` : 'Você ganhou frete grátis!'}</p><span className="text-xs font-black text-orange-600">{Math.round(shippingProgress)}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-orange-100"><div className="h-full rounded-full bg-orange-500 transition-all duration-700" style={{ width: `${shippingProgress}%` }} /></div><p className="mt-2 text-[11px] text-orange-700">Adicione mais produtos e economize no frete.</p></div><div className="space-y-4">{cart.map((item) => <div key={item.id} className="flex gap-3 rounded-2xl bg-slate-50 p-3"><div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.tone} text-3xl text-white/80`}>{item.icon}</div><div className="min-w-0 flex-1"><p className="font-extrabold text-slate-800">{item.name}</p><p className="mt-1 text-sm font-bold text-slate-500">{currency.format(item.price)}</p><div className="mt-2 flex items-center gap-2"><button onClick={() => changeQuantity(item.id, -1)} className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm">−</button><span className="w-4 text-center text-xs font-bold">{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)} className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm">+</button></div></div></div>)}</div></>}</div><div className="border-t border-slate-100 px-6 py-6"><div className="mb-4 flex items-center justify-between"><span className="text-sm text-slate-500">Total</span><strong className="text-2xl font-black text-slate-900">{currency.format(cartTotal)}</strong></div><button onClick={openCheckout} disabled={!cart.length} className="w-full rounded-xl bg-slate-900 py-4 text-sm font-extrabold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-slate-200">Ir para o Checkout <span className="ml-1">→</span></button></div></aside></div>}
    </div>
  )
}

function OrderSummary({ cart, cartTotal, shippingCost, orderTotal, shippingProgress, shippingRemaining, openCheckout }: { cart: CartItem[]; cartTotal: number; shippingCost: number; orderTotal: number; shippingProgress: number; shippingRemaining: number; openCheckout: () => void }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-slate-900">Resumo do pedido</h2><div className="mt-5 space-y-4">{cart.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-500">{item.quantity}x {item.name}</span><strong>{currency.format(item.price * item.quantity)}</strong></div>)}</div><div className="mt-6 rounded-xl bg-orange-50 p-4"><div className="flex justify-between text-xs font-bold text-orange-800"><span>{shippingRemaining > 0 ? `Faltam ${currency.format(shippingRemaining)} para frete grátis` : 'Frete grátis liberado!'}</span><span>{Math.round(shippingProgress)}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-orange-100"><div className="h-full rounded-full bg-orange-500 transition-all duration-700" style={{ width: `${shippingProgress}%` }} /></div></div><div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm"><div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{currency.format(cartTotal)}</span></div><div className="flex justify-between text-slate-500"><span>Frete</span><span>{shippingCost ? currency.format(shippingCost) : 'Grátis'}</span></div><div className="flex items-center justify-between pt-2"><span className="font-bold text-slate-800">Total</span><strong className="text-2xl font-black text-slate-900">{currency.format(orderTotal)}</strong></div></div><button onClick={openCheckout} className="mt-6 hidden w-full rounded-xl bg-orange-500 py-4 text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 sm:block">Ir para pagamento <span className="ml-1">→</span></button><div className="mt-5 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-center text-xs text-slate-400"><LockIcon className="h-4 w-4 shrink-0" /><span>Ambiente 100% Seguro e Criptografado</span></div></div>
}

export default App

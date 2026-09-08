import { merchants } from '../data'
import { useApp } from '../context/AppContext'
import { MerchantCard } from '../components/Cards'

export function Favorites() { const { favoriteMerchantIds } = useApp(); const favoriteMerchants = merchants.filter((merchant) => favoriteMerchantIds.includes(merchant.id)); return <div className="page-content"><section className="page-heading"><p className="eyebrow">VOS ADRESSES</p><h1>Favoris</h1><p>Retrouvez vos commerces préférés en un geste.</p></section>{favoriteMerchants.length ? <div className="merchant-grid">{favoriteMerchants.map((merchant) => <MerchantCard key={merchant.id} merchant={merchant} />)}</div> : <div className="empty-state large"><span>♡</span><strong>Vous n’avez pas encore de favoris</strong><p>Ajoutez vos commerces préférés pour les retrouver rapidement.</p></div>}</div> }

import type { Role, User } from '../types'

export type DemoAccount = { role: Role; label: string; email: string; password: string }
export const demoAccounts: DemoAccount[] = [
  { role: 'customer', label: 'Client', email: 'client@rubigo.ci', password: 'Rubigo2026!' },
  { role: 'merchant', label: 'Commerçant', email: 'merchant@rubigo.ci', password: 'Rubigo2026!' },
  { role: 'driver', label: 'Livreur', email: 'driver@rubigo.ci', password: 'Rubigo2026!' },
  { role: 'admin', label: 'Administrateur', email: 'admin@rubigo.ci', password: 'Rubigo2026!' },
]

export function authenticate(email: string, password: string): User | null { const account = demoAccounts.find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password); if (!account) return null; const names: Record<Role, { name: string; initials: string }> = { customer: { name: 'Amadou K.', initials: 'AK' }, merchant: { name: 'Le Patio d’Adzopé', initials: 'PA' }, driver: { name: 'Koffi Yao', initials: 'KY' }, admin: { name: 'Administrateur RUBIGO', initials: 'AD' } }; return { id: `${account.role}-demo`, name: names[account.role].name, initials: names[account.role].initials, email: account.email, phone: '+225 07 08 09 10 11', city: 'Adzopé, Côte d’Ivoire', role: account.role, addresses: [{ id: 'address-001', label: 'Maison', line: 'Quartier Commerce, Adzopé', isDefault: true }] } }

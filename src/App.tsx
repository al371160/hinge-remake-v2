import { LucideProvider } from 'lucide-react'
import { BrowserRouter } from 'react-router-dom'
import { AppShell } from './app/AppShell'

export default function App() {
  return (
    <LucideProvider strokeWidth={2.5}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </LucideProvider>
  )
}

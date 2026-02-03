import { Header } from "@/components/header"
import { MenuPage } from "@/components/menu-page"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MenuPage />
    </div>
  )
}

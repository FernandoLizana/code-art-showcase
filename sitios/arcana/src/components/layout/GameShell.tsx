import Link from "next/link";
import { GAME } from "@/lib/game/constants";
import { AudioToggle } from "@/components/ui/AudioToggle";
import { SymbolBackground } from "@/components/ui/SymbolBackground";

interface GameShellProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function GameShell({ children, showNav = false }: GameShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SymbolBackground />
      <AudioToggle />
      {showNav && (
        <nav className="fixed top-0 left-0 right-0 z-40 flex justify-center gap-6 p-4 terminal-text text-xs">
          <Link href="/cuaderno" className="hover:text-[var(--text-primary)] transition-colors">
            Cuaderno
          </Link>
          <Link href="/archivo" className="hover:text-[var(--text-primary)] transition-colors">
            Archivo
          </Link>
          <Link href="/configuracion" className="hover:text-[var(--text-primary)] transition-colors">
            Config
          </Link>
        </nav>
      )}
      <main className="relative z-10 flex flex-1 flex-col">{children}</main>
      <footer className="relative z-10 p-4 text-center terminal-text text-[10px] opacity-30">
        {GAME.name}
      </footer>
    </div>
  );
}

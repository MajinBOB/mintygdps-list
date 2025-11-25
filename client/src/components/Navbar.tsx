import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LogOut } from "lucide-react";

interface NavbarProps {
  showListSelector?: boolean;
  currentList?: string;
  onListChange?: (list: string) => void;
}

export function Navbar({ showListSelector, currentList, onListChange }: NavbarProps) {
  const { isAuthenticated } = useAuth();

  const lists = [
    { value: "demonlist", label: "Demonlist" },
    { value: "challenge", label: "Challenge List" },
    { value: "unrated", label: "Unrated List" },
    { value: "upcoming", label: "Upcoming List" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link href={isAuthenticated ? "/" : "/"}>
          <a className="flex items-center gap-2 hover:opacity-80 transition-opacity" data-testid="link-home">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
            <span className="font-display font-bold text-xl">GD Demonlist</span>
          </a>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/demonlist">
            <a className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-nav-demonlist">
              Demonlist
            </a>
          </Link>
          <Link href="/leaderboard">
            <a className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-nav-leaderboard">
              Leaderboard
            </a>
          </Link>
          {isAuthenticated && (
            <Link href="/submit">
              <a className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-nav-submit">
                Submit Record
              </a>
            </Link>
          )}
        </nav>

        {showListSelector && lists.length > 0 && (
          <div className="flex items-center gap-2">
            {lists.map((list) => (
              <Button
                key={list.value}
                variant={currentList === list.value ? "default" : "ghost"}
                size="sm"
                onClick={() => onListChange?.(list.value)}
                data-testid={`button-list-${list.value}`}
              >
                {list.label}
              </Button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />
          {isAuthenticated ? (
            <ProfileDropdown />
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild data-testid="button-login">
                <a href="/api/login">Login</a>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

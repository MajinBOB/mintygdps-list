import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import { getInitials } from "@/lib/initials";

export function ProfileDropdown() {
  const { user, isModerator } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const initials = getInitials(user);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          data-testid="button-profile-menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profileImageUrl || ""} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 px-2 py-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profileImageUrl || ""} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium" data-testid="text-username">
              {user.username}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild data-testid="menu-item-profile">
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild data-testid="menu-item-settings">
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        {isModerator && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild data-testid="menu-item-admin-panel">
              <Link href="/admin/dashboard">Admin Panel</Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild data-testid="menu-item-logout">
          <a href="/logout">Log out</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

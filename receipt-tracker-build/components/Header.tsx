"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <header
      className={`p-4 flex justify-between items-center ${isHomePage ? "bg-blue-50" : "bg-white border-b border-blue-50"}`}
    >
      <Link href="/" className="flex items-center text-blue-600">
        <Shield className="w-6 h-6 mr-2" />
        Expense.io
      </Link>

      <div className="flex items-center space-x-4">
        <SignedIn>
          <Link href="/receipts">
            <Button variant="outline">My Receipts</Button>
          </Link>

          <Link href="/manage-plan">
            <Button>Manage Plan</Button>
          </Link>

          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <Button>Login</Button>
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  );
}

export default Header;

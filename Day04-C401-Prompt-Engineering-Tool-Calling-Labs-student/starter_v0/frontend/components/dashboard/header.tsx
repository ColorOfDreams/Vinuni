"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Beaker, Github, Settings } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Beaker className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-lg">Lab Research Agent Gọi Tool</h1>
            <Badge variant="outline" className="text-xs">
              Bản demo
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Github className="w-4 h-4 mr-2" />
            Mã nguồn
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

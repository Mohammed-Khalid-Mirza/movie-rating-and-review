"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GenreFormProps {
  initialData?: { name: string };
  onSubmit: (data: { name: string }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function GenreForm({ initialData, onSubmit, onCancel, isSubmitting }: GenreFormProps) {
  const [name, setName] = useState(initialData?.name || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Genre Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Action, Drama, Sci-Fi..."
          className="bg-background/50 h-11"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} className="rounded-full px-6">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="rounded-full px-8 bg-primary shadow-lg shadow-primary/20">
          {isSubmitting ? "Saving..." : initialData ? "Update Genre" : "Add Genre"}
        </Button>
      </div>
    </form>
  );
}

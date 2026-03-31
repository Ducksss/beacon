"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Database } from "@/lib/database.types";
import {
  publicDemoModeEnabled,
  PUBLIC_DEMO_READ_ONLY_MESSAGE,
} from "@/lib/public-demo";

type Category = Database['public']['Tables']['categories']['Row'];
type CategoriesResponse = {
  categories?: Category[];
  category?: Category;
  error?: string;
};

const PREDEFINED_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Gray', value: '#6b7280' },
];

export default function ManageCategoriesPage() {
  const isPublicDemoMode = publicDemoModeEnabled;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PREDEFINED_COLORS[0].value);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState(PREDEFINED_COLORS[0].value);
  const [savingId, setSavingId] = useState<string | null>(null);

  const getErrorMessage = (error: unknown, fallback: string) => {
    return error instanceof Error ? error.message : fallback;
  };

  useEffect(() => {
    if (isPublicDemoMode) {
      setLoading(false);
      return;
    }

    async function loadCategories() {
      setLoading(true);
      try {
        const res = await fetch('/api/categories');
        const data = (await res.json()) as CategoriesResponse;
        if (!res.ok) throw new Error(data.error);
        setCategories(data.categories || []);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to load categories"));
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, [isPublicDemoMode]);

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), color: newColor })
      });
      const data = (await res.json()) as CategoriesResponse;
      if (!res.ok) throw new Error(data.error);
      
      if (data.category) {
        setCategories((current) => [...current, data.category as Category]);
      }
      setNewName("");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create category"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("Are you sure you want to delete this category? Broadcasts using it will no longer have a category.")) return;

    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete");
      setCategories((current) => current.filter((category) => category.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setEditingName("");
        setEditingColor(PREDEFINED_COLORS[0].value);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to delete category"));
    }
  }

  function beginEditing(category: Category) {
    setError(null);
    setEditingId(category.id);
    setEditingName(category.name);
    setEditingColor(category.color);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName("");
    setEditingColor(PREDEFINED_COLORS[0].value);
  }

  async function handleSaveCategory(id: string) {
    if (!editingName.trim()) return;

    setSavingId(id);
    setError(null);
    try {
      const res = await fetch('/api/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editingName.trim(), color: editingColor }),
      });
      const data = (await res.json()) as CategoriesResponse;
      if (!res.ok) throw new Error(data.error);

      if (data.category) {
        setCategories((current) =>
          current.map((category) => category.id === id ? data.category as Category : category)
        );
      }
      cancelEditing();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update category"));
    } finally {
      setSavingId(null);
    }
  }

  if (isPublicDemoMode) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
        <div>
          <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Manage Categories</h1>
          <p className="text-muted-foreground mt-1">Category editing is disabled in the public Beacon demo.</p>
        </div>

        <div className="rounded-xl border border-amber-300/30 bg-amber-500/10 p-6 text-sm text-amber-100">
          <p className="font-semibold text-white">Read-only public demo</p>
          <p className="mt-2 leading-6">{PUBLIC_DEMO_READ_ONLY_MESSAGE}</p>
          <p className="mt-2 leading-6">
            The shared demo dataset already includes a curated category mix so visitors can explore filters on the dashboard without changing the underlying records.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
      <div>
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Manage Categories</h1>
        <p className="text-muted-foreground mt-1">Create and organize custom tags for your broadcasts.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Create Form */}
        <div className="md:col-span-2 lg:col-span-1 border border-border rounded-xl p-5 bg-card text-card-foreground shadow-sm h-fit">
          <h2 className="text-lg font-semibold mb-4">New Category</h2>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Category Name</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Elections, Events"
                maxLength={30}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors hover:border-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Badge Color</label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_COLORS.map(color => (
                  <button
                    type="button"
                    key={color.name}
                    aria-label={`Select ${color.name}`}
                    aria-pressed={newColor === color.value}
                    onClick={() => setNewColor(color.value)}
                    className={`size-6 rounded-full border-2 transition-transform ${newColor === color.value ? 'scale-110 border-foreground shadow-[0_0_0_2px_rgba(0,0,0,0.1)]' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="color"
                  value={newColor}
                  onChange={(event) => setNewColor(event.target.value)}
                  aria-label="Choose a custom badge color"
                  className="h-9 w-12 cursor-pointer rounded-md border border-input bg-transparent p-1"
                />
                <span className="text-xs text-muted-foreground">Or pick any custom color.</span>
              </div>
            </div>
            {error && <p className="text-sm text-destructive font-medium">{error}</p>}
            <button
              type="submit"
              disabled={submitting || !newName.trim()}
              className="inline-flex w-full mt-2 items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Category'}
            </button>
          </form>
        </div>

        {/* Existing Categories */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Existing Categories</h2>
          {loading ? (
            <p className="text-sm text-muted-foreground animate-pulse">Loading categories...</p>
          ) : categories.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-8 text-center bg-secondary/10">
              <p className="text-sm text-muted-foreground">No categories defined yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Create one to start organizing your broadcasts!</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border divide-y divide-border bg-card shadow-sm overflow-hidden">
              {categories.map(category => (
                <div key={category.id} className="p-4 hover:bg-secondary/20 transition-colors">
                  {editingId === category.id ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Category Name</label>
                        <input
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          maxLength={30}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors hover:border-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Badge Color</label>
                        <div className="flex flex-wrap gap-2">
                          {PREDEFINED_COLORS.map((color) => (
                            <button
                              type="button"
                              key={`${category.id}-${color.name}`}
                              aria-label={`Select ${color.name}`}
                              aria-pressed={editingColor === color.value}
                              onClick={() => setEditingColor(color.value)}
                              className={`size-6 rounded-full border-2 transition-transform ${editingColor === color.value ? 'scale-110 border-foreground shadow-[0_0_0_2px_rgba(0,0,0,0.1)]' : 'border-transparent hover:scale-105'}`}
                              style={{ backgroundColor: color.value }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-3 pt-1">
                          <input
                            type="color"
                            value={editingColor}
                            onChange={(event) => setEditingColor(event.target.value)}
                            aria-label="Choose a custom badge color"
                            className="h-9 w-12 cursor-pointer rounded-md border border-input bg-transparent p-1"
                          />
                          <span className="text-xs text-muted-foreground">Or choose a custom color.</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="size-3 rounded-full shadow-sm" style={{ backgroundColor: editingColor }} />
                          <span className="text-sm font-medium">{editingName.trim() || "Untitled category"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="text-muted-foreground hover:text-foreground transition-colors text-xs font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveCategory(category.id)}
                            disabled={savingId === category.id || !editingName.trim()}
                            className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {savingId === category.id ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="size-3 rounded-full shadow-sm" style={{ backgroundColor: category.color }} />
                        <span className="font-medium text-sm">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => beginEditing(category)}
                          className="text-muted-foreground hover:text-foreground transition-colors text-xs font-medium"
                          aria-label={`Edit ${category.name}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors text-xs font-medium"
                          aria-label={`Delete ${category.name}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

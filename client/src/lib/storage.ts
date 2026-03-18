// LocalStorage keys
const NOTES_STORAGE_KEY = 'campus_notes';
const PYQ_STORAGE_KEY = 'campus_pyq';

// Types
export interface NoteItem {
  id: string;
  title: string;
  subject: string;
  semester: string;
  format: string;
  size: string;
  date: string;
  fileUrl: string;
  fileName: string;
  visibility: 'current' | 'all';
}

export interface PYQItem {
  id: string;
  title: string;
  subject: string;
  year: string;
  semester: string;
  type: string;
  fileUrl: string;
  fileName: string;
  date: string;
  size: string;
}

// Utility functions for Notes
export function getNotes(): NoteItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(NOTES_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveNote(note: NoteItem): void {
  const notes = getNotes();
  notes.unshift(note);
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

export function deleteNote(id: string): void {
  const notes = getNotes().filter((note) => note.id !== id);
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

export function updateNote(id: string, updates: Partial<NoteItem>): void {
  const notes = getNotes().map((note) =>
    note.id === id ? { ...note, ...updates } : note
  );
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

// Utility functions for PYQ
export function getPYQs(): PYQItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(PYQ_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function savePYQ(pyq: PYQItem): void {
  const pyqs = getPYQs();
  pyqs.unshift(pyq);
  localStorage.setItem(PYQ_STORAGE_KEY, JSON.stringify(pyqs));
}

export function deletePYQ(id: string): void {
  const pyqs = getPYQs().filter((pyq) => pyq.id !== id);
  localStorage.setItem(PYQ_STORAGE_KEY, JSON.stringify(pyqs));
}

export function updatePYQ(id: string, updates: Partial<PYQItem>): void {
  const pyqs = getPYQs().map((pyq) =>
    pyq.id === id ? { ...pyq, ...updates } : pyq
  );
  localStorage.setItem(PYQ_STORAGE_KEY, JSON.stringify(pyqs));
}

// File size formatter
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Get file extension
export function getFileExtension(fileName: string): string {
  const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE';
  return ext;
}

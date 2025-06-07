"use client";

import { useState, useEffect, FormEvent } from 'react';
import { Note } from './types/note';
import { getNotes, createNote, updateNote, deleteNote } from './services/noteService';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Partial<Note> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const notes = await getNotes();
        setNotes(notes);
      } catch (error) {
        console.error(error);
      }
    };
    fetchNotes();
  }, []);

  const handleCreate = () => {
    setCurrentNote({});
    setIsEditing(true);
  };

  const handleEdit = (note: Note) => {
    setCurrentNote(note);
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNote(id);
      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentNote) return;

    try {
      if ('id' in currentNote) {
        const updatedNote = await updateNote(currentNote as Note);
        setNotes(notes.map((n) => (n.id === updatedNote.id ? updatedNote : n)));
      } else {
        const newNote = await createNote({
          title: currentNote.title || '',
          content: currentNote.content || '',
        });
        setNotes([...notes, newNote]);
      }
      setIsEditing(false);
      setCurrentNote(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Notes</h1>
      <button onClick={handleCreate}>Create Note</button>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <h2>{note.title}</h2>
            <p>{note.content}</p>
            <button onClick={() => handleEdit(note)}>Edit</button>
            <button onClick={() => handleDelete(note.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {isEditing && currentNote && (
        <form onSubmit={handleSubmit}>
          <h2>{currentNote.id ? 'Edit Note' : 'Create Note'}</h2>
          <input
            type="text"
            placeholder="Title"
            value={currentNote.title || ''}
            onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
          />
          <textarea
            placeholder="Content"
            value={currentNote.content || ''}
            onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
          />
          <button type="submit">Save</button>
          <button type="button" onClick={() => { setIsEditing(false); setCurrentNote(null); }}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

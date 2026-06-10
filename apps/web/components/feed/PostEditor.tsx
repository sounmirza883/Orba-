'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';
import { useCreatePost } from '@/lib/api/queries';

export function PostEditor({ spaceSlug }: { spaceSlug: string }) {
  const [title, setTitle] = useState('');
  const createPost = useCreatePost(spaceSlug);

  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    editorProps: { attributes: { class: 'tiptap' } },
  });

  async function submit() {
    if (!editor || editor.isEmpty) return;
    await createPost.mutateAsync({ title: title || undefined, body: editor.getJSON() });
    editor.commands.clearContent();
    setTitle('');
  }

  return (
    <div className="card space-y-2">
      <input
        className="input"
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <EditorContent editor={editor} />
      <div className="flex justify-end">
        <button className="btn-accent" onClick={submit} disabled={createPost.isPending}>
          {createPost.isPending ? 'Posting…' : 'Post'}
        </button>
      </div>
      {createPost.isError && (
        <p className="text-sm text-red-600">{(createPost.error as Error).message}</p>
      )}
    </div>
  );
}

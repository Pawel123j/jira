import { useState } from "react";
import type { CommentItem } from "../../types";
import { Button } from "../ui/Button";
import { inputClasses } from "../ui/Field";

interface CommentsProps {
  comments: CommentItem[];
  /** Returns true when the comment was added so the input can reset. */
  onAdd: (text: string) => boolean;
}

export function Comments({ comments, onAdd }: CommentsProps) {
  const [text, setText] = useState("");

  const handleAdd = () => {
    if (onAdd(text)) setText("");
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
      <h3 className="text-lg font-bold">
        Komentarze{" "}
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          ({comments.length})
        </span>
      </h3>

      <label htmlFor="new-comment" className="sr-only">
        Nowy komentarz
      </label>
      <textarea
        id="new-comment"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={`${inputClasses} mt-3 h-24 resize-y`}
        placeholder="Dodaj komentarz..."
      />
      <Button
        variant="primary"
        fullWidth
        onClick={handleAdd}
        disabled={!text.trim()}
        className="mt-3"
      >
        Dodaj komentarz
      </Button>

      <div className="mt-4 space-y-3">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="animate-fade-in rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between gap-3">
                <strong className="text-sm">{comment.author}</strong>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {comment.time}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{comment.text}</p>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 p-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Brak komentarzy. Dorzuć pierwszy.
          </p>
        )}
      </div>
    </div>
  );
}

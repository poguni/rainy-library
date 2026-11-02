import { useState, type FormEvent } from 'react';
import { BottomSheet } from '../../components/BottomSheet';
import type { NewBook } from '../../db/books';

interface Props {
  onSubmit: (book: NewBook) => Promise<void>;
  onClose: () => void;
}

const inputClass =
  'h-12 w-full rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 text-md text-ink';

/** 책 등록(B-01): 제목·전체 쪽수는 필수, 저자·표지는 선택 */
export function AddBookSheet({ onSubmit, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pages, setPages] = useState('');
  const [cover, setCover] = useState<File>();
  const [errors, setErrors] = useState<{ title?: string; pages?: string }>({});
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const totalPages = Number(pages);
    const next = {
      title: title.trim() ? undefined : '책 제목을 적어 주세요.',
      pages:
        Number.isInteger(totalPages) && totalPages > 0
          ? undefined
          : '전체 쪽수를 1 이상의 숫자로 적어 주세요.',
    };
    setErrors(next);
    if (next.title || next.pages) return;
    setSaving(true);
    try {
      await onSubmit({ title: title.trim(), author: author.trim(), totalPages, coverBlob: cover });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet title="책 추가" onClose={onClose}>
      <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="book-title" className="text-sm">
            제목(필수)
          </label>
          <input
            id="book-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'book-title-error' : undefined}
            className={inputClass}
          />
          {errors.title && (
            <p id="book-title-error" role="alert" className="text-sm text-ribbon">
              {errors.title}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="book-author" className="text-sm">
            저자
          </label>
          <input
            id="book-author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="book-pages" className="text-sm">
            전체 쪽수(필수)
          </label>
          <input
            id="book-pages"
            inputMode="numeric"
            value={pages}
            onChange={(e) => setPages(e.target.value.replace(/[^0-9]/g, ''))}
            aria-invalid={!!errors.pages}
            aria-describedby={errors.pages ? 'book-pages-error' : undefined}
            className={inputClass}
          />
          {errors.pages && (
            <p id="book-pages-error" role="alert" className="text-sm text-ribbon">
              {errors.pages}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="book-cover" className="text-sm">
            표지 사진(선택)
          </label>
          <input
            id="book-cover"
            type="file"
            accept="image/*"
            onChange={(e) => setCover(e.target.files?.[0])}
            className="min-h-11 text-sm text-ink-muted file:mr-3 file:min-h-11 file:rounded-full file:border file:border-line-strong file:bg-surface file:px-4 file:text-ink"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="press mt-2 min-h-12 rounded-full bg-accent text-md text-on-accent shadow-[var(--shadow-primary)] disabled:opacity-60"
        >
          책 추가
        </button>
      </form>
    </BottomSheet>
  );
}

# Mini Jira

Lekki menedżer zadań inspirowany Jirą — zbudowany w **React + TypeScript + Vite + Tailwind CSS**.
Aplikacja działa w całości po stronie przeglądarki, a stan jest zapisywany w `localStorage`.

> Wcześniej projekt był pojedynczym plikiem `mini jira.jsx`, który nie dało się
> uruchomić. Został przebudowany na pełnoprawną, modularną aplikację.

## ✨ Funkcje

- **Logowanie demo** z walidacją (dane: `pawel@demo.local` / `demo1234`).
- **Trzy widoki** przełączane w pasku górnym:
  - **Lista** — filtry, lista zadań, formularz tworzenia i panel edycji.
  - **Tablica Kanban** — kolumny `To do / In progress / Done` z **przeciąganiem** (drag & drop) do zmiany statusu.
  - **Dashboard** — statystyki: liczba zadań, ukończone, po terminie, soft deleted, rozkład wg statusu i priorytetu oraz pasek postępu.
- **Zarządzanie zadaniami**: tworzenie, edycja, soft delete + przywracanie, priorytety, terminy, przypisani, tagi.
- **Komentarze** do zadań.
- **Audit log** — każda zmiana (utworzenie, edycja, zmiana statusu, delete/restore, komentarz) jest rejestrowana.
- **Filtrowanie na żywo** po tekście, statusie, priorytecie i widoczności usuniętych.
- **Trwałość danych** — zadania, komentarze, audit log, motyw i widok zapisywane w `localStorage`.
- **Motyw jasny/ciemny** (Tailwind `dark` mode).
- **Dostępność i UX**: etykiety formularzy, `aria-*`, focus ring, obsługa `prefers-reduced-motion`, responsywny layout (mobilny drawer menu), oznaczenia zadań po terminie.

## 🚀 Uruchomienie

```bash
npm install      # instalacja zależności
npm run dev      # serwer deweloperski (http://localhost:5173)
npm run build    # produkcyjny build do dist/
npm run preview  # podgląd builda produkcyjnego
npm run typecheck# sprawdzenie typów (tsc --noEmit)
npm run lint     # ESLint
```

## 🗂️ Struktura projektu

```
src/
  App.tsx                 # orkiestracja: auth, widoki, layout, handlery
  main.tsx                # punkt wejścia React
  index.css               # Tailwind + style bazowe
  types.ts                # wspólne typy domenowe
  data/seed.ts            # dane startowe, zespół, opcje, dane demo
  lib/
    badges.ts             # mapy klas Tailwind dla statusów/priorytetów
    format.ts             # formatowanie dat, isOverdue, makeId
    labels.ts             # polskie etykiety akcji i ról
    storage.ts            # bezpieczny wrapper na localStorage
  hooks/
    useJiraStore.ts       # reducer zadań/komentarzy/audit + persystencja
    useTheme.ts           # motyw + klasa `dark` na <html>
    useToast.ts           # powiadomienia z auto-dismiss
  components/
    auth/LoginScreen.tsx
    layout/Sidebar.tsx, Topbar.tsx
    tasks/TaskForm.tsx, TaskCard.tsx, TaskFilters.tsx,
          CreateTaskPanel.tsx, TaskDetailsPanel.tsx, Comments.tsx
    views/ListView.tsx, KanbanBoard.tsx, Dashboard.tsx
    ui/Button.tsx, Badge.tsx, Chip.tsx, Field.tsx,
       EmptyState.tsx, Toast.tsx, ThemeToggle.tsx
```

## 🧱 Architektura

- **Stan zadań** trzyma `useJiraStore` (oparty na `useReducer`). Każda mutacja
  jest czysta, automatycznie dopisuje wpis do audit logu i zapisuje stan do
  `localStorage`.
- **Motywowanie** opiera się na wariancie `dark:` Tailwinda — przełącznik dodaje/usuwa
  klasę `dark` na `<html>`, więc nie ma rozjazdu warunkowych klas w komponentach.
- **Formularze** (tworzenie/edycja) używają wspólnego `TaskForm`. Panel edycji
  resetuje się przez `key={task.id}`, więc zawsze startuje od aktualnego zadania.

## 📦 Stack

React 18 · TypeScript 5 · Vite 5 · Tailwind CSS 3 · ESLint

import type { ReactNode } from 'react';

/**
 * Code text rendered character-exact, like `Terminal`, but with:
 * - optional Python syntax highlighting (offline, hand-rolled: no hljs bundle);
 * - marks that can also strike through a substring (a dependency that was removed).
 * Reuses the engine's `bd-term` / `bd-mk` styles so it looks identical to `Terminal`.
 */

export interface CodeMark {
  /** Substring to mark (must occur in the line). */
  text: string;
  /** Which occurrence, 0-based. Default 0. */
  nth?: number;
  /** Marked now. Default true. */
  on?: boolean;
  /** Label shown under the substring while on (stage text). */
  label?: string;
  /** Strike the substring through (e.g. a dependency removed from the map). */
  strike?: boolean;
}

export interface CodeLine {
  t: string;
  /** Marks on this line. */
  marks?: CodeMark[];
  /** Label rows to reserve under this line (0–2), so labels never push the next line. */
  labels?: 0 | 1 | 2;
  /** Dim the line (context that is not the point of this beat). */
  dim?: boolean;
  /** Visible now. Default true. */
  on?: boolean;
  /** The line must appear in the source, verbatim. */
  exact?: boolean;
}

const PY_RE = /(#[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(def|from|import|if|elif|else|return|raise|assert|and|or|not|in|is|None|True|False|class|for|while|with|as|try|except|lambda)\b|\b(\d+)\b/g;

/** tokenize a plain-text slice into coloured spans (comments, strings, keywords, numbers) */
function pySpans(text: string, kp: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  PY_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = PY_RE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const color = m[1] ? 'var(--ink-3)' : m[2] ? 'var(--ok)' : m[3] ? 'var(--accent)' : 'var(--warning)';
    out.push(<span key={kp + k} style={{ color }}>{m[0]}</span>);
    last = m.index + m[0].length;
    k++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

interface Range { i: number; j: number; m: CodeMark }

function markRanges(t: string, marks: CodeMark[] = []): Range[] {
  return marks
    .map((m) => {
      let i = -1;
      for (let k = 0; k <= (m.nth ?? 0); k++) i = t.indexOf(m.text, i + 1);
      if (i < 0) throw new Error(`Code: mark "${m.text}" not found in "${t}"`);
      return { i, j: i + m.text.length, m };
    })
    .sort((a, b) => a.i - b.i);
}

export function Code({ lines, size = 28, x, y, width, python = false }: {
  lines: (string | CodeLine)[]; size?: number; x?: number; y?: number; width?: number; python?: boolean;
}) {
  return (
    <div className="bd-term" style={{ position: x != null || y != null ? 'absolute' : undefined, left: x, top: y, width, fontSize: size }}>
      {lines.map((raw, li) => {
        const l: CodeLine = typeof raw === 'string' ? { t: raw } : raw;
        const parts: ReactNode[] = [];
        let p = 0;
        let k = 0;
        for (const r of markRanges(l.t, l.marks)) {
          if (r.i > p) {
            const plain = l.t.slice(p, r.i);
            parts.push(<span key={`s${li}-${k++}`}>{python ? pySpans(plain, `t${li}-${k}-`) : plain}</span>);
          }
          parts.push(
            <span
              key={`m${li}-${k++}`}
              className={`bd-mk${(r.m.on ?? true) ? ' on' : ''}`}
              data-label={r.m.label ?? ''}
              style={{
                // strike only while the mark is on, like the colour and the label
                textDecoration: (r.m.on ?? true) && r.m.strike ? 'line-through' : 'none',
                textDecorationThickness: '3px',
                transition: 'text-decoration-color 400ms',
              }}
            >
              {r.m.text}
            </span>,
          );
          p = r.j;
        }
        if (p < l.t.length) {
          const rest = l.t.slice(p);
          parts.push(<span key={`s${li}-${k++}`}>{python ? pySpans(rest, `t${li}-${k}-`) : rest}</span>);
        }
        return (
          <div
            key={li}
            className={`bd-term-line${l.dim ? ' dim' : ''}`}
            data-exact={l.exact ? true : undefined}
            style={{ paddingBottom: `${(l.labels ?? 0) * 1.25}em`, opacity: l.on === false ? 0 : undefined }}
          >
            {parts}
          </div>
        );
      })}
    </div>
  );
}

import type { Question } from '../data';

// Turning guide markdown into quiz / review questions.
//
// Split out of data.ts, which is otherwise the content registry (menu
// structure, cheat sheets, lazy loaders). This is the half with real logic and
// real history: two different question-marker formats, the `---` terminator
// that ends an answer, and `dedupeIds` — which exists because 344 of 1,298
// questions collided on an id, and ids are the localStorage keys for
// spaced-repetition state, so a collision made two questions share one review
// record. `src/data.test.ts` covers all of it.
//
// `getAllQuestions()` stays in data.ts: it needs `loadAllContent`, and putting
// it here would make this module import the registry that imports it.

// ==================== Quiz Q&A Parser ====================

interface DifficultyRange {
  difficulty: string;
  startIndex: number;
}

function parseDifficultyRanges(content: string): DifficultyRange[] {
  const ranges: DifficultyRange[] = [];
  const regex = /^### (Beginner|Intermediate|Advanced)(?:\s*\(.*?\))?\s*$/gm;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    ranges.push({ difficulty: match[1].toLowerCase(), startIndex: match.index });
  }
  return ranges;
}

function getDifficulty(questionIndex: number, difficultyRanges: DifficultyRange[]): string | undefined {
  if (difficultyRanges.length === 0) return undefined;
  for (let i = difficultyRanges.length - 1; i >= 0; i--) {
    if (questionIndex >= difficultyRanges[i].startIndex) {
      return difficultyRanges[i].difficulty;
    }
  }
  return undefined;
}

/**
 * Question ids are `<guide>-q<N>`, taken from the `**QN:**` marker. Many guides
 * contain two independent Q sequences (an interview section and a "Tricky
 * Output Questions" section, each restarting at Q1), so that number is not
 * unique within a file — 344 of 1,298 questions collided before this.
 *
 * Ids are the localStorage keys for spaced-repetition state, so a collision
 * made two different questions share one SM-2 record: reviewing one silently
 * rescheduled the other, and both showed up in the same review queue.
 *
 * The first occurrence keeps its original id so existing review history stays
 * attached; only repeats are suffixed.
 */
function dedupeIds(questions: Question[]): Question[] {
  const seen = new Map<string, number>();
  for (const q of questions) {
    const n = (seen.get(q.id) ?? 0) + 1;
    seen.set(q.id, n);
    if (n > 1) q.id = `${q.id}-${n}`;
  }
  return questions;
}

export function extractQuestions(content: string, guideName: string): Question[] {
  const questions: Question[] = [];
  const difficultyRanges = parseDifficultyRanges(content);

  // Pattern 1: JS Interview Prep style — ## QN + code block + output + explanation
  const jsPattern = /^## Q(\d+)\s*\n([\s\S]*?)(?=^## Q\d+\s*$|$)/gm;
  const jsMatches = [...content.matchAll(jsPattern)];

  if (jsMatches.length > 3) {
    for (const m of jsMatches) {
      const block = m[2];
      const codeMatch = block.match(/```[\w]*\n([\s\S]*?)```/);
      const outputMatch = block.match(/###\s*✅\s*Output[\s\S]*?\n([\s\S]*?)(?=###|---|$)/);
      const explainMatch = block.match(/###\s*💡\s*Explanation\s*\n([\s\S]*?)(?=---|^## |$)/m);

      if (codeMatch) {
        questions.push({
          id: `${guideName}-q${m[1]}`,
          question: `What is the output?\n\n\`\`\`javascript\n${codeMatch[1].trim()}\n\`\`\``,
          answer: [
            outputMatch ? `**Output:**\n\`\`\`\n${outputMatch[1].trim()}\n\`\`\`` : '',
            explainMatch ? `\n\n**Explanation:**\n${explainMatch[1].trim()}` : '',
          ].filter(Boolean).join('\n'),
          guide: guideName,
          type: 'output',
          difficulty: getDifficulty(m.index, difficultyRanges),
        });
      }
    }
    return dedupeIds(questions);
  }

  // Pattern 2: Standard guide style — **QN: Question text** followed by answer
  const stdPattern = /\*\*Q(\d+):\s*(.+?)\*\*\s*\n([\s\S]*?)(?=\*\*Q\d+:|---(?:\s*\n)|$)/g;
  const stdMatches = [...content.matchAll(stdPattern)];

  for (const m of stdMatches) {
    const answer = m[3].trim();
    if (answer.length > 10) {
      questions.push({
        id: `${guideName}-q${m[1]}`,
        question: m[2].trim(),
        answer,
        guide: guideName,
        type: 'conceptual',
        difficulty: getDifficulty(m.index, difficultyRanges),
      });
    }
  }

  return dedupeIds(questions);
}

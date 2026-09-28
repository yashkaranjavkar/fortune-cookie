import { useRef, useState } from 'react';
import { Mascot, useMascot, MASCOT_REACTIONS, EMOTION_NAMES } from './mascot';

const QUESTIONS = [
  { q: 'What is inside a fortune cookie?', a: ['A paper fortune', 'A coin', 'Chocolate'], correct: 0 },
  { q: 'Fortune cookies are usually…', a: ['Soft and chewy', 'Crisp and folded', 'Frozen'], correct: 1 },
  { q: 'A fortune usually gives you…', a: ['A recipe', 'A map', 'A wise saying'], correct: 2 },
];

export default function QuizExample() {
  const buddy = useRef(null);          // the mascot that sits on the screen
  const { trigger } = useMascot();     // the pop-up mascot
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState(false);
  const [asked, setAsked] = useState(Date.now());

  const current = QUESTIONS[index];

  function answer(i) {
    const correct = i === current.correct;
    const fast = Date.now() - asked < 3000;

    if (correct) {
      const nextStreak = streak + 1;
      setScore((s) => s + 10);
      setStreak(nextStreak);
      const event = nextStreak >= 3 ? 'combo' : fast ? 'fastCorrect' : 'correct';
      buddy.current.play(MASCOT_REACTIONS[event]);
      trigger(event, { message: 'Correct! +10' });
    } else {
      const event = streak >= 3 ? 'streakLost' : 'wrong';
      setStreak(0);
      buddy.current.play(MASCOT_REACTIONS[event]);
      trigger(event, { message: 'Not quite, try the next one' });
    }

    if (index + 1 < QUESTIONS.length) {
      setIndex(index + 1);
      setAsked(Date.now());
    } else {
      setDone(true);
      const perfect = correct && score + 10 === QUESTIONS.length * 10;
      setTimeout(() => trigger(perfect ? 'perfectSession' : 'sessionComplete', { message: 'Lesson complete!' }), 2600);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>Fortune Quiz</h1>

        {/* Stays on screen. When the session ends it switches to a looping celebration. */}
        <Mascot ref={buddy} emotion={done ? 'overjoyed' : 'cozy'} size="180px" />

        {done ? (
          <p style={styles.q}>Session complete! Score {score}</p>
        ) : (
          <>
            <p style={styles.q}>{current.q}</p>
            <div style={styles.answers}>
              {current.a.map((text, i) => (
                <button key={text} style={styles.btn} onClick={() => answer(i)}>{text}</button>
              ))}
            </div>
            <p>Question {index + 1} of {QUESTIONS.length} · Score {score}</p>
          </>
        )}

        <hr style={styles.hr} />
        <p>Preview every emotion:</p>
        <div style={styles.all}>
          {EMOTION_NAMES.map((name) => (
            <button key={name} style={styles.small} onClick={() => buddy.current.play(name)}>{name}</button>
          ))}
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#E3874B', display: 'grid', placeItems: 'center', padding: 24, boxSizing: 'border-box', color: '#3A1F10', fontFamily: "'Nunito', system-ui, sans-serif" },
  card: { width: 'min(520px, 100%)', background: '#FFF6E6', borderRadius: 28, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center', boxShadow: '0 16px 40px rgba(58,31,16,.2)' },
  title: { margin: 0, fontFamily: "'Fredoka', sans-serif", fontSize: 28 },
  q: { margin: 0, fontSize: 20, fontWeight: 700 },
  answers: { display: 'grid', gap: 10, width: '100%' },
  btn: { minHeight: 48, border: '2px solid #3A1F10', borderRadius: 14, background: '#fff', color: '#3A1F10', font: "700 17px 'Nunito', sans-serif", cursor: 'pointer' },
  small: { minHeight: 44, padding: '0 14px', border: '2px solid #3A1F10', borderRadius: 12, background: '#fff', color: '#3A1F10', font: "700 14px 'Nunito', sans-serif", cursor: 'pointer' },
  all: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  hr: { width: '100%', border: 0, borderTop: '1px solid #EBD3BA' },
};

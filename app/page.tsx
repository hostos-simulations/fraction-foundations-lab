"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Mode = "learn" | "practice" | "test";
type Op = "add" | "subtract" | "multiply" | "divide";
type Overlay = "menu" | "guide" | null;
type Fr = { n: number; d: number };
const OPS: Record<
  Op,
  { label: string; symbol: string; color: string; rule: string[] }
> = {
  add: {
    label: "Add",
    symbol: "+",
    color: "hostos-yellow",
    rule: [
      "Find a common denominator.",
      "Rename each fraction.",
      "Add the numerators.",
      "Simplify if possible.",
    ],
  },
  subtract: {
    label: "Subtract",
    symbol: "−",
    color: "hostos-orange",
    rule: [
      "Find a common denominator.",
      "Rename each fraction.",
      "Subtract the numerators.",
      "Simplify if possible.",
    ],
  },
  multiply: {
    label: "Multiply",
    symbol: "×",
    color: "hostos-navy",
    rule: [
      "Multiply the numerators.",
      "Multiply the denominators.",
      "Simplify the product.",
    ],
  },
  divide: {
    label: "Divide",
    symbol: "÷",
    color: "custom-yellow",
    rule: [
      "Keep the first fraction.",
      "Change ÷ to ×.",
      "Flip the second fraction.",
      "Multiply, then simplify.",
    ],
  },
};
const PROBLEMS: Record<Op, [Fr, Fr][]> = {
  add: [
    [
      { n: 1, d: 3 },
      { n: 1, d: 6 },
    ],
    [
      { n: 2, d: 5 },
      { n: 1, d: 4 },
    ],
    [
      { n: 3, d: 8 },
      { n: 1, d: 2 },
    ],
  ],
  subtract: [
    [
      { n: 3, d: 4 },
      { n: 1, d: 6 },
    ],
    [
      { n: 5, d: 6 },
      { n: 1, d: 3 },
    ],
    [
      { n: 7, d: 10 },
      { n: 1, d: 4 },
    ],
  ],
  multiply: [
    [
      { n: 2, d: 3 },
      { n: 3, d: 5 },
    ],
    [
      { n: 3, d: 4 },
      { n: 2, d: 9 },
    ],
    [
      { n: 5, d: 6 },
      { n: 3, d: 10 },
    ],
  ],
  divide: [
    [
      { n: 2, d: 3 },
      { n: 4, d: 5 },
    ],
    [
      { n: 3, d: 7 },
      { n: 2, d: 5 },
    ],
    [
      { n: 5, d: 8 },
      { n: 3, d: 4 },
    ],
  ],
};
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const lcm = (a: number, b: number) => Math.abs(a * b) / gcd(a, b);
function solve(op: Op, a: Fr, b: Fr): Fr {
  let n = 0,
    d = 1;
  if (op === "add" || op === "subtract") {
    d = lcm(a.d, b.d);
    n = a.n * (d / a.d) + (op === "add" ? 1 : -1) * b.n * (d / b.d);
  } else if (op === "multiply") {
    n = a.n * b.n;
    d = a.d * b.d;
  } else {
    n = a.n * b.d;
    d = a.d * b.n;
  }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

function Fraction({ v }: { v: Fr }) {
  return (
    <span className="fraction" aria-label={`${v.n} over ${v.d}`}>
      <span>{v.n}</span>
      <span>{v.d}</span>
    </span>
  );
}
function Rule({ op, compact = false }: { op: Op; compact?: boolean }) {
  const x = OPS[op],
    id = `rule-${op}`;
  return (
    <aside
      className={`rule-card ${compact ? "compact" : ""}`}
      aria-labelledby={id}
    >
      <div className="rule-heading">
        <span className={`rule-icon ${x.color}`} aria-hidden="true">
          {x.symbol}
        </span>
        <div>
          <span className="eyebrow">THE RULE</span>
          <h2 id={id}>{x.label} fractions</h2>
        </div>
      </div>
      <ol>
        {x.rule.map((s, i) => (
          <li key={s}>
            <span aria-hidden="true">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
    </aside>
  );
}
function Picker({ value, onChange }: { value: Op; onChange: (o: Op) => void }) {
  return (
    <fieldset className="operation-picker">
      <legend className="sr-only">Choose an operation</legend>
      {(Object.keys(OPS) as Op[]).map((k) => (
        <button
          type="button"
          key={k}
          className={value === k ? "selected" : ""}
          aria-pressed={value === k}
          onClick={() => onChange(k)}
        >
          <span className={`op-dot ${OPS[k].color}`} aria-hidden="true">
            {OPS[k].symbol}
          </span>
          {OPS[k].label}
        </button>
      ))}
    </fieldset>
  );
}

const LESSONS: Record<
  Op,
  { title: string; text: string; kind: "problem" | "multiples" | "transform" }[]
> = {
  add: [
    {
      title: "Look at the denominators",
      text: "Different denominators name different-size parts. Before adding, rename both fractions with equal-size parts.",
      kind: "problem",
    },
    {
      title: "Find a shared denominator",
      text: "List multiples. Choose the smallest number that both denominators divide into.",
      kind: "multiples",
    },
    {
      title: "Rename, then combine",
      text: "Multiply the numerator and denominator by the same number. Add only the numerators, then check for a shared factor.",
      kind: "transform",
    },
  ],
  subtract: [
    {
      title: "Compare the parts",
      text: "You can subtract only when both fractions describe equal-size parts.",
      kind: "problem",
    },
    {
      title: "Find a shared denominator",
      text: "Choose a number both denominators divide into. The least common denominator keeps the arithmetic smaller.",
      kind: "multiples",
    },
    {
      title: "Rename, then subtract",
      text: "Subtract the second numerator from the first. Keep the common denominator and simplify.",
      kind: "transform",
    },
  ],
  multiply: [
    {
      title: "Multiply straight across",
      text: "Fractions already describe parts, so no common denominator is needed.",
      kind: "problem",
    },
    {
      title: "Top numbers together",
      text: "Multiply numerator by numerator. This becomes the new numerator.",
      kind: "multiples",
    },
    {
      title: "Bottom numbers together",
      text: "Multiply denominator by denominator, then simplify using a shared factor.",
      kind: "transform",
    },
  ],
  divide: [
    {
      title: "Keep, change, flip",
      text: "Keep the first fraction. Change division to multiplication. Flip the second fraction.",
      kind: "problem",
    },
    {
      title: "Use the reciprocal",
      text: "The numerator and denominator of the second fraction trade places.",
      kind: "multiples",
    },
    {
      title: "Multiply and simplify",
      text: "Use the multiplication rule, then divide top and bottom by any shared factor.",
      kind: "transform",
    },
  ],
};
function LessonVisual({ op, kind }: { op: Op; kind: string }) {
  const [a, b] = PROBLEMS[op][0];
  if (kind === "problem")
    return (
      <>
        <Fraction v={a} />
        <b>{OPS[op].symbol}</b>
        <Fraction v={b} />
      </>
    );
  if (kind === "multiples") {
    if (op === "add" || op === "subtract")
      return (
        <div className="multiple-row">
          <span>
            {a.d}: {a.d}, <b>{lcm(a.d, b.d)}</b>, {lcm(a.d, b.d) + a.d}
          </span>
          <span>
            {b.d}: <b>{lcm(a.d, b.d)}</b>, {lcm(a.d, b.d) + b.d}
          </span>
        </div>
      );
    if (op === "multiply")
      return (
        <div className="mini-equation">
          {a.n} × {b.n} → numerator
        </div>
      );
    return (
      <div className="equiv">
        <Fraction v={b} />
        <b>→</b>
        <Fraction v={{ n: b.d, d: b.n }} />
      </div>
    );
  }
  if (op === "add")
    return (
      <div className="equiv">
        <Fraction v={a} />
        <b>→</b>
        <Fraction v={{ n: 2, d: 6 }} />
      </div>
    );
  if (op === "subtract")
    return (
      <div className="equiv">
        <Fraction v={a} />
        <b>→</b>
        <Fraction v={{ n: 9, d: 12 }} />
      </div>
    );
  if (op === "multiply")
    return (
      <div className="mini-equation">
        {a.d} × {b.d} → denominator
      </div>
    );
  return (
    <>
      <Fraction v={a} />
      <b>×</b>
      <Fraction v={{ n: b.d, d: b.n }} />
    </>
  );
}

function Learn({ op, setOp }: { op: Op; setOp: (o: Op) => void }) {
  const [step, setStep] = useState(0);
  const item = LESSONS[op][step];
  return (
    <div className="mode-layout">
      <Rule op={op} />
      <section className="workspace" aria-labelledby="lesson-title">
        <div className="workspace-top">
          <div>
            <span className="eyebrow">LEARN THE PATTERN</span>
            <h1 id="lesson-title">{item.title}</h1>
          </div>
          <span className="step-count" role="status">
            Step {step + 1} of 3
          </span>
        </div>
        <div
          className={`lesson-visual ${OPS[op].color}`}
          aria-label={`Worked example for ${OPS[op].label.toLowerCase()} fractions`}
        >
          <LessonVisual op={op} kind={item.kind} />
        </div>
        <p className="lesson-copy">{item.text}</p>
        <div
          className="step-dots"
          role="progressbar"
          aria-label="Lesson progress"
          aria-valuemin={1}
          aria-valuemax={3}
          aria-valuenow={step + 1}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={i <= step ? "active" : ""}
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="actions">
          <button
            type="button"
            className="secondary"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
          >
            Back
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => setStep(step + 1)}
            disabled={step === 2}
          >
            Next step <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
      <Picker value={op} onChange={setOp} />
    </div>
  );
}

function Practice({
  op,
  setOp,
  onSuccess,
}: {
  op: Op;
  setOp: (o: Op) => void;
  onSuccess: () => void;
}) {
  const [index, setIndex] = useState(0),
    [stage, setStage] = useState(0),
    [inputs, setInputs] = useState({ a: "", b: "" }),
    [feedback, setFeedback] = useState<{
      kind: "good" | "try";
      text: string;
    } | null>(null),
    [hints, setHints] = useState(0);
  const [a, b] = PROBLEMS[op][index % 3],
    answer = solve(op, a, b),
    common = op === "add" || op === "subtract",
    stages = common || op === "divide" ? 2 : 1;
  const prompt =
    common && stage === 0
      ? "Enter a common denominator"
      : op === "divide" && stage === 0
        ? "Enter the reciprocal of the second fraction"
        : "Enter the simplified result";
  function check() {
    const x = Number(inputs.a),
      y = Number(inputs.b);
    if (!inputs.a || !inputs.b || y === 0) {
      setFeedback({
        kind: "try",
        text: "Enter a number in both boxes. A denominator cannot be zero.",
      });
      return;
    }
    let ok = false;
    if (common && stage === 0) ok = x === y && x % a.d === 0 && x % b.d === 0;
    else if (op === "divide" && stage === 0) ok = x === b.d && y === b.n;
    else ok = x === answer.n && y === answer.d;
    if (ok) {
      setFeedback({
        kind: "good",
        text:
          stage + 1 < stages
            ? "That step works. Continue when you are ready."
            : "Strong work. Your fraction is correct and simplified.",
      });
      if (stage + 1 === stages && feedback?.kind !== "good") onSuccess();
    } else {
      const text =
        common && stage === 0
          ? "That number does not work for both denominators. Check the multiples of each denominator."
          : op === "divide" && stage === 0
            ? "Check which fraction should flip. The first fraction stays exactly as it is."
            : gcd(x, y) > 1
              ? "Your fraction can still be simplified. Look for a number that divides both entries."
              : "Recheck the operation rule and your arithmetic. Revise one step.";
      setFeedback({ kind: "try", text });
    }
  }
  const hint =
    common && stage === 0
      ? hints < 2
        ? "Write the first few multiples of each denominator."
        : "Look for the first number that appears in both lists."
      : op === "divide" && stage === 0
        ? "The reciprocal swaps the top and bottom numbers."
        : hints < 2
          ? "Follow the numbered rule one line at a time."
          : "Check for a shared factor after you calculate.";
  function next() {
    setIndex((index + 1) % 3);
    setStage(0);
    setInputs({ a: "", b: "" });
    setFeedback(null);
    setHints(0);
  }
  function advance() {
    setStage(stage + 1);
    setInputs({ a: "", b: "" });
    setFeedback(null);
    setHints(0);
  }
  const describedBy = feedback
    ? "practice-feedback"
    : hints > 0
      ? "practice-hint"
      : undefined;
  return (
    <div className="mode-layout">
      <Rule op={op} />
      <section className="workspace" aria-labelledby="practice-title">
        <div className="workspace-top">
          <div>
            <span className="eyebrow">GUIDED PRACTICE</span>
            <h1 id="practice-title">Your turn</h1>
          </div>
          <span className="problem-count">Problem {index + 1}</span>
        </div>
        <div
          className="problem"
          aria-label={`${a.n} over ${a.d} ${OPS[op].label.toLowerCase()} ${b.n} over ${b.d}`}
        >
          <Fraction v={a} />
          <b aria-hidden="true">{OPS[op].symbol}</b>
          <Fraction v={b} />
        </div>
        <div className="response-area">
          <p id="practice-prompt">{prompt}</p>
          <FractionInput
            value={inputs}
            onChange={setInputs}
            label={prompt}
            invalid={feedback?.kind === "try"}
            describedBy={describedBy}
          />
        </div>
        {feedback && (
          <div
            id="practice-feedback"
            className={`feedback ${feedback.kind}`}
            role="status"
            aria-live="polite"
          >
            <span aria-hidden="true">
              {feedback.kind === "good" ? "✓" : "↗"}
            </span>
            <p>
              <strong>
                {feedback.kind === "good" ? "Good reasoning" : "Try this"}
              </strong>
              {feedback.text}
            </p>
          </div>
        )}
        {hints > 0 && !feedback && (
          <div id="practice-hint" className="hint" role="status">
            <b>Hint {Math.min(hints, 2)}:</b> {hint}
          </div>
        )}
        <div className="actions">
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setHints(Math.min(2, hints + 1));
              setFeedback(null);
            }}
          >
            Give me a hint
          </button>
          {feedback?.kind === "good" && stage + 1 < stages ? (
            <button type="button" className="primary" onClick={advance}>
              Continue to next step <span aria-hidden="true">→</span>
            </button>
          ) : (
            <button type="button" className="primary" onClick={check}>
              Check my step <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
        {feedback?.kind === "good" && stage + 1 === stages && (
          <button type="button" className="text-button" onClick={next}>
            Try another problem <span aria-hidden="true">→</span>
          </button>
        )}
      </section>
      <Picker value={op} onChange={setOp} />
    </div>
  );
}
function FractionInput({
  value,
  onChange,
  small = false,
  label = "",
  invalid = false,
  describedBy,
}: {
  value: { a: string; b: string };
  onChange: (v: { a: string; b: string }) => void;
  small?: boolean;
  label?: string;
  invalid?: boolean;
  describedBy?: string;
}) {
  return (
    <div
      className={`fraction-input ${small ? "small" : ""}`}
      role="group"
      aria-label={label || "Fraction response"}
    >
      <label className="fraction-field">
        <span className="sr-only">Numerator or first value</span>
        <input
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          inputMode="numeric"
          autoComplete="off"
          value={value.a}
          onChange={(e) =>
            onChange({ ...value, a: e.target.value.replace(/[^0-9-]/g, "") })
          }
        />
      </label>
      <span aria-hidden="true" />
      <label className="fraction-field">
        <span className="sr-only">Denominator or second value</span>
        <input
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          inputMode="numeric"
          autoComplete="off"
          value={value.b}
          onChange={(e) =>
            onChange({ ...value, b: e.target.value.replace(/[^0-9-]/g, "") })
          }
        />
      </label>
    </div>
  );
}

function Test() {
  const questions = useMemo(
      () =>
        (Object.keys(OPS) as Op[]).map((op, i) => ({
          op,
          pair: PROBLEMS[op][i % 3],
        })),
      [],
    ),
    [answers, setAnswers] = useState<Record<number, { a: string; b: string }>>(
      {},
    ),
    [report, setReport] = useState<{ score: number; skills: string[] } | null>(
      null,
    ),
    [active, setActive] = useState<Op>("add"),
    reportRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (report) reportRef.current?.focus();
  }, [report]);
  function submit() {
    let score = 0;
    const skills: string[] = [];
    questions.forEach((q, i) => {
      const s = solve(q.op, ...q.pair),
        r = answers[i];
      if (r && Number(r.a) === s.n && Number(r.b) === s.d) score++;
      else skills.push(OPS[q.op].label);
    });
    setReport({ score, skills });
  }
  if (report)
    return (
      <div className="test-report" ref={reportRef} tabIndex={-1}>
        <span className="eyebrow">KNOWLEDGE CHECK COMPLETE</span>
        <div className="score-ring" aria-label={`Score: ${report.score} of 4`}>
          <strong aria-hidden="true">{report.score}</strong>
          <span aria-hidden="true">of 4</span>
        </div>
        <h1>
          {report.score === 4
            ? "Your fraction foundation is solid."
            : "You found your next learning target."}
        </h1>
        <p>
          {report.skills.length
            ? `Review: ${report.skills.join(", ")}. Your answers remain hidden so you can revisit the reasoning.`
            : "You applied all four operation rules accurately."}
        </p>
        <button
          type="button"
          className="primary"
          onClick={() => {
            setAnswers({});
            setReport(null);
          }}
        >
          Try a new check <span aria-hidden="true">↻</span>
        </button>
      </div>
    );
  return (
    <div className="test-layout">
      <section className="test-main" aria-labelledby="test-title">
        <div className="workspace-top">
          <div>
            <span className="eyebrow">TEST YOUR KNOWLEDGE</span>
            <h1 id="test-title">Four operations check</h1>
            <p>
              Work independently. You will receive a skill report, not an answer
              key.
            </p>
          </div>
          <span className="problem-count" role="status">
            {Object.keys(answers).length} of 4 attempted
          </span>
        </div>
        <div className="question-list">
          {questions.map((q, i) => {
            const [a, b] = q.pair,
              v = answers[i] || { a: "", b: "" };
            return (
              <article
                key={q.op}
                onFocus={() => setActive(q.op)}
                aria-labelledby={`question-${i + 1}`}
              >
                <span className="q-number" id={`question-${i + 1}`}>
                  {i + 1}
                </span>
                <div
                  className="q-problem"
                  aria-label={`${a.n} over ${a.d} ${OPS[q.op].label.toLowerCase()} ${b.n} over ${b.d} equals`}
                >
                  <Fraction v={a} />
                  <b aria-hidden="true">{OPS[q.op].symbol}</b>
                  <Fraction v={b} />
                  <b aria-hidden="true">=</b>
                </div>
                <FractionInput
                  small
                  label={`Question ${i + 1} answer`}
                  value={v}
                  onChange={(x) => setAnswers({ ...answers, [i]: x })}
                />
                <button
                  type="button"
                  className="rule-link"
                  onClick={() => setActive(q.op)}
                  aria-pressed={active === q.op}
                >
                  View {OPS[q.op].label.toLowerCase()} rule
                </button>
              </article>
            );
          })}
        </div>
        <button
          type="button"
          className="primary submit-test"
          onClick={submit}
          disabled={Object.keys(answers).length < 4}
        >
          Submit knowledge check <span aria-hidden="true">→</span>
        </button>
      </section>
      <Rule op={active} compact />
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("learn"),
    [op, setOp] = useState<Op>("add"),
    [overlay, setOverlay] = useState<Overlay>(null),
    [mastery, setMastery] = useState<Record<Op, number>>({
      add: 0,
      subtract: 0,
      multiply: 0,
      divide: 0,
    }),
    dialogRef = useRef<HTMLElement>(null),
    returnFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const loadProgress = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem("fraction-lab-progress");
        if (saved) setMastery(JSON.parse(saved));
      } catch {}
    }, 0);
    return () => window.clearTimeout(loadProgress);
  }, []);
  useEffect(() => {
    if (!overlay) return;
    const dialog = dialogRef.current,
      oldOverflow = document.body.style.overflow,
      focusTimer = window.setTimeout(
        () => dialog?.querySelector<HTMLElement>("[data-autofocus]")?.focus(),
        0,
      );
    document.body.style.overflow = "hidden";
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOverlay(null);
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0],
        last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeydown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = oldOverflow;
      returnFocusRef.current?.focus();
    };
  }, [overlay]);
  function openOverlay(next: Exclude<Overlay, null>, trigger: HTMLElement) {
    returnFocusRef.current = trigger;
    setOverlay(next);
  }
  function mark() {
    setMastery((p) => {
      const n = { ...p, [op]: Math.min(3, p[op] + 1) };
      localStorage.setItem("fraction-lab-progress", JSON.stringify(n));
      return n;
    });
  }
  const total = Object.values(mastery).reduce((a, b) => a + b, 0);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="app-header">
        <a
          className="brand"
          href="#main-content"
          aria-label="Fraction Foundations home"
        >
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
          </span>
          <span>
            FRACTION
            <br />
            <b>FOUNDATIONS</b>
          </span>
        </a>
        <nav aria-label="Learning modes">
          {(["learn", "practice", "test"] as Mode[]).map((m) => (
            <button
              type="button"
              key={m}
              className={mode === m ? "active" : ""}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {m === "test" ? "Test yourself" : m[0].toUpperCase() + m.slice(1)}
            </button>
          ))}
        </nav>
        <div className="header-tools">
          <div
            className="progress-pill"
            role="progressbar"
            aria-label="Guided practice progress"
            aria-valuemin={0}
            aria-valuemax={12}
            aria-valuenow={total}
          >
            <span>{total}/12</span>
            <div aria-hidden="true">
              <i style={{ width: `${(total / 12) * 100}%` }} />
            </div>
          </div>
          <button
            type="button"
            className="menu-trigger"
            aria-haspopup="dialog"
            onClick={(event) => openOverlay("menu", event.currentTarget)}
          >
            <span className="menu-bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            Guide
          </button>
        </div>
      </header>
      <main className="page-shell" id="main-content" tabIndex={-1}>
        {mode === "learn" && (
          <section className="welcome-strip" aria-labelledby="welcome-title">
            <div>
              <span className="eyebrow">START HERE</span>
              <h2 id="welcome-title">
                Build the rule before solving the problem.
              </h2>
              <p>Learn, practice with feedback, then test your reasoning.</p>
            </div>
            <button
              type="button"
              className="secondary"
              aria-haspopup="dialog"
              onClick={(event) => openOverlay("guide", event.currentTarget)}
            >
              How to use this app
            </button>
          </section>
        )}
        {mode === "learn" && <Learn key={op} op={op} setOp={setOp} />}{" "}
        {mode === "practice" && (
          <Practice key={op} op={op} setOp={setOp} onSuccess={mark} />
        )}{" "}
        {mode === "test" && <Test />}
      </main>
      <footer>
        <p>Built for learning, one step at a time.</p>
        <p>
          Designed to support WCAG 2.2 AA conformance efforts. Progress stays on
          this device.
        </p>
      </footer>
      {overlay && (
        <div
          className={`overlay ${overlay === "menu" ? "drawer-overlay" : "lightbox-overlay"}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOverlay(null);
          }}
        >
          {overlay === "menu" ? (
            <aside
              className="side-drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="drawer-title"
              ref={dialogRef}
            >
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">FRACTION FOUNDATIONS</span>
                  <h2 id="drawer-title">Guide</h2>
                </div>
                <button
                  type="button"
                  className="close-button"
                  aria-label="Close guide"
                  data-autofocus
                  onClick={() => setOverlay(null)}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="drawer-content">
                <section aria-labelledby="workflow-title">
                  <h3 id="workflow-title">Workflow</h3>
                  <ul>
                    <li>
                      <strong>Learn:</strong> Choose an operation and follow the
                      rule one step at a time.
                    </li>
                    <li>
                      <strong>Practice:</strong> Enter each step, request a hint,
                      and revise from the feedback.
                    </li>
                    <li>
                      <strong>Test:</strong> Complete all four operations and
                      receive a skill report.
                    </li>
                  </ul>
                </section>
                <section aria-labelledby="keyboard-title">
                  <h3 id="keyboard-title">Keyboard</h3>
                  <ul className="keyboard-list">
                    <li><kbd>Tab</kbd><span>Move through controls</span></li>
                    <li><kbd>Shift</kbd> + <kbd>Tab</kbd><span>Move backward</span></li>
                    <li><kbd>Enter</kbd><span>Activate a focused button</span></li>
                    <li><kbd>Space</kbd><span>Activate a focused button</span></li>
                    <li><kbd>Esc</kbd><span>Close this panel</span></li>
                  </ul>
                </section>
              </div>
              <div className="credits">
                <h3>Project credits</h3>
                <p>
                  <strong>Concept and mathematical direction</strong><br />
                  Professor Olen Dias<br />
                  Mathematics Department, Hostos Community College
                </p>
                <p>
                  <strong>Learning technology and technical support</strong><br />
                  Ana Marjanovic<br />
                  LMS Administrator and Instructional Designer, Office of
                  Educational Technology, Hostos Community College
                </p>
              </div>
            </aside>
          ) : (
            <section
              className="how-to-lightbox"
              role="dialog"
              aria-modal="true"
              aria-labelledby="how-to-title"
              ref={dialogRef}
            >
              <button
                type="button"
                className="close-button lightbox-close"
                aria-label="Close how-to instructions"
                data-autofocus
                onClick={() => setOverlay(null)}
              >
                <span aria-hidden="true">×</span>
              </button>
              <span className="eyebrow">QUICK START</span>
              <h2 id="how-to-title">How to use Fraction Foundations</h2>
              <ol className="quick-steps">
                <li>
                  <span aria-hidden="true">1</span>
                  <div><strong>Learn the rule</strong><p>Choose an operation and move through its three short explanations.</p></div>
                </li>
                <li>
                  <span aria-hidden="true">2</span>
                  <div><strong>Practice the process</strong><p>Enter your work one step at a time. Use hints and feedback to revise.</p></div>
                </li>
                <li>
                  <span aria-hidden="true">3</span>
                  <div><strong>Test your reasoning</strong><p>Complete the four-operation check to see which skills to review.</p></div>
                </li>
              </ol>
              <div className="lightbox-note">
                <strong>Designed for productive struggle:</strong> feedback
                guides your next move without revealing the answer.
              </div>
              <button
                type="button"
                className="primary"
                onClick={() => setOverlay(null)}
              >
                Start learning <span aria-hidden="true">→</span>
              </button>
            </section>
          )}
        </div>
      )}
    </>
  );
}

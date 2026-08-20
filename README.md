# Fraction Foundations Lab

Fraction Foundations Lab is an interactive learning application for college
students developing fluency with addition, subtraction, multiplication, and
division of fractions.

Students can:

- learn each operation through short, rule-based explanations;
- practice one step at a time with hints and formative feedback;
- complete a four-operation knowledge check without receiving an answer key;
- navigate the interface with a keyboard; and
- retain guided-practice progress on their device.

The interface uses Hostos Community College colors and typography and is
designed to support WCAG 2.2 Level AA conformance efforts.

## Project credits

**Concept and mathematical direction**  
Professor Olen Dias  
Mathematics Department, Hostos Community College

**Learning technology and technical support**  
Ana Marjanovic  
LMS Administrator and Instructional Designer, Office of Educational
Technology, Hostos Community College

## Run locally

Requirements: Node.js 22 or later.

```bash
npm ci
npm run dev
```

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds the static version
and publishes it through GitHub Pages whenever the `main` branch changes.

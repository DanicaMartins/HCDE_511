#!/usr/bin/env node
/**
 * Build HCDE 511 presentation deck (.pptx)
 * Run from repo root: node scripts/build_presentation.js
 */

const path = require("path");
const pptxgen = require(path.join(__dirname, "../presentation/node_modules/pptxgenjs"));

const COLORS = {
  bg: "F7F5F0",
  text: "1A1714",
  accent: "C8714A",
  muted: "6B6560",
  border: "E8E4DC",
};

const FONTS = {
  heading: "Georgia",
  body: "Helvetica Neue",
};

const MARGIN = 0.75;
const SLIDE_W = 10;
const SLIDE_H = 5.625;

const OUTPUT = path.join(__dirname, "../output/HCDE511_Presentation.pptx");

function applySlideBackground(slide) {
  slide.background = { color: COLORS.bg };
}

/**
 * Build rich-text runs from a string, accenting specific phrases (case-sensitive).
 */
function buildRichText(text, accentPhrases = []) {
  if (!accentPhrases.length) {
    return [{ text, options: { color: COLORS.text } }];
  }

  const sorted = [...accentPhrases].sort((a, b) => b.length - a.length);
  const runs = [];
  let remaining = text;

  while (remaining.length > 0) {
    let matched = null;
    let matchIndex = remaining.length;

    for (const phrase of sorted) {
      const idx = remaining.indexOf(phrase);
      if (idx !== -1 && idx < matchIndex) {
        matched = phrase;
        matchIndex = idx;
      }
    }

    if (matched === null) {
      runs.push({ text: remaining, options: { color: COLORS.text } });
      break;
    }

    if (matchIndex > 0) {
      runs.push({
        text: remaining.slice(0, matchIndex),
        options: { color: COLORS.text },
      });
    }

    runs.push({
      text: matched,
      options: { color: COLORS.accent },
    });

    remaining = remaining.slice(matchIndex + matched.length);
  }

  return runs;
}

function addHeading(slide, text, accentPhrases = [], y = MARGIN, fontSize = 36) {
  slide.addText(buildRichText(text, accentPhrases), {
    x: MARGIN,
    y,
    w: SLIDE_W - MARGIN * 2,
    h: 1.65,
    fontFace: FONTS.heading,
    fontSize,
    valign: "top",
    margin: 0,
  });
}

function addBody(slide, text, y, width = SLIDE_W - MARGIN * 2, accentPhrases = []) {
  slide.addText(buildRichText(text, accentPhrases), {
    x: MARGIN,
    y,
    w: width,
    h: 1.0,
    fontFace: FONTS.body,
    fontSize: 18,
    valign: "top",
    margin: 0,
  });
}

function addImagePlaceholder(slide, label, box = { x: 5.5, y: 2.0, w: 3.75, h: 3.2 }) {
  slide.addShape("rect", {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    fill: { color: COLORS.bg },
    line: { color: COLORS.border, width: 1.5 },
  });

  slide.addText(label, {
    x: box.x + 0.2,
    y: box.y + 0.2,
    w: box.w - 0.4,
    h: box.h - 0.4,
    fontFace: FONTS.body,
    fontSize: 11,
    color: COLORS.muted,
    align: "center",
    valign: "middle",
    margin: 0,
  });
}

function addSpeakerNotes(slide, text) {
  slide.addNotes(text);
}

function buildPresentation() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Danica & Manasvi";
  pres.title = "High Automation Doesn't Mean Fewer Jobs — Yet";

  // Slide 1 — Title
  {
    const slide = pres.addSlide();
    applySlideBackground(slide);
    addHeading(slide, "High Automation Doesn't Mean Fewer Jobs — Yet", ["Yet"]);
    addBody(slide, "Danica & Manasvi · HCDE Data Visualization", 2.55);
    addSpeakerNotes(
      slide,
      "So this started with a pretty personal question. Both of us were looking at job listings, thinking about what's happening in our fields, and honestly just feeling uncertain about whether things were getting harder or whether we were imagining it."
    );
  }

  // Slide 2 — The Question
  {
    const slide = pres.addSlide();
    applySlideBackground(slide);
    addHeading(slide, "We asked 7 people one question", ["one question"], MARGIN);
    addBody(
      slide,
      "Is it getting harder in my field — and did something change recently?",
      2.35,
      4.5
    );
    addImagePlaceholder(
      slide,
      "[IMAGE: handwritten notes or informal interview setting — add your own photo here]"
    );
    addSpeakerNotes(
      slide,
      "Before we touched any data, we talked to seven people — students figuring out what comes next, people already in the workforce. We didn't come in with a hypothesis. We just asked: if you could see one true thing about AI and jobs right now, what would you want to know? Nobody mentioned automation percentages. That question — is it getting harder in my field specifically — became our design brief."
    );
  }

  // Slide 3 — The Inspiration
  {
    const slide = pres.addSlide();
    applySlideBackground(slide);
    addHeading(slide, "We started here", [], MARGIN);
    addBody(
      slide,
      "Beautiful work. But it answers AI's question, not theirs.",
      2.35,
      4.5,
      ["theirs"]
    );
    addImagePlaceholder(
      slide,
      "[IMAGE: Anthropic Economic Index screenshot — explore.anthropic.com/economic-index]"
    );
    addSpeakerNotes(
      slide,
      "This was genuinely the inspiration — the Anthropic Economic Index. It goes occupation by occupation and shows which tasks AI is automating versus augmenting. But it answers a question from the inside — from Claude's perspective. Our users weren't asking about tasks. They were asking about jobs. Whether there were more or fewer of them."
    );
  }

  // Slide 4 — First Iteration + Pivot
  {
    const slide = pres.addSlide();
    applySlideBackground(slide);
    addHeading(
      slide,
      "First we tried wages. Then we changed direction.",
      ["direction"]
    );
    addBody(
      slide,
      "Too many confounds. We couldn't isolate the AI signal.",
      2.35,
      4.5
    );
    addImagePlaceholder(
      slide,
      "[IMAGE: wages visualization screenshot — manasvikale99.github.io/The-AI-Shift/viz/]"
    );
    addSpeakerNotes(
      slide,
      "Our first version went toward wages — whether AI was showing up in compensation data. We built it, spent real time with it. But the more we dug in, the harder it became to separate what was AI from inflation, remote work, post-COVID normalization. We felt like we were making an argument we couldn't fully stand behind. So we pulled back. What we landed on was job postings — Indeed publishes a daily hiring index for 37 sectors going back to February 2020. And Anthropic and OpenAI released 128 models in that same window. Two timelines, six years."
    );
  }

  // Slide 5 — Usability
  {
    const slide = pres.addSlide();
    applySlideBackground(slide);
    addHeading(slide, "Two things nobody understood", []);
    addBody(
      slide,
      "What does 100 mean? And why is everything overlapping?",
      2.35,
      4.5,
      ["100", "overlapping"]
    );
    addImagePlaceholder(
      slide,
      "[IMAGE: before/after of scatter plot simplification]",
      { x: 5.5, y: 2.0, w: 3.75, h: 3.2 }
    );
    addSpeakerNotes(
      slide,
      "We did informal usability tests along the way — just showing people the viz and watching where they got stuck. Nobody understood the baseline number. So we added one line directly under the chart: 100 equals Feb 2020. Above means more jobs than before COVID. Below means fewer. The scatter plot also had too many overlapping points — people couldn't read it. So we restructured into four named quadrants and gave everything more room."
    );
  }

  // Slide 6 — The Finding
  {
    const slide = pres.addSlide();
    applySlideBackground(slide);
    addHeading(
      slide,
      "The sectors most at risk aren't losing the most jobs",
      ["aren't"],
      MARGIN,
      32
    );
    addBody(slide, "That tension is worth showing.", 2.35, 4.5);
    addImagePlaceholder(
      slide,
      "[IMAGE: quadrant scatter plot screenshot showing 'High Automation Doesn't Mean Fewer Jobs — Yet']"
    );
    addSpeakerNotes(
      slide,
      "What we found was genuinely surprising. The sectors with the highest automation risk — Hospitality, Banking, Pharmacy — are either holding steady or above their pre-COVID baseline. Meanwhile Marketing, Media, Administrative work — moderate automation — have softened more. We don't have a clean explanation for that. But we think that tension complicates the story that usually gets told about AI and jobs. Here's what that looks like — [transition to live demo]."
    );
  }

  // Slide 7 — Demo
  {
    const slide = pres.addSlide();
    applySlideBackground(slide);
    addHeading(slide, "Explore it yourself", ["yourself"]);
    slide.addText("manasvikale99.github.io/ai-viz", {
      x: MARGIN,
      y: 2.1,
      w: SLIDE_W - MARGIN * 2,
      h: 1.5,
      fontFace: FONTS.body,
      fontSize: 24,
      color: COLORS.text,
      align: "center",
      valign: "middle",
      margin: 0,
    });
    addSpeakerNotes(
      slide,
      "Walk through: aggregate timeline first, show AI bars. Then heatmap — filter to knowledge work, click a cell. Then sector detail for Marketing. Then scatter quadrant. Keep it under 4 minutes total with demo."
    );
  }

  return pres.writeFile({ fileName: OUTPUT });
}

buildPresentation()
  .then(() => {
    console.log(`Wrote ${OUTPUT}`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

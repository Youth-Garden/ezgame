# EzGame Visual Art & Image Generation Guidelines

## 1. Core Visual Philosophy: "Cartoon Minimalism"
- **Style Definition**: Clean, flat-to-semi-flat vector/cartoon illustration with bold, simplified silhouettes, pleasant color palettes, soft cel-shading or subtle gradients, and zero photographic clutter.
- **Strictly Prohibited**:
  - **NO Hyper-realistic 3D**: No photorealistic raytracing, complex shiny reflections, real-life pool hall / room environments, or gritty textures.
  - **NO Neon Clutter / Heavy Glow**: Avoid aggressive neon overlays, holographic matrices, or intense bloom effects.
  - **NO Text / Typographic Overlays inside generated images**: The UI already displays title and badges natively; generated images must contain **NO text, words, or letters**.

## 2. Image Prompt Engineering Formula
When prompting `image-generator` for any game artwork:

```
A clean, modern cartoon minimalist game illustration of [Subject / Game Theme].
Flat to semi-flat vector art style with smooth soft shading, vibrant minimalist color palette, clean outlines and rounded geometric shapes.
Plain uncluttered background with subtle solid-to-soft gradient.
Isometric or gentle top-down perspective, playful, friendly casual game aesthetic.
No realistic 3D textures, no photorealism, no text, no words, no letters.
Aspect ratio 16:9, high resolution, minimalist digital vector artwork.
```

### Examples:
- **Caro (Gomoku)**:
  "A clean, modern cartoon minimalist game illustration of Caro Gomoku. Sleek warm wooden board with simple geometric grid lines, cute minimalist cyan cross (X) tokens and coral-pink circle (O) tokens aligned in a five-in-a-row pattern. Minimalist flat aesthetic, soft subtle ambient shadows, playful casual mobile game art style, clean simple pastel background, no realistic 3D textures, no text, no letters."
- **Billiards (Pool)**:
  "A clean, modern cartoon minimalist game illustration of a pool billiards table. Vibrant emerald green felt, smooth rounded wooden rails, colorful smooth cartoon billiard balls and a stylized wooden cue stick. Flat to semi-flat vector style, soft clean shadows, uncluttered composition, playful and modern, no photorealism, no background room clutter, no text, no words."

## 3. Storage and File Naming
- Destination: `public/games/[game-id].jpg` (or `.png`).
- Resolution: Optimized 16:9 ratio, lightweight for instant web load.

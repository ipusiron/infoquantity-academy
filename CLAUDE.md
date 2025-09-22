# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InfoQuantity Academy is an interactive educational web tool for learning information theory concepts, specifically focusing on information quantity (I = -log₂ P) and entropy. It's a pure client-side JavaScript application using vanilla JS, HTML5 Canvas for visualizations, and CSS for styling.

## Directory Structure

```
infoquantity-academy/
├── index.html          # Main HTML file with tab-based interface
├── script.js           # JavaScript logic with comprehensive developer comments
├── style.css          # CSS with theme system and developer comments
├── README.md          # Comprehensive documentation and theory explanations
├── CLAUDE.md          # Development guidance (this file)
├── LICENSE            # MIT License
├── .gitignore         # Git ignore rules
├── .nojekyll          # GitHub Pages configuration
└── .claude/           # Claude Code settings
    └── settings.local.json
```

## Architecture

The application is a single-page application (SPA) with a tab-based interface:

- **index.html**: Main HTML structure with 5 tabbed sections (Definition, Calculation Examples, Additivity, Properties, Entropy)
- **script.js**: All JavaScript logic including:
  - Tab navigation control
  - Canvas-based graph rendering (using 2D context)
  - Real-time calculation of information quantity based on probability inputs
  - Interactive demonstrations of information theory concepts
- **style.css**: Modern CSS styling with custom properties for theming

Key architectural patterns:
- Event-driven UI updates triggered by user inputs
- Mathematical calculations use Math.log() for logarithms (converted to log₂)
- Canvas drawings for visualizations are redrawn on tab switches
- No external dependencies or frameworks - pure vanilla implementation

## Development Commands

This is a static site with no build process:

```bash
# Open directly in browser
start index.html

# Or serve locally with any static server
python -m http.server 8000
# Then open http://localhost:8000
```

For GitHub Pages deployment (already configured):
- Push to main branch → automatically deployed to https://ipusiron.github.io/infoquantity-academy/

## Testing Approach

Manual testing in browser - no automated test framework configured. When making changes:
1. Test all 5 tabs for functionality
2. Verify calculations with known values (e.g., P=0.5 → I=1 bit)
3. Check responsive design at different viewport sizes
4. Test interactive elements (sliders, inputs, buttons)

## Key Implementation Details

- **Information quantity formula**: `I(a) = -log₂ P(a)` where log₂ is computed as `Math.log(x) / Math.log(2)`
- **Canvas coordinate system**: Custom transforms for mathematical graph plotting with theme-aware colors
- **Input validation**: Probability inputs must sum to 1.0 with real-time validation and sanitization
- **Special cases**: P=0 displays as "∞ bit" since log(0) is undefined
- **Theme system**: CSS Custom Properties enable seamless dark/light mode switching
- **Security**: Content Security Policy headers and input sanitization for GitHub Pages deployment
- **Responsive design**: Mobile-friendly layout with flexible grid systems
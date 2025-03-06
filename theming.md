# Odoo React Native Theming Guide

## Vision

Our Odoo React Native application embraces a futuristic, premium design language with a focus on fluid animations, spatial awareness, and a dark, sophisticated color palette. The interface aims to create a sense of depth and dimensionality while maintaining exceptional clarity and usability.

## Color Palette

### Primary Colors
- Primary: `#6C63FF` (Vibrant Purple)
- Secondary: `#3ABFF8` (Electric Blue)
- Accent: `#36D399` (Emerald Green)

### Background Colors
- Background Dark: `#0F172A` (Deep Space Blue)
- Background Medium: `#1E293B` (Midnight Blue)
- Background Light: `#334155` (Slate Blue)

### Text Colors
- Text Primary: `#F8FAFC` (Almost White)
- Text Secondary: `#94A3B8` (Soft Silver)
- Text Muted: `#64748B` (Steel Gray)

### Status Colors
- Success: `#36D399` (Emerald Green)
- Warning: `#FBBD23` (Golden Yellow)
- Error: `#F87272` (Coral Red)
- Info: `#3ABFF8` (Electric Blue)

## Typography

### Font Family
- Primary Font: "Inter" (Sans-serif)
- Monospace Font: "Fira Code" (for code snippets or technical content)

### Font Sizes
- Extra Small: 12px
- Small: 14px
- Base: 16px
- Large: 18px
- Extra Large: 20px
- Heading 1: 32px
- Heading 2: 24px
- Heading 3: 20px
- Heading 4: 18px

### Font Weights
- Light: 300
- Regular: 400
- Medium: 500
- Semi-Bold: 600
- Bold: 700

## Spacing

A consistent 8-point grid system:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

## Component Styling

### Cards
- Subtle gradient backgrounds
- Glass morphism effect (semi-transparent background with blur)
- Soft shadows with colored glow effects
- Rounded corners (borderRadius: 16px)
- Inner padding: 24px

### Buttons
- Primary: Gradient background from primary to secondary colors
- Secondary: Subtle background with border
- Text-only: No background, just colored text
- Hover/Press state: Subtle scale animation (1.02x) with brightness increase
- Height: 48px for standard, 40px for compact
- Border radius: 12px
- Drop shadow with brand color glow

### Inputs
- Floating labels
- Subtle background (slightly lighter than card background)
- Animated focus states with glowing border effect
- Height: 56px
- Border radius: 12px
- Status indication with colored borders/icons

### Navigation
- Tab bar with subtle blur effect
- Active state with glowing indicator
- Micro-interactions on selection
- Custom icons with consistent style

### Lists
- Subtle separators (opacity 0.1)
- Hover states with background highlight
- Animated expansion/collapse

## Animations

### Principles
- Fluid, natural motion
- Purpose-driven (not animation for animation's sake)
- Consistent timing functions
- Seamless transitions between states

### Timing
- Fast actions: 150-200ms
- Standard transitions: 300ms
- Complex animations: 500-800ms
- Staggered animations for lists: 50ms delay between items

### Types
1. **Background Animation**
   - Subtle gradient drift
   - Particle effects that respond to user interaction
   - Low-opacity flowing patterns

2. **Transition Animations**
   - Page transitions with shared element transitions
   - Fade and slide combinations
   - Scale with fade for modals and dialogs

3. **Micro-interactions**
   - Button press effects (scale down slightly)
   - Success animations (checkmarks, confetti)
   - Loading states (pulsing, shimmer effects)
   - Voice input visualization (audio waveform)

4. **State Changes**
   - Smooth interpolation between states
   - Spring physics for natural movement
   - Sequenced animations for complex state changes

## Iconography

- Consistent line weight (2px)
- Rounded corners
- Filled and outlined variants
- Size standardization (24px default)
- Optional subtle glow effect on primary actions

## Depth and Layering

Create a sense of depth with:
- Subtle shadows
- Parallax effects
- Z-index hierarchy
- Scale changes during interaction

## Voice UI Elements

- Voice input visualization (audio waveform animation)
- Listening state indicator (pulsing circle)
- Processing animation (subtle loading state)
- Voice command recognition feedback

## Accessibility

- Maintain contrast ratios of at least 4.5:1 for text
- Include haptic feedback for important actions
- Support dynamic text sizing
- Ensure all animations can be reduced/disabled
- Voice commands should have visual equivalents

## Implementation Guidelines

- Use React Native Reanimated for complex animations
- Implement shared element transitions with React Navigation
- Use React Native Skia for complex visual effects
- Create a ThemeProvider with React Context
- Implement dark mode as default, with light mode option

## Examples

Include design mockups or code snippets for key components in the application, showcasing the application of these design principles.
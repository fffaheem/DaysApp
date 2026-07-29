package com.faheem.days.ui.theme

import androidx.compose.ui.graphics.Color

// --- WARM LILAC THEME (Cozy, Vibrant, Purple-matching, Zero White Glare) ---
// Core Brand Colors
val PrimaryLight = Color(0xFF8B5CF6)      // Vibrant Violet accent
val OnPrimaryLight = Color(0xFFFFFFFF)    // Crisp white for button text
val BackgroundLight = Color(0xFFE4D5EC)   // Warm Dusty Lilac (Colorful, matches purple, zero bright white)
val SurfaceLight = Color(0xFFF1E3F7)      // Soft Lilac for elevated cards (Provides subtle depth)

// Category & Status Colors (Synced exactly with Dark Theme for consistency)
val ProductiveLight = Color(0xFF10B981)   // Emerald 500
val NeutralLight = Color(0xFF7B6DB8)      // Deep Muted Violet (strong contrast on lilac bg)
val WastedLight = Color(0xFFEF4444)       // Red 500
val VacationLight = Color(0xFF3B82F6)     // Blue 500
val UncategorizedLight = Color(0xFF5B4070) // Deep muted plum for empty calendar days (guaranteed high contrast)
val FutureLight = Color(0xFFB4A0C4)       // Darker soft lilac for future calendar days

// Text Colors
val TextPrimaryLight = Color(0xFF3B1E4A)   // Deep warm plum/eggplant (Extremely easy on eyes, perfectly fits purple theme)
val TextSecondaryLight = Color(0xFF4A3460) // Deep plum for secondary elements (high contrast)

// Accents
val AccentLight = Color(0xFFF43F5E)       // Warm Rose accent (Pairs beautifully with vibrant violet)

// Material Surface Variants (Light)
val PrimaryContainerLight = Color(0xFF6D28D9)   // Deep, loud plum/violet for active tabs
val OnPrimaryContainerLight = Color(0xFFFFFFFF)  // White text on the active violet tabs
val SurfaceContainerLight = Color(0xFFEBE0F2)    // Soft tinted lilac for outer cards
val SurfaceContainerHighLight = Color(0xFFF2EAF7) // Slightly higher surface
val SurfaceContainerHighestLight = Color(0xFFE8DAF0) // Warm tinted lilac for inner boxes (no white glare)
val SurfaceVariantLight = Color(0xFFEBE0F2)      // Variant surface
val OutlineColorLight = Color(0xFF6B4D85)        // Bold plum outline (high contrast for headings/labels)
val OutlineVariantLight = Color(0xFFD6C8E0)      // Outline variant

// Extended Colors (Light)
val DotBorderLight = Color(0xFF000000)     // YearGrid empty/future dot border (Black for light mode)
val DotFallbackLight = Color.Gray          // Fallback if status not found in map
val CardShadowLight = Color(0xFF000000)    // PremiumCard shadow base (used at low alpha)
val PillSelectedTextLight = Color(0xFFFFFFFF) // Selected categorized pill text in MonthViewOverlay
val DestructiveLight = Color(0xFFEF4444)   // Delete buttons, expired goals, simulated time label
val GoalCompleteStarLight = Color(0xFF4CAF50) // Goal complete star marker (Green)
val GoalDefeatStarLight = Color(0xFFF44336)   // Goal defeat star marker (Red)
val ErrorColorLight = Color(0xFFC62828)        // Vivid dark red for danger zone (high visibility on lilac)
val OnErrorLight = Color(0xFFFFFFFF)           // Text on error buttons
val ErrorContainerLight = Color(0xFFF9DEDC)    // Error container background
val OnErrorContainerLight = Color(0xFF410E0B)  // Text on error container
val ChartLineLight = Color(0xFF8B5CF6)         // Line chart stroke color (matches primary)
val ChartBarLight = Color(0xFF8B5CF6)          // Weekday bar chart fill color (matches primary)


// --- PREMIUM DARK THEME ---
// Core Brand Colors
val PrimaryDark = Color(0xFFFFFFFF)       // Main brand color (Pure White)
val OnPrimaryDark = Color(0xFF121212)     // Text/Icons on top of primary color
val BackgroundDark = Color(0xFF0A0A0A)    // App-wide screen background (Deep Black)
val SurfaceDark = Color(0xFF161616)       // Cards, sheets, and dialog surfaces (Soft Black)

// Category & Status Colors
val ProductiveDark = Color(0xFF10B981)    // Highly productive day (Emerald 500)
val NeutralDark = Color(0xFFC4B5FD)       // Neutral/Muted day (Muted Violet)
val WastedDark = Color(0xFFEF4444)        // Low productivity/Wasted day (Red 500)
val VacationDark = Color(0xFF3B82F6)      // Day set as vacation/off (Blue 500)
val UncategorizedDark = Color(0xFF1E293B)  // Placeholder for days without data (Slate 800)
val FutureDark = Color(0xFF0F172A)        // Days in the future (Slate 900)

// Text Colors
val TextPrimaryDark = Color(0xFFF9FAFB)    // Primary body and title text (Gray 50)
val TextSecondaryDark = Color(0xFF9CA3AF)  // Descriptions and secondary labels (Gray 400)

// Accents
val AccentDark = Color(0xFFFFD700)        // Premium highlight/Bright Gold accent

// Material Surface Variants (Dark)
val PrimaryContainerDark = Color(0xFF3D2A5C)      // Purple-tinted active tab background (visible against dark surfaces)
val OnPrimaryContainerDark = Color(0xFFFFFFFF)    // Text on active tabs
val SurfaceContainerDark = Color(0xFF1C1C1C)      // Container surface
val SurfaceContainerHighDark = Color(0xFF222222)  // Higher container surface
val SurfaceContainerHighestDark = Color(0xFF2A2A2A) // Highest container surface
val SurfaceVariantDark = Color(0xFF282828)        // Variant surface
val OutlineColorDark = Color(0xFF555555)          // Outline
val OutlineVariantDark = Color(0xFF333333)        // Outline variant

// Extended Colors (Dark)
val DotBorderDark = Color(0xFFC4B5FD)      // YearGrid empty/future dot border (keeps existing behavior)
val DotFallbackDark = Color.Gray           // Fallback if status not found in map
val CardShadowDark = Color(0xFF000000)     // PremiumCard shadow base
val PillSelectedTextDark = Color(0xFFFFFFFF) // Selected categorized pill text
val DestructiveDark = Color(0xFFEF4444)    // Destructive/delete actions
val GoalCompleteStarDark = Color(0xFF4CAF50) // Goal complete star marker (Green)
val GoalDefeatStarDark = Color(0xFFF44336)   // Goal defeat star marker (Red)
val ErrorColorDark = Color(0xFFF2B8B5)         // Error/danger color (Material dark default)
val OnErrorDark = Color(0xFF601410)            // Text on error
val ErrorContainerDark = Color(0xFF8C1D18)     // Error container background
val OnErrorContainerDark = Color(0xFFF9DEDC)   // Text on error container
val ChartLineDark = Color(0xFFFFFFFF)          // Line chart stroke color (matches primary)
val ChartBarDark = Color(0xFFFFFFFF)           // Weekday bar chart fill color (matches primary)


// --- TUTORIAL / SPECIAL SCREENS (not theme-dependent) ---
val TutorialBackground = Color(0xFF0D1117)     // Onboarding/tutorial/splash dark background
val TutorialText = Color(0xFFFFFFFF)           // Tutorial text (white)
val TutorialButtonBackground = Color(0xFF58A6FF) // "Start Tour" button
val TutorialDismissBackground = Color(0xFFE74C3C) // Tutorial close/X button
val TutorialOverlayScrim = Color(0xFF000000)   // Tutorial overlay dim (used at 58% alpha)
val TutorialBorder = Color(0xFFFFFFFF)         // Tutorial card border (used at 25% alpha)


const items = [
    {text: "Do Assignment", isCompleted: true, year: "2025" },
    {text: "Build Project", isCompleted: true, year: "2025" },
    {text: "Write Dissertation", isCompleted: true, year: "2025" },
    {text: "Write Research Paper", isCompleted: true, year: "2025" },
    {text: "Collect Degree", isCompleted: true, year: "2025" },
];

const tx = db.transaction("YearChecklist", "readwrite");
const store = tx.objectStore("YearChecklist");

items.forEach(item => store.add(item));


const items = [
    {text: "Design homepage", isCompleted: true, year: "2026" },
    {text: "Build API", isCompleted: true, year: "2026" },
    {text: "Write docs", isCompleted: false, year: "2026" },
    {text: "Deploy", isCompleted: false, year: "2026" },
    {text: "Test", isCompleted: false, year: "2026" },
    {text: "hogaya\nnhee hua\nfix kro isey", isCompleted: false, year: "2026" },
];

const tx = db.transaction("YearChecklist", "readwrite");
const store = tx.objectStore("YearChecklist");

items.forEach(item => store.add(item));
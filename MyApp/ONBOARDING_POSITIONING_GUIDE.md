# ChoiceScreen Onboarding - Positioning Guide

## Fixed Tooltip Positioning

The onboarding tooltips now correctly point to their respective UI elements:

### Layout Understanding:
```
SafeAreaView (full screen, centered content)
├── Profile Icon (top: 80, right: 28) - absolute positioned
├── Title (centered, large text)
├── Subtitle (centered, below title)
├── Options Container (centered)
│   ├── Voice Button (220x160, marginVertical: 20)
│   ├── "OR" text
│   └── Manual Button (220x160, marginVertical: 20)
├── Market Button (marginTop: 40)
├── Soil Button (marginTop: 40)
└── Help Button Container (bottom: 60, right: 20) - absolute positioned
```

### Updated Tooltip Positions:

1. **Welcome Message (`screen`)**
   - Position: `top: '35%', alignSelf: 'center'`
   - Arrow: None (center message)
   - Points to: General screen area

2. **Voice Button (`voiceButton`)**
   - Position: `top: '25%', alignSelf: 'center'`
   - Arrow: Up arrow (tooltip above button)
   - Points to: Voice Pilot Mode button

3. **Manual Button (`manualButton`)**
   - Position: `top: '50%', alignSelf: 'center'`
   - Arrow: Up arrow (tooltip above button)
   - Points to: Manual Mode button

4. **Profile Icon (`profileIcon`)**
   - Position: `top: 130, right: 40`
   - Arrow: Down arrow (tooltip below icon)
   - Points to: Profile icon (top right)

5. **Market Button (`marketButton`)**
   - Position: `bottom: 180, alignSelf: 'center'`
   - Arrow: Down arrow (tooltip above button)
   - Points to: Market Prices button

6. **Soil Button (`soilButton`)**
   - Position: `bottom: 120, alignSelf: 'center'`
   - Arrow: Down arrow (tooltip above button)
   - Points to: Soil Monitoring button

7. **Help Button (`helpButton`)**
   - Position: `bottom: 140, right: 30`
   - Arrow: Down arrow (tooltip above button)
   - Points to: Help button (bottom right)

### Key Improvements Made:

1. **Proper Vertical Alignment**: Used percentage-based positioning for centered elements and fixed pixel values for absolute positioned elements.

2. **Correct Arrow Directions**: 
   - `top` arrows point down (tooltip is above element)
   - `bottom` arrows point up (tooltip is below element)
   - `center` has no arrow

3. **Responsive Positioning**: Used `alignSelf: 'center'` for center-aligned tooltips and specific pixel values for corner elements.

4. **Visual Hierarchy**: Tooltips appear in logical order following the screen layout from top to bottom.

### Testing the Positioning:

1. First-time users will see the onboarding automatically
2. Returning users can click the "Tour" button to restart
3. Each tooltip should appear correctly positioned relative to its target element
4. Arrows should point in the correct direction toward the target

### Onboarding Flow:
1. Welcome → 2. Voice Mode → 3. Manual Mode → 4. Profile → 5. Market → 6. Soil → 7. Help

The positioning has been adjusted to work with the actual layout structure of the ChoiceScreen, ensuring tooltips appear in the right locations and arrows point correctly to their target elements.

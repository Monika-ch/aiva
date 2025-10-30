# AIVA Chat Widget - Testing Checklist

## 🧪 Complete Test Suite

### Before Testing

- [ ] Server is running: `http://localhost:5175/`
- [ ] Browser: Chrome or Edge (for voice features)
- [ ] Clear browser cache if needed

---

## Test 1: One-Click Suggestion Send ✅

**Steps:**

1. Open chat widget
2. Wait for welcome message and suggestions
3. Click on "learn top tech skills"

**Expected Result:**

- ✅ Message appears immediately in chat as user message
- ✅ AIVA responds
- ✅ NO need to click "Send" button

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

---

## Test 2: Visited Suggestion Highlighting 🎨

**Steps:**

1. Click suggestion "learn top tech skills"
2. Observe the visual change
3. Scroll up to see same suggestion
4. Click a different suggestion "explore experience"

**Expected Result:**

- ✅ First click: "learn top tech skills" gets indigo background
- ✅ Still highlighted after scroll
- ✅ Second click: "explore experience" also gets indigo background
- ✅ Both remain highlighted (like visited links)

**Status:** [ ] Pass [ ] Fail

**Visual Check:**

- Unclicked: Gray text, gray hover
- Clicked: Indigo background, indigo text, indigo border

**Notes:**

---

---

## Test 3: Typing Indicator 💬

**Steps:**

1. Open chat widget (wait for auto-open or click FAB)
2. Watch for typing indicator before greeting
3. Send a message: "Hello"
4. Watch for typing indicator before response

**Expected Result:**

- ✅ Three animated dots appear
- ✅ Dots bounce in sequence
- ✅ Indicator shows before greeting message
- ✅ Indicator disappears when message appears
- ✅ Located on left side with AIVA avatar

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

---

## Test 4: Clear Chat Button 🗑️

**Steps:**

1. Have at least 3 messages in chat
2. Locate trash icon in header (top right, left of X)
3. Click trash icon
4. Observe confirmation dialog
5. Click "OK" to confirm

**Expected Result:**

- ✅ Confirmation dialog appears
- ✅ Dialog asks "Are you sure you want to clear the chat history?"
- ✅ After confirm: Clicked suggestions reset (back to gray)
- ✅ Icon has hover effect (background change)

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

---

## Test 5: Message Timestamps ⏰

**Steps:**

1. Send a message
2. Look below the message bubble
3. Check multiple messages sent at different times

**Expected Result:**

- ✅ Time appears in format: "2:30 PM" or "10:45 AM"
- ✅ Shows for both user and assistant messages
- ✅ Gray color, small text
- ✅ Positioned below message bubble

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

---

## Test 6: Copy Message Button 📋

**Steps:**

1. Send a message and get a response
2. Hover over an assistant message
3. Click the copy icon (appears on hover)
4. Paste in a text editor (Ctrl+V)

**Expected Result:**

- ✅ Copy icon appears on hover (near timestamp)
- ✅ Icon is a document/clipboard symbol
- ✅ Click copies message text
- ✅ Pasted text matches message exactly
- ✅ Icon disappears when not hovering

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

---

## Test 7: Voice Input 🎤 (Chrome/Edge Only)

**Steps:**

1. Click microphone button (left of input field)
2. Speak: "What are your top skills?"
3. Stop speaking and wait
4. Observe input field

**Expected Result:**

- ✅ Mic button turns red when active
- ✅ Red button has pulse/glow animation
- ✅ Input field shows "Listening..." placeholder
- ✅ Input field is disabled during recording
- ✅ Transcript appears in input after speaking
- ✅ Mic button returns to gray
- ✅ Can click Send or speak again

**Status:** [ ] Pass [ ] Fail

**Browser:** [ ] Chrome [ ] Edge [ ] Other: ******\_\_\_******

**If Fail - Check:**

- Browser supports Web Speech API?
- Microphone permission granted?
- Are you in HTTPS or localhost?

**Notes:**

---

---

## Test 8: Improved Animations ✨

**Steps:**

1. Close chat widget
2. Click FAB to open
3. Watch open animation
4. Close widget
5. Watch close animation
6. Hover over FAB button
7. Click FAB button

**Expected Result:**

- ✅ Open: Fade in + slide up + scale up
- ✅ Close: Fade out + slide down + scale down
- ✅ Smooth 250ms duration
- ✅ FAB hover: Slight scale increase
- ✅ FAB click: Scale down then up
- ✅ No janky/stuttering motion

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

---

## Test 9: Enhanced UI Elements 🎨

### A. Header Gradient

**Expected:**

- ✅ Gradient background (indigo to purple)
- ✅ Logo + "AIVA Chat" text visible
- ✅ "AI Portfolio Assistant" subtitle

**Status:** [ ] Pass [ ] Fail

### B. FAB Button

**Expected:**

- ✅ Circular gradient button (indigo to purple)
- ✅ White robot icon
- ✅ Bottom-right corner
- ✅ Shadow effect

**Status:** [ ] Pass [ ] Fail

### C. Message Bubbles

**Expected:**

- ✅ User: Gradient blue, right-aligned
- ✅ Assistant: White with border, left-aligned
- ✅ Assistant has robot avatar
- ✅ Rounded corners

**Status:** [ ] Pass [ ] Fail

### D. Suggestions

**Expected:**

- ✅ Full-width buttons
- ✅ Bullet point prefix
- ✅ Clickable/hoverable
- ✅ Visual feedback on click

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

---

## Test 10: Unread Badge 🔴

**Steps:**

1. Have chat widget closed
2. Trigger a new message from AIVA
3. Observe FAB button

**Expected Result:**

- ✅ Red badge appears on top-right of FAB
- ✅ Shows number (1, 2, 3...)
- ✅ Shows "9+" for 10 or more
- ✅ Badge disappears when widget opens

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

---

## Test 11: Keyboard Navigation ⌨️

**Steps:**

1. Click in input field
2. Type: "Hello AIVA"
3. Press Enter (not Shift+Enter)
4. Observe message sent

**Expected Result:**

- ✅ Enter sends message
- ✅ Input clears after send
- ✅ Focus returns to input
- ✅ Hint text shows: "Press Enter to send • Shift+Enter for new line"

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

---

## Test 12: Auto-Scroll Behavior 📜

**Steps:**

1. Send 10+ messages to fill the chat
2. Scroll to top of messages
3. Send a new message
4. Observe scroll behavior

**Expected Result:**

- ✅ Auto-scrolls to bottom on new message
- ✅ Smooth scroll animation
- ✅ Shows latest message immediately

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

---

## Test 13: Accessibility (Screen Reader) ♿

**Steps:**

1. Enable screen reader (NVDA/JAWS on Windows, VoiceOver on Mac)
2. Tab through chat widget
3. Listen to announcements

**Expected Result:**

- ✅ FAB has label: "Open chat" or "Open chat, X unread messages"
- ✅ Close button labeled: "Close chat"
- ✅ Input field labeled: "Type your question to AIVA"
- ✅ Send button labeled: "Send message"
- ✅ New messages announced in live region

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

---

## Test 14: Mobile Responsiveness 📱

**Steps:**

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone 12 Pro
4. Test all interactions

**Expected Result:**

- ✅ Widget visible on mobile (md:hidden class works)
- ✅ Proper sizing for mobile screens
- ✅ Touch-friendly buttons (min 44x44px)
- ✅ All features work on touch

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

---

## Test 15: Error Handling 🐛

### A. Voice Input - No Microphone

**Steps:**

1. Deny microphone permission
2. Click mic button

**Expected:**

- ✅ Alert: "Voice recognition is not supported..."
- ✅ Or proper error message
- ✅ Doesn't crash

**Status:** [ ] Pass [ ] Fail

### B. Voice Input - Unsupported Browser

**Steps:**

1. Open in Firefox or Safari
2. Click mic button

**Expected:**

- ✅ Alert: "Voice recognition is not supported in this browser. Try Chrome or Edge."
- ✅ Graceful degradation

**Status:** [ ] Pass [ ] Fail

### C. Empty Input

**Steps:**

1. Click Send with empty input
2. Try spaces only " "

**Expected:**

- ✅ Nothing happens
- ✅ No error
- ✅ Send button may be disabled

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

---

## Performance Tests ⚡

### A. Animation Smoothness

**Check:**

- [ ] 60 FPS during animations
- [ ] No stuttering
- [ ] Smooth transitions

### B. Load Time

**Check:**

- [ ] Widget appears quickly
- [ ] No layout shift
- [ ] Assets load properly

### C. Memory Usage

**Steps:**

1. Open DevTools > Performance
2. Interact with widget for 2 minutes
3. Check memory graph

**Expected:**

- ✅ No memory leaks
- ✅ Stable memory usage

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

---

## Browser Compatibility ✅

Test on multiple browsers:

| Browser | Version | Status        | Notes    |
| ------- | ------- | ------------- | -------- |
| Chrome  | **\_**  | [ ] ✅ [ ] ❌ |          |
| Edge    | **\_**  | [ ] ✅ [ ] ❌ |          |
| Firefox | **\_**  | [ ] ✅ [ ] ❌ | No voice |
| Safari  | **\_**  | [ ] ✅ [ ] ❌ | No voice |

---

## Final Checks ✨

- [ ] All features work as documented
- [ ] No console errors
- [ ] Professional appearance
- [ ] Smooth user experience
- [ ] Ready for deployment

---

## Issues Found 🐛

| #   | Feature | Issue | Severity | Status |
| --- | ------- | ----- | -------- | ------ |
| 1   |         |       |          |        |
| 2   |         |       |          |        |
| 3   |         |       |          |        |

---

## Overall Rating

**Functionality:** ☆☆☆☆☆ (0-5 stars)

**Design:** ☆☆☆☆☆ (0-5 stars)

**Performance:** ☆☆☆☆☆ (0-5 stars)

**Overall:** ☆☆☆☆☆ (0-5 stars)

---

## Tester Information

**Name:** ****************\_****************

**Date:** ****************\_****************

**Environment:**

- OS: ****************\_****************
- Browser: ****************\_****************
- Screen Size: ****************\_****************

**Completion Time:** **\_\_\_\_** minutes

---

## Next Steps

After completing all tests:

1. [ ] Document any issues found
2. [ ] Take screenshots of visual bugs
3. [ ] Report to development team
4. [ ] Re-test after fixes
5. [ ] Approve for production

---

**Testing completed by:** ************\_\_************

**Approved for deployment:** [ ] Yes [ ] No

**Signature:** ************\_************ **Date:** ****\_\_****

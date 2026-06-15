## Problem

On Android (installed Capacitor build), pressing the on-screen keyboard's Backspace inside the email/password fields on `/auth` does not delete characters.

## Root cause

The Auth page uses **fully controlled React inputs** (`value={formData.email}` + `onChange` that calls `setFormData`). On Android WebView, Gboard sends each keystroke as an IME composition event (keyCode 229). When React re-renders the input on every keystroke, it interrupts the in-flight composition. Backspace is delivered as part of that composition stream, so the WebView ends up replacing the composed text with the same string instead of deleting a character. The on-screen Backspace therefore appears to do nothing. The desktop browser and the Lovable preview don't reproduce this because they don't go through Gboard composition.

The Eye/EyeOff toggle and the `type="password"` field are not the cause — the same bug reproduces in the email field too.

## Fix

Convert the inputs on `src/pages/Auth.tsx` to **uncontrolled** with `ref` + `defaultValue`. The DOM owns the text, Gboard composition completes without React re-rendering between keystrokes, and Backspace deletes normally. Form values are read from refs inside the submit handlers (already where we use them).

### Changes in `src/pages/Auth.tsx`

1. Replace the `formData` state object with `useRef` for each field:
   - `emailRef`, `passwordRef`, `fullNameRef`, `confirmPasswordRef`.
2. Remove `value=` and `onChange={handleInputChange}` on every `<Input>`; add `ref={emailRef}` etc. Keep `name`, `type`, `placeholder`, `required`, `autoComplete`, `autoCapitalize="off"`, `autoCorrect="off"`, `spellCheck={false}`, `inputMode`.
3. Rewrite `handleSignIn`, `handleSignUp`, `handleResetPassword` to read values from refs (`emailRef.current?.value ?? ''`, trimmed for email).
4. The "Passwords do not match" inline hint and the disabled-state on the submit buttons currently depend on `formData`. Replace with a single lightweight `useState<{ passwordMismatch: boolean; canSubmitSignIn: boolean; canSubmitSignUp: boolean }>` updated via `onInput` handlers that read from refs (NOT `onChange`, and they do not call `setState` on every character — only flip booleans when they actually change). This keeps validation UX without forcing a re-render that re-syncs `value` back to the DOM.
5. The forgot-password modal reuses the email ref; no behavior change.
6. The Eye/EyeOff show-password toggle keeps working: switching `type` between `password` and `text` does not reset an uncontrolled input's value (React preserves the DOM node).
7. The Google sign-in button is unchanged.

### Out of scope

- No changes to `AuthContext`, routing, Capacitor config, or other pages.
- No CSS changes — `.mobile-input` styling is preserved.
- ResetPassword page (`/reset-password`) is a separate flow and not reported broken; leave it alone unless the user asks.

## Verification

After deploy: `git pull && npm install && npx cap sync android && npx cap run android`, open the Sign In tab, type an email, press Backspace — characters delete one at a time. Repeat in the password field and the Sign Up tab.

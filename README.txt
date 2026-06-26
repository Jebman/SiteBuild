<!--
=======================================================
  workouts.html — STRUCTURE GUIDE
=======================================================

  <head>
    1. Meta tags         — tells the browser basic info
    2. <style>           — ALL visual styles for this page
         a. CSS variables (colors, fonts)
         b. Layout (sidebar, main, topbar)
         c. Cards (routine card, load card)
         d. Modal (button, backdrop, box, inputs, table)
  </head>

  <body>
    3. <aside>           — sidebar nav (same on every page)
    4. <div.main>        — everything to the right of sidebar
         a. <header>     — topbar with title + day picker
         b. <div.content>
              i.  type pills (Push/Pull/Legs/Arms/Rest)
              ii. cards row
                    - Today's Routine card
                    - Expected Load card
    5. Modal HTML        — button + backdrop + modal box
                           (hidden by default, JS shows it)
    6. <script>          — ALL javascript for this page
         a. DAYS data    — workout definitions
         b. Store        — save/load from localStorage
         c. renderRoutine() — builds the exercise list
         d. renderLoad()    — builds the body diagram
         e. Modal functions — open/close/addRow/save
         f. Init            — runs on page load
=======================================================
-->

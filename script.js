/*
  script.js — RetireWise Retirement Calculator
  ============================================================

  FROM COURSE SLIDES (used in this file):
    ✅ var declarations                  — Week 9
    ✅ Named functions                   — Week 10
    ✅ for loops                         — Week 9
    ✅ if / else conditionals            — Week 9
    ✅ Number() conversion               — HW 9
    ✅ Math.round()                      — HW 9 (Math object)
    ✅ new Date().getFullYear()          — HW 9 (Date object)
    ✅ Arrays + .push()                  — Week 10
    ✅ document.getElementById()         — Week 9 / 10
    ✅ element.innerHTML                 — Week 9 / 10
    ✅ addEventListener (click, submit)  — Week 10
    ✅ classList.remove()                — Week 11 / 12

  ⚠️ OUTSIDE COURSE SLIDES (flagged clearly):
    🔶 Chart.js            — 3rd-party library, draws the chart
    🔶 .toLocaleString()   — Week 9 taught Number(); this extends it
    🔶 e.preventDefault()  — stops the page from refreshing on submit
    🔶 getComputedStyle()  — reads CSS variables to color the chart
    🔶 .scrollIntoView()   — scrolls the page to show results
  ============================================================
*/


/* ──────────────────────────────────────────
   THEME TOGGLE (dark / light mode)
   Uses addEventListener — FROM SLIDES (Week 10)
   Uses setAttribute — FROM SLIDES (Week 11)
────────────────────────────────────────── */

// Start with the browser's preferred color scheme.
// matchMedia checks a CSS media query from JavaScript.
var currentTheme = 'light';
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  currentTheme = 'dark';
}

// Apply the theme to the <html> element right away.
document.documentElement.setAttribute('data-theme', currentTheme);

// Grab the toggle button so we can listen for clicks.
var themeBtn = document.getElementById('themeToggle');

// Update the button icon to show which mode is active.
function updateThemeButton() {
  if (currentTheme === 'dark') {
    // Sun icon — clicking will switch to light
    themeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  } else {
    // Moon icon — clicking will switch to dark
    themeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
}

// Run once on load to show the right icon.
updateThemeButton();

// Listen for clicks on the toggle button — addEventListener FROM SLIDES (Week 10).
themeBtn.addEventListener('click', function () {
  // Flip the theme between dark and light.
  if (currentTheme === 'dark') {
    currentTheme = 'light';
  } else {
    currentTheme = 'dark';
  }
  // Write the new theme to the <html> element — setAttribute FROM SLIDES (Week 11).
  document.documentElement.setAttribute('data-theme', currentTheme);
  // Update the icon.
  updateThemeButton();
  // Re-color the chart if it's already drawn (⚠️ Chart.js — outside slides).
  if (growthChart) {
    syncChartColors();
  }
});


/* ──────────────────────────────────────────
   CHART.JS INSTANCE
   This variable holds the chart object.
   It starts as null (empty) because no chart
   has been drawn yet.
   var declaration — FROM SLIDES (Week 9)
────────────────────────────────────────── */
var growthChart = null;


/* ──────────────────────────────────────────
   formatCurrency() — helper function
   Turns a raw number like 12345 into "$12,345".
   Named function — FROM SLIDES (Week 10)
   Math.round() — FROM SLIDES / HW 9
   .toLocaleString() — ⚠️ OUTSIDE SLIDES
────────────────────────────────────────── */
function formatCurrency(num) {
  // Math.round removes any cents so we get a clean dollar number.
  // toLocaleString adds commas (e.g., 12000 → "12,000").
  return '$' + Math.round(num).toLocaleString('en-US');
}


/* ──────────────────────────────────────────
   ⚠️ getCSSColors() — OUTSIDE SLIDES
   Reads CSS custom properties so the chart
   uses the same colors as the current theme.
   Only needed because of Chart.js.
────────────────────────────────────────── */
function getCSSColors() {
  var s = getComputedStyle(document.documentElement);
  return {
    primary:   s.getPropertyValue('--pri').trim(),
    textMuted: s.getPropertyValue('--txm').trim(),
    divider:   s.getPropertyValue('--div').trim()
  };
}

/* ──────────────────────────────────────────
   ⚠️ syncChartColors() — OUTSIDE SLIDES
   Called after theme switch so the chart
   updates to the new color values.
────────────────────────────────────────── */
function syncChartColors() {
  var c = getCSSColors();
  growthChart.data.datasets[0].borderColor          = c.primary;
  growthChart.data.datasets[0].backgroundColor      = c.primary + '28';
  growthChart.data.datasets[0].pointBackgroundColor = c.primary;
  growthChart.options.scales.x.ticks.color = c.textMuted;
  growthChart.options.scales.y.ticks.color = c.textMuted;
  growthChart.options.scales.x.grid.color  = c.divider;
  growthChart.options.scales.y.grid.color  = c.divider;
  growthChart.update();
}


/* ════════════════════════════════════════════════════════
   calcRetire() — THE MAIN CALCULATION FUNCTION
   This runs every time the user submits the form.
   Named function — FROM SLIDES (Week 10)
════════════════════════════════════════════════════════ */
function calcRetire() {

  /* ── Step 1: Read input values from the form ────────────
     getElementById() — FROM SLIDES (Week 9 / 10)
     Number()         — FROM SLIDES / HW 9
  ──────────────────────────────────────────────────────── */
  var currentAge     = Number(document.getElementById('currentAge').value);
  var retirementAge  = Number(document.getElementById('retirementAge').value);
  var monthlyPmt     = Number(document.getElementById('monthlyContrib').value);
  var annualRate     = Number(document.getElementById('annualRate').value);
  var withdrawalRate = Number(document.getElementById('withdrawalRate').value);


  /* ── Step 2: Clear old error messages ───────────────────
     Arrays — FROM SLIDES (Week 10)
     for loop — FROM SLIDES (Week 9)
     getElementById + className — FROM SLIDES
  ──────────────────────────────────────────────────────── */
  var errIds = ['errA', 'errR', 'errM', 'errI', 'errW'];
  for (var i = 0; i < errIds.length; i++) {
    // Remove the .show class so the error disappears.
    document.getElementById(errIds[i]).className = 'errmsg';
  }


  /* ── Step 3: Validate the inputs ────────────────────────
     if / else conditionals — FROM SLIDES (Week 9)
     isNaN() checks if a value is "Not a Number"
  ──────────────────────────────────────────────────────── */
  var hasError = false;

  // Current age must be a real number between 18 and 80.
  if (isNaN(currentAge) || currentAge < 18 || currentAge > 80) {
    document.getElementById('errA').className = 'errmsg show';
    hasError = true;
  }

  // Retirement age must be bigger than current age.
  if (isNaN(retirementAge) || retirementAge <= currentAge) {
    document.getElementById('errR').className = 'errmsg show';
    hasError = true;
  }

  // Monthly payment must be 0 or more.
  if (isNaN(monthlyPmt) || monthlyPmt < 0) {
    document.getElementById('errM').className = 'errmsg show';
    hasError = true;
  }

  // Interest rate must be between 0% and 30%.
  if (isNaN(annualRate) || annualRate < 0 || annualRate > 30) {
    document.getElementById('errI').className = 'errmsg show';
    hasError = true;
  }

  // Withdrawal rate must be between 0.1% and 20%.
  if (isNaN(withdrawalRate) || withdrawalRate < 0.1 || withdrawalRate > 20) {
    document.getElementById('errW').className = 'errmsg show';
    hasError = true;
  }

  // If anything was wrong, stop here. Don't calculate.
  if (hasError) {
    return;
  }


  /* ── Step 4: Set up variables for the calculation ───────
     var declarations — FROM SLIDES (Week 9)
     new Date().getFullYear() — FROM SLIDES / HW 9
  ──────────────────────────────────────────────────────── */

  // How many years until retirement?
  var years = retirementAge - currentAge;

  // Convert annual rate (like 7) to a monthly decimal (like 0.005833).
  var monthlyRate = (annualRate / 100) / 12;

  // Running balance starts at zero.
  var balance = 0;

  // Get the current calendar year so we can label table rows.
  var thisYear = new Date().getFullYear();


  /* ── Step 5: Create empty arrays for chart and table ────
     Arrays and .push() — FROM SLIDES (Week 10)
  ──────────────────────────────────────────────────────── */
  var chartLabels   = [];   // age labels for x-axis (e.g., "Age 31")
  var chartBalances = [];   // balance numbers for y-axis
  var tableHTML     = '';   // we'll build the table rows as a string


  /* ── Step 6: Year-by-year compound interest loop ────────
     Nested for loops — FROM SLIDES (Weeks 9–10)
     .push() — FROM SLIDES (Week 10)
     innerHTML string building — FROM SLIDES (Week 9)
  ──────────────────────────────────────────────────────── */

  // Outer loop: go through each year until retirement.
  for (var yr = 1; yr <= years; yr++) {

    var yearlyInterest = 0;   // track interest earned this year

    // Inner loop: compound 12 times per year (once per month).
    for (var mo = 1; mo <= 12; mo++) {
      var interest   = balance * monthlyRate;   // this month's interest
      yearlyInterest = yearlyInterest + interest;
      balance        = balance + interest + monthlyPmt;   // add interest + deposit
    }

    var age     = currentAge + yr;
    var isFinal = (yr === years);   // true only on the very last year


    // Add a data point to our arrays for the chart.
    chartLabels.push('Age ' + age);        // .push() FROM SLIDES (Week 10)
    chartBalances.push(Math.round(balance));


    // Build one HTML table row using string concatenation.
    // innerHTML pattern — FROM SLIDES (Week 9 / 10)
    var rowClass = isFinal ? ' class="fr"' : '';   // highlight the last row
    tableHTML = tableHTML + '<tr' + rowClass + '>';
    tableHTML = tableHTML + '<td>' + (thisYear + yr) + '</td>';
    tableHTML = tableHTML + '<td>' + age + '</td>';
    tableHTML = tableHTML + '<td>' + formatCurrency(monthlyPmt * 12) + '</td>';
    tableHTML = tableHTML + '<td>' + formatCurrency(yearlyInterest) + '</td>';
    tableHTML = tableHTML + '<td class="bc">' + formatCurrency(balance) + '</td>';
    tableHTML = tableHTML + '</tr>';
  }


  /* ── Step 7: Calculate summary numbers ──────────────────
     Basic math operators — FROM SLIDES (Week 9)
  ──────────────────────────────────────────────────────── */
  var finalBal     = balance;
  var totalContrib = monthlyPmt * 12 * years;
  var totalGains   = finalBal - totalContrib;
  var annualIncome = finalBal * (withdrawalRate / 100);
  var monthIncome  = annualIncome / 12;


  /* ── Step 8: Write results into the page ────────────────
     getElementById + innerHTML — FROM SLIDES (Week 9 / 10)
     classList.remove() — FROM SLIDES (Week 11 / 12)
  ──────────────────────────────────────────────────────── */

  document.getElementById('monthlyIncome').innerHTML = formatCurrency(monthIncome);

  document.getElementById('incomeSub').innerHTML =
    'Based on a ' + withdrawalRate + '% annual withdrawal from ' + formatCurrency(finalBal);

  document.getElementById('finalBalance').innerHTML = formatCurrency(finalBal);
  document.getElementById('totalContrib').innerHTML = formatCurrency(totalContrib);
  document.getElementById('totalGains').innerHTML   = formatCurrency(totalGains);

  document.getElementById('statYears').innerHTML  = years + ' years of contributions';
  document.getElementById('statMonths').innerHTML =
    (years * 12) + ' monthly payments of ' + formatCurrency(monthlyPmt);

  // Drop all the table rows in at once using innerHTML.
  document.getElementById('tableBody').innerHTML = tableHTML;

  // Make the results section visible by removing the .hidden class.
  // classList.remove() — FROM SLIDES (Week 11 / 12)
  document.getElementById('results').classList.remove('hidden');


  /* ════════════════════════════════════════════════════════
     ⚠️ CHART.JS BLOCK — OUTSIDE COURSE SLIDES
     ─────────────────────────────────────────────────────
     Everything below this comment uses Chart.js.
     Chart.js is a library loaded from CDN in index.html.
     It was NOT taught in the course slides.

     To remove it: delete from here to the END CHART.JS
     comment below. The data table above is the same
     information shown with plain JavaScript.
  ════════════════════════════════════════════════════════ */

  // Read the current CSS theme colors.
  var c = getCSSColors();

  // Grab the <canvas> element where the chart will be drawn.
  var ctx = document.getElementById('growthChart');

  // If a chart already exists, destroy it before making a new one.
  // (Prevents a Chart.js bug when you calculate more than once.)
  if (growthChart) {
    growthChart.destroy();
  }

  // Create the line chart using Chart.js.
  growthChart = new Chart(ctx, {
    type: 'line',   // draw a line chart

    data: {
      labels: chartLabels,   // x-axis labels (ages)
      datasets: [{
        label: 'Portfolio Balance',
        data:  chartBalances,             // y-axis values (balances)
        borderColor:          c.primary,
        backgroundColor:      c.primary + '28',  // semi-transparent fill
        borderWidth:          2.5,
        fill:                 true,       // fill area under the line
        tension:              0.4,        // smooth curved line
        pointRadius:          chartLabels.length > 25 ? 0 : 4,
        pointHoverRadius:     6,
        pointBackgroundColor: c.primary
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },

      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              // Format the tooltip number as currency.
              return '  Balance: ' + formatCurrency(ctx.raw);
            }
          }
        }
      },

      scales: {
        x: {
          ticks: { color: c.textMuted, maxTicksLimit: 12 },
          grid:  { color: c.divider }
        },
        y: {
          ticks: {
            color: c.textMuted,
            callback: function (v) {
              // Show "$1.5M" instead of "1500000" on the y-axis.
              if (v >= 1000000) { return '$' + (v / 1000000).toFixed(1) + 'M'; }
              if (v >= 1000)    { return '$' + (v / 1000).toFixed(0) + 'K'; }
              return '$' + v;
            }
          },
          grid: { color: c.divider }
        }
      }
    }
  });
  /* END CHART.JS */


  /* ⚠️ OUTSIDE SLIDES: scrollIntoView
     Smoothly scrolls the page down so the results
     are visible right after the button is clicked.
     Safe to delete — results will just appear in place. */
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}


/* ──────────────────────────────────────────
   FORM SUBMIT EVENT LISTENER
   addEventListener — FROM SLIDES (Week 10)
   ⚠️ e.preventDefault() — OUTSIDE SLIDES
      This stops the browser from refreshing
      the page when a form is submitted.
      Slides-only alternative: change the button
      to type="button" onclick="calcRetire()"
      and delete this entire addEventListener block.
────────────────────────────────────────── */
document.getElementById('calcForm').addEventListener('submit', function (e) {
  e.preventDefault();   // stop the page from refreshing ⚠️ outside slides
  calcRetire();
});

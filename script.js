// Retirement Growth Calculator with Charts
// Author: Sergio Ruelas
// This file reads the form, does the math, and draws three charts.

/* ============================================================
   1. Theme button (switch between light and dark mode)
   ============================================================ */

// Get the theme button and the body element
var themeButton = document.getElementById("themeButton");
var body = document.body;

// Start the page in light mode
body.className = "light-mode";

// When we click the theme button, swap between light and dark mode
themeButton.addEventListener("click", function () {
  // If page is dark, change back to light
  if (body.className === "dark-mode") {
    body.className = "light-mode";
    themeButton.textContent = "Dark";  // next click will go to dark
  } else {
    // If page is light (or anything else), change to dark
    body.className = "dark-mode";
    themeButton.textContent = "Light"; // next click will go to light
  }
});

/* ============================================================
   2. Form inputs and result spans
   ============================================================ */

// Get form and input elements
var form = document.getElementById("calcForm");
var ageNowInput = document.getElementById("ageNow");
var ageRetireInput = document.getElementById("ageRetire");
var monthlySaveInput = document.getElementById("monthlySave");
var yearRateInput = document.getElementById("yearRate");

// Get output spans where we show results
var finalBalanceSpan = document.getElementById("finalBalance");
var monthlyIncomeSpan = document.getElementById("monthlyIncome");

/* ============================================================
   3. Chart.js objects (we keep them here so we can update them)
   ============================================================ */

// We keep the Chart.js chart objects here so we can destroy
// the old charts and draw new ones after each calculation.
var lineChart = null;     // line chart: balance over time
var barChart = null;      // bar chart: contributions vs interest
var doughnutChart = null; // NEW doughnut chart: share of savings vs interest

/* ============================================================
   4. Helper function to format money numbers
   ============================================================ */

// Turn a number into a simple money string like "$12345"
function formatMoney(amount) {
  // Round to the nearest whole dollar and add the dollar sign
  return "$" + Math.round(amount);
}

/* ============================================================
   5. Main calculation when the user submits the form
   ============================================================ */

// When the form is submitted, run our calculation
form.addEventListener("submit", function (event) {
  // Stop the page from reloading when we submit the form
  event.preventDefault();

  // Read numbers from inputs
  var ageNow = Number(ageNowInput.value);
  var ageRetire = Number(ageRetireInput.value);
  var monthlySave = Number(monthlySaveInput.value);
  var yearRate = Number(yearRateInput.value);

  // Simple checks to make sure values make sense

  // Check for any box that is not a number
  if (isNaN(ageNow) || isNaN(ageRetire) || isNaN(monthlySave) || isNaN(yearRate)) {
    alert("Please fill in all boxes with numbers.");
    return;
  }

  // Retirement age must be greater than current age
  if (ageRetire <= ageNow) {
    alert("Retirement age must be bigger than current age.");
    return;
  }

  // You cannot save a negative amount
  if (monthlySave < 0) {
    alert("Monthly save must be 0 or more.");
    return;
  }

  // Rate cannot be negative either
  if (yearRate < 0) {
    alert("Rate must be 0 or more.");
    return;
  }

  /* ------------------------------------------------------------
     5a. Do the retirement math
     ------------------------------------------------------------ */

  // Figure out how many years and months we will save
  var years = ageRetire - ageNow;
  var months = years * 12;

  // Change yearly percent into monthly decimal rate
  // Example: 6% per year becomes 0.06 / 12 per month
  var monthlyRate = (yearRate / 100) / 12;

  // Balance starts at 0 dollars
  var balance = 0;

  // Arrays for the line chart labels and data
  var labels = [];      // labels will be ages: "Age 31", "Age 32", ...
  var dataPoints = [];  // data will be the balance at each year

  var year;
  var m;

  // Loop over each year
  for (year = 1; year <= years; year++) {
    // Loop over 12 months in this year
    for (m = 0; m < 12; m++) {
      // Grow with interest for this month
      var interest = balance * monthlyRate;
      // Add interest and monthly saving to the balance
      balance = balance + interest + monthlySave;
    }

    // After 12 months, save the age label for the x-axis
    labels.push("Age " + (ageNow + year));
    // Save rounded balance for the y-axis
    dataPoints.push(Math.round(balance));
  }

  // Final balance after all the years of saving
  var finalBalance = balance;

  // Simple 4% rule for yearly and monthly income
  var yearlyIncome = finalBalance * 0.04;
  var monthlyIncome = yearlyIncome / 12;

  // Calculate total contributions and total interest earned
  var totalContributions = monthlySave * months;
  var totalInterest = Math.round(finalBalance - totalContributions);

  // Show results on the page
  finalBalanceSpan.textContent = formatMoney(finalBalance);
  monthlyIncomeSpan.textContent = formatMoney(monthlyIncome);

  /* ------------------------------------------------------------
     5b. Draw or update the three charts
     ------------------------------------------------------------ */

  // ===== Line chart: balance over time =====
  var ctx = document.getElementById("growthChart").getContext("2d");

  // If we already drew a chart before, destroy it first
  if (lineChart) {
    lineChart.destroy();
  }

  // Make a new line chart with Chart.js
  lineChart = new Chart(ctx, {
    type: "line",   // line chart
    data: {
      labels: labels,   // x-axis labels (ages)
      datasets: [{
        label: "Balance",
        data: dataPoints, // y-axis values (money)
        borderColor: "rgb(1, 105, 111)",
        backgroundColor: "rgba(1, 105, 111, 0.2)",
        tension: 0.2     // slight curve in the line
      }]
    },
    options: {
      responsive: false  // keep fixed size set in HTML
    }
  });

  // ===== Bar chart: contributions vs interest =====
  var ctx2 = document.getElementById("breakdownChart").getContext("2d");

  // Remove the old bar chart if it exists
  if (barChart) {
    barChart.destroy();
  }

  // Make a new bar chart with Chart.js
  barChart = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: ["Total Contributions", "Total Interest Earned"],
      datasets: [{
        label: "Final Balance Pieces",
        data: [Math.round(totalContributions), totalInterest],
        backgroundColor: [
          "rgba(1, 105, 111, 0.7)",   // teal bar for savings
          "rgba(200, 120, 30, 0.7)"   // orange bar for interest
        ]
      }]
    },
    options: {
      responsive: false
    }
  });

  // ===== NEW doughnut chart: savings vs interest share =====
  var ctx3 = document.getElementById("shareChart").getContext("2d");

  // Remove the old doughnut chart if it exists
  if (doughnutChart) {
    doughnutChart.destroy();
  }

  // Make a new doughnut chart with Chart.js
  // This chart shows what percent of your final money is
  // from your own savings and what percent is from interest.
  doughnutChart = new Chart(ctx3, {
    type: "doughnut",
    data: {
      labels: ["Your Savings", "Interest Growth"],
      datasets: [{
        data: [Math.round(totalContributions), totalInterest],
        backgroundColor: [
          "rgba(1, 105, 111, 0.85)",   // dark teal slice
          "rgba(240, 180, 75, 0.95)"   // gold slice
        ]
      }]
    },
    options: {
      responsive: false
    }
  });

  // NOTE: A true 3D chart would need a different library
  // like Plotly.js, which is beyond our simple Chart.js setup.[web:423]
});
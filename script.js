// Retirement Growth Calculator
// Author: Sergio Ruelas
// This file reads the form, does the math, and draws two charts.

/* ============================================================
   1. Grab all the elements from the page
   ============================================================ */

// I need the form and each input box so I can read the numbers
var form          = document.getElementById("calcForm");
var ageNowInput   = document.getElementById("ageNow");
var ageRetireInput= document.getElementById("ageRetire");
var monthlySaveInput = document.getElementById("monthlySave");
var yearRateInput = document.getElementById("yearRate");

// These are the spots on the page where I show the final answers
var finalBalanceSpan = document.getElementById("finalBalance");
var monthlyIncomeSpan= document.getElementById("monthlyIncome");

/* ============================================================
   2. Chart variables
   I save the charts here so I can destroy the old ones
   before drawing new ones after a recalculation.
   ============================================================ */

var lineChart = null;   // holds my line chart
var barChart  = null;   // holds my bar chart

/* ============================================================
   3. Helper to turn a number into money format like "$12345"
   ============================================================ */

function formatMoney(amount) {
  // round to the nearest dollar, then stick a $ in front
  return "$" + Math.round(amount).toLocaleString();
}

/* ============================================================
   4. Main math + chart code — runs every time I click Calculate
   ============================================================ */

form.addEventListener("submit", function (event) {
  // stop the page from refreshing when I submit the form
  event.preventDefault();

  // read all the numbers from the inputs
  var ageNow      = Number(ageNowInput.value);
  var ageRetire   = Number(ageRetireInput.value);
  var monthlySave = Number(monthlySaveInput.value);
  var yearRate    = Number(yearRateInput.value);

  // --- basic error checking so the math does not break ---

  if (isNaN(ageNow) || isNaN(ageRetire) || isNaN(monthlySave) || isNaN(yearRate)) {
    alert("Please fill in all boxes with numbers.");
    return;
  }

  if (ageRetire <= ageNow) {
    alert("Retirement age must be bigger than current age.");
    return;
  }

  if (monthlySave < 0) {
    alert("Monthly savings must be 0 or more.");
    return;
  }

  if (yearRate < 0) {
    alert("Interest rate must be 0 or more.");
    return;
  }

  /* ----------------------------------------------------------
     4a. Calculate the retirement balance month by month
     ---------------------------------------------------------- */

  // figure out the total months I will be saving
  var years  = ageRetire - ageNow;
  var months = years * 12;

  // convert yearly percent into a monthly decimal
  // example: 6% per year = 0.06 / 12 per month
  var monthlyRate = (yearRate / 100) / 12;

  // start with zero dollars
  var balance = 0;

  // these arrays store data points for the line chart
  var labels     = [];   // x-axis: "Age 31", "Age 32", etc.
  var dataPoints = [];   // y-axis: balance at each age

  // loop year by year, and inside that month by month
  var year, m;
  for (year = 1; year <= years; year++) {
    for (m = 0; m < 12; m++) {
      // interest earned this month
      var interest = balance * monthlyRate;
      // add interest + my monthly contribution
      balance = balance + interest + monthlySave;
    }
    // save this year's label and balance for the chart
    labels.push("Age " + (ageNow + year));
    dataPoints.push(Math.round(balance));
  }

  /* ----------------------------------------------------------
     4b. Calculate the summary results
     ---------------------------------------------------------- */

  var finalBalance       = balance;
  var yearlyIncome       = finalBalance * 0.04;   // 4% rule
  var monthlyIncome      = yearlyIncome / 12;

  // total money I put in myself vs total earned from interest
  var totalContributions = monthlySave * months;
  var totalInterest      = Math.round(finalBalance - totalContributions);

  // show the results on the page
  finalBalanceSpan.textContent  = formatMoney(finalBalance);
  monthlyIncomeSpan.textContent = formatMoney(monthlyIncome);

  /* ----------------------------------------------------------
     4c. Animation settings
     I got these from: chartjs.org/docs/latest/configuration/animations.html
     duration = how many milliseconds the animation plays
     easing   = the style of motion (starts fast, slows at end)
     ---------------------------------------------------------- */

  var myAnimation = {
    duration: 10000,
    easing: "easeOutQuart"
  };

  /* ----------------------------------------------------------
     4d. Line chart — balance growing over time
     ---------------------------------------------------------- */

  var ctx = document.getElementById("growthChart");

  // destroy the old line chart first, otherwise they stack up
  if (lineChart) {
    lineChart.destroy();
  }

  lineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,         // ages on the x-axis
      datasets: [{
        label: "Balance",
        data: dataPoints,     // dollar amounts on the y-axis
        borderColor: "rgb(2, 195, 154)",
        backgroundColor: "rgba(2, 195, 154, 0.15)",
        tension: 0.3          // slight curve so the line looks smooth
      }]
    },
    options: {
      responsive: false,
      animation: myAnimation   // play the animation on every new chart
    }
  });

  /* ----------------------------------------------------------
     4e. Bar chart — what I saved vs what interest added
     ---------------------------------------------------------- */

  var ctx2 = document.getElementById("breakdownChart");

  // destroy the old bar chart first
  if (barChart) {
    barChart.destroy();
  }

  barChart = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: ["Total Contributions", "Total Interest Earned"],
      datasets: [{
        label: "Final Balance Breakdown",
        data: [Math.round(totalContributions), totalInterest],
        backgroundColor: [
          "rgba(2, 195, 154, 0.75)",    // teal = money I put in
          "rgba(245, 158, 11, 0.85)"    // gold = money from interest
        ]
      }]
    },
    options: {
      responsive: false,
      animation: myAnimation   // same animation so both charts match
    }
  });

});
// This project uses Chart.js for the chart.
// Chart.js is a new library I researched for this extra credit.

// Get the theme button and the body element
var themeButton = document.getElementById("themeButton");
var body = document.body;

// When we click the theme button, swap between light and dark mode
themeButton.addEventListener("click", function () {
  // If page is dark, change back to light
  if (body.className === "dark-mode") {
    body.className = "light-mode";
    themeButton.textContent = "Dark"; // next click will go to dark
  } else {
    // If page is light (or empty), change to dark
    body.className = "dark-mode";
    themeButton.textContent = "Light"; // next click will go to light
  }
});

// Get form and input elements
var form = document.getElementById("calcForm");
var ageNowInput = document.getElementById("ageNow");
var ageRetireInput = document.getElementById("ageRetire");
var monthlySaveInput = document.getElementById("monthlySave");
var yearRateInput = document.getElementById("yearRate");

// Get output spans
var finalBalanceSpan = document.getElementById("finalBalance");
var monthlyIncomeSpan = document.getElementById("monthlyIncome");

// We keep the Chart.js chart object here so we can update it later
var chart = null;   // for the line chart
var chart2 = null;  // for the bar chart

// Turn a number into a simple money string like "$12345"
function formatMoney(amount) {
  // round to the nearest whole dollar
  return "$" + Math.round(amount);
}

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
  if (isNaN(ageNow) || isNaN(ageRetire) || isNaN(monthlySave) || isNaN(yearRate)) {
    alert("Please fill in all boxes with numbers.");
    return;
  }

  if (ageRetire <= ageNow) {
    alert("Retirement age must be bigger than current age.");
    return;
  }

  if (monthlySave < 0) {
    alert("Monthly save must be 0 or more.");
    return;
  }

  if (yearRate < 0) {
    alert("Rate must be 0 or more.");
    return;
  }

  // Figure out how many years and months we will save
  var years = ageRetire - ageNow;
  var months = years * 12;

  // Change yearly percent into monthly decimal rate
  var monthlyRate = (yearRate / 100) / 12;

  // balance starts at 0
  var balance = 0;

  // arrays for the chart labels and data
  var labels = [];
  var dataPoints = [];

  // Loop over each year
  var year;
  for (year = 1; year <= years; year++) {
    var m;
    // Loop over 12 months in this year
    for (m = 0; m < 12; m++) {
      // grow with interest
      var interest = balance * monthlyRate;
      // add interest and monthly saving to balance
      balance = balance + interest + monthlySave;
    }
    // Save label like "Age 31", "Age 32", and so on
    labels.push("Age " + (ageNow + year));
    // Save rounded balance for this year
    dataPoints.push(Math.round(balance));
  }

  // Final balance after all years
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

  // ===== Chart.js part (new library) =====

  // Get the canvas element for Chart.js
  var ctx = document.getElementById("growthChart");

  // If we already drew a chart before, destroy it first
  if (chart) {
    chart.destroy();
  }

  // Make a new line chart with Chart.js
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,      // x-axis labels (ages)
      datasets: [{
        label: "Balance",
        data: dataPoints,  // y-axis values (money)
        borderColor: "rgb(1, 105, 111)",
        backgroundColor: "rgba(1, 105, 111, 0.2)"
      }]
    },
    options: {
      // keep it simple for extra credit
      responsive: false
    }
  });

  // Make a new bar chart with Chart.js
  var ctx2 = document.getElementById("breakdownChart");
  if (chart2) { chart2.destroy(); }
  chart2 = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: ["Total Contributions", "Total Interest Earned"],
      datasets: [{
        label: "Breakdown",
        data: [Math.round(totalContributions), totalInterest],
        backgroundColor: ["rgba(1, 105, 111, 0.6)", "rgba(200, 120, 30, 0.6)"]
      }]
    },
    options: { responsive: false }
  });

});
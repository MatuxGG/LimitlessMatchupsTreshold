// ==UserScript==
// @name         LimitlessMatchupsThreshold
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Filters table rows based on a dynamic threshold set via an input at the top right, with URL filters
// @author
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Configurations
    const columnTitle = "Matches"; // Replace with the title of the column to use
    const defaultThreshold = 20; // Default threshold value
    const urlPatterns = [/matchups/]; // List of URL patterns (regular expressions)

    // Check if the URL matches any of the patterns
    const currentUrl = window.location.href;
    const matchesPattern = urlPatterns.some(pattern => pattern.test(currentUrl));
    if (!matchesPattern) return; // If no pattern matches, stop the script

    // Main function
    function filterRows(threshold) {
        const tables = document.querySelectorAll('table'); // Search for all tables
        tables.forEach(table => {
            const tbody = table.querySelector('tbody');
            if (!tbody) return; // If no tbody, move to the next table

            const headerRow = tbody.querySelector('tr:first-child');
            if (!headerRow) return;

            const headerCells = headerRow.querySelectorAll('td, th'); // Select the first row (headers)
            let columnIndex = -1;

            // Find the index of the column based on the title
            headerCells.forEach((cell, index) => {
                if (cell.textContent.trim() === columnTitle) {
                    columnIndex = index;
                }
            });

            if (columnIndex === -1) return; // If the column title is not found, exit the function

            // Iterate over the rows and show/hide those that do not meet the threshold
            const rows = Array.from(tbody.querySelectorAll('tr')).slice(1); // Skip the first row (headers)
            rows.forEach(row => {
                const cells = row.querySelectorAll('td, th');
                const cellValue = parseFloat(cells[columnIndex].textContent.trim());
                if (!isNaN(cellValue) && cellValue < threshold) {
                    row.style.display = 'none'; // Hide the row
                } else {
                    row.style.display = ''; // Show the row
                }
            });
        });
    }

    // Create the input for the threshold
    function createThresholdInput() {
        const inputContainer = document.createElement('div');
        inputContainer.style.display = 'flex';
        inputContainer.style.alignItems = 'center';
        inputContainer.style.padding = '12px';

        const label = document.createElement('label');
        label.textContent = 'Minimum matches: ';

        const input = document.createElement('input');
        input.type = 'number';
        input.value = defaultThreshold;
        input.style.backgroundColor = 'transparent';
        input.style.width = '60px';

        label.appendChild(input);
        inputContainer.appendChild(label);
        let parentInPage = document.getElementsByClassName('player-nav')[0];
        parentInPage.appendChild(inputContainer);

        // Add an event listener to detect changes
        input.addEventListener('input', function() {
            const newThreshold = parseFloat(input.value);
            if (!isNaN(newThreshold)) {
                filterRows(newThreshold);
            }
        });

        // Initially filter with the default value
        filterRows(defaultThreshold);
    }

    // Execute the script when the page loads
    window.addEventListener('load', createThresholdInput);

})();

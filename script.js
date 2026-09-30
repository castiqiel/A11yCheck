// 1. Grab all the HTML elements we need to work with
const bgColorInput = document.getElementById('bgColor');
const textColorInput = document.getElementById('textColor');
const previewBox = document.getElementById('previewBox');
const resultBadge = document.getElementById('resultBadge');
const resultText = document.getElementById('resultText');

// Helper Function: Converts a hex string (#ffffff) to RGB values
function hexToRgb(hex) {
    // Remove the '#' if the user typed it
    hex = hex.replace('#', '');
    
    // If it's a shorthand hex like #fff, expand it to #ffffff
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    
    // If it's not a valid 6-character hex, return null
    if (hex.length !== 6) return null;

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
}

// Helper Function: Calculates relative luminance required for official contrast formulas
function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Main Function: Updates the screen and calculates the accessibility pass/fail
function updateContrastPreview() {
    let bgHex = bgColorInput.value;
    let textHex = textColorInput.value;

    // Automatically add a '#' if the user forgot it for the live CSS styling
    if (!bgHex.startsWith('#')) bgHex = '#' + bgHex;
    if (!textHex.startsWith('#')) textHex = '#' + textHex;

    // Apply the colors directly to our preview box DOM element
    previewBox.style.backgroundColor = bgHex;
    previewBox.style.color = textHex;

    // Convert both inputs to RGB objects
    const bgRgb = hexToRgb(bgHex);
    const textRgb = hexToRgb(textHex);

    // If either color code is incomplete or invalid, pause the calculation
    if (!bgRgb || !textRgb) {
        resultBadge.textContent = "WAITING...";
        resultBadge.className = "badge";
        resultBadge.style.backgroundColor = "#e0e0e0";
        resultBadge.style.color = "#666666";
        resultText.textContent = "Please enter valid 3 or 6-digit hex color codes.";
        return;
    }

    // Calculate official WCAG contrast ratio
    const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    const textLuminance = getLuminance(textRgb.r, textRgb.g, textRgb.b);

    const brightest = Math.max(bgLuminance, textLuminance);
    const darkest = Math.min(bgLuminance, textLuminance);
    const contrastRatio = (brightest + 0.05) / (darkest + 0.05);

    // WCAG AA standard requires a contrast ratio of at least 4.5:1 for regular text
    if (contrastRatio >= 4.5) {
        resultBadge.textContent = "PASS";
        resultBadge.className = "badge pass";
        resultBadge.style.backgroundColor = ""; // Reset to use CSS file colors
        resultBadge.style.color = "";
        resultText.textContent = `Great contrast ratio (${contrastRatio.toFixed(1)}:1)! This text meets accessibility standards.`;
    } else {
        resultBadge.textContent = "FAIL";
        resultBadge.className = "badge fail";
        resultBadge.style.backgroundColor = ""; 
        resultBadge.style.color = "";
        resultText.textContent = `Poor contrast ratio (${contrastRatio.toFixed(1)}:1). This text might be very hard for people to read.`;
    }
}

// 3. Setup event listeners so the app updates the very millisecond a user types!
bgColorInput.addEventListener('input', updateContrastPreview);
textColorInput.addEventListener('input', updateContrastPreview);

// Run the function once right away when the page loads to set the initial white/dark text preview
updateContrastPreview();
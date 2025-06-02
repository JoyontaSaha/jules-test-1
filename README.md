# Ubuntu OS Clone in HTML, CSS & JavaScript

## Description

This project is a front-end visual clone of the Ubuntu desktop environment, built purely with web technologies (HTML, CSS, and JavaScript). The entire experience runs from a single `index.html` file, along with its supporting `style.css` and `script.js` files. It aims to replicate some of the basic look, feel, and functionality of a modern desktop environment within a web browser.

## Key Features

*   **Desktop Environment:**
    *   Ubuntu-like desktop with a top bar displaying current time and activities placeholder.
    *   Side launcher for frequently used applications.
*   **Window Management:**
    *   Windows are draggable by their title bar.
    *   Windows can be maximized to fit the workspace (excluding top bar and launcher).
    *   Windows can be minimized to a dock area at the bottom of the launcher.
    *   Windows can be closed.
    *   Windows brought to front on click.
*   **Basic Applications:**
    *   **File Manager:** Simple interface with a sidebar for locations and a main area for dummy files/folders.
    *   **Terminal:** Mock terminal interface that accepts a few basic commands (e.g., `help`, `date`, `echo`, `clear`, `exit`).
    *   **Web Browser:** An iframe-based "browser" that can load external websites (sandboxed by iframe capabilities).
*   **Interactivity:**
    *   Desktop icons can be single-clicked for selection and double-clicked to launch applications.
    *   Launcher icons can be clicked to launch or focus their respective applications.
    *   Minimize-to-dock functionality allows windows to be temporarily hidden and restored.

## How to Run

1.  **Download the files:**
    *   `index.html`
    *   `style.css`
    *   `script.js`
2.  **Place them in the same directory** on your local machine.
3.  **Open `index.html`** in a modern web browser (e.g., Chrome, Firefox, Edge, Safari).

No build steps or servers are required for the basic functionality.

## Disclaimer

This project is a simplified clone created for educational and demonstration purposes. It is **not** a full-fledged operating system and does not interact with your actual computer's file system or operating system beyond the capabilities of a standard web page. Many features are mock-ups or simplified implementations.

## Technologies Used

*   **HTML5:** For the structure of the application.
*   **CSS3:** For styling the visual appearance, layout, and animations.
*   **Vanilla JavaScript (ES6+):** For all interactivity, window management, and application logic. No external libraries or frameworks are used.

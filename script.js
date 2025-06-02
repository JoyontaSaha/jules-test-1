// JavaScript for Ubuntu OS Clone
console.log("Ubuntu OS Clone script loaded.");

document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References
    const windowsContainer = document.getElementById('windows-container');
    const windowTemplate = document.getElementById('window-template');
    const currentTimeElement = document.getElementById('current-time');
    const desktop = document.getElementById('desktop');
    const minimizedDock = document.getElementById('minimized-dock'); // Dock for minimized windows

    // State Variables
    let highestZIndex = 100;    // Initial z-index for new windows, ensures they appear on top.
    let openWindowCount = 0;     // Used to stagger initial positions of new windows.
    const minimizedWindows = new Map(); // Stores { windowId: { windowElement, dockElement } } for minimized windows.

    // --- Time Update ---
    // Updates the current time in the top-bar every second.
    function updateTime() {
        if (currentTimeElement) {
            const now = new Date();
            currentTimeElement.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }
    updateTime(); // Initial call.
    setInterval(updateTime, 1000); // Subsequent updates every second.

    // --- Window Management ---

    // Brings the specified window element to the front by increasing its z-index.
    function bringToFront(windowElement) {
        if (!windowElement) return;
        highestZIndex++;
        windowElement.style.zIndex = highestZIndex;
    }

    // Creates and displays a new window.
    // title: String, the title of the window.
    // contentHtml: String, HTML content for the window's body.
    // Returns the created window DOM element or null if template is missing.
    window.createWindow = function(title, contentHtml) {
        if (!windowTemplate) {
            console.error("Window template not found!");
            return null;
        }

        // Clone the template and populate window details
        const newWindow = windowTemplate.content.cloneNode(true).firstElementChild;
        const windowId = `window-${Date.now()}-${Math.random().toString(36).substring(2,7)}`; // Unique ID
        newWindow.id = windowId; // Assign unique ID to the window element
        newWindow.querySelector('.title').textContent = title;
        newWindow.querySelector('.window-content').innerHTML = contentHtml;

        // Set initial position (staggered) and z-index
        openWindowCount++;
        const offsetX = (openWindowCount % 10) * 25; // Stagger new windows horizontally
        const offsetY = (openWindowCount % 10) * 25; // Stagger new windows vertically
        newWindow.style.left = `${100 + offsetX}px`;
        newWindow.style.top = `${50 + offsetY}px`;
        bringToFront(newWindow); // Make the new window appear on top

        windowsContainer.appendChild(newWindow);

        // --- Window Control Event Listeners ---
        const closeButton = newWindow.querySelector('.close');
        closeButton.addEventListener('click', () => {
            newWindow.remove(); // Remove window from DOM
            // If this window was minimized, remove its dock item
            if (minimizedWindows.has(windowId)) {
                minimizedWindows.get(windowId).dockElement.remove();
                minimizedWindows.delete(windowId);
            }
        });

        const maximizeButton = newWindow.querySelector('.maximize');
        maximizeButton.addEventListener('click', () => {
            newWindow.classList.toggle('maximized');
            // If maximized, ensure it's on top.
            if (newWindow.classList.contains('maximized')) {
                 bringToFront(newWindow);
            }
            // Adjust button symbol based on state (e.g., □ for maximize, ▫ for restore).
            maximizeButton.textContent = newWindow.classList.contains('maximized') ? '▫' : '□';
        });

        const minimizeButton = newWindow.querySelector('.minimize');
        minimizeButton.addEventListener('click', () => {
            newWindow.style.display = 'none'; // Hide the window
            // Add to minimized dock if not already there
            if (minimizedDock && !minimizedWindows.has(windowId)) {
                const dockElement = document.createElement('div');
                dockElement.className = 'minimized-item';
                // Truncate title if too long for the dock item
                dockElement.textContent = title.length > 10 ? title.substring(0,7) + '...' : title;
                dockElement.title = title; // Show full title on hover
                dockElement.dataset.windowId = windowId; // Store window ID for restoration

                dockElement.addEventListener('click', () => {
                    newWindow.style.display = ''; // Show the window
                    bringToFront(newWindow);      // Bring it to the front
                    dockElement.remove();         // Remove item from dock
                    minimizedWindows.delete(windowId); // Remove from tracked minimized windows
                });
                minimizedDock.appendChild(dockElement);
                minimizedWindows.set(windowId, { windowElement: newWindow, dockElement: dockElement });
            }
        });
        
        // --- Window Interaction ---
        // Bring window to front when any part of it is clicked.
        // Using capture phase to ensure this runs before titleBar's mousedown for dragging,
        // preventing potential race conditions or missed focus.
        newWindow.addEventListener('mousedown', () => {
            bringToFront(newWindow);
        }, true); 

        // --- Draggable Functionality ---
        const titleBar = newWindow.querySelector('.title-bar');
        let isDragging = false;
        let dragStartX, dragStartY;     // Mouse position at the start of a drag.
        let windowStartX, windowStartY; // Window position at the start of a drag.

        titleBar.addEventListener('mousedown', (e) => {
            // Prevent dragging if the click is on a window control button.
            if (e.target.classList.contains('window-control')) {
                return;
            }
            isDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            windowStartX = newWindow.offsetLeft;
            windowStartY = newWindow.offsetTop;
            newWindow.style.userSelect = 'none'; // Disable text selection during drag for smoother experience.
            // bringToFront(newWindow); // Already handled by the window's general mousedown listener.
        });

        // Listen for mousemove on the whole document to allow dragging outside the window bounds.
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - dragStartX; // Change in mouse X position.
            const dy = e.clientY - dragStartY; // Change in mouse Y position.
            // Update window position. Boundary checks (e.g., to keep window in viewport) can be added here.
            newWindow.style.left = `${windowStartX + dx}px`;
            newWindow.style.top = `${windowStartY + dy}px`;
        });

        // Stop dragging on mouseup anywhere in the document.
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                newWindow.style.userSelect = ''; // Re-enable text selection.
            }
        });

        return newWindow; // Return the created window DOM element.
    };

    // --- Desktop Icon Management ---
    const desktopIcons = document.querySelectorAll('.desktop-icon');

    // Handle single click for selection on desktop icons.
    desktopIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click from bubbling to the desktop, which would deselect.
            // Deselect any other currently selected icon.
            desktopIcons.forEach(i => { 
                if (i !== icon) i.classList.remove('selected');
            });
            // Toggle selection for the clicked icon (allows deselecting by clicking again).
            icon.classList.toggle('selected');
        });
    });

    // Deselect icons if clicking on the desktop itself.
    if (desktop) {
        desktop.addEventListener('click', () => {
            desktopIcons.forEach(i => i.classList.remove('selected'));
        });
    }

    // --- Application Launchers (from Desktop Icons) ---
    // Generic function to create app windows, preventing duplicates and restoring minimized.
    function launchApp(appTitle, contentGenerator, contentClass) {
        // Check if this app's window is already minimized
        for (const [winId, minWinData] of minimizedWindows) {
            if (minWinData.windowElement.querySelector('.title').textContent === appTitle) {
                minWinData.dockElement.click(); // Simulate click on dock item to restore
                return; 
            }
        }

        // Check if this app's window is already open (and not minimized)
        const existingWindows = windowsContainer.querySelectorAll('.window');
        for (const win of existingWindows) {
            if (win.querySelector('.title').textContent === appTitle && win.style.display !== 'none') {
                bringToFront(win); // Bring existing window to front
                return; 
            }
        }
        
        // If not minimized or already open, create a new window
        const content = typeof contentGenerator === 'function' ? contentGenerator() : contentGenerator;
        const appWindow = createWindow(appTitle, content);
        if (appWindow && contentClass) {
            appWindow.querySelector('.window-content').classList.add(contentClass);
        }
        // Special handling for focusing input in terminal after creation
        if (contentClass === 'terminal-content' && appWindow) {
            const inputField = appWindow.querySelector('.terminal-input');
            if (inputField) inputField.focus();
        }
    }
    
    // Define desktop icon double-click listeners using the generic launchApp function
    const fileManagerIcon = document.getElementById('file-manager-icon');
    if (fileManagerIcon) {
        fileManagerIcon.addEventListener('dblclick', () => launchApp("Files", () => `
            <div class="file-manager-sidebar">
                <ul><li>🏠 Home</li><li>📄 Documents</li><li>🖼️ Pictures</li><li>🎵 Music</li><li>🗑️ Trash</li></ul>
            </div>
            <div class="file-manager-main">
                <div class="fm-item"><span>📁</span><span class="fm-item-name">Applications</span></div>
                <div class="fm-item"><span>📁</span><span class="fm-item-name">Desktop</span></div>
                <div class="fm-item"><span>📄</span><span class="fm-item-name">notes.txt</span></div>
            </div>
        `, 'file-manager-content'));
    }

    const terminalIcon = document.getElementById('terminal-icon');
    if (terminalIcon) {
        terminalIcon.addEventListener('dblclick', () => {
            // Terminal needs special handling for its input logic, so not using launchApp directly
            // or extending launchApp to accept a callback for post-creation logic.
            // For now, keep its original structure but add duplicate/minimized checks.
            const appTitle = "Terminal";
            for (const [winId, minWinData] of minimizedWindows) {
                if (minWinData.windowElement.querySelector('.title').textContent === appTitle) {
                    minWinData.dockElement.click(); return;
                }
            }
            const existingWindows = windowsContainer.querySelectorAll('.window');
            for (const win of existingWindows) {
                if (win.querySelector('.title').textContent === appTitle && win.style.display !== 'none') {
                    bringToFront(win); return;
                }
            }

            const termContent = `
                <div class="terminal-output">
                    <p>Last login: ${new Date().toUTCString()}</p>
                    <p><span class="prompt">user@ubuntu:~$</span></p>
                </div>
                <div class="terminal-input-line">
                    <span class="prompt">user@ubuntu:~$</span>
                    <input type="text" class="terminal-input" autofocus />
                </div>`;
            const termWindow = createWindow(appTitle, termContent);
            if (termWindow) {
                termWindow.querySelector('.window-content').classList.add('terminal-content');
                const inputField = termWindow.querySelector('.terminal-input');
                const outputArea = termWindow.querySelector('.terminal-output');

                if (inputField && outputArea) {
                    inputField.focus();
                    inputField.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const command = inputField.value.trim();
                            
                            const pCommand = document.createElement('p');
                            pCommand.innerHTML = `<span class="prompt">user@ubuntu:~$</span> ${command}`;
                            outputArea.appendChild(pCommand);
                            
                            if (command) {
                                const pResponse = document.createElement('p');
                                if (command === 'help') {
                                    pResponse.textContent = 'Available commands: help, clear, date, echo [text], exit';
                                } else if (command === 'clear') {
                                    outputArea.innerHTML = '<p><span class="prompt">user@ubuntu:~$</span></p>';
                                } else if (command === 'date') {
                                    pResponse.textContent = new Date().toString();
                                } else if (command.startsWith('echo ')) {
                                    pResponse.textContent = command.substring(5);
                                } else if (command === 'exit') {
                                    // Find the close button of this terminal window and click it
                                    termWindow.querySelector('.window-control.close').click();
                                    return; // Stop further processing for 'exit'
                                } else {
                                    pResponse.textContent = `command not found: ${command}`;
                                }
                                outputArea.appendChild(pResponse);
                            }
                            // Add new prompt line for next command
                            const pNewPrompt = document.createElement('p');
                            pNewPrompt.innerHTML = `<span class="prompt">user@ubuntu:~$</span>`;
                            outputArea.appendChild(pNewPrompt);
                            
                            inputField.value = ''; 
                            outputArea.scrollTop = outputArea.scrollHeight; 
                        }
                    });
                }
            }
        });
    }
    
    const browserIcon = document.getElementById('browser-icon');
    if (browserIcon) {
        browserIcon.addEventListener('dblclick', () => launchApp("Web Browser", () => `
            <div class="browser-address-bar"><input type="text" value="https://example.com" readonly /></div>
            <iframe src="https://example.com" class="browser-iframe"></iframe>
        `, 'browser-content'));
    }

    // --- Launcher Icon Click Functionality ---
    // Make launcher icons also launch apps (or focus if already open/minimized)
    const launcherIcons = document.querySelectorAll('#launcher .launcher-icon');
    launcherIcons.forEach(launcherButton => {
        const iconSpan = launcherButton.querySelector('span');
        if (!iconSpan) return; // Skip if no span found

        const iconText = iconSpan.textContent;
        let correspondingDesktopIconId = null;

        // Map launcher icon text to desktop icon ID
        if (iconText === '📁') correspondingDesktopIconId = 'file-manager-icon';
        else if (iconText === '🖥️') correspondingDesktopIconId = 'terminal-icon'; // Assuming terminal launcher icon matches
        else if (iconText === '🌐') correspondingDesktopIconId = 'browser-icon';
        // Add more mappings here if launcher icons differ or new ones are added

        if (correspondingDesktopIconId) {
            const desktopIconElement = document.getElementById(correspondingDesktopIconId);
            if (desktopIconElement) {
                launcherButton.addEventListener('click', () => {
                    // Simulate a double click on the corresponding desktop icon
                    // This reuses the launchApp logic (including duplicate/minimized checks)
                    const dblClickEvent = new MouseEvent('dblclick', { bubbles: true, cancelable: true });
                    desktopIconElement.dispatchEvent(dblClickEvent);
                });
            }
        } else {
            // Fallback for launcher icons not mapped to a desktop icon's app logic
            launcherButton.addEventListener('click', () => {
                 console.log(`Launcher icon "${iconText}" clicked. No app configured for this launcher item.`);
            });
        }
    });
});

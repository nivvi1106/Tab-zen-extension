# Tab Zen ⏳

A mindful productivity companion for deep work and intentional Browse, designed to help you reclaim your focus in a distracting digital world.

---

##  Core Features

* **Integrated Pomodoro Timer:** A simple and intuitive timer system to manage your productivity, built directly into the main screen.
    * **Dual Timer Display:** Clearly shows the time remaining for both the current **Focus** and upcoming **Break** sessions.
    * **Auto-Cycling:** Automatically transitions between focus and break sessions to keep you in a productive rhythm.

* **On-Screen Customization:** Control your sessions directly from the main timer view:
    * Set custom durations for your **Focus Time** and **Break Time**.
    * Define the **Number of Cycles** before the timer completes its run.

* **Smart Site Blocking:** Two powerful modes to eliminate distractions during focus sessions:
    * **Blacklist Mode:** Block a persistent list of user-defined distracting sites or URL keywords.
    * **Whitelist Mode:** Allow access *only* to a specific list of user-defined sites, blocking everything else.

* **Strict Mode:** For deep work, enable Strict Mode to prevent pausing the timer or changing any settings after a focus session has started.

* **Productivity Dashboard:** A dedicated **Stats** page to visualize your progress with simple charts for "Total Focus Hours" and "Focus Minutes This Week."

* **Adaptive & Calming UI:**
    * A clean, minimal, and calming user interface.
    * **Automatic Dark/Light Mode:** The UI seamlessly adapts to your browser's default theme.

* **Audio & Badge Notifications:**
    * Receive an **alarm sound** when a session ends.
    * A visual **badge** appears on the extension icon to notify you when it's time for a break.

---

##  Tech Stack

* **Core:** JavaScript (ES6+)
* **Framework:** React
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **Browser APIs:** WebExtension APIs (`storage`, `alarms`, `tabs`, `action`, `windows`, `offscreen`)
* **Compatibility:** `webextension-polyfill` for cross-browser support.

---

##  Getting Started

Follow these instructions to set up and run the extension on your local machine.

### Prerequisites

You must have [Node.js](https://nodejs.org/) (which includes npm) installed on your computer.

### Installation & Build

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/nivvi1106/tab-zen-extension.git
    cd tab-zen-extension
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Build the Extension**
    ```bash
    npm run build
    ```
    This command will compile all the files and create a final, production-ready `/dist` folder.

### Loading the Extension in Your Browser

#### For Chrome, Brave, or Edge

1.  Open your browser and navigate to `chrome://extensions`.
2.  Enable **Developer mode** using the toggle in the top-right corner.
3.  Click the **Load unpacked** button.
4.  Select the **`/dist`** folder from the project directory.

#### For Firefox

1.  Open Firefox and navigate to `about:debugging`.
2.  Click on **This Firefox**.
3.  Click the **Load Temporary Add-on...** button.
4.  Navigate into the **`/dist`** folder and select the `manifest.json` file.

The Tab Zen icon will now appear in your browser's toolbar, ready to use!

##  Contributing
Contributions are welcome! If you have any suggestions, bug reports, or feature requests, please open an issue or submit a pull request.

##  License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

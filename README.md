
# ChatGPT-SmartNavbar

ChatGPT-SmartNavbar is a Chrome extension that adds an interactive navbar and smart dropdown menu to enhance user experience on the ChatGPT platform. This extension provides features like dynamic option filtering, keyboard navigation, and modern styling powered by Tailwind CSS. 

## Features

- **Dynamic Navbar**: Adds a responsive, interactive navbar to ChatGPT's UI.
- **Smart Dropdown Menu**: Dynamically generates a dropdown based on user input after typing a customizable key (default is `<<`).
- **Keyboard Navigation**: Navigate through dropdown options using arrow keys and select with 'Enter'.
- **Create and Manage Prompts**: Users can create their own prompts and save them into custom categories for quick access.
- **Custom Categories for Prompts**: Users can create, rename, and delete their own prompt categories. Prompts can be easily moved between categories.
- **Prompt Management**: Users can add, edit, and delete prompts in any category, making organization a breeze.
- **Seamless Category Assignment**: Facilitates prompt assignment and reassignment between different categories with an intuitive interface.
- **Tailwind CSS Styling**: Clean, modern, and customizable styling using Tailwind CSS.
- **Optimized for Performance**: Fast and responsive interactions using efficient DOM observers, ensuring that performance remains smooth as more prompts and categories are added.
- **User Preferences**: The extension saves user preferences such as prompt categories, prompt order, and other customizations, ensuring a personalized experience across sessions.

## New Features and Improvements

- **Enhanced Search Functionality**: The search engine now supports more flexible and intuitive searches. Users can search for IDs with multiple words, spaces, and incomplete terms. For example, if a prompt category is named "Explain Code", the user can find it by typing:
  - `Explain`
  - `Exp C`
  - `Expl Code`
  - `Code`
  - `Ex C`
  - And similar variations
  This makes it easier to search for prompt categories with multi-word names or partial matches.

- **Improved Text Insertion**: After selecting an option from the dropdown menu, the inserted text now automatically includes a newline at the end, improving readability and formatting within the ChatGPT prompt box.

- **Customizable Dropdown Activation Key**: The default key to activate the dropdown is `<<`, but users can now customize this key in the extension's popup menu. This provides flexibility for users to choose a shortcut that best fits their workflow or preferences.

## Future Improvements

- **Advanced Search Options**: Continue refining the search to handle even more variations and typos, making it as user-friendly as possible.
- **Streamlined User Interface**: Further simplify category and prompt management by reducing clicks and improving overall usability.
- **Improved Storage Options**: Explore better ways to store user preferences and prompt data, ensuring data is secure and easily retrievable across different devices.

## Installation

### Prerequisites

- Node.js (version 12 or higher)
- npm (Node package manager)

### Build the App

To build the CSS for the extension, use the following commands:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the Tailwind CSS:
   ```bash
   npm run build:css
   ```

Alternatively, you can run the Tailwind CSS build command manually:
```bash
npx tailwindcss -i ./src/css/styles.css -o ./dist/css/styles.css --minify
```

> Ensure that the input and output paths (`-i` and `-o`) match the locations of your CSS files.

## Project Structure

```plaintext
ChatGPT-SmartNavbar/
├── dist/
│   └── css/
│       └── styles.css  # Minified CSS output
├── src/
│   └── css/
│       └── styles.css  # Source CSS file with Tailwind directives
│   └── js/
│       └── contentScript.js  # Main content script for the extension
│   └── data/
│  |    └── options.json  # Data file for dropdown menu options
   |----── manifest.json  # Chrome extension manifest (Version 3)
├── tailwind.config.js  # Tailwind CSS configuration
├── postcss.config.js  # PostCSS configuration for processing CSS
└── package.json  # Project metadata and dependencies
```

## Usage

1. Build the extension's CSS using the above instructions.
2. Load the extension into Chrome by navigating to `chrome://extensions/`.
3. Enable Developer Mode and click "Load unpacked" to select the `dist` folder.
4. The extension will be active on the ChatGPT page (https://chatgpt.com/*).

## Contributing

Feel free to open issues and submit pull requests to improve the project. Make sure to follow best practices in terms of code cleanliness and readability.

---

Enjoy enhanced productivity with ChatGPT-SmartNavbar!

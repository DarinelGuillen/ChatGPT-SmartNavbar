
# ChatGPT-SmartNavbar

ChatGPT-SmartNavbar is a Chrome extension designed to streamline and accelerate the process of managing and using prompts on the ChatGPT platform. It enhances the user experience with features like an interactive navbar, smart dropdown menus for quick prompt access, dynamic option filtering, and efficient keyboard navigation. The extension offers a modern, intuitive interface focused on improving the speed and ease of prompt creation, organization, and retrieval.

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

- **Enhanced Search Functionality**: The search engine now supports more flexible and intuitive searches. Users can search for IDs even if they contain spaces, partial words, or multiple word fragments. For example, if a prompt category is named "Design Patterns" or "Database Integration", users can now search using:
  - `Design`
  - `Pat`
  - `Dari`
  - `Code`
  This improves the search experience by narrowing down results based on more flexible matching logic. The dropdown will also highlight the closest match to the user's query, allowing for faster selection.

- **Improved Dropdown Behavior**: The dropdown now intelligently hovers over the closest match when the user starts typing, so that pressing 'Enter' selects the best match automatically. This helps avoid selecting irrelevant options by accident. Additionally, the dropdown now deactivates more efficiently after an option is inserted, and properly handles cursor placement after insertion to prevent it from interfering with the search trigger key.

- **Text Formatting with Newline**: After selecting an option from the dropdown menu, the inserted text now automatically includes a newline after it. This resolves the issue where the cursor would mistakenly jump behind the newly inserted text, and ensures a smoother typing experience.

- **Customizable Dropdown Activation Key**: Users can now set their own key to trigger the dropdown menu instead of the default `<<`. This customization is available in the extension's popup, providing more flexibility for different workflows.

- **Error Handling and UI Improvements**: The extension no longer shows raw alert messages for saving changes to prompts, categories, or activation keys. Instead, notifications are shown in a non-intrusive, visually appealing manner, improving user experience. The inline editing feature for both the category ID and prompt is now in the same popup window, making it easier to modify both elements without jumping between different menus.

## Future Improvements

- **Refined Cursor Behavior**: Further improvements will focus on ensuring that the cursor is placed optimally after prompt insertion, even in complex scenarios where multiple prompts are added rapidly.
- **Improved User Interface**: Streamline the design of the popup menu to make prompt and category editing even more intuitive, and add better visual feedback for actions like saving without intrusive alerts.
- **Advanced Search Capabilities**: Continue refining the search to handle even more flexible matching logic, including typo tolerance and better support for larger prompt libraries.
- **Recommendation System**: Improve or add a recommendation feature for the most frequently used prompts based on user behavior. This will automatically reorder categories and prompts based on usage to maximize speed and efficiency.
- **Design Enhancements**: Improve the design of the dropdown, navbar, and popup, adding a more polished and modern style using Tailwind CSS to provide a better user experience.

## Additional Features to Consider

- **Cloud Syncing**: Allow users to sync their prompts and categories across multiple devices using cloud storage. This ensures that the user experience is consistent across environments without manual export/import.
- **Export and Import Prompts**: Add a feature to export prompts and categories as a JSON file, which can be imported back into the extension later. This is helpful for backup purposes or for sharing prompt collections with others.
- **Tagging and Filtering**: Introduce a tagging system for prompts, allowing users to filter and search by tags. This could help manage large collections of prompts more efficiently.
- **Context-Aware Recommendations**: Based on the context of the conversation, recommend prompts that are likely to be useful. This could leverage AI or basic keyword detection.
- **AI-Assisted Prompt Creation**: Provide users with suggestions or auto-complete functionality when creating new prompts, based on common structures or previous prompts they've created.
- **Dark Mode**: Add support for a dark mode in the extension’s UI, making it more visually comfortable for users working in low-light environments.
- **Multi-Platform Support**: Expand the extension’s functionality to work not only with ChatGPT but also with other popular AI platforms such as Claude, Gemini, and others. This would allow users to manage and utilize their prompts across multiple AI services, enhancing versatility and usefulness beyond ChatGPT.


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
   npm run build
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

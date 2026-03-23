import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface AutoTaggerSettings {
  geminiApiKey: string;
  maxTags: number;
  geminiModel: string;
  useExistingTags: boolean;
  outputLanguage: string;
}

const DEFAULT_SETTINGS: AutoTaggerSettings = {
  geminiApiKey: '',
  maxTags: 5,
  geminiModel: 'gemini-2.5-flash',
  useExistingTags: false,
  outputLanguage: 'Auto'
}

export default class AutoTaggerPlugin extends Plugin {
  settings: AutoTaggerSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: 'generate-tags',
      name: 'Generate tags for active note',
      editorCallback: async (editor: Editor, view: MarkdownView) => {
        new Notice("Generating tags...");
        await this.generateTags(view.file);
      }
    });

    this.addSettingTab(new AutoTaggerSettingTab(this.app, this));
  }

  onunload() {

  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async generateTags(file: TFile | null) {
    if (!file) return;

    if (!this.settings.geminiApiKey) {
      new Notice("Please set your Gemini API Key in the settings.");
      return;
    }

    try {
      const content = await this.app.vault.read(file);
      const genAI = new GoogleGenerativeAI(this.settings.geminiApiKey);
      const model = genAI.getGenerativeModel({
        model: this.settings.geminiModel,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY" as any,
            items: {
              type: "STRING" as any,
            } as any,
          },
        },
      });

      let existingTagsString = "";
      if (this.settings.useExistingTags) {
        const allTags = Object.keys((this.app.metadataCache as any).getTags()).map((tag: string) => tag.replace(/^#/, ''));
        existingTagsString = `
**Please select appropriate tags from the following existing tag list as much as possible (to prevent inconsistencies):**
[${allTags.join(', ')}]
`;
      }

      let languageInstructions = `Output the tags in the following language: ${this.settings.outputLanguage === 'Auto' ? 'Identify the main language of the provided article/text and output the tags in that same language' : this.settings.outputLanguage}.`;

      const prompt = `
Analyze the following text and generate up to ${this.settings.maxTags} tags that best represent its content.
${languageInstructions}

**IMPORTANT: Strictly follow Obsidian's tag naming conventions.**
1. **NEVER** use spaces.
2. Connect words containing spaces like "Gemini API" with underscores like "Gemini_API" (do not use hyphens).
${existingTagsString}
Output example: ["tag1", "tag_2", "tag-3"]

Text:
${content}
            `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      // Structured output returns a valid JSON string directly
      const tagsRaw: string[] = JSON.parse(response.text());

      // Sanitize tags client-side to enforce rules
      const tags = tagsRaw.map(tag => {
        return tag.trim()
          .replace(/[ \u3000]+/g, '_') // Replace spaces (half/full width) with underscores
          .replace(/^#/, '')    // Remove leading #
          .replace(/[#,\[\]()]/g, ''); // Remove other forbidden chars
      }).filter(tag => tag.length > 0);

      await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
        if (!frontmatter['tags']) {
          frontmatter['tags'] = [];
        }
        // Check if tags is a string (YAML flow style) or array
        let currentTags = frontmatter['tags'];
        if (typeof currentTags === 'string') {
          // split by space or comma? Obsidian usually handles array in yaml
          // but sometimes it can be a comma separated string
          currentTags = [currentTags];
        }

        // Add new tags avoiding duplicates
        const uniqueTags = new Set([...(currentTags || []), ...tags]);
        frontmatter['tags'] = Array.from(uniqueTags);
      });

      new Notice(`Added ${tags.length} tags!`);

    } catch (error) {
      console.error(error);
      new Notice("Error occurred while generating tags.");
    }
  }
}

class AutoTaggerSettingTab extends PluginSettingTab {
  plugin: AutoTaggerPlugin;

  constructor(app: App, plugin: AutoTaggerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('Gemini API Key')
      .setDesc('Enter your Google Gemini API Key')
      .addText(text => {
        text
          .setPlaceholder('API Key')
          .setValue(this.plugin.settings.geminiApiKey)
          .onChange(async (value) => {
            this.plugin.settings.geminiApiKey = value;
            await this.plugin.saveSettings();
          });
        text.inputEl.type = 'password';
      });

    new Setting(containerEl)
      .setName('Gemini Model Name')
      .setDesc('Specify the model name (e.g. gemini-2.5-flash)')
      .addText(text => text
        .setPlaceholder('gemini-2.5-flash')
        .setValue(this.plugin.settings.geminiModel)
        .onChange(async (value) => {
          this.plugin.settings.geminiModel = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Reuse Existing Tags')
      .setDesc('Use existing tags from the vault as context to prevent inconsistencies. \nNote: If you have many tags, this increases the context size and may increase API costs.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.useExistingTags)
        .onChange(async (value) => {
          this.plugin.settings.useExistingTags = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Tag Output Language')
      .setDesc('Select the language for the generated tags.')
      .addDropdown(dropdown => dropdown
        .addOption('Auto', 'Auto (Match Article)')
        .addOption('English', 'English')
        .addOption('Japanese', 'Japanese')
        .setValue(this.plugin.settings.outputLanguage)
        .onChange(async (value) => {
          this.plugin.settings.outputLanguage = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Max Tags')
      .setDesc('Maximum number of tags to generate')
      .addText(text => text
        .setPlaceholder('5')
        .setValue(String(this.plugin.settings.maxTags))
        .onChange(async (value) => {
          const num = parseInt(value);
          if (!isNaN(num)) {
            this.plugin.settings.maxTags = num;
            await this.plugin.saveSettings();
          }
        }));
  }
}

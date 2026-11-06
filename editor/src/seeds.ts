import type { JSONContent } from 'shuttle-editor';

export const NOTES = [
  { id: 'n-reading', title: 'Reading list' },
  { id: 'n-ideas', title: 'Ideas' },
  { id: 'n-draft', title: 'First draft' },
];

const text = (value: string, marks?: string[]): JSONContent =>
  marks ? { type: 'text', text: value, marks: marks.map((type) => ({ type })) } : { type: 'text', text: value };
const p = (...content: JSONContent[]): JSONContent => ({ type: 'paragraph', content });
const h = (level: number, value: string): JSONContent => ({ type: 'heading', attrs: { level }, content: [text(value)] });
const link = (id: string, label: string): JSONContent => ({ type: 'mention', attrs: { id, label } });
const list = (...items: string[]): JSONContent => ({
  type: 'bulletList',
  content: items.map((item) => ({ type: 'listItem', content: [p(text(item))] })),
});

export const SEEDS: Record<'cord' | 'shuttle', JSONContent> = {
  cord: {
    type: 'doc',
    content: [
      h(2, 'A note to mess with'),
      p(text('Select this text to format it, or link it to your '), link('n-reading', 'Reading list'), text('.')),
      list('Type # and a space on a new line for a heading', 'Type [[ to link one of the sample notes'),
      p(text('Refreshing the page resets everything.', ['italic'])),
    ],
  },
  shuttle: {
    type: 'doc',
    content: [
      h(1, 'Edit this document'),
      p(
        text('The JSON pane shows what '),
        text('onChange', ['code']),
        text(' hands your app. Try '),
        text('**bold**', ['code']),
        text(', '),
        text('[[', ['code']),
        text(' or '),
        text('/', ['code']),
        text('.'),
      ),
      p(text('Links resolve through your host, such as '), link('n-ideas', 'Ideas'), text('.')),
      { type: 'blockquote', content: [p(text('Markdown is how you type. JSON is what you store.'))] },
      { type: 'blockMath', attrs: { latex: 'e^{i\\pi} + 1 = 0' } },
      {
        type: 'codeBlock',
        attrs: { language: 'typescript' },
        content: [text("const doc: JSONContent = editor.getJSON();")],
      },
      {
        type: 'taskList',
        content: [
          { type: 'taskItem', attrs: { checked: true }, content: [p(text('Install the package'))] },
          { type: 'taskItem', attrs: { checked: false }, content: [p(text('Write a host'))] },
        ],
      },
    ],
  },
};

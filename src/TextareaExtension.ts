import { Node, mergeAttributes } from '@tiptap/core';

export const TextareaNode = Node.create({
  name: 'textareaBox',

  group: 'block',

  content: 'text*',

  parseHTML() {
    return [
      {
        tag: 'textarea',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['textarea', mergeAttributes(HTMLAttributes), 0];
  },
});

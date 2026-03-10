'use client';

import { useState } from 'react';

// Content block types
export type ContentBlockType = 'heading' | 'paragraph' | 'bulletList';

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  level?: 1 | 2 | 3;
  text?: string;
  items?: string[];
}

interface ContentBlocksEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

const generateId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function ContentBlocksEditor({ blocks, onChange }: ContentBlocksEditorProps) {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // Add a new block
  const addBlock = (type: ContentBlockType) => {
    const newBlock: ContentBlock = {
      id: generateId(),
      type,
      ...(type === 'heading' ? { level: 2, text: '' } : {}),
      ...(type === 'paragraph' ? { text: '' } : {}),
      ...(type === 'bulletList' ? { items: [''] } : {}),
    };
    onChange([...blocks, newBlock]);
    setActiveBlockId(newBlock.id);
  };

  // Update a specific block
  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    onChange(blocks.map(block =>
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  // Delete a block
  const deleteBlock = (id: string) => {
    onChange(blocks.filter(block => block.id !== id));
  };

  // Move block up
  const moveBlockUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    onChange(newBlocks);
  };

  // Move block down
  const moveBlockDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    onChange(newBlocks);
  };

  // Add bullet item
  const addBulletItem = (blockId: string) => {
    onChange(blocks.map(block =>
      block.id === blockId
        ? { ...block, items: [...(block.items || []), ''] }
        : block
    ));
  };

  // Update bullet item
  const updateBulletItem = (blockId: string, itemIndex: number, value: string) => {
    onChange(blocks.map(block =>
      block.id === blockId
        ? { ...block, items: (block.items || []).map((item, i) => i === itemIndex ? value : item) }
        : block
    ));
  };

  // Delete bullet item
  const deleteBulletItem = (blockId: string, itemIndex: number) => {
    onChange(blocks.map(block =>
      block.id === blockId
        ? { ...block, items: (block.items || []).filter((_, i) => i !== itemIndex) }
        : block
    ));
  };

  return (
    <div className="space-y-4">
      {/* Block List */}
      {blocks.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-brand-grey-200 dark:border-brand-grey-700 rounded-lg">
          <p className="text-brand-grey-400 dark:text-brand-grey-500 mb-4">
            No content blocks yet. Add your first block to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className={`relative bg-white dark:bg-brand-grey-900 border rounded-lg transition-all ${
                activeBlockId === block.id
                  ? 'border-accent shadow-sm'
                  : 'border-brand-grey-200 dark:border-brand-grey-700'
              }`}
            >
              {/* Block Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-brand-grey-100 dark:border-brand-grey-800 bg-brand-grey-50 dark:bg-brand-grey-850 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-brand-grey-500 dark:text-brand-grey-400 uppercase">
                    {block.type === 'heading' ? `Heading (H${block.level})` : block.type === 'paragraph' ? 'Paragraph' : 'Bullet List'}
                  </span>
                  <span className="text-xs text-brand-grey-400 dark:text-brand-grey-500">
                    Block {index + 1}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {/* Move Up */}
                  <button
                    type="button"
                    onClick={() => moveBlockUp(index)}
                    disabled={index === 0}
                    className="p-1 text-brand-grey-400 hover:text-brand-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  {/* Move Down */}
                  <button
                    type="button"
                    onClick={() => moveBlockDown(index)}
                    disabled={index === blocks.length - 1}
                    className="p-1 text-brand-grey-400 hover:text-brand-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => deleteBlock(block.id)}
                    className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Delete block"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Block Content */}
              <div className="p-4" onClick={() => setActiveBlockId(block.id)}>
                {block.type === 'heading' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium text-brand-grey-600 dark:text-brand-grey-400 whitespace-nowrap">
                        Level:
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => updateBlock(block.id, { level: level as 1 | 2 | 3 })}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                              block.level === level
                                ? 'bg-accent text-brand-black'
                                : 'bg-brand-grey-100 dark:bg-brand-grey-800 text-brand-grey-600 dark:text-brand-grey-400 hover:bg-brand-grey-200 dark:hover:bg-brand-grey-700'
                            }`}
                          >
                            H{level}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={block.text || ''}
                      onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                      placeholder="Enter heading text..."
                      className={`w-full px-4 py-3 border border-brand-grey-200 dark:border-brand-grey-700 bg-white dark:bg-brand-grey-800 text-brand-black dark:text-white rounded-lg focus:outline-none focus:border-accent ${
                        block.level === 1 ? 'text-2xl font-bold' : block.level === 2 ? 'text-xl font-semibold' : 'text-lg font-medium'
                      }`}
                    />
                  </div>
                )}

                {block.type === 'paragraph' && (
                  <textarea
                    value={block.text || ''}
                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                    placeholder="Enter paragraph text..."
                    rows={4}
                    className="w-full px-4 py-3 border border-brand-grey-200 dark:border-brand-grey-700 bg-white dark:bg-brand-grey-800 text-brand-black dark:text-white rounded-lg focus:outline-none focus:border-accent"
                  />
                )}

                {block.type === 'bulletList' && (
                  <div className="space-y-2">
                    {(block.items || []).map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-2">
                        <span className="text-brand-grey-400 dark:text-brand-grey-500">•</span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateBulletItem(block.id, itemIndex, e.target.value)}
                          placeholder={`List item ${itemIndex + 1}...`}
                          className="flex-1 px-3 py-2 border border-brand-grey-200 dark:border-brand-grey-700 bg-white dark:bg-brand-grey-800 text-brand-black dark:text-white rounded-lg focus:outline-none focus:border-accent"
                        />
                        {(block.items?.length || 0) > 1 && (
                          <button
                            type="button"
                            onClick={() => deleteBulletItem(block.id, itemIndex)}
                            className="p-1 text-red-400 hover:text-red-600"
                            title="Remove item"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addBulletItem(block.id)}
                      className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 mt-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add item
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Block Buttons */}
      <div className="flex flex-wrap gap-2 pt-4">
        <button
          type="button"
          onClick={() => addBlock('heading')}
          className="flex items-center gap-2 px-4 py-2 border border-brand-grey-200 dark:border-brand-grey-700 rounded-lg text-sm font-medium text-brand-grey-600 dark:text-brand-grey-400 hover:border-accent hover:text-accent transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Heading
        </button>
        <button
          type="button"
          onClick={() => addBlock('paragraph')}
          className="flex items-center gap-2 px-4 py-2 border border-brand-grey-200 dark:border-brand-grey-700 rounded-lg text-sm font-medium text-brand-grey-600 dark:text-brand-grey-400 hover:border-accent hover:text-accent transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Paragraph
        </button>
        <button
          type="button"
          onClick={() => addBlock('bulletList')}
          className="flex items-center gap-2 px-4 py-2 border border-brand-grey-200 dark:border-brand-grey-700 rounded-lg text-sm font-medium text-brand-grey-600 dark:text-brand-grey-400 hover:border-accent hover:text-accent transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Bullet List
        </button>
      </div>
    </div>
  );
}
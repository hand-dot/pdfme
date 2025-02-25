/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
// Import the mock Designer instead of the real one
const { Designer } = require('../__mocks__/componentMocks');
import { I18nContext, FontContext, PluginsRegistry, CacheContext, OptionsContext } from '../../src/contexts';
import { i18n } from '../../src/i18n';
import { getDefaultFont, Template, BLANK_PDF, SchemaForUI } from '@pdfme/common';
import { text, image } from "@pdfme/schemas";
import { SELECTABLE_CLASSNAME } from '../../src/constants';

// Mock ReactDOM.render
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  render: jest.fn(),
}));

// Mock the helper functions
jest.mock('../../src/helper', () => ({
  ...jest.requireActual('../../src/helper'),
  uuid: jest.fn().mockReturnValue('test-uuid'),
}));

// Mock the RightSidebar component
jest.mock('../../src/components/Designer/RightSidebar', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ schema, onChange }) => {
    // Simulate the RightSidebar by providing a button to change properties
    return (
      <div data-testid="right-sidebar-mock">
        <button 
          data-testid="change-content-button"
          onClick={() => onChange({ key: 'content', value: 'Updated content' })}
        >
          Change Content
        </button>
        <button 
          data-testid="change-position-button"
          onClick={() => onChange({ key: 'position', value: { x: 50, y: 50 } })}
        >
          Change Position
        </button>
        <div data-testid="schema-content">{schema?.content}</div>
      </div>
    );
  }),
}));

// Mock the Canvas component
jest.mock('../../src/components/Designer/Canvas', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ schemasList, onSelect, onChange, selectedIds }) => {
    // Simulate the Canvas by providing elements that can be selected
    return (
      <div data-testid="canvas-mock">
        {schemasList[0]?.map((schema: SchemaForUI) => (
          <div 
            key={schema.id}
            data-testid={`schema-${schema.id}`}
            className={selectedIds?.includes(schema.id) ? 'selected' : ''}
            onClick={() => onSelect(schema.id)}
          >
            {schema.content}
            <button
              data-testid={`change-schema-${schema.id}`}
              onClick={() => onChange({ 
                id: schema.id, 
                key: 'content', 
                value: 'Canvas updated content' 
              })}
            >
              Update from Canvas
            </button>
          </div>
        ))}
      </div>
    );
  }),
}));

describe('Designer Integration', () => {
  let container: HTMLDivElement;
  let onChangeTemplateMock: jest.Mock;
  
  beforeEach(() => {
    // Create a DOM element to render into
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Create mock functions
    onChangeTemplateMock = jest.fn();
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    document.body.removeChild(container);
  });

  const getSampleTemplate = (): Template => ({
    basePdf: BLANK_PDF,
    schemas: [
      [
        {
          name: 'field1',
          type: 'text',
          content: 'Sample text',
          position: { x: 20, y: 20 },
          width: 100,
          height: 15,
        },
      ],
    ],
  });

  test('should update schema from RightSidebar to Canvas', async () => {
    // Initialize the Designer
    const designer = new Designer({
      domContainer: container,
      template: getSampleTemplate(),
    });
    
    designer.onChangeTemplate(onChangeTemplateMock);
    
    // Wait for the component to render
    await waitFor(() => {
      expect(document.querySelector('[data-testid="canvas-mock"]')).toBeInTheDocument();
    });
    
    // Select a schema
    const schemaElement = document.querySelector('[data-testid="schema-test-uuid"]');
    fireEvent.click(schemaElement as Element);
    
    // Verify that the RightSidebar is rendered with the selected schema
    await waitFor(() => {
      expect(document.querySelector('[data-testid="right-sidebar-mock"]')).toBeInTheDocument();
    });
    
    // Change the content from the RightSidebar
    const changeContentButton = document.querySelector('[data-testid="change-content-button"]');
    fireEvent.click(changeContentButton as Element);
    
    // Verify that the template was updated
    expect(onChangeTemplateMock).toHaveBeenCalled();
    
    // Verify that the content in the Canvas was updated
    await waitFor(() => {
      const updatedSchemaElement = document.querySelector('[data-testid="schema-test-uuid"]');
      expect(updatedSchemaElement?.textContent).toContain('Updated content');
    });
  });

  test('should update schema from Canvas to RightSidebar', async () => {
    // Initialize the Designer
    const designer = new Designer({
      domContainer: container,
      template: getSampleTemplate(),
    });
    
    designer.onChangeTemplate(onChangeTemplateMock);
    
    // Wait for the component to render
    await waitFor(() => {
      expect(document.querySelector('[data-testid="canvas-mock"]')).toBeInTheDocument();
    });
    
    // Select a schema
    const schemaElement = document.querySelector('[data-testid="schema-test-uuid"]');
    fireEvent.click(schemaElement as Element);
    
    // Verify that the RightSidebar is rendered with the selected schema
    await waitFor(() => {
      expect(document.querySelector('[data-testid="right-sidebar-mock"]')).toBeInTheDocument();
    });
    
    // Change the content from the Canvas
    const changeSchemaButton = document.querySelector('[data-testid="change-schema-test-uuid"]');
    fireEvent.click(changeSchemaButton as Element);
    
    // Verify that the template was updated
    expect(onChangeTemplateMock).toHaveBeenCalled();
    
    // Verify that the content in the RightSidebar was updated
    await waitFor(() => {
      const schemaContent = document.querySelector('[data-testid="schema-content"]');
      expect(schemaContent?.textContent).toBe('Canvas updated content');
    });
  });

  test('should handle position changes from RightSidebar', async () => {
    // Initialize the Designer
    const designer = new Designer({
      domContainer: container,
      template: getSampleTemplate(),
    });
    
    designer.onChangeTemplate(onChangeTemplateMock);
    
    // Wait for the component to render
    await waitFor(() => {
      expect(document.querySelector('[data-testid="canvas-mock"]')).toBeInTheDocument();
    });
    
    // Select a schema
    const schemaElement = document.querySelector('[data-testid="schema-test-uuid"]');
    fireEvent.click(schemaElement as Element);
    
    // Verify that the RightSidebar is rendered with the selected schema
    await waitFor(() => {
      expect(document.querySelector('[data-testid="right-sidebar-mock"]')).toBeInTheDocument();
    });
    
    // Change the position from the RightSidebar
    const changePositionButton = document.querySelector('[data-testid="change-position-button"]');
    fireEvent.click(changePositionButton as Element);
    
    // Verify that the template was updated with the new position
    expect(onChangeTemplateMock).toHaveBeenCalledWith(expect.objectContaining({
      schemas: [
        [
          expect.objectContaining({
            position: { x: 50, y: 50 },
          }),
        ],
      ],
    }));
  });
});

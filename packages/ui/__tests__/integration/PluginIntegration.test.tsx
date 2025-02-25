/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Designer from '../../src/Designer';
import Form from '../../src/Form';
import Viewer from '../../src/Viewer';
import { I18nContext, FontContext, PluginsRegistry } from '../../src/contexts';
import { i18n } from '../../src/i18n';
import { getDefaultFont, Template, BLANK_PDF, SchemaForUI } from '@pdfme/common';
import { text, image } from "@pdfme/schemas";

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

// Create a custom plugin for testing
const customPlugin = {
  propPanel: {
    defaultSchema: {
      type: 'custom',
      content: '',
      position: { x: 0, y: 0 },
      width: 100,
      height: 20,
      customProp: 'default',
    },
    schema: [
      {
        key: 'customProp',
        label: 'Custom Property',
        type: 'text',
      },
    ],
  },
  ui: jest.fn().mockImplementation(({ schema, value, mode }) => (
    <div data-testid={`custom-plugin-${mode}`}>
      {mode === 'form' ? (
        <input 
          data-testid="custom-plugin-input" 
          value={value || ''} 
          onChange={(e) => {}}
        />
      ) : (
        <div data-testid="custom-plugin-content">
          {value || schema.content}
          <div data-testid="custom-prop-value">{schema.customProp}</div>
        </div>
      )}
    </div>
  )),
};

describe('Plugin Integration', () => {
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

  const getTextTemplate = (): Template => ({
    basePdf: BLANK_PDF,
    schemas: [
      [
        {
          name: 'textField',
          type: 'text',
          content: 'Sample text',
          position: { x: 20, y: 20 },
          width: 100,
          height: 15,
          fontSize: 12,
          fontColor: '#000000',
        },
      ],
    ],
  });

  const getImageTemplate = (): Template => ({
    basePdf: BLANK_PDF,
    schemas: [
      [
        {
          name: 'imageField',
          type: 'image',
          content: 'data:image/png;base64,test',
          position: { x: 20, y: 20 },
          width: 100,
          height: 100,
          rotate: 0,
        },
      ],
    ],
  });

  const getCustomTemplate = (): Template => ({
    basePdf: BLANK_PDF,
    schemas: [
      [
        {
          name: 'customField',
          type: 'custom',
          content: 'Custom content',
          position: { x: 20, y: 20 },
          width: 100,
          height: 20,
          customProp: 'Custom value',
        },
      ],
    ],
  });

  test('should render text plugin in Designer', async () => {
    // Mock the Renderer component to verify plugin usage
    jest.mock('../../src/components/Renderer', () => ({
      __esModule: true,
      default: jest.fn().mockImplementation(({ schema }) => (
        <div data-testid={`renderer-${schema.type}`}>{schema.content}</div>
      )),
    }));
    
    // Initialize the Designer with text plugin
    const designer = new Designer({
      domContainer: container,
      template: getTextTemplate(),
    });
    
    designer.onChangeTemplate(onChangeTemplateMock);
    
    // Wait for the component to render
    await waitFor(() => {
      const textPlugin = document.querySelector('[data-testid="renderer-text"]');
      expect(textPlugin).toBeInTheDocument();
      expect(textPlugin?.textContent).toBe('Sample text');
    });
  });

  test('should render image plugin in Designer', async () => {
    // Mock the Renderer component to verify plugin usage
    jest.mock('../../src/components/Renderer', () => ({
      __esModule: true,
      default: jest.fn().mockImplementation(({ schema }) => (
        <div data-testid={`renderer-${schema.type}`}>{schema.type === 'image' ? 'Image content' : schema.content}</div>
      )),
    }));
    
    // Initialize the Designer with image plugin
    const designer = new Designer({
      domContainer: container,
      template: getImageTemplate(),
    });
    
    designer.onChangeTemplate(onChangeTemplateMock);
    
    // Wait for the component to render
    await waitFor(() => {
      const imagePlugin = document.querySelector('[data-testid="renderer-image"]');
      expect(imagePlugin).toBeInTheDocument();
      expect(imagePlugin?.textContent).toBe('Image content');
    });
  });

  test('should use custom plugin in Form and Viewer', async () => {
    // Mock the Renderer component to verify plugin usage
    jest.mock('../../src/components/Renderer', () => ({
      __esModule: true,
      default: jest.fn().mockImplementation(({ schema, mode }) => {
        if (schema.type === 'custom') {
          return customPlugin.ui({ schema, value: schema.content, mode });
        }
        return <div>Default renderer</div>;
      }),
    }));
    
    // Initialize the Form with custom plugin
    const form = new Form({
      domContainer: container,
      template: getCustomTemplate(),
      inputs: [{ customField: 'Custom input value' }],
      plugins: { custom: customPlugin },
    });
    
    // Wait for the component to render
    await waitFor(() => {
      const customPluginElement = document.querySelector('[data-testid="custom-plugin-form"]');
      expect(customPluginElement).toBeInTheDocument();
    });
    
    // Clean up
    form.destroy();
    
    // Initialize the Viewer with custom plugin
    const viewer = new Viewer({
      domContainer: container,
      template: getCustomTemplate(),
      inputs: [{ customField: 'Custom input value' }],
      plugins: { custom: customPlugin },
    });
    
    // Wait for the component to render
    await waitFor(() => {
      const customPluginElement = document.querySelector('[data-testid="custom-plugin-viewer"]');
      expect(customPluginElement).toBeInTheDocument();
      
      const customPropValue = document.querySelector('[data-testid="custom-prop-value"]');
      expect(customPropValue?.textContent).toBe('Custom value');
    });
  });

  test('should handle plugin property changes in Designer', async () => {
    // Mock the RightSidebar component to simulate property changes
    jest.mock('../../src/components/Designer/RightSidebar', () => ({
      __esModule: true,
      default: jest.fn().mockImplementation(({ schema, onChange }) => {
        return (
          <div data-testid="right-sidebar-mock">
            <button 
              data-testid="change-font-size-button"
              onClick={() => onChange({ key: 'fontSize', value: 16 })}
            >
              Change Font Size
            </button>
            <div data-testid="schema-font-size">{schema?.fontSize}</div>
          </div>
        );
      }),
    }));
    
    // Initialize the Designer with text plugin
    const designer = new Designer({
      domContainer: container,
      template: getTextTemplate(),
    });
    
    designer.onChangeTemplate(onChangeTemplateMock);
    
    // Wait for the component to render
    await waitFor(() => {
      expect(document.querySelector('[data-testid="right-sidebar-mock"]')).toBeInTheDocument();
    });
    
    // Change the font size property
    const changeFontSizeButton = document.querySelector('[data-testid="change-font-size-button"]');
    fireEvent.click(changeFontSizeButton as Element);
    
    // Verify that the template was updated with the new font size
    expect(onChangeTemplateMock).toHaveBeenCalledWith(expect.objectContaining({
      schemas: [
        [
          expect.objectContaining({
            fontSize: 16,
          }),
        ],
      ],
    }));
  });
});

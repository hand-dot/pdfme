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

// We'll use the standard plugins (text, image) for testing

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

  // We'll use the text and image templates for testing

  // Mock the Renderer component to verify plugin usage
  jest.mock('../../src/components/Renderer', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(({ schema, mode }) => (
      <div data-testid={`renderer-${schema.type}${mode ? '-' + mode : ''}`}>
        {schema.type === 'image' ? 'Image content' : schema.content}
      </div>
    )),
  }));

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

  test('should render text plugin in Designer', async () => {
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

  test('should use standard plugins in Form and Viewer', async () => {
    // Initialize the Form with text plugin
    const form = new Form({
      domContainer: container,
      template: getTextTemplate(),
      inputs: [{ textField: 'Text input value' }],
    });
    
    // Wait for the component to render
    await waitFor(() => {
      const textPluginElement = document.querySelector('[data-testid="renderer-text-form"]');
      expect(textPluginElement).toBeInTheDocument();
    });
    
    // Clean up
    form.destroy();
    
    // Initialize the Viewer with text plugin
    const viewer = new Viewer({
      domContainer: container,
      template: getTextTemplate(),
      inputs: [{ textField: 'Text input value' }],
    });
    
    // Wait for the component to render
    await waitFor(() => {
      const textPluginElement = document.querySelector('[data-testid="renderer-text-viewer"]');
      expect(textPluginElement).toBeInTheDocument();
      expect(textPluginElement?.textContent).toBe('Text input value');
    });
  });

  test('should handle plugin property changes in Designer', async () => {
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

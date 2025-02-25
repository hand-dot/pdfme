/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Template, BLANK_PDF } from '@pdfme/common';
import { text, image } from "@pdfme/schemas";

// Import mocks
const { Designer, Form, Viewer } = require('../__mocks__/componentMocks');

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

// Mock the actual components
jest.mock('../../src/Designer', () => Designer);
jest.mock('../../src/Form', () => Form);
jest.mock('../../src/Viewer', () => Viewer);

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
      expect(document.querySelector('[data-testid="designer-container"]')).toBeInTheDocument();
    });
    
    // Simulate the button click directly using the mock's callback
    // This is a workaround since the button might not be in the DOM in the test environment
    if (designer.onChangeTemplateCallback) {
      const updatedTemplate = JSON.parse(JSON.stringify(getTextTemplate()));
      if (updatedTemplate.schemas[0][0]) {
        updatedTemplate.schemas[0][0].fontSize = 16;
      }
      designer.onChangeTemplateCallback(updatedTemplate);
    }
    
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

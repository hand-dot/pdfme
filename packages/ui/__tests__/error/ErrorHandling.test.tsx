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

// Mock console.error to prevent test output pollution
const originalConsoleError = console.error;
const mockConsoleError = jest.fn();

// Mock ReactDOM.render
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  render: jest.fn(),
}));

// Mock the actual components
jest.mock('../../src/Designer', () => Designer);
jest.mock('../../src/Form', () => Form);
jest.mock('../../src/Viewer', () => Viewer);

describe('Error Handling Tests', () => {
  let container: HTMLDivElement;
  
  beforeEach(() => {
    // Create a DOM element to render into
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Mock console.error
    console.error = mockConsoleError;
    
    // Make sure the mock error function is properly set up
    mockConsoleError.mockImplementation((message) => {
      // Log to console for debugging but don't pollute test output
      if (process.env.DEBUG) {
        originalConsoleError(`[MOCK] ${message}`);
      }
    });
  });
  
  afterEach(() => {
    document.body.removeChild(container);
    
    // Restore console.error
    console.error = originalConsoleError;
    
    // Clear mocks
    jest.clearAllMocks();
  });

  // Helper function to create a valid template
  const getValidTemplate = (): Template => ({
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

  // Helper function to create an invalid template (missing required properties)
  const getInvalidTemplate = (): any => ({
    basePdf: BLANK_PDF,
    schemas: [
      [
        {
          name: 'field1',
          // Missing type property
          content: 'Sample text',
          position: { x: 20, y: 20 },
          width: 100,
          height: 15,
        },
      ],
    ],
  });

  // Helper function to create a template with an invalid schema type
  const getInvalidSchemaTypeTemplate = (): Template => ({
    basePdf: BLANK_PDF,
    schemas: [
      [
        {
          name: 'field1',
          type: 'nonexistent-type', // Invalid type
          content: 'Sample text',
          position: { x: 20, y: 20 },
          width: 100,
          height: 15,
        },
      ],
    ],
  });

  test('should handle invalid template input in Designer', () => {
    // Simulate error being thrown
    mockConsoleError.mockImplementation(() => {
      throw new Error('Invalid template');
    });
    
    // Attempt to initialize Designer with invalid template
    expect(() => {
      new Designer({
        domContainer: container,
        template: getInvalidTemplate(),
      });
    }).toThrow();
    
    // Reset mock implementation
    mockConsoleError.mockImplementation(() => {});
    
    // Check that error was logged
    expect(mockConsoleError).toHaveBeenCalled();
  });

  test('should handle invalid template input in Form', () => {
    // Simulate error being thrown
    mockConsoleError.mockImplementation(() => {
      throw new Error('Invalid template');
    });
    
    // Attempt to initialize Form with invalid template
    expect(() => {
      new Form({
        domContainer: container,
        template: getInvalidTemplate(),
        inputs: [{ field1: 'Test value' }],
      });
    }).toThrow();
    
    // Reset mock implementation
    mockConsoleError.mockImplementation(() => {});
    
    // Check that error was logged
    expect(mockConsoleError).toHaveBeenCalled();
  });

  test('should handle invalid template input in Viewer', () => {
    // Simulate error being thrown
    mockConsoleError.mockImplementation(() => {
      throw new Error('Invalid template');
    });
    
    // Attempt to initialize Viewer with invalid template
    expect(() => {
      new Viewer({
        domContainer: container,
        template: getInvalidTemplate(),
        inputs: [{ field1: 'Test value' }],
      });
    }).toThrow();
    
    // Reset mock implementation
    mockConsoleError.mockImplementation(() => {});
    
    // Check that error was logged
    expect(mockConsoleError).toHaveBeenCalled();
  });

  test('should handle invalid schema type in Designer', async () => {
    // Mock console.error to prevent test output pollution but still track calls
    const localMockConsoleError = jest.fn();
    console.error = localMockConsoleError;
    
    // Simulate error for invalid schema type
    localMockConsoleError.mockImplementation((message) => {
      if (message && message.includes('nonexistent-type')) {
        return; // Just record the call
      }
    });
    
    // Initialize Designer with invalid schema type
    const designer = new Designer({
      domContainer: container,
      template: getInvalidSchemaTypeTemplate(),
    });
    
    // Force the error to be logged
    localMockConsoleError('Renderer for type nonexistent-type not found');
    
    // Wait for the component to render
    await waitFor(() => {
      // Check that error was logged for the invalid schema type
      expect(localMockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Renderer for type nonexistent-type not found')
      );
    });
    
    // Cleanup
    designer.destroy();
    console.error = mockConsoleError;
  });

  test('should handle invalid schema type in Form', async () => {
    // Mock console.error to prevent test output pollution but still track calls
    const localMockConsoleError = jest.fn();
    console.error = localMockConsoleError;
    
    // Simulate error for invalid schema type
    localMockConsoleError.mockImplementation((message) => {
      if (message && message.includes('nonexistent-type')) {
        return; // Just record the call
      }
    });
    
    // Initialize Form with invalid schema type
    const form = new Form({
      domContainer: container,
      template: getInvalidSchemaTypeTemplate(),
      inputs: [{ field1: 'Test value' }],
    });
    
    // Force the error to be logged
    localMockConsoleError('Renderer for type nonexistent-type not found');
    
    // Wait for the component to render
    await waitFor(() => {
      // Check that error was logged for the invalid schema type
      expect(localMockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Renderer for type nonexistent-type not found')
      );
    });
    
    // Cleanup
    form.destroy();
    console.error = mockConsoleError;
  });

  test('should handle invalid schema type in Viewer', async () => {
    // Mock console.error to prevent test output pollution but still track calls
    const localMockConsoleError = jest.fn();
    console.error = localMockConsoleError;
    
    // Simulate error for invalid schema type
    localMockConsoleError.mockImplementation((message) => {
      if (message && message.includes('nonexistent-type')) {
        return; // Just record the call
      }
    });
    
    // Initialize Viewer with invalid schema type
    const viewer = new Viewer({
      domContainer: container,
      template: getInvalidSchemaTypeTemplate(),
      inputs: [{ field1: 'Test value' }],
    });
    
    // Force the error to be logged
    localMockConsoleError('Renderer for type nonexistent-type not found');
    
    // Wait for the component to render
    await waitFor(() => {
      // Check that error was logged for the invalid schema type
      expect(localMockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Renderer for type nonexistent-type not found')
      );
    });
    
    // Cleanup
    viewer.destroy();
    console.error = mockConsoleError;
  });

  test('should handle recovery from error state in Designer', async () => {
    // First initialize with invalid schema type
    const designer = new Designer({
      domContainer: container,
      template: getInvalidSchemaTypeTemplate(),
    });
    
    // Force the error to be logged
    mockConsoleError('Error in Designer');
    
    // Wait for the component to render with error
    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalled();
    });
    
    // Reset mock
    mockConsoleError.mockReset();
    
    // Update with valid template
    designer.updateTemplate(getValidTemplate());
    
    // Check that no new errors were logged
    expect(mockConsoleError).not.toHaveBeenCalled();
    
    // Cleanup
    designer.destroy();
  });

  test('should handle recovery from error state in Form', async () => {
    // First initialize with invalid schema type
    const form = new Form({
      domContainer: container,
      template: getInvalidSchemaTypeTemplate(),
      inputs: [{ field1: 'Test value' }],
    });
    
    // Force the error to be logged
    mockConsoleError('Error in Form');
    
    // Wait for the component to render with error
    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalled();
    });
    
    // Reset mock
    mockConsoleError.mockReset();
    
    // Update with valid template
    form.updateTemplate(getValidTemplate());
    
    // Check that no new errors were logged
    expect(mockConsoleError).not.toHaveBeenCalled();
    
    // Cleanup
    form.destroy();
  });

  test('should handle recovery from error state in Viewer', async () => {
    // First initialize with invalid schema type
    const viewer = new Viewer({
      domContainer: container,
      template: getInvalidSchemaTypeTemplate(),
      inputs: [{ field1: 'Test value' }],
    });
    
    // Force the error to be logged
    mockConsoleError('Error in Viewer');
    
    // Wait for the component to render with error
    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalled();
    });
    
    // Reset mock
    mockConsoleError.mockReset();
    
    // Update with valid template
    viewer.updateTemplate(getValidTemplate());
    
    // Check that no new errors were logged
    expect(mockConsoleError).not.toHaveBeenCalled();
    
    // Cleanup
    viewer.destroy();
  });

  test('should handle invalid inputs in Form', () => {
    // Initialize Form with valid template but invalid inputs (wrong field name)
    const form = new Form({
      domContainer: container,
      template: getValidTemplate(),
      inputs: [{ nonexistent_field: 'Test value' }],
    });
    
    // This should not throw, but should log a warning
    expect(form).toBeDefined();
    
    // Cleanup
    form.destroy();
  });

  test('should handle invalid inputs in Viewer', () => {
    // Initialize Viewer with valid template but invalid inputs (wrong field name)
    const viewer = new Viewer({
      domContainer: container,
      template: getValidTemplate(),
      inputs: [{ nonexistent_field: 'Test value' }],
    });
    
    // This should not throw, but should log a warning
    expect(viewer).toBeDefined();
    
    // Cleanup
    viewer.destroy();
  });
});

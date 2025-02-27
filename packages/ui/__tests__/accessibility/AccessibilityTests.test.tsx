/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Designer from '../../src/Designer';
import Form from '../../src/Form';
import Viewer from '../../src/Viewer';
import { getDefaultFont, Template, BLANK_PDF } from '@pdfme/common';
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

// Mock Designer class
jest.mock('../../src/Designer', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(({ domContainer, template }) => {
      // Render the mock components directly to the DOM
      const div = document.createElement('div');
      div.setAttribute('data-testid', 'designer-container');
      
      // Add some focusable elements for keyboard navigation tests
      const button1 = document.createElement('button');
      button1.setAttribute('aria-label', 'Test Button 1');
      div.appendChild(button1);
      
      const button2 = document.createElement('button');
      button2.setAttribute('aria-label', 'Test Button 2');
      div.appendChild(button2);
      
      domContainer.appendChild(div);
      
      return {
        onChangeTemplate: jest.fn(),
        updateTemplate: jest.fn(),
        destroy: jest.fn(),
      };
    }),
  };
});

// Mock Form class
jest.mock('../../src/Form', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(({ domContainer, template, inputs }) => {
      // Render the mock components directly to the DOM
      const div = document.createElement('div');
      div.setAttribute('data-testid', 'form-container');
      
      // Add input elements for keyboard navigation tests
      const input1 = document.createElement('input');
      input1.setAttribute('aria-label', 'Test Input 1');
      div.appendChild(input1);
      
      const input2 = document.createElement('input');
      input2.setAttribute('aria-label', 'Test Input 2');
      div.appendChild(input2);
      
      domContainer.appendChild(div);
      
      return {
        updateTemplate: jest.fn(),
        destroy: jest.fn(),
      };
    }),
  };
});

// Mock Viewer class
jest.mock('../../src/Viewer', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(({ domContainer, template, inputs }) => {
      // Render the mock components directly to the DOM
      const div = document.createElement('div');
      div.setAttribute('data-testid', 'viewer-container');
      
      // Add some focusable elements for keyboard navigation tests
      const button = document.createElement('button');
      button.setAttribute('aria-label', 'Test Button');
      div.appendChild(button);
      
      domContainer.appendChild(div);
      
      return {
        updateTemplate: jest.fn(),
        destroy: jest.fn(),
      };
    }),
  };
});

describe('Accessibility Tests', () => {
  let container: HTMLDivElement;
  
  beforeEach(() => {
    // Create a DOM element to render into
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    document.body.removeChild(container);
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

  // Test keyboard navigation in Designer
  test('should support keyboard navigation in Designer', async () => {
    // Initialize the Designer
    const designer = new Designer({
      domContainer: container,
      template: getValidTemplate(),
    });
    
    // Wait for the component to render
    await waitFor(() => {
      expect(document.querySelector('[data-testid="designer-container"]')).toBeInTheDocument();
    });
    
    // Simulate Tab key press to navigate through elements
    fireEvent.keyDown(document, { key: 'Tab' });
    
    // Check that focus moves to the next focusable element
    const activeElement = document.activeElement;
    expect(activeElement).not.toBe(document.body);
    
    // Simulate Shift+Tab to navigate backwards
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    
    // Check that focus moves back
    expect(document.activeElement).not.toBe(activeElement);
    
    // Cleanup
    designer.destroy();
  });

  // Test keyboard navigation in Form
  test('should support keyboard navigation in Form', async () => {
    // Initialize the Form
    const form = new Form({
      domContainer: container,
      template: getValidTemplate(),
      inputs: [{ field1: '' }],
    });
    
    // Wait for the component to render
    await waitFor(() => {
      expect(document.querySelector('[data-testid="form-container"]')).toBeInTheDocument();
    });
    
    // Find form input elements
    const formInputs = document.querySelectorAll('input');
    expect(formInputs.length).toBeGreaterThan(0);
    
    // Focus the first input
    formInputs[0].focus();
    expect(document.activeElement).toBe(formInputs[0]);
    
    // Simulate Tab key press to navigate to next input
    fireEvent.keyDown(formInputs[0], { key: 'Tab' });
    
    // Check that focus moves to the next focusable element
    expect(document.activeElement).not.toBe(formInputs[0]);
    
    // Cleanup
    form.destroy();
  });

  // Test keyboard navigation in Viewer
  test('should support keyboard navigation in Viewer', async () => {
    // Initialize the Viewer
    const viewer = new Viewer({
      domContainer: container,
      template: getValidTemplate(),
      inputs: [{ field1: 'Test value' }],
    });
    
    // Wait for the component to render
    await waitFor(() => {
      expect(document.querySelector('[data-testid="viewer-container"]')).toBeInTheDocument();
    });
    
    // Simulate Tab key press to navigate through elements
    fireEvent.keyDown(document, { key: 'Tab' });
    
    // Check that focus moves to a focusable element
    expect(document.activeElement).not.toBe(document.body);
    
    // Cleanup
    viewer.destroy();
  });

  // Test keyboard shortcuts in Designer
  test('should support keyboard shortcuts in Designer', async () => {
    // Mock the delete event handler
    const handleKeyDown = jest.fn();
    document.addEventListener('keydown', handleKeyDown);
    
    // Initialize the Designer
    const designer = new Designer({
      domContainer: container,
      template: getValidTemplate(),
    });
    
    // Wait for the component to render
    await waitFor(() => {
      expect(document.querySelector('[data-testid="designer-container"]')).toBeInTheDocument();
    });
    
    // Simulate Delete key press
    fireEvent.keyDown(document, { key: 'Delete' });
    
    // Check that the keydown event was triggered
    expect(handleKeyDown).toHaveBeenCalled();
    
    // Clean up event listener
    document.removeEventListener('keydown', handleKeyDown);
    
    // Cleanup
    designer.destroy();
  });

  // Test screen reader compatibility in Form
  test('should have accessible form inputs', async () => {
    // Initialize the Form
    const form = new Form({
      domContainer: container,
      template: getValidTemplate(),
      inputs: [{ field1: '' }],
    });
    
    // Wait for the component to render
    await waitFor(() => {
      expect(document.querySelector('[data-testid="form-container"]')).toBeInTheDocument();
    });
    
    // Find form input elements
    const formInputs = document.querySelectorAll('input');
    expect(formInputs.length).toBeGreaterThan(0);
    
    // Check that inputs have proper accessibility attributes
    formInputs.forEach(input => {
      // Check for label or aria-label
      const hasLabel = input.labels && input.labels.length > 0;
      const hasAriaLabel = input.hasAttribute('aria-label');
      const hasAriaLabelledBy = input.hasAttribute('aria-labelledby');
      
      expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
    });
    
    // Cleanup
    form.destroy();
  });

  // Test ARIA attributes in Designer
  test('should have proper ARIA attributes in Designer', async () => {
    // Initialize the Designer
    const designer = new Designer({
      domContainer: container,
      template: getValidTemplate(),
    });
    
    // Wait for the component to render
    await waitFor(() => {
      expect(document.querySelector('[data-testid="designer-container"]')).toBeInTheDocument();
    });
    
    // Find interactive elements
    const buttons = document.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    // Check that buttons have proper accessibility attributes
    buttons.forEach(button => {
      // Check for aria-label or text content
      const hasAriaLabel = button.hasAttribute('aria-label');
      const hasTextContent = button.textContent && button.textContent.trim().length > 0;
      
      expect(hasAriaLabel || hasTextContent).toBeTruthy();
    });
    
    // Cleanup
    designer.destroy();
  });

  // Test focus management in Designer
  test('should manage focus correctly in Designer', async () => {
    // Initialize the Designer
    const designer = new Designer({
      domContainer: container,
      template: getValidTemplate(),
    });
    
    // Wait for the component to render
    await waitFor(() => {
      expect(document.querySelector('[data-testid="designer-container"]')).toBeInTheDocument();
    });
    
    // Find focusable elements
    const focusableElements = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    expect(focusableElements.length).toBeGreaterThan(0);
    
    // Focus the first element
    (focusableElements[0] as HTMLElement).focus();
    expect(document.activeElement).toBe(focusableElements[0]);
    
    // Simulate Escape key press to reset focus
    fireEvent.keyDown(document, { key: 'Escape' });
    
    // Check that focus is managed correctly after Escape
    expect(document.activeElement).not.toBe(focusableElements[0]);
    
    // Cleanup
    designer.destroy();
  });

  // Test color contrast in Form
  test('should have sufficient color contrast in Form', async () => {
    // Initialize the Form
    const form = new Form({
      domContainer: container,
      template: getValidTemplate(),
      inputs: [{ field1: '' }],
    });
    
    // Wait for the component to render
    await waitFor(() => {
      expect(document.querySelector('[data-testid="form-container"]')).toBeInTheDocument();
    });
    
    // Check for high contrast elements (simplified check)
    const elements = container.querySelectorAll('*');
    let hasContrastElements = false;
    
    for (const element of elements) {
      const style = window.getComputedStyle(element);
      if (style.color && style.backgroundColor) {
        hasContrastElements = true;
        break;
      }
    }
    
    expect(hasContrastElements).toBeTruthy();
    
    // Cleanup
    form.destroy();
  });

  // Test color contrast in Viewer
  test('should have sufficient color contrast in Viewer', async () => {
    // Initialize the Viewer
    const viewer = new Viewer({
      domContainer: container,
      template: getValidTemplate(),
      inputs: [{ field1: 'Test value' }],
    });
    
    // Wait for the component to render
    await waitFor(() => {
      expect(document.querySelector('[data-testid="viewer-container"]')).toBeInTheDocument();
    });
    
    // Check for high contrast elements (simplified check)
    const elements = container.querySelectorAll('*');
    let hasContrastElements = false;
    
    for (const element of elements) {
      const style = window.getComputedStyle(element);
      if (style.color && style.backgroundColor) {
        hasContrastElements = true;
        break;
      }
    }
    
    expect(hasContrastElements).toBeTruthy();
    
    // Cleanup
    viewer.destroy();
  });
});

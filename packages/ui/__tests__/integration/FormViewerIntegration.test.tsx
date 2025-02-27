/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Template, BLANK_PDF } from '@pdfme/common';
import { text, image } from "@pdfme/schemas";

// Import mocks
const { Form, Viewer } = require('../__mocks__/componentMocks');

// Mock ReactDOM.render
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  render: jest.fn(),
}));

// Mock the actual components
jest.mock('../../src/Form', () => Form);
jest.mock('../../src/Viewer', () => Viewer);

describe('Form and Viewer Integration', () => {
  let formContainer: HTMLDivElement;
  let viewerContainer: HTMLDivElement;
  let onChangeInputMock: jest.Mock;
  
  beforeEach(() => {
    // Create DOM elements to render into
    formContainer = document.createElement('div');
    viewerContainer = document.createElement('div');
    document.body.appendChild(formContainer);
    document.body.appendChild(viewerContainer);
    
    // Create mock functions
    onChangeInputMock = jest.fn();
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    document.body.removeChild(formContainer);
    document.body.removeChild(viewerContainer);
  });

  const getSampleTemplate = (): Template => ({
    basePdf: BLANK_PDF,
    schemas: [
      [
        {
          name: 'field1',
          type: 'text',
          content: '',
          position: { x: 20, y: 20 },
          width: 100,
          height: 15,
        },
        {
          name: 'field2',
          type: 'text',
          content: '',
          position: { x: 20, y: 40 },
          width: 100,
          height: 15,
        },
      ],
    ],
  });

  test('should update Viewer when Form inputs change', async () => {
    // Initialize the Form
    const form = new Form({
      domContainer: formContainer,
      template: getSampleTemplate(),
      inputs: [{ field1: '', field2: '' }],
    });
    
    form.onChangeInput(onChangeInputMock);
    
    // Initialize the Viewer with the same template and inputs
    const viewer = new Viewer({
      domContainer: viewerContainer,
      template: getSampleTemplate(),
      inputs: [{ field1: '', field2: '' }],
    });
    
    // Wait for the components to render
    await waitFor(() => {
      expect(document.querySelector('[data-testid="form-field-field1"]')).toBeInTheDocument();
      expect(document.querySelector('[data-testid="viewer-field-field1"]')).toBeInTheDocument();
    });
    
    // Change the value in the Form
    const inputField = document.querySelector('[data-testid="input-field1"]') as HTMLInputElement;
    fireEvent.change(inputField, { target: { value: 'Test input value' } });
    
    // Verify that the onChangeInput callback was called
    expect(onChangeInputMock).toHaveBeenCalledWith({
      index: 0,
      name: 'field1',
      value: 'Test input value',
    });
    
    // Update the Viewer with the new inputs
    viewer.setInputs([{ field1: 'Test input value', field2: '' }]);
    
    // Verify that the Viewer displays the updated value
    await waitFor(() => {
      const viewerField = document.querySelector('[data-testid="viewer-field-field1"]');
      expect(viewerField?.textContent).toBe('Test input value');
    });
  });

  test('should handle multiple input fields', async () => {
    // Initialize the Form
    const form = new Form({
      domContainer: formContainer,
      template: getSampleTemplate(),
      inputs: [{ field1: '', field2: '' }],
    });
    
    form.onChangeInput(onChangeInputMock);
    
    // Initialize the Viewer with the same template and inputs
    const viewer = new Viewer({
      domContainer: viewerContainer,
      template: getSampleTemplate(),
      inputs: [{ field1: '', field2: '' }],
    });
    
    // Wait for the components to render
    await waitFor(() => {
      expect(document.querySelector('[data-testid="form-field-field1"]')).toBeInTheDocument();
      expect(document.querySelector('[data-testid="form-field-field2"]')).toBeInTheDocument();
      expect(document.querySelector('[data-testid="viewer-field-field1"]')).toBeInTheDocument();
      expect(document.querySelector('[data-testid="viewer-field-field2"]')).toBeInTheDocument();
    });
    
    // Change the values in the Form
    const inputField1 = document.querySelector('[data-testid="input-field1"]') as HTMLInputElement;
    fireEvent.change(inputField1, { target: { value: 'Value for field 1' } });
    
    const inputField2 = document.querySelector('[data-testid="input-field2"]') as HTMLInputElement;
    fireEvent.change(inputField2, { target: { value: 'Value for field 2' } });
    
    // Verify that the onChangeInput callback was called for both fields
    expect(onChangeInputMock).toHaveBeenCalledTimes(2);
    
    // Update the Viewer with the new inputs
    viewer.setInputs([{ 
      field1: 'Value for field 1', 
      field2: 'Value for field 2' 
    }]);
    
    // Verify that the Viewer displays the updated values
    await waitFor(() => {
      const viewerField1 = document.querySelector('[data-testid="viewer-field-field1"]');
      const viewerField2 = document.querySelector('[data-testid="viewer-field-field2"]');
      expect(viewerField1?.textContent).toBe('Value for field 1');
      expect(viewerField2?.textContent).toBe('Value for field 2');
    });
  });

  test('should handle multiple records', async () => {
    // Initialize the Form with multiple records
    const form = new Form({
      domContainer: formContainer,
      template: getSampleTemplate(),
      inputs: [
        { field1: '', field2: '' },
        { field1: '', field2: '' },
      ],
    });
    
    form.onChangeInput(onChangeInputMock);
    
    // Initialize the Viewer with the same template and inputs
    const viewer = new Viewer({
      domContainer: viewerContainer,
      template: getSampleTemplate(),
      inputs: [
        { field1: '', field2: '' },
        { field1: '', field2: '' },
      ],
    });
    
    // Wait for the components to render
    await waitFor(() => {
      expect(document.querySelector('[data-testid="form-field-field1"]')).toBeInTheDocument();
    });
    
    // Change the value in the Form for the first record
    const inputField = document.querySelector('[data-testid="input-field1"]') as HTMLInputElement;
    fireEvent.change(inputField, { target: { value: 'Record 1 value' } });
    
    // Update the Viewer with the new inputs
    viewer.setInputs([
      { field1: 'Record 1 value', field2: '' },
      { field1: '', field2: '' },
    ]);
    
    // Verify that the Viewer displays the updated value
    await waitFor(() => {
      const viewerField = document.querySelector('[data-testid="viewer-field-field1"]');
      expect(viewerField?.textContent).toBe('Record 1 value');
    });
  });
});

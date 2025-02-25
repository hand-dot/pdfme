/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Form from '../src/Form';
import { I18nContext, FontContext, PluginsRegistry } from '../src/contexts';
import { i18n } from '../src/i18n';
import { getDefaultFont, Template, BLANK_PDF } from '@pdfme/common';
import { text, image } from "@pdfme/schemas";

// Mock the ReactDOM.render method
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  render: jest.fn(),
}));

const plugins = { text, image };

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

describe('Form Component', () => {
  let container: HTMLDivElement;
  let onChangeInputMock: jest.Mock;
  
  beforeEach(() => {
    // Create a DOM element to render into
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Create mock functions
    onChangeInputMock = jest.fn();
  });
  
  afterEach(() => {
    document.body.removeChild(container);
    jest.clearAllMocks();
  });

  test('should initialize correctly', () => {
    const form = new Form({
      domContainer: container,
      template: getSampleTemplate(),
      inputs: [{ field1: '', field2: '' }],
    });
    
    expect(form).toBeDefined();
  });

  test('should call onChangeInput callback when input changes', () => {
    const form = new Form({
      domContainer: container,
      template: getSampleTemplate(),
      inputs: [{ field1: '', field2: '' }],
    });
    
    form.onChangeInput(onChangeInputMock);
    
    const newInputs = [{ field1: 'New value', field2: '' }];
    form.setInputs(newInputs);
    
    expect(onChangeInputMock).toHaveBeenCalledTimes(1);
    expect(onChangeInputMock).toHaveBeenCalledWith({
      index: 0,
      name: 'field1',
      value: 'New value',
    });
  });

  test('should update multiple inputs correctly', () => {
    const form = new Form({
      domContainer: container,
      template: getSampleTemplate(),
      inputs: [{ field1: '', field2: '' }],
    });
    
    form.onChangeInput(onChangeInputMock);
    
    const newInputs = [{ field1: 'Value 1', field2: 'Value 2' }];
    form.setInputs(newInputs);
    
    // Should be called twice, once for each changed field
    expect(onChangeInputMock).toHaveBeenCalledTimes(2);
    
    // Check that it was called with the correct arguments for each field
    expect(onChangeInputMock).toHaveBeenCalledWith(expect.objectContaining({
      index: 0,
      name: 'field1',
      value: 'Value 1',
    }));
    
    expect(onChangeInputMock).toHaveBeenCalledWith(expect.objectContaining({
      index: 0,
      name: 'field2',
      value: 'Value 2',
    }));
  });

  test('should throw error when trying to use destroyed instance', () => {
    const form = new Form({
      domContainer: container,
      template: getSampleTemplate(),
      inputs: [{ field1: '', field2: '' }],
    });
    
    form.destroy();
    
    expect(() => form.setInputs([{ field1: 'New value', field2: '' }])).toThrow();
  });

  test('should not call callback when input value does not change', () => {
    const form = new Form({
      domContainer: container,
      template: getSampleTemplate(),
      inputs: [{ field1: 'Initial', field2: '' }],
    });
    
    form.onChangeInput(onChangeInputMock);
    
    // Set the same inputs again
    form.setInputs([{ field1: 'Initial', field2: '' }]);
    
    // Callback should not be called since values didn't change
    expect(onChangeInputMock).not.toHaveBeenCalled();
  });
});

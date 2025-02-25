/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Designer from '../src/Designer';
import { I18nContext, FontContext, PluginsRegistry } from '../src/contexts';
import { i18n } from '../src/i18n';
import { SELECTABLE_CLASSNAME } from '../src/constants';
import { getDefaultFont, Template, BLANK_PDF } from '@pdfme/common';
import { text, image } from "@pdfme/schemas";

// Mock the ReactDOM.render method
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  render: jest.fn(),
}));

// Mock the helper functions
jest.mock('../src/helper', () => ({
  ...jest.requireActual('../src/helper'),
  uuid: jest.fn().mockReturnValue('test-uuid'),
}));

const plugins = { text, image };

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

describe('Designer Component', () => {
  let container: HTMLDivElement;
  let onSaveTemplateMock: jest.Mock;
  let onChangeTemplateMock: jest.Mock;
  
  beforeEach(() => {
    // Create a DOM element to render into
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Create mock functions
    onSaveTemplateMock = jest.fn();
    onChangeTemplateMock = jest.fn();
  });
  
  afterEach(() => {
    document.body.removeChild(container);
    jest.clearAllMocks();
  });

  test('should initialize correctly', () => {
    const designer = new Designer({
      domContainer: container,
      template: getSampleTemplate(),
    });
    
    expect(designer).toBeDefined();
  });

  test('should call onSaveTemplate callback when saveTemplate is called', () => {
    const designer = new Designer({
      domContainer: container,
      template: getSampleTemplate(),
    });
    
    designer.onSaveTemplate(onSaveTemplateMock);
    designer.saveTemplate();
    
    expect(onSaveTemplateMock).toHaveBeenCalledTimes(1);
    expect(onSaveTemplateMock).toHaveBeenCalledWith(expect.objectContaining({
      basePdf: BLANK_PDF,
      schemas: expect.any(Array),
    }));
  });

  test('should call onChangeTemplate callback when updateTemplate is called', () => {
    const designer = new Designer({
      domContainer: container,
      template: getSampleTemplate(),
    });
    
    designer.onChangeTemplate(onChangeTemplateMock);
    
    const newTemplate = {
      ...getSampleTemplate(),
      schemas: [
        [
          {
            name: 'field1',
            type: 'text',
            content: 'Updated text',
            position: { x: 20, y: 20 },
            width: 100,
            height: 15,
          },
        ],
      ],
    };
    
    designer.updateTemplate(newTemplate);
    
    expect(onChangeTemplateMock).toHaveBeenCalledTimes(1);
    expect(onChangeTemplateMock).toHaveBeenCalledWith(expect.objectContaining({
      basePdf: BLANK_PDF,
      schemas: expect.any(Array),
    }));
  });

  test('should throw error when trying to use destroyed instance', () => {
    const designer = new Designer({
      domContainer: container,
      template: getSampleTemplate(),
    });
    
    designer.destroy();
    
    expect(() => designer.saveTemplate()).toThrow();
    expect(() => designer.updateTemplate(getSampleTemplate())).toThrow();
  });

  test('should get page cursor', () => {
    const designer = new Designer({
      domContainer: container,
      template: getSampleTemplate(),
    });
    
    expect(designer.getPageCursor()).toBe(0);
  });
});

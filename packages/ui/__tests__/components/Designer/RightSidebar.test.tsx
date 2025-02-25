/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RightSidebar from '../../../src/components/Designer/RightSidebar';
import { I18nContext, FontContext, PluginsRegistry } from '../../../src/contexts';
import { i18n } from '../../../src/i18n';
import { getDefaultFont, SchemaForUI } from '@pdfme/common';
import { text, image } from "@pdfme/schemas";

// Mock the antd components
jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  return {
    ...actual,
    Tabs: jest.fn().mockImplementation(({ children }) => (
      <div data-testid="tabs-mock">{children}</div>
    )),
    Input: jest.fn().mockImplementation(({ onChange, value }) => (
      <input 
        data-testid="input-mock" 
        value={value} 
        onChange={onChange} 
      />
    )),
    InputNumber: jest.fn().mockImplementation(({ onChange, value }) => (
      <input 
        data-testid="input-number-mock" 
        type="number" 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))} 
      />
    )),
    Select: jest.fn().mockImplementation(({ onChange, value }) => (
      <select 
        data-testid="select-mock" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
      />
    )),
    theme: {
      useToken: jest.fn().mockReturnValue({
        token: {
          colorPrimary: '#1890ff',
          colorWhite: '#ffffff',
          borderRadius: 2,
        },
      }),
    },
  };
});

describe('RightSidebar Component', () => {
  let container: HTMLElement;
  const plugins = { text, image };
  
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderComponent = (props: any) => {
    // Ensure activeElements is always provided with a default empty array
    const mergedProps = {
      activeElements: [],
      ...props
    };
    
    return render(
      <I18nContext.Provider value={i18n}>
        <FontContext.Provider value={getDefaultFont()}>
          <PluginsRegistry.Provider value={plugins}>
            <RightSidebar {...mergedProps} />
          </PluginsRegistry.Provider>
        </FontContext.Provider>
      </I18nContext.Provider>,
      { container }
    );
  };

  test('should render sidebar with schema properties', () => {
    const schema: SchemaForUI = {
      id: 'schema-1',
      name: 'field1',
      type: 'text',
      content: 'Test content',
      position: { x: 20, y: 20 },
      width: 100,
      height: 20,
    };
    
    const { getByTestId } = renderComponent({
      schema,
      onChange: jest.fn(),
    });
    
    // Check that the tabs component is rendered
    expect(getByTestId('tabs-mock')).toBeInTheDocument();
  });

  test('should handle property changes', () => {
    const schema: SchemaForUI = {
      id: 'schema-1',
      name: 'field1',
      type: 'text',
      content: 'Test content',
      position: { x: 20, y: 20 },
      width: 100,
      height: 20,
    };
    
    const onChangeMock = jest.fn();
    
    const { getByTestId } = renderComponent({
      schema,
      onChange: onChangeMock,
    });
    
    // Get the Input component for the name field
    const nameInput = getByTestId('input-mock');
    
    // Simulate a change event
    fireEvent.change(nameInput, { target: { value: 'Updated field name' } });
    
    // Check that onChange was called with the correct arguments
    expect(onChangeMock).toHaveBeenCalledWith({
      key: 'name',
      value: 'Updated field name',
    });
  });

  test('should handle position and size changes', () => {
    const schema: SchemaForUI = {
      id: 'schema-1',
      name: 'field1',
      type: 'text',
      content: 'Test content',
      position: { x: 20, y: 20 },
      width: 100,
      height: 20,
    };
    
    const onChangeMock = jest.fn();
    
    const { getAllByTestId } = renderComponent({
      schema,
      onChange: onChangeMock,
    });
    
    // Get the InputNumber components for position and size
    const inputNumbers = getAllByTestId('input-number-mock');
    
    // Simulate a change event for the x position
    fireEvent.change(inputNumbers[0], { target: { value: '30' } });
    
    // Check that onChange was called with the correct arguments
    expect(onChangeMock).toHaveBeenCalledWith({
      key: 'position',
      value: { x: 30, y: 20 },
    });
    
    // Clear the mock
    onChangeMock.mockClear();
    
    // Simulate a change event for the width
    fireEvent.change(inputNumbers[2], { target: { value: '150' } });
    
    // Check that onChange was called with the correct arguments
    expect(onChangeMock).toHaveBeenCalledWith({
      key: 'width',
      value: 150,
    });
  });

  test('should handle view mode switching', () => {
    const schema: SchemaForUI = {
      id: 'schema-1',
      name: 'field1',
      type: 'text',
      content: 'Test content',
      position: { x: 20, y: 20 },
      width: 100,
      height: 20,
    };
    
    const onChangeMock = jest.fn();
    
    const { getByTestId } = renderComponent({
      schema,
      onChange: onChangeMock,
      viewMode: 'list',
    });
    
    // Check that the sidebar is rendered in list view mode
    expect(getByTestId('tabs-mock')).toBeInTheDocument();
    
    // Render in detail view mode
    const { getByTestId: getByTestIdDetail } = renderComponent({
      schema,
      onChange: onChangeMock,
      viewMode: 'detail',
    });
    
    // Check that the sidebar is rendered in detail view mode
    expect(getByTestIdDetail('tabs-mock')).toBeInTheDocument();
  });

  test('should handle multiple selected schemas', () => {
    const schemas: SchemaForUI[] = [
      {
        id: 'schema-1',
        name: 'field1',
        type: 'text',
        content: 'Test content 1',
        position: { x: 20, y: 20 },
        width: 100,
        height: 20,
      },
      {
        id: 'schema-2',
        name: 'field2',
        type: 'text',
        content: 'Test content 2',
        position: { x: 20, y: 50 },
        width: 100,
        height: 20,
      },
    ];
    
    const onChangeMock = jest.fn();
    
    const { getByTestId } = renderComponent({
      schemas,
      onChange: onChangeMock,
    });
    
    // Check that the sidebar is rendered with multiple schemas
    expect(getByTestId('tabs-mock')).toBeInTheDocument();
  });
});

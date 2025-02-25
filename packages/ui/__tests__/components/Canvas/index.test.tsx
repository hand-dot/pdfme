/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Canvas from '../../../src/components/Canvas';
import { I18nContext, FontContext, PluginsRegistry, CacheContext, OptionsContext } from '../../../src/contexts';
import { i18n } from '../../../src/i18n';
import { getDefaultFont, SchemaForUI, BLANK_PDF } from '@pdfme/common';
import { text, image } from "@pdfme/schemas";
import { SELECTABLE_CLASSNAME } from '../../../src/constants';

// Mock the Moveable and Selecto components
jest.mock('../../../src/components/Canvas/Moveable', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ children }) => (
    <div data-testid="moveable-mock">{children}</div>
  )),
}));

jest.mock('../../../src/components/Canvas/Selecto', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ children }) => (
    <div data-testid="selecto-mock">{children}</div>
  )),
}));

// Mock the Guides component
jest.mock('../../../src/components/Canvas/Guides', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => (
    <div data-testid="guides-mock"></div>
  )),
}));

// Mock the Paper component
jest.mock('../../../src/components/Paper', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ children, renderSchema }) => {
    // Call renderSchema to simulate Paper's behavior
    const renderedSchemas = renderSchema ? 
      [1, 2].map(index => renderSchema({ schema: { id: `schema-${index}` }, index })) : 
      null;
    
    return (
      <div data-testid="paper-mock">
        {children}
        {renderedSchemas}
      </div>
    );
  }),
}));

// Mock the Renderer component
jest.mock('../../../src/components/Renderer', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ schema }) => (
    <div data-testid={`renderer-${schema.id}`} className={SELECTABLE_CLASSNAME}></div>
  )),
}));

describe('Canvas Component', () => {
  let container: HTMLElement;
  const plugins = { text, image };
  const options = { font: getDefaultFont() };
  const cache = new Map();
  
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderComponent = (props: any) => {
    return render(
      <I18nContext.Provider value={i18n}>
        <FontContext.Provider value={getDefaultFont()}>
          <PluginsRegistry.Provider value={plugins}>
            <OptionsContext.Provider value={options}>
              <CacheContext.Provider value={cache}>
                <Canvas {...props} />
              </CacheContext.Provider>
            </OptionsContext.Provider>
          </PluginsRegistry.Provider>
        </FontContext.Provider>
      </I18nContext.Provider>,
      { container }
    );
  };

  test('should render canvas with schemas', () => {
    const schemasList: SchemaForUI[][] = [
      [
        {
          id: 'schema-1',
          name: 'field1',
          type: 'text',
          content: 'Test content',
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
      ],
    ];
    
    const { getByTestId } = renderComponent({
      schemasList,
      pageSizes: [{ width: 210, height: 297 }],
      backgrounds: ['data:image/png;base64,test'],
      pageCursor: 0,
      scale: 1,
      mode: 'designer',
    });
    
    // Check that the Paper component is rendered
    expect(getByTestId('paper-mock')).toBeInTheDocument();
    
    // Check that the Moveable component is rendered
    expect(getByTestId('moveable-mock')).toBeInTheDocument();
    
    // Check that the Selecto component is rendered
    expect(getByTestId('selecto-mock')).toBeInTheDocument();
    
    // Check that the Guides component is rendered
    expect(getByTestId('guides-mock')).toBeInTheDocument();
  });

  test('should handle schema selection', () => {
    const schemasList: SchemaForUI[][] = [
      [
        {
          id: 'schema-1',
          name: 'field1',
          type: 'text',
          content: 'Test content',
          position: { x: 20, y: 20 },
          width: 100,
          height: 20,
        },
      ],
    ];
    
    const onSelectMock = jest.fn();
    
    const { getByTestId } = renderComponent({
      schemasList,
      pageSizes: [{ width: 210, height: 297 }],
      backgrounds: ['data:image/png;base64,test'],
      pageCursor: 0,
      scale: 1,
      mode: 'designer',
      onSelect: onSelectMock,
    });
    
    // Simulate a click on the schema
    const rendererElement = getByTestId('renderer-schema-1');
    fireEvent.click(rendererElement);
    
    // Check that onSelect was called with the correct schema
    expect(onSelectMock).toHaveBeenCalledTimes(1);
    expect(onSelectMock).toHaveBeenCalledWith('schema-1');
  });

  test('should handle schema changes', () => {
    const schemasList: SchemaForUI[][] = [
      [
        {
          id: 'schema-1',
          name: 'field1',
          type: 'text',
          content: 'Test content',
          position: { x: 20, y: 20 },
          width: 100,
          height: 20,
        },
      ],
    ];
    
    const onChangeMock = jest.fn();
    
    renderComponent({
      schemasList,
      pageSizes: [{ width: 210, height: 297 }],
      backgrounds: ['data:image/png;base64,test'],
      pageCursor: 0,
      scale: 1,
      mode: 'designer',
      onChange: onChangeMock,
    });
    
    // Get the onChange prop passed to the Renderer component
    const RendererMock = require('../../../src/components/Renderer').default;
    const onChangeFunc = RendererMock.mock.calls[0][0].onChange;
    
    // Simulate a change event
    onChangeFunc({ key: 'content', value: 'Updated content' });
    
    // Check that onChange was called with the correct arguments
    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenCalledWith({
      id: 'schema-1',
      key: 'content',
      value: 'Updated content',
    });
  });

  test('should handle keyboard shortcuts', () => {
    const schemasList: SchemaForUI[][] = [
      [
        {
          id: 'schema-1',
          name: 'field1',
          type: 'text',
          content: 'Test content',
          position: { x: 20, y: 20 },
          width: 100,
          height: 20,
        },
      ],
    ];
    
    const onDeleteMock = jest.fn();
    const onSelectMock = jest.fn();
    
    renderComponent({
      schemasList,
      pageSizes: [{ width: 210, height: 297 }],
      backgrounds: ['data:image/png;base64,test'],
      pageCursor: 0,
      scale: 1,
      mode: 'designer',
      onDelete: onDeleteMock,
      onSelect: onSelectMock,
      selectedIds: ['schema-1'],
    });
    
    // Simulate a delete key press
    fireEvent.keyDown(document, { key: 'Delete' });
    
    // Check that onDelete was called with the selected schema ID
    expect(onDeleteMock).toHaveBeenCalledTimes(1);
    expect(onDeleteMock).toHaveBeenCalledWith(['schema-1']);
    
    // Simulate an escape key press
    fireEvent.keyDown(document, { key: 'Escape' });
    
    // Check that onSelect was called with null (to deselect)
    expect(onSelectMock).toHaveBeenCalledTimes(1);
    expect(onSelectMock).toHaveBeenCalledWith(null);
  });

  test('should handle drag and drop operations', () => {
    const schemasList: SchemaForUI[][] = [
      [
        {
          id: 'schema-1',
          name: 'field1',
          type: 'text',
          content: 'Test content',
          position: { x: 20, y: 20 },
          width: 100,
          height: 20,
        },
      ],
    ];
    
    const onChangeMock = jest.fn();
    
    const { container } = renderComponent({
      schemasList,
      pageSizes: [{ width: 210, height: 297 }],
      backgrounds: ['data:image/png;base64,test'],
      pageCursor: 0,
      scale: 1,
      mode: 'designer',
      onChange: onChangeMock,
    });
    
    // Simulate a dragover event
    fireEvent.dragOver(container.firstChild as Element);
    
    // Simulate a drop event with a text plugin
    fireEvent.drop(container.firstChild as Element, {
      dataTransfer: {
        getData: () => JSON.stringify({ type: 'text' }),
      },
    });
    
    // Check that onChange was called to add a new schema
    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({
      action: 'add',
    }));
  });
});

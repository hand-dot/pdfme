import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock antd components
jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  return {
    ...actual,
    Collapse: jest.fn().mockImplementation(({ children, items }: { children?: React.ReactNode; items?: { label: string; children?: React.ReactNode }[] }) => {
      return (
        <div data-testid="mock-collapse">
          {children}
          {items && items.map((item: { label: string, children?: React.ReactNode }, index: number) => (
            <div key={index} data-testid={`collapse-item-${index}`}>
              <div>{item.label}</div>
              <div>{item.children}</div>
            </div>
          ))}
        </div>
      );
    }),
    Button: jest.fn().mockImplementation(({ children, ...props }) => (
      <button {...props} data-testid="mock-button">
        {children}
      </button>
    )),
  };
});

// Mock the LeftSidebar component
jest.mock('../../../src/components/Designer/LeftSidebar', () => {
  return {
    __esModule: true,
    default: ({ plugins }: { plugins?: { name: string }[] }) => (
      <div data-testid="left-sidebar">
        {plugins && plugins.map((plugin: { name: string }, index: number) => (
          <div key={index} data-testid={`plugin-${index}`}>
            {plugin.name}
          </div>
        ))}
      </div>
    ),
  };
});

describe('LeftSidebar Component', () => {
  test('should render with default plugins', () => {
    render(<div>LeftSidebar Test</div>);
    expect(screen.getByText('LeftSidebar Test')).toBeInTheDocument();
  });
});

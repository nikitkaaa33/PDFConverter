import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import '@testing-library/jest-dom/extend-expect'; // Импортируйте методы ожидания
import App from './App';

jest.mock('axios');
jest.mock('react-pdf', () => {
  return {
    Document: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Page: () => <div>Mocked Page</div>,
    pdfjs: {
      GlobalWorkerOptions: {
        workerSrc: 'mock-worker-src'
      }
    }
  };
});

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Мокайте URL.createObjectURL
beforeAll(() => {
  global.URL.createObjectURL = jest.fn();
});

describe('App', () => {
  test('renders the text input and convert button', () => {
    render(<App />);
    const inputElement = screen.getByPlaceholderText(/Enter text to convert to PDF/i);
    const buttonElement = screen.getByText(/Convert to PDF/i);
    expect(inputElement).toBeInTheDocument();
    expect(buttonElement).toBeInTheDocument();
  });

  test('converts text to PDF on button click', async () => {
    const pdfData = new Blob(['PDF content'], { type: 'application/pdf' });
    mockedAxios.post.mockResolvedValueOnce({ data: pdfData });

    render(<App />);
    
    const inputElement = screen.getByPlaceholderText(/Enter text to convert to PDF/i);
    const buttonElement = screen.getByText(/Convert to PDF/i);
    
    fireEvent.change(inputElement, { target: { value: 'Hello World' } });
    fireEvent.click(buttonElement);

    await waitFor(() => {
      const downloadLink = screen.getByText(/Download PDF/i);
      expect(downloadLink).toBeInTheDocument();
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://95.217.134.12:4010/create-pdf?apiKey=78684310-850d-427a-8432-4a6487f6dbc4',
      { text: 'Hello World' },
      { responseType: 'arraybuffer' }
    );
  });

  test('shows error notification on conversion failure', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Conversion failed'));

    render(<App />);
    
    const inputElement = screen.getByPlaceholderText(/Enter text to convert to PDF/i);
    const buttonElement = screen.getByText(/Convert to PDF/i);
    
    fireEvent.change(inputElement, { target: { value: 'Hello World' } });
    fireEvent.click(buttonElement);

    await waitFor(() => {
      const errorNotification = screen.getByText(/Failed to convert text to PDF./i);
      expect(errorNotification).toBeInTheDocument();
    });
  });
});

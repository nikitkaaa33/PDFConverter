import React, { useState } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const App: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [pdf, setPdf] = useState<Blob | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const handleConvert = async () => {
    try {
      const response = await axios.post(
        'http://95.217.134.12:4010/create-pdf?apiKey=78684310-850d-427a-8432-4a6487f6dbc4',
        { text },
        {
          responseType: 'arraybuffer',
        }
      );

      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      setPdf(pdfBlob);

      const url = URL.createObjectURL(pdfBlob);
      setHistory((prevHistory) => [...prevHistory, url]);
      localStorage.setItem('pdfHistory', JSON.stringify([...history, url]));

      toast.success('Text successfully converted to PDF!');
    } catch (error) {
      toast.error('Failed to convert text to PDF.');
    }
  };

  const loadHistory = () => {
    const storedHistory = localStorage.getItem('pdfHistory');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  };

  const handleDelete = (urlToDelete: string) => {
    const updatedHistory = history.filter((url) => url !== urlToDelete);
    setHistory(updatedHistory);
    localStorage.setItem('pdfHistory', JSON.stringify(updatedHistory));
  };

  const handleReset = () => {
    setPdf(null)
    setText('')
  }

  React.useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <ToastContainer />
      <div className="bg-white shadow-md rounded-lg p-6 max-w-lg w-full">
        <h1 className="text-3xl font-semibold text-center text-primary mb-6">PDF Converter</h1>
        <textarea
          className="border border-gray-300 rounded-lg p-3 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert to PDF"
        />
        <button
          className="bg-primary text-white px-4 py-2 rounded-lg w-full transition transform hover:bg-primary-dark hover:scale-105"
          onClick={handleConvert}
        >
          Convert to PDF
        </button>
        {pdf && <button
          className="bg-red-500 text-white mt-3 px-4 py-2 rounded-lg w-full transition transform hover:bg-primary-dark hover:scale-105"
          onClick={handleReset}
        >
          Reset PDF
        </button>}

        <div className="mt-6">
        {pdf ? (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <Document file={pdf}>
                <Page pageNumber={1} />
              </Document>
              <div className="text-center mt-4 flex justify-center w-full mb-2">
                <a
                  href={URL.createObjectURL(pdf)}
                  download="converted.pdf"
                  className="text-primary underline font-bold"
                >
                  Download PDF
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <h2>Try converting some text to PDF</h2>
            </div>
          )}
        </div>

        {history.length ? (<div className="mt-6">
          <h2 className="text-xl font-semibold text-secondary mb-4">Conversion History</h2>
          <ul className="space-y-2">
            {history.map((url, index) => (
              <li key={index} className="bg-gray-100 p-2 rounded-lg flex justify-between items-center">
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary">
                  View PDF {index + 1}
                </a>
                <button
                  onClick={() => handleDelete(url)}
                  className="border p-2 rounded-xl shadow-md bg-red-500 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>) : (
          <div className="text-center mt-4 text-gray-600">
            No history !
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

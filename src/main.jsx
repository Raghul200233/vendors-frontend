import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

console.log('App starting...', { 
  apiUrl: import.meta.env.VITE_API_URL,
  mode: import.meta.env.MODE
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
)
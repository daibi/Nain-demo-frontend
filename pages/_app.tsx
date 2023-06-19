import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Modal from 'react-modal';

// Set the app element for react-modal
Modal.setAppElement('#__next');

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

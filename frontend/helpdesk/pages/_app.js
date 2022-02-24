import '../styles/globals.css'
import Chat from '../components/Chat'

function MyApp({ Component, pageProps }) {
  return (
    <Chat>
      <Component {...pageProps} />
    </Chat>
  )
}

export default MyApp

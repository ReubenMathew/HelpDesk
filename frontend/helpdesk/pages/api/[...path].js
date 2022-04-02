// Forked from https://maxschmitt.me/posts/next-js-http-only-cookie-auth-tokens/
import httpProxy from "http-proxy";
import Cookies from "cookies";
import url from "url";

const API_URL = process.env.BACKEND_URL

const proxy = httpProxy.createProxyServer();

// You can export a config variable from any API route in Next.js.
// We'll use this to disable the bodyParser, otherwise Next.js
// would read and parse the entire request body before we
// can forward the request to the API. By skipping the bodyParser,
// we can just stream all requests through to the actual API.
export const config = {
    api: {
        bodyParser: false
    }
}

export default (req, res) => {
    // Return a Promise to let Next.js know when we're done
    // processing the request:
    return new Promise((resolve, reject) => {
        // In case the current API request is for logging in,
        // we'll need to intercept the API response.
        // More on that in a bit.
        const pathname = url.parse(req.url).pathname
        const isLogin = pathname === '/login'
        // Get the `access_token` cookie:
        const cookies = new Cookies(req, res)
        const accessToken = cookies.get('access_token')
        // Rewrite the URL: strip out the leading '/api'.
        // For example, '/api/login' would become '/login'.
        // ️You might want to adjust this depending
        // on the base path of your API.
        req.url = req.url.replace(/^\/api/, '')
        // Don't forward cookies to the API:
        req.headers.cookie = ''
        // Set access_token header from cookie:
        if (accessToken) {
            req.headers['access_token'] = accessToken
        }
        // In case the request is for login, we need to
        // intercept the API's response. It contains the
        // auth token that we want to strip out and set
        // as an HTTP-only cookie.
        if (isLogin) {
            proxy.once('proxyRes', interceptLoginResponse)
        }
        // Don't forget to handle errors:
        proxy.once('error', reject)
        // Forward the request to the API
        proxy.web(req, res, {
            target: API_URL,
            // Don't autoRewrite because we manually rewrite
            // the URL in the route handler.
            autoRewrite: false,
            // In case we're dealing with a login request,
            // we need to tell http-proxy that we'll handle
            // the client-response ourselves (since we don't
            // want to pass along the auth token).
            selfHandleResponse: isLogin
        })
        function interceptLoginResponse(proxyRes, req, res) {
            // Read the API's response body from
            // the stream:
            let apiResponseBody = ''
            proxyRes.on('data', (chunk) => {
                apiResponseBody += chunk
            })
            // Once we've read the entire API
            // response body, we're ready to
            // handle it:
            proxyRes.on('end', () => {
                try {
                    console.log(JSON.parse(apiResponseBody))
                    // Extract the accessToken from API's response:
                    const { accessToken } = JSON.parse(apiResponseBody)
                    // Set the accessToken as an HTTP-only cookie.
                    // We'll also set the SameSite attribute to
                    // 'lax' for some additional CSRF protection.
                    const cookies = new Cookies(req, res)
                    cookies.set('access_token', accessToken, {
                        httpOnly: true,
                        sameSite: 'lax'
                    })
                    // Our response to the client won't contain
                    // the actual accessToken. This way the auth token
                    // never gets exposed to the client.
                    res.status(200).json({ loggedIn: true })
                    resolve()
                } catch (err) {
                    reject(err)
                }
            })
        }
    })
}

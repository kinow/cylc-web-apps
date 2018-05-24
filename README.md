# Cylc Web App Experiments

(learning the technology...)

## Browsers VS Native Web Apps (electron)

To work in browsers:
  - the suite server program must set Cross-Origin-Request appropriately in
    HTTP response headers (see `lib/cylc/network/httpserver.py`)
  - avoid or factor out and make optional operations that browsers can't do
    (e.g. interaction with the filesystem)

## Digest Authentication
  - browsers automatically pop up an authentication dialog and detect and
    handle digest authentication
  - I haven't figured out how to do this in electron; until then must disable
    digest authentication in the suite server program
    (see `lib/cylc/network/httpserver.py`)

## Self-signed SSL Certificates

- in the native `main.js`
```
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
```
- In Firefox the initial suite query will fail. Just click directly on the
  suite server URL and add a security exception

## Server API

It's helpful to print server API call and response from
`lib/cylc/network/httpclient.py` (for normal cylc clients, not web apps!).

## Install
```
npm install
```

## Run (native)
```
npm start
```

## Run (browser)
```
firefox index.html
```

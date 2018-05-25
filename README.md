# Cylc Web App Experiments

(learning the technology...)

## Browsers VS Native Web Apps (electron)

To work in browsers:
  - the suite server program must set Cross-Origin-Request appropriately in
    HTTP response headers
  - avoid or factor out and make optional operations that browsers can't do
    (e.g. interaction with the filesystem)

## Digest Authentication
  - cylc server programs use digest authentication
  - browsers automatically detect this and pop up a dialog for username and
  - until we figured out how to do this in electron, disable digest
    authentication in cylc

## Server API

It's also helpful to print server API calls and responses from the cylc client
interface (for normal cylc clients, not web apps!).

## Self-signed SSL Certificates

- in the native `main.js`
```
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
```
- In Firefox the initial suite query will fail. Just click directly on the
  suite server URL and add a security exception

## Cylc Branch To Use

[https://github.com/hjoliver/cylc/tree/web-app-experiments](https://github.com/hjoliver/cylc/tree/web-app-experiments)
- prints server API call and response
- sets Cross Origin response header
- turns off digest authentication
- sets random SSL certificate number

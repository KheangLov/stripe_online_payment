# Stripe online payment

An [Express server](http://expressjs.com) implementation

## Requirements

- Node v10+

## How to run

```
npm i
```
 or
```
yarn
```
 *******                                   
```
npm start
```
 or
```
yarn start
```
***default port 3000***

<!-- prettier-ignore -->
| Test card number     | Webhook |
:--- | :--- 
**4242424242424242** | Succeeds  |
**4000000000003220** | Displays a pop-up modal to authenticate  |

# Node-RED Node Google APIS

This is the repo of [@openpixel/node-red-contrib-googleapis](https://www.npmjs.com/package/@openpixel/node-red-contrib-googleapis)

I personally use that project to get all my google calendar events and parse them through node-red. While it may also work for other operations against the google API. These are not tested.
The main concept is, to wrap a node-red node around [googleapis](https://www.npmjs.com/package/googleapis).

## Getting Started

1. This project is designed to work with `yarn`. If you don't have `yarn` installed, you can install it with `npm install -g yarn`.
2. Install dependencies: `yarn install`.

## Nodes

This projects provides 1 credentials node `google-credentials` and two nodes `google-operation` and `google-events` 


### Google Credentials
The `google-credentials` node provides the Credentials to be used when performing request against the google-api. We opted to use [User consenst](https://support.google.com/googleapi/answer/6158849?hl=en&ref_topic=7013279#zippy=%2Cuser-consent) and the [limited Input Device](https://developers.google.com/identity/protocols/oauth2/limited-input-device) to provide credentials for node-red. While other authentication options would be supported as well they are currently not implemented. Using the [limited Input Device](https://developers.google.com/identity/protocols/oauth2/limited-input-device) there might be issues with specific scopes not being able to be accessed via this node. Please raise an issue if you find these scopes.

#### Scopes
When configuring the authentication you have to provide the scopes you want to use in a comma-seperated string. An overview of all available scopes is available at the [official documentation](https://developers.google.com/identity/protocols/oauth2/scopes).

### Google Operation

This node let's you perform a generic operation agains the google-api. Finding the correct combination of  `api`, `version`,`path`, `method` can get tricky. The [NodeJS API client documentation](https://googleapis.dev/nodejs/googleapis/latest/) will give you a hint on how to traverse the API and what payload is available for that API. 
As an example, getting all events from your primary google calendar would be [/calendar/v3/events/list](https://googleapis.dev/nodejs/googleapis/latest/calendar/classes/Resource$Events.html#list) which results in

```yaml
name: myrequest
api: calendar
version: v3
path: events
method: list
```

It's also possible that your `path` includes a `/` to traverse the API.

### Google Events
This node directly calls the `calendar/v3/events/list` API to get all events from a calendar. It wraps the logic of `google-operation` to provide easier configuration of the payload (like what events, and what calendar).

# Contributing
## Adding Nodes

You can quickly scaffold a new node and add it to the node set. Use the following command to create `my-new-node-type` node:

```
yarn add-node my-new-node-type
```

The node generator is based on mustache templates. At the moment there are three templates available:

- `blank` (used by default) - basic node for Node-RED >=1.0
- `blank-0` - node with a backward compatibility for running on Node-RED <1.0
- `config` - configuration node

To generate a node using a template, specify it as the third argument:

```
yarn add-node my-new-node-type blank
```

or

```
yarn add-node my-new-node-config config
```

### Adding Node Templates

If you want to make your own template available, add it to `./utils/templates/`.

## Developing Nodes

Build & Test in Watch mode:

```
yarn dev
```

## Building Node Set

Create a production build:

```
yarn build
```
## Testing Node Set in Node-RED

[Read Node-RED docs](https://nodered.org/docs/creating-nodes/first-node#testing-your-node-in-node-red) on how to install the node set into your Node-RED runtime.

## License
MIT

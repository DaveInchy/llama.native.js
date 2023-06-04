# Changes

Changes for `llama.native.js` per publication on the npm register for node packages.

## Release 1.0.0 <Comment change this to a version before pushing to githubs />

```shell
# updating your current version:
npm i --save llama.native.js@1.0.0
```

```shell
# to start the server. i recommend you download the sourcecode from github and use:
npm setup && npm start
```

```typescript
/*
This is supposed to work as single module,
This is a minified module with all non-client related packages removed.
*/
import { ioClientController } from "llama.native.js/bin/network/client";

/*
This is supposed to be the different types you can import,
by themselves they are the ioClientController and the interfaces / structures used when communication was successful.
This is a minified module with all non-client related packages removed.
*/
import { ioClient, ioInference, ioHandshake, ioMetadata } from "llama.native.js/bin/client.io"
```

> ### Added a way to not being required to install all non client related packages except `socket.io-client`

> ### each node module get included and transpiled to be individually imported and used.

> ### **Types** and **Source** **Mapping** is correctly transpiled for production builds, everything ends up in `bin/` so the ESLinter doesnt *error that theres no types for these values*.

> ### Added imports for `ioClient` and `ioServer`

> - a server that does handshakes for inference and making sure the connection is correctly validated and secure. for now theres only one pre processed prompt that can be executed on this server. It uses the os native binary for python and llama.cpp.
> - the server puts them in rooms. secure or not secure, and thereby the server has authorativity.
> - a client that requests handshakes for inference and identifies the connection if its secure or not.

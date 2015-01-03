Angular-chat
============

This is a simple chat made with Angular and NodeJS.

If you want to try it out, you must fill a `credential.json` and put it in the scripts/server folder.

Here is the required structure:
-------------------------------

```json
{
  "twitter": {
    "consumerKey": "",
    "consumerSecret": ""
  },
  "steam": {
    "apiKey": ""
  },
  "session": {
    "secret": ""
  }
}

```

Then you can install the dependencies with `npm install` and start it with `gulp`.

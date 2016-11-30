#!/bin/bash -le

npm run lint
npm run test
npm run export
echo 'everything OK!'

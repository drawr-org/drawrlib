#!/bin/bash -le

npm run lint
npm run unit-test
npm run export
echo 'everything OK!'

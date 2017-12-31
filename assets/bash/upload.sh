#!/bin/bash -ex

curl -T ~/Pictures/*.png http://localhost:3000/upload  -d '{"name":"Set1"}' --header "Content-Type: application/json";

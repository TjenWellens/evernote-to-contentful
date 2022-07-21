docker build . -t evernote-to-contentful

docker run -it \
-v $(pwd)/errors:/home/node/app/errors \
--env-file .docker.env \
evernote-to-contentful
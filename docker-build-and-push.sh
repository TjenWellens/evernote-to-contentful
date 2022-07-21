if test -z "$IMAGE_NAME" ; then
  >&2 echo "variable 'IMAGE_NAME' is not set"
  exit 1
fi

docker build . -t ${IMAGE_NAME}

docker push ${IMAGE_NAME}
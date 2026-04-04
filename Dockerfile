FROM ubuntu:latest
LABEL authors="melkor"

ENTRYPOINT ["top", "-b"]
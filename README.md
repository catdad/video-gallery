# video gallery

I created this as a simple and performant solution for browsing videos from my security cameras

## Setup

I use cameras that perform their own local object detection and have the ability to record to an FTP server. This is good enough for my use case, but still leaves the need to be able to browse those videos. I run `video-gallery` alongside an FTP docker container, both mounting the same folder so they have access to the same recordings.

## Sample `docker-compose.yml` file

```yml
version: '3'
services:
  video:
    container_name: video
    image: ghcr.io/catdad/video-gallery
    environment:
      # needs access to time zone
      - TZ=America/New_York
      # how many days to retain videos before auto-deleting
      # remove to never delete videos
      - PURGE_PERIOD=30
      # match folder names from /input to their human-readable names
      - FILTER=camera-name:camera name,other-camera-name:other
    volumes:
      # needs access to timezone information
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
      # mount all of your cameras
      - /path/to/ftp/camera-name:/input/camera-name
      - /path/to/ftp/other-camera-name:/input/other-camera-name
    restart: unless-stopped
    ports:
      # map port 3000 to any port you want
      - 3333:3000
```

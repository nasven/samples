ARG NASVEN_IMAGE=nasven.js-local
FROM ${NASVEN_IMAGE}

COPY spark /app
RUN NASVEN_NORUN=true /opt/nasven/nasven /app

EXPOSE 8080
CMD ["/app"]

# Stage 1
FROM node:lts-buster-slim AS node_base
FROM mcr.microsoft.com/dotnet/sdk:5.0-buster-slim AS build
COPY --from=node_base . .
ARG app_version=1.0.0.0
ARG source_version=local
WORKDIR /build
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app /p:Version=${app_version} /p:SourceRevisionId=${source_version}
# Stage 2
FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS final
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "Calling.dll"]
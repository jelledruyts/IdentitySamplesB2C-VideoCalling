# Stage 1
FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
ARG app_version=1.0.0.0
ARG source_version=local
RUN curl -sL https://deb.nodesource.com/setup_10.x |  bash -
RUN apt-get install -y nodejs
WORKDIR /build
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app /p:Version=${app_version} /p:SourceRevisionId=${source_version}
# Stage 2
FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS final
RUN curl -sL https://deb.nodesource.com/setup_10.x |  bash -
RUN apt-get install -y nodejs
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "Calling.dll"]
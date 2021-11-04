# short-url-service

This is an internet service to shorten URLs like bit.ly or TinyURL (just the service, without a GUI)
.

Users can enter a URL on a page and get back a shortened version. The shortened version of a URL is
the same for every shortening request. If this shortened URL is used as an address in a browser, the
document of the unabridged URL is displayed after being redirected via the Internet service.

## Usage of the service

### Short url

User can use a POST request to generate a new short URL:

POST BASE_URL/short-url/generate

The body must be in JSON format and contains the `url` parameter.

### Call the short url

User just need to enter the returned shorted url in the browser to call the url. Please take care,
that the parameter BASE_URL in AWS SSM already configured after deployment to AWS.

### GET statistic

User can use a POST request to generate a new short URL:

POST BASE_URL/short-url/get-statistic

The body must be in JSON format and contains the `url` parameter.


## Architecture and Deployment

This project using AWS SAM CLI to deploy the codes to AWS.

Please take a look on these documentations to have more overview about AWS SAM CLI

To use the SAM CLI, you need the following tools.

* SAM CLI - [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* Node.js - [Install Node.js 10](https://nodejs.org/en/), including the NPM package management tool.
* Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community)


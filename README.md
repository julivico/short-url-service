# short-url-service
This is an internet service to shorten URLs like bit.ly or TinyURL (just the service, without a GUI). 

The following functionality should be provided:

- Users can enter a URL on a page and get back a shortened version. The shortened version of a URL is the same for every shortening request. If this shortened URL is used as an address in a browser, the document of the unabridged URL is displayed after being redirected via the Internet service.

- Statistics are kept for each shortened URL:

  How often was the URL shortened? 

  How often was the shortened URL accessed? 

  Anyone can see the statistics. It should also be displayed automatically after each shortening.

- Variation (Please do not implement, let’s talk about what changes you would do to provide the functionality):

  Optionally users can log in. Then a shortening will provide a separate URL for each user. In addition to the previous statistics, the calls per user are then counted.

  Only logged in users can see statistics. This should be an incentive to sign up. You can login as admin and will see all statistics.

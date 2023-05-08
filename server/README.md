# Web site for serving SWAPI data

## TODOS
- Species/people is weird. In the initial data, they apparently have a many-to-many relationship between characters and species. So we created a junction table. But it's really a one-to-many. No person can be in more than one species. This should be refactored.
- The junction requests are not as elegant as they should be. I used a brute force method to get the data into JS arrays and then searched through that. But I think there's a way to use the json-server tools that is more ideomatic. Do research to how to do that and refactor.


## Notes
- Weirdly, there is no connections to the transport collection. We'd expect it to be featured in a film or have a list of pilots (characters).
- 
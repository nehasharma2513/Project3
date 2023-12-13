# Project3
=======
# Book Recommendation Platform : Project3
In this project, we are analyzing and visualizing popularity of different Authors based on User ratings of Books. This will help readers decide their next read or can be adapted for their specific use cases.


The project can be run using following steps:
1. Database Setup - Run Jupyter Notebook DB_setup.ipynb to get the merged data
2. Running the Flask Application - Run the app.py file to get the jsonified data
3. Interactive Visualizations - The html page will by default display a Dashboard with a Bar Chart : Top 10 Authors showing Average Rating Score, Quadrant Analysis for the default selected Author from the dropdown. There are options to change the charts using Radio Buttons and change the Author using provided dropdown


### Limitations
We also set out to analyse the geographic locations of users and provide more information but due to time constraints, could not complete that in this iteration of the project. This will be included in the new features to be added in the future.

### Analysis
Our data sets include 3 csv files - Users, Books and Ratings and a merged version of all 3 files.
Our analysis focused on books' authors, specifically:
- popularity among readers measured by the average rating score per author, 
- and engagement with the books measured by the number of reviews per author. 

Visualization shows bar charts showing top ten most popular authors, the number of reviews and their average ratings. We also show the details of their books, year of publication and books by each author in the order of their popularity.

### References
[Flask and mongodb] (https://www.digitalocean.com/community/tutorials/how-to-use-mongodb-in-a-flask-application)
[Installation of charts js] (https://www.chartjs.org/docs/latest/getting-started/installation.html)
[chartsjs intro](https://www.chartjs.org/docs/latest/getting-started/usage.html)
[Redraw chart in charts js](https://stackoverflow.com/questions/40056555/destroy-chart-js-bar-graph-to-redraw-other-graph-in-same-canvas)
[Merge of collections](https://www.mongodb.com/developer/languages/python/python-quickstart-aggregation/)
[Filter an array of objects](https://builtin.com/software-engineering-perspectives/javascript-filter)
[Merge data in mongodb](https://jira.mongodb.org/browse/SERVER-30812)
[Remove fields after merge of data in mongodb](https://www.mongodb.com/docs/manual/reference/operator/aggregation/unset/)
[ForEach](https://www.w3schools.com/jsref/jsref_foreach.asp)
[How to find keys of a dictionary in js](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)
[Lines on bubble chart](https://stackoverflow.com/questions/42423167/custom-vertical-line-using-plotly-js)
[pie-donut](https://codepen.io/Shokeen/pen/gxwKKO)
[text inside donut](https://stackoverflow.com/questions/28097184/adding-text-to-the-center-of-a-d3-donut-graph)
[General info in layout parameters](https://plotly.com/javascript/reference/layout/xaxis/)
[Remove duplicates](https://www.geeksforgeeks.org/how-to-remove-duplicate-elements-from-javascript-array/)
[Extract a substring](https://www.w3schools.com/jsref/jsref_substring.asp)
[Sort array of objects](https://www.javascripttutorial.net/array/javascript-sort-an-array-of-objects/)


### Acknowledgements
Shout out to the contributors to this project:
1. Daria Z.
2. Neha S.
3. Seeke O.D
4. Valentyna K.

It has been great working and learning with you all.

 

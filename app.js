
// Available routes:
// let booksURL = '/api/v1.0/books'
// let usersURL = /api/v1.0/users
// let reviewsURL = /api/v1.0/reviews 
// let reviewsURL = /api/v1.0/merged

const mergedEndpoint = 'http://127.0.0.1:5000/api/v1.0/merged';
const defaultAuthor = 'John Grisham';

// Colors for the doughnut chart
const doughnutChartColors = ['rgb(211,211,211,0.8)', 'rgba(255, 0, 0, 0.8)', 'rgb(255, 229, 180, 0.8)', 'rgba(255, 255, 0, 0.8)', 'rgba(0, 153, 76, 0.8)'];

// Font style for chart titles
const titleFont = { family: 'Arial, Helvetica, sans-serif', size: 16 };

// Dropdown element for authors
const authorDropdown = document.getElementById('authorDropdown');

// Leaflet Map
var myMap = L.map('map').setView([0, 0], 2);

// Function to fetch unique authors from the API
async function getAuthorsFromAPI() {
  try {
    const response = await fetch(mergedEndpoint);
    const data = await response.json();
    return [...new Set(data.map(item => item['Book-Author']))];
  } catch (error) {
    console.error('Error fetching authors:', error.message);
    return [];
  }
}

// Function to update the author dropdown
async function updateAuthorDropdownFromAPI() {
  authorDropdown.innerHTML = ''; // Clear existing options

  try {
    const authors = await getAuthorsFromAPI();
    authors.forEach(author => {
      const option = document.createElement('option');
      option.text = author;
      option.value = author;
      authorDropdown.add(option);
    });
  } catch (error) {
    console.error('Error updating author dropdown:', error.message);
  }
}

// Initial loading of authors and updating the dropdown
updateAuthorDropdownFromAPI();

// Event listener for changes in the author dropdown
authorDropdown.addEventListener('change', function () {
  const selectedAuthor = this.value;
  // Call the function to load data for the selected author
  loadDataForAuthor(selectedAuthor);
});

// Function to load data for the selected author
async function loadDataForAuthor(selectedAuthor) {
  try {
    // Fetch data for the selected author
    const authorDataResponse = await fetch(`${mergedEndpoint}?author=${selectedAuthor}`);
    const authorData = await authorDataResponse.json();

    // Process the data and calculate necessary metrics
    const authorBooks = authorData.filter(item => item['Book-Author'] === selectedAuthor);
    const AuthorBookTPACListOfObjects = processAuthorBooks(authorBooks);

    // Calculate the maximum number of reviews
    const maxReviewCounts = Math.max(...authorData.map(item => item.Ratings.length));

    // Update the charts with the new data
    updateCharts(AuthorBookTPACListOfObjects, maxReviewCounts, selectedAuthor);
  } catch (error) {
    console.error('Error loading data for author:', error.message);
  }
}
// Leaflet Map
var myMap = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 18
}).addTo(myMap);

// Function to create and add markers to the map
function addMarkersToMap(data) {
  data.features.forEach(function (review) {
    var coordinates = review.geometry.coordinates;
    var numReviews = review.properties.num_reviews;
    var averageRating = review.properties.avg_rating;

    var marker = L.circleMarker([coordinates[1], coordinates[0]], {
      radius: numReviews * 2, 
      fillColor: getColor(averageRating),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(myMap);

    marker.bindPopup(`<b>Location:</b> ${review.properties.place}<br>
                     <b>Number of Reviews:</b> ${numReviews}<br>
                     <b>Average Rating:</b> ${averageRating}`);
  });
}

// Fetch data from the GeoLoc.csv and Ratings.csv files
d3.csv('GeoLoc.csv').then(function (geoData) {
  d3.csv('Ratings.csv').then(function (ratingsData) {
    // Process data to get the average rating and number of reviews for each location
    var reviewsData = processDataForMap(geoData, ratingsData);

    // Add markers to the map
    addMarkersToMap(reviewsData);
  });
});

// Function to process data and calculate average rating and number of reviews for each location
function processDataForMap(geoData, ratingsData) {
  var reviewsData = { type: "FeatureCollection", features: [] };

  geoData.forEach(function (location) {
    var coordinates = [parseFloat(location.Long), parseFloat(location.Lat)];
    var place = location.country;

    var locationReviews = ratingsData.filter(function (review) {
      return review.Location === place;
    });

    var numReviews = locationReviews.length;

    if (numReviews > 0) {
      var totalRating = locationReviews.reduce(function (sum, review) {
        return sum + parseInt(review['Book-Rating']);
      }, 0);

      var avgRating = totalRating / numReviews;

      reviewsData.features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: coordinates
        },
        properties: {
          place: place,
          num_reviews: numReviews,
          avg_rating: avgRating
        }
      });
    }
  });

  return reviewsData;
}

let maxReviewCounts = Math.max(...authorData.map(item => item.Ratings.length));

function avgList(list){
    if (list.length>0){
        let sum=0;
        for (let i of list){
            sum+=i
        }
        let avgL=sum/list.length
        return avgL.toFixed(2)}
    else {return null}
}

function groupByReviewScore(listScores){
  counts=[];
  for (let i=1;i<11; i++){
    counts.push(listScores.filter(j=>j==i).length)
  }
  return counts
}

function generateGroupsText(listOfGroups){
    let scoresText=``;
    for (let i=0; i<listOfGroups.length; i++){
      if (listOfGroups[i]>0){
        if (listOfGroups[i]>1){
        scoresText+=`  - score <b>${i+1}</b>: was given <b>${listOfGroups[i]}</b> times <br>`;}
        else {scoresText+=`  - score <b>${i+1}</b>: was given <b>${listOfGroups[i]}</b> time <br>`;}
      }}
    return scoresText;  
    }

function normilizedSizeList(valuesList,maxS,minS){
  // define acceptable range of values [minAcceptable;maxAcceptable]
  // and then having max and min for the whole set convert any value within the range into [0;1]: projected01=(value-min)/(max-min)
  // then convert projected01 into value within range [minAcceptable;maxAcceptable]: projected01*(maxAcceptable-minAcceptable)+minAcceptable
  // https://math.stackexchange.com/questions/914823/shift-numbers-into-a-different-range
  let minAcceptable=10;
  let maxAcceptable=60;
  return valuesList.map(value=>(minAcceptable+(value-minS)*(maxAcceptable-minAcceptable)/(maxS-minS)));
}

function MinMax(arr) {  
  return [Math.min(...arr),Math.max(...arr)];
}

function groupQuadrants(listOfObj,maxReviewCounts){
  // create an object with number of author's book per each of defined category,
  // which are quadrants: 
  //Q1 - avgScore<5, ReviewsCount<maxReviewCounts/2
  //Q2 - avgScore>=5, ReviewsCount<maxReviewCounts/2
  //Q3 - avgScore<5, ReviewsCount>=maxReviewCounts/2
  //Q4 - avgScore>=5, ReviewsCount>=maxReviewCounts/2
  // as well as a category with No Reviews at all
  let numberBooks=[];
  let yearPubl=[[],[],[],[],[]];
  const nameCategory = ['No Reviews', 'Q1 - Not Very Popular, Not Much Loved', 'Q2 - Not Very Popular, But Loved', 'Q3 - Popular, Not Much Loved', 'Q4 - Popular and Loved'];
  for (let i=0; i<5; i++){
    numberBooks[i]=0;
  }
  for (let obj of listOfObj){
    if (obj.reviewsCount>0 && obj.avrScore<5 && obj.reviewsCount<maxReviewCounts/2){
      numberBooks[1]+=1;
      yearPubl[1].push(+obj.YearOfPublication);
    }
    else if (obj.reviewsCount>0 && obj.avrScore>=5 && obj.reviewsCount<maxReviewCounts/2){
      numberBooks[2]+=1;
      yearPubl[2].push(+obj.YearOfPublication);
    }
    else if (obj.reviewsCount>0 && obj.avrScore<5 && obj.reviewsCount>=maxReviewCounts/2){
      numberBooks[3]+=1;
      yearPubl[3].push(+obj.YearOfPublication);
    }
    else if (obj.reviewsCount>0 && obj.avrScore>=5 && obj.reviewsCount>=maxReviewCounts/2){
      numberBooks[4]+=1;
      yearPubl[4].push(+obj.YearOfPublication);
    }
    else if (obj.reviewsCount==0){
      numberBooks[0]+=1;
      yearPubl[0].push(+obj.YearOfPublication);
    }
  }
  let minMaxY=[];
  for (let i=0; i<yearPubl.length; i++){
    minMaxY[i]=[];
    minMaxY[i]=MinMax(yearPubl[i]);
   }

  return {
    'values':numberBooks,
    'categoryNames':nameCategory,
    'publicationYears':minMaxY
  }
}

function plotBubble(listOfObjects,maxReviewCounts){
  // plot the bubble chart
  // size of the bubble will represent the year of book's publication
  let yearOfPublicationList=listOfObjects.map(item => item.YearOfPublication);
  let maxYear=Math.max(...yearOfPublicationList);
  let minYear=Math.min(...yearOfPublicationList);
  let yearOfPublicationListNormilized=normilizedSizeList(yearOfPublicationList,maxYear,minYear);
  // x-axis will represent the count of reviews
  let reviewsCount=listOfObjects.map(item => item.reviewsCount);
  // y-axis will represent the average rating score
  let avgRatingScore=listOfObjects.map(item => item.avrScore);
  let deltaX=maxReviewCounts/12;
  let xAxis=[]
  if (maxReviewCounts>6){
    let step=Math.ceil(maxReviewCounts/6) // not more than 8 points at xAxis
    for (let i=0; i<=6;i++){
      xAxis.push(i*step);
    }
  }
  else {
    for (let i=0; i<=maxReviewCounts;i++){
      xAxis.push(i);
    }
  }
  let yAxis = [];
  for (let i=0; i<=10;i+=2){
    yAxis.push(i);
  }

  const deltaY=2;
  
  let traceBubble = {
      x: reviewsCount,
      y: avgRatingScore,
      mode: 'markers',
      marker: { 
          color: '#1f77b4',
          size:  yearOfPublicationListNormilized,
          line: {
            color: 'black', 
            width: 1
          }},
      text: listOfObjects.map(item=>` Book Title: <b>${item.bookTitle}</b><br> Year of Publication: <b>${item.YearOfPublication}</b> <br> Total <b>${item.reviewsCount}</b> Reviews:<br> ${generateGroupsText(item.scoresCount)}<br>`),
    };

    let data_bubble = [traceBubble];
    let backgroundOpacity=0.05
    let layout_bubble = {
      title: {
          text: `<b> Quadrant Analysis of Reader Engagement for ${author}</b> <br>Reflects Lovability and Popularity, with Larger Markers for Recent Releases`,
          font: titleFont}, 
      xaxis: {title: 'Reviews Count',
      zeroline: false, 
      tickvals: xAxis, 
      ticktext: xAxis, 
      range: [0-deltaX, maxReviewCounts+deltaX],
      showgrid: false},
      yaxis: {title: 'Average Rating Score',
      zeroline: false, 
      tickvals: yAxis, 
      ticktext: yAxis, 
      range: [0-deltaY, 10+deltaY],
      showgrid: false},
      shapes: [{
        type: 'line',
        x0: maxReviewCounts/2,
        y0: 0-deltaY,
        x1: maxReviewCounts/2,
        y1: 10+deltaY,
        line: {
          color: 'grey',
          width: 0.5,
          dash: 'dot'
        }
      }, {
        type: 'line',
        x0: 0-deltaX,
        y0: 5,
        x1: maxReviewCounts+deltaX,
        y1: 5,
        line: {
          color: 'grey',
          width: 0.5,
          dash: 'dot'
        }
      },
      {
        type: 'rect',
        x0: 0-deltaX,
        y0: 0-deltaY,
        x1: maxReviewCounts/2, 
        y1: 5, 
        fillcolor: 'red', 
        opacity: backgroundOpacity,
        line: {
          width: 0
        }
      },
      {
        type: 'rect',
        x0: maxReviewCounts/2,
        y0: 0-deltaY,
        x1: maxReviewCounts+deltaX, 
        y1: 5,
        fillcolor: 'orange',
        opacity: backgroundOpacity,
        line: {
          width: 0
        }
      },
      {
        type: 'rect',
        x0: 0-deltaX,
        y0: 5,
        x1: maxReviewCounts/2,
        y1: 10+deltaY, 
        fillcolor: '#bcbd22',  ///yellow 
        opacity: backgroundOpacity,
        line: {
          width: 0
        }
      },
      {
        type: 'rect',
        x0: maxReviewCounts/2,
        y0: 5,
        x1: maxReviewCounts+deltaX,
        y1: 10+deltaY,
        fillcolor: 'darkgreen', 
        opacity: backgroundOpacity,
        line: {
          width: 0
        }
      }],
      padding: { t: 5, r: 5, b: 5, l: 5 },
      margin: { t: 55, r: 55, b: 55, l: 55 }
    };
  
    Plotly.newPlot("doughnutBubbleChart", data_bubble, layout_bubble, {responsive:true});
}

function plotDonutChart(proportionQ,author,minY,MaxY){
  let pieDiv = document.getElementById("doughnutBubbleChart");
  let values = proportionQ.values;
  let names = proportionQ.categoryNames;
  let years = proportionQ.publicationYears;
  let valuesToPlot=[], namesToPlot=[], colorsToPlot=[], yearsToPlot=[];
  for (let i=0; i<5; i++){
    if (values[i]>0){
      namesToPlot.push(names[i]);
      valuesToPlot.push(values[i]);
      colorsToPlot.push(doughnutChartColors[i]);
      yearsToPlot.push(years[i]);
    }
  }
  let texthint=[];
  for (let i=0; i<yearsToPlot.length;i++){
    texthint[i]=`Year of Publication: starting ${yearsToPlot[i][0]} with ${yearsToPlot[i][1]} latest`
    if (yearsToPlot[i][0]==yearsToPlot[i][1]){
      texthint[i]=`The only Year of Publication ${yearsToPlot[i][0]}`
    }
  }
  let wholeBooks=0;
  for (let i of values){
    wholeBooks+=i;
  }

  let traceA = {
    type: "pie",
    values: valuesToPlot,
    labels: namesToPlot,
    hole: 0.5,
    text: texthint,
    hoverinfo: 'text+percent',
    textinfo: 'none',
    marker: {
      colors: colorsToPlot}
  };

  let data = [traceA];

  let titletext=`<b>Distribution by Reader Engagement for ${author}</b> <br>Years of Publication: ${minY}-${MaxY}`;
  if (minY==MaxY){
    titletext=`<b>Distribution by Reader Engagement for ${author}</b> <br>Year of Publication: ${minY}`
  }

  let layout = {
    title: {
      text:titletext,
      font: titleFont},
    annotations: [
      {
          font: {
              size: 14,
              family: 'Arial, Helvetica, sans-serif',
              color: '(64,64,64,0.9)' 
          },
          showarrow: false,
          text: `Total of<br><b>${wholeBooks}</b><br>books`,  
          x: 0.5,
          y: 0.5
      }
  ]
  };
  Plotly.newPlot(pieDiv, data, layout);
}


//Define the API endpoint
let merged = '/api/v1.0/merged';

//Load the data
d3.json(merged).then(function(data){ 

  // Find the maximum number of reviews book recieved in the whole db
  let maxReviewCounts=Math.max(...data.map(item=>item.Ratings.length));
  // Generate a list of dictionaties for each book of the author, which has title, ISBN, publication year, average rating score and reviews count
  let authorBooks=data.filter(function(bookitem){return bookitem['Book-Author']==author})
  let AuthorBookTPACListOfObjects=authorBooks.map(
    item => { 
    let reviewsList = item.Ratings.map(i=>i['Book-Rating'])
    let scoresCount=groupByReviewScore(reviewsList)
    return {
        'ISBN':item['ISBN'],
        'bookTitle':item['Book-Title'],
        'YearOfPublication': item['Year-Of-Publication'],
        'avrScore': avgList(reviewsList),
        'reviewsCount': reviewsList.length,
        'scoresCount':scoresCount
      } 
  })
  // calculate number of books in each quadrant and those without reviews
  let proportionQ=groupQuadrants(AuthorBookTPACListOfObjects,maxReviewCounts)
  let minY=Math.min(...AuthorBookTPACListOfObjects.map(item=>item.YearOfPublication));
  let maxY=Math.max(...AuthorBookTPACListOfObjects.map(item=>item.YearOfPublication));
  // Listen for radio buttons
  d3.selectAll("input[name='chart']").on("change", function() {
    var selectedChart = this.value;
    switch (selectedChart) {
        case "doughnutChart":
           plotDonutChart(proportionQ,author,minY,maxY)
            break;
        case "bubbleChart":
            plotBubble(AuthorBookTPACListOfObjects, maxReviewCounts)
            break;
    }
  });
  //plot a pie chart initially
  plotDonutChart(proportionQ,author,minY,maxY)
// Helper function to process author books data
function processAuthorBooks(authorBooks) {
  return authorBooks.map(item => {
    const reviewsList = item.Ratings.map(i => i['Book-Rating']);
    const scoresCount = groupByReviewScore(reviewsList);
    return {
      'ISBN': item['ISBN'],
      'bookTitle': item['Book-Title'],
      'YearOfPublication': item['Year-Of-Publication'],
      'avrScore': avgList(reviewsList),
      'reviewsCount': reviewsList.length,
      'scoresCount': scoresCount
    };
  });
}

// Helper function to group review scores
function groupByReviewScore(listScores) {
  return Array.from({ length: 10 }, (_, i) => listScores.filter(j => j === i + 1).length);
}

// Helper function to calculate average of a list
function avgList(list) {
  return list.length > 0 ? (list.reduce((sum, i) => sum + i, 0) / list.length).toFixed(2) : null;
}

});




